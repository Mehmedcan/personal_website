import { getById, queryAll, isPointInRect } from '../utils/dom.js';
import { HandTracker } from '../handTracker.js';
import {
    CURSOR_LERP_FACTOR,
    SCROLL_SENSITIVITY,
    HAND_SENSITIVITY,
    PINCH_SCROLL_THRESHOLD,
    SCROLL_FRICTION
} from '../config/constants.js';

/**
 * GestureController Component
 * Handles webcam-based hand tracking and gesture-based UI control
 */
export class GestureController {
    constructor(particleSystem) {
        this.particles = particleSystem;

        // DOM References
        this.cursor = getById('custom-cursor');
        this.startBtn = getById('start-gesture');
        this.stopBtn = getById('stop-gesture');
        this.infoContainer = getById('gesture-info-container');
        this.activeInfo = getById('gesture-active-info');

        // Cursor position state (lerp animation)
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;

        // Scroll control state
        this.isPinching = false;
        this.pinchInitialX = null;
        this.pinchInitialY = null;
        this.isPinchScrolling = false;
        this.scrollVelocityY = 0;

        this.animationRunning = false;

        this.tracker = new HandTracker((pos) => this.handleHandMove(pos));
        this.bindEvents();
    }

    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stop());
        }
    }

    /**
     * Processes hand position data and updates cursor/scroll state
     */
    handleHandMove(handPos) {
        const mirroredX = 1 - handPos.x;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.targetX = centerX + (mirroredX - 0.5) * window.innerWidth * HAND_SENSITIVITY;
        this.targetY = centerY + (handPos.y - 0.5) * window.innerHeight * HAND_SENSITIVITY;

        this.cursor.style.display = 'block';

        if (handPos.isPinching) {
            this.handlePinchStart();
        } else {
            this.handlePinchEnd();
        }
    }

    /**
     * Handles pinch gesture state
     */
    handlePinchStart() {
        this.cursor.classList.add('pinching');

        if (!this.isPinching) {
            this.scrollVelocityY = 0;
            this.pinchInitialX = this.currentX;
            this.pinchInitialY = this.currentY;
            this.isPinchScrolling = false;
        } else if (!this.isPinchScrolling) {
            const dx = this.currentX - this.pinchInitialX;
            const dy = this.currentY - this.pinchInitialY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > PINCH_SCROLL_THRESHOLD) {
                this.isPinchScrolling = true;
            }
        }

        this.isPinching = true;
    }

    /**
     * Handles pinch release - triggers click if not scrolling
     */
    handlePinchEnd() {
        if (this.isPinching && !this.isPinchScrolling) {
            // Dispatch pinch event for games to listen
            window.dispatchEvent(new CustomEvent('gesturePinch', {
                detail: { x: this.currentX, y: this.currentY }
            }));

            this.triggerClick();
        }

        this.cursor.classList.remove('pinching');
        this.isPinching = false;
        this.isPinchScrolling = false;
    }

    /**
     * Triggers click on element under cursor
     */
    triggerClick() {
        let targetElement = document.elementFromPoint(this.currentX, this.currentY);

        if (!targetElement) return;

        // If we hit an SVG or its children, find the closest clickable parent (button, a, etc.)
        const clickableParent = targetElement.closest('button, a, [onclick], [role="button"]');
        if (clickableParent) {
            targetElement = clickableParent;
        }

        // Fallback: check social links directly if no element found
        if (!targetElement.closest('a')) {
            const buttons = queryAll('.social-links a');
            for (const btn of buttons) {
                const rect = btn.getBoundingClientRect();
                if (isPointInRect(this.currentX, this.currentY, rect)) {
                    targetElement = btn;
                    break;
                }
            }
        }

        // Prevent clicking the stop-gesture button via gesture (would be confusing UX)
        if (targetElement === this.stopBtn || targetElement.closest('#stop-gesture')) {
            return;
        }

        // When a game is active, block clicks on main menu elements only
        // (social links, theme toggle, games menu) but allow everything else (game interactions)
        const isGameActive = document.documentElement.hasAttribute('data-game-active');
        if (isGameActive) {
            const isMainMenuElement = targetElement.closest(
                '.social-links, #theme-toggle, #games-menu-container, .gesture-btn'
            );
            if (isMainMenuElement) {
                return;
            }
        }

        // Ensure the element has a click method
        if (typeof targetElement.click !== 'function') {
            return;
        }

        const link = targetElement.closest('a');
        if (link?.href) {
            window.open(link.href, link.target || '_self');
        } else {
            targetElement.click();
        }
    }

    /**
     * Main animation loop for cursor movement and scroll
     */
    animate() {
        if (!this.animationRunning) return;

        const prevY = this.currentY;
        this.currentX += (this.targetX - this.currentX) * CURSOR_LERP_FACTOR;
        this.currentY += (this.targetY - this.currentY) * CURSOR_LERP_FACTOR;

        this.cursor.style.left = `${this.currentX}px`;
        this.cursor.style.top = `${this.currentY}px`;

        this.particles.setTarget(this.currentX, this.currentY);

        // Dispatch cursor position event for games to listen
        window.dispatchEvent(new CustomEvent('gestureCursorMove', {
            detail: { x: this.currentX, y: this.currentY }
        }));

        // Check if a game is active
        const isGameActive = document.documentElement.hasAttribute('data-game-active');

        // Handle scroll based on pinch state - DISABLED during games
        if (this.isPinching && this.isPinchScrolling && !isGameActive) {
            const deltaY = (prevY - this.currentY) * (SCROLL_SENSITIVITY / 100);
            if (Math.abs(deltaY) > 0.01) {
                window.scrollBy(0, deltaY);
                this.scrollVelocityY = deltaY;
            }
        } else if (Math.abs(this.scrollVelocityY) > 0.1 && !isGameActive) {
            window.scrollBy(0, this.scrollVelocityY);
            this.scrollVelocityY *= SCROLL_FRICTION;
        }

        requestAnimationFrame(() => this.animate());
    }

    async start() {
        await this.tracker.start();

        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'block';
        this.infoContainer?.classList.add('hidden');
        this.activeInfo?.classList.remove('hidden');

        // Hide theme toggle during gesture mode to prevent conflicts
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.display = 'none';
        }

        this.particles.setIsGestureActive(true);
        this.animationRunning = true;
        this.animate();
    }

    stop() {
        this.tracker.stop();

        this.stopBtn.style.display = 'none';
        this.startBtn.style.display = 'block';
        this.cursor.style.display = 'none';
        this.infoContainer?.classList.remove('hidden');
        this.activeInfo?.classList.add('hidden');

        // Show theme toggle again
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.display = 'flex';
        }

        this.particles.setIsGestureActive(false);
        this.animationRunning = false;

        // Reset state
        this.pinchInitialX = null;
        this.pinchInitialY = null;
        this.isPinchScrolling = false;
        this.isPinching = false;
        this.scrollVelocityY = 0;
    }
}
