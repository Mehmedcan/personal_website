import { LetterFall } from '../LetterFall.js';
import { Scoreboard } from './Scoreboard.js';

// ==========================================
// GAME CONFIGURATION
// ==========================================
const SPIDER_TRAVEL_TIME = 7.0;     // Time in seconds to reach emoji from off-screen
const SPIDER_SPAWN_INTERVAL = 1.0;  // Spawn frequency in seconds
const SPIDER_SPAWN_COUNT = 1;       // Number of spiders to spawn per interval

// Fail sequence configuration
const FAIL_GLOW_INTERVAL = 100;     // 0.25 seconds between glows (2x faster)
const FAIL_GLOW_COUNT = 3;          // Number of red glow flashes


/**
 * Save the Emoji Game
 * 
 * A mini-game where all letters fall down with physics simulation,
 * leaving only the emoji "saved" in its original position.
 * 
 * Game Flow:
 * 1. Switch to light theme
 * 2. Letters fall with Matter.js physics
 * 3. Letters fade out after a delay
 * 4. Player interaction (coming soon)
 * 
 * @example
 * const game = new SaveTheEmojiGame();
 * game.start();
 * 
 * // Later...
 * game.stop();
 */
export class SaveTheEmojiGame {
    constructor() {
        this.letterFall = null;
        this.isActive = false;
        this.spiders = [];
        this.spiderPool = []; // Object pool for reusing spider elements
        this.spiderInterval = null;
        this.animationFrameId = null;

        // Slipper elements
        this.slipper = null;
        this.cursor = { x: 0, y: 0 };
        this.boundMouseMove = this._handleMouseMove.bind(this);
        this.boundMouseDown = this._handleMouseDown.bind(this);

        // Gesture control bindings
        this.boundGestureCursorMove = this._handleGestureCursorMove.bind(this);
        this.boundGesturePinch = this._handleGesturePinch.bind(this);
        this.isGestureMode = false;

        // Visibility change handler
        this.boundVisibilityChange = this._handleVisibilityChange.bind(this);
        this.isPaused = false;

        // Score system
        this.score = 0;
        this.scoreboard = new Scoreboard('saveTheEmoji_highScore');

        // Fail state
        this.isFailed = false;
        this.restartButton = null;
        this.failGlowElement = null;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    /**
     * Start the game
     * @returns {SaveTheEmojiGame} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        this.score = 0; // Reset score
        this.isFailed = false; // Reset fail state
        this._initSlipper();
        this.scoreboard.init();
        document.documentElement.setAttribute('data-game-active', 'save-the-emoji');
        this._startLetterFall();
        this._scheduleSpiderInvasion();
        this._initGestureListeners();
        this._initVisibilityListener();

        console.log('Save the Emoji: Game started!');
        return this;
    }

    /**
     * Stop the game and cleanup
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;

        this._stopLetterFall();
        this._stopSpiderInvasion();
        this._removeSlipper();
        this.scoreboard.remove();
        this._removeRestartButton();
        this._removeFailGlow();
        this._removeGestureListeners();
        this._removeVisibilityListener();
        document.documentElement.removeAttribute('data-game-active');

        console.log('Save the Emoji: Game stopped!');
    }

    /**
     * Check if the game is currently active
     * @returns {boolean}
     */
    get active() {
        return this.isActive;
    }

    // ==========================================
    // LETTER FALL EFFECT
    // ==========================================

    /**
     * @private
     */
    _startLetterFall() {
        // Small delay to let the dark theme transition be visible first
        setTimeout(() => {
            this.letterFall = new LetterFall({
                autoFadeOut: false,
                explosion: true,
                explosionStrength: 20,
                hasBoundaries: false
            });
            this.letterFall.start();

            console.log('Save the Emoji: Letters falling with physics!');
        }, 300);
    }

    /**
     * @private
     */
    _stopLetterFall() {
        if (this.letterFall) {
            this.letterFall.stop();
            this.letterFall = null;
        }
    }

    // ==========================================
    // SPIDER INVASION
    // ==========================================

    /**
     * @private
     */
    _scheduleSpiderInvasion() {
        // Wait 1 second after letters fall (which have 300ms delay)
        setTimeout(() => {
            if (!this.isActive) return;
            this._startSpiderInvasion();
        }, 1300);
    }

    /**
     * @private
     */
    _startSpiderInvasion() {
        this.spiderInterval = setInterval(() => {
            for (let i = 0; i < SPIDER_SPAWN_COUNT; i++) {
                this._spawnSpider();
            }
        }, SPIDER_SPAWN_INTERVAL * 1000);

        this._startSpiderLoop();
        console.log('Save the Emoji: Spiders are coming!');
    }

    /**
     * @private
     */
    _stopSpiderInvasion() {
        if (this.spiderInterval) {
            clearInterval(this.spiderInterval);
            this.spiderInterval = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove all spiders from DOM
        this.spiders.forEach(spider => {
            if (spider.element && spider.element.parentNode) {
                spider.element.remove();
            }
        });
        this.spiders = [];

        // Clean up pool
        this.spiderPool.forEach(element => {
            if (element && element.parentNode) {
                element.remove();
            }
        });
        this.spiderPool = [];
    }

    /**
     * @private
     */
    _spawnSpider() {
        const emoji = document.querySelector('.emoji-line');
        if (!emoji) return;

        // Get spider element from pool or create new one
        let spider;
        if (this.spiderPool.length > 0) {
            spider = this.spiderPool.pop();
            spider.classList.remove('dead');
            spider.style.display = 'flex';
        } else {
            spider = document.createElement('div');
            spider.className = 'game-spider';
            document.body.appendChild(spider);
        }

        const { innerWidth: width, innerHeight: height } = window;
        const emojiRect = emoji.getBoundingClientRect();
        const emojiX = emojiRect.left + emojiRect.width / 2;
        const emojiY = emojiRect.top + emojiRect.height / 2;

        // Pick a random side to start from (0: top, 1: right, 2: bottom, 3: left)
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Math.random() * width;
                y = -50;
                break;
            case 1: // Right
                x = width + 50;
                y = Math.random() * height;
                break;
            case 2: // Bottom
                x = Math.random() * width;
                y = height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * height;
                break;
        }

        // Calculate distance to emoji to set speed for exact travel time
        // speed = distance / (time * fps)
        const dx = emojiX - x;
        const dy = emojiY - y;
        const initialDistance = Math.sqrt(dx * dx + dy * dy);
        const speed = initialDistance / (SPIDER_TRAVEL_TIME * 60);

        const spiderObj = {
            element: spider,
            x: x,
            y: y,
            speed: speed,
            isDead: false
        };

        this.spiders.push(spiderObj);

        // Initial position
        spider.style.left = `${x}px`;
        spider.style.top = `${y}px`;
    }

    /**
     * @private
     */
    _startSpiderLoop() {
        const update = () => {
            if (!this.isActive) return;
            if (this.isPaused) {
                this.animationFrameId = requestAnimationFrame(update);
                return;
            }
            this._updateSpiders();
            this.animationFrameId = requestAnimationFrame(update);
        };
        update();
    }

    /**
     * @private
     */
    _updateSpiders() {
        const emoji = document.querySelector('.emoji-line');
        if (!emoji) return;

        // Don't update if game has failed
        if (this.isFailed) return;

        const emojiRect = emoji.getBoundingClientRect();
        const emojiX = emojiRect.left + emojiRect.width / 2;
        const emojiY = emojiRect.top + emojiRect.height / 2;
        for (let i = this.spiders.length - 1; i >= 0; i--) {
            const spider = this.spiders[i];
            if (spider.isDead) continue;

            // Check for collision with emoji
            const dx = emojiX - spider.x;
            const dy = emojiY - spider.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                // Spider reached the emoji - GAME OVER!
                this._triggerFail();
                return;
            }

            // Move towards emoji
            const vx = (dx / distance) * spider.speed;
            const vy = (dy / distance) * spider.speed;

            spider.x += vx;
            spider.y += vy;

            spider.element.style.left = `${spider.x}px`;
            spider.element.style.top = `${spider.y}px`;

            // Rotate spider to face movement direction
            const angle = Math.atan2(vy, vx) + Math.PI / 2;
            spider.element.style.transform = `rotate(${angle}rad)`;
        }
    }

    /**
     * Return spider element to pool for reuse
    /**
     * Return spider element to pool for reuse
     * @private
     */
    _returnSpiderToPool(spider) {
        spider.element.style.display = 'none';
        spider.element.classList.remove('dead', 'frozen');
        spider.element.style.transform = '';
        this.spiderPool.push(spider.element);
    }

    // ==========================================
    // SLIPPER MECHANIC
    // ==========================================

    /**
     * @private
     */
    _initSlipper() {
        this.slipper = document.createElement('div');
        this.slipper.className = 'game-slipper';
        document.body.appendChild(this.slipper);

        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mousedown', this.boundMouseDown);

        // Match current cursor position immediately
        this.slipper.style.left = `${this.cursor.x}px`;
        this.slipper.style.top = `${this.cursor.y}px`;
    }

    /**
     * @private
     */
    _removeSlipper() {
        if (this.slipper) {
            this.slipper.remove();
            this.slipper = null;
        }
        window.removeEventListener('mousemove', this.boundMouseMove);
        window.removeEventListener('mousedown', this.boundMouseDown);
    }

    /**
     * @private
     */
    _handleMouseMove(e) {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;

        if (this.slipper) {
            this.slipper.style.left = `${e.clientX}px`;
            this.slipper.style.top = `${e.clientY}px`;
        }
    }

    /**
     * @private
     */
    _handleMouseDown() {
        if (!this.slipper || this.isFailed) return;

        // Trigger animation
        this.slipper.classList.remove('slapping');
        void this.slipper.offsetWidth; // Trigger reflow
        this.slipper.classList.add('slapping');

        // Check for spider kills
        this._checkSpiderKill();
    }

    /**
     * @private
     */
    _checkSpiderKill() {
        if (this.isFailed) return; // Don't kill spiders when failed
        
        const killRadius = 60;

        for (let i = this.spiders.length - 1; i >= 0; i--) {
            const spider = this.spiders[i];
            if (spider.isDead) continue;

            const dist = Math.sqrt(
                Math.pow(this.cursor.x - spider.x, 2) +
                Math.pow(this.cursor.y - spider.y, 2)
            );

            if (dist < killRadius) {
                // Spider squashed by slipper!
                spider.isDead = true;
                spider.element.classList.add('dead');

                setTimeout(() => {
                    // Return to pool instead of removing from DOM
                    this._returnSpiderToPool(spider);
                    const index = this.spiders.indexOf(spider);
                    if (index > -1) this.spiders.splice(index, 1);

                    // Increment score
                    this.score += 1;
                    this.scoreboard.update(this.score);
                }, 500);
            }
        }
    }


    // ==========================================
    // GESTURE CONTROL
    // ==========================================

    /**
     * Initialize gesture event listeners
     * @private
     */
    _initGestureListeners() {
        // Check if gesture mode is active
        const customCursor = document.getElementById('custom-cursor');
        this.isGestureMode = customCursor && customCursor.style.display === 'block';

        window.addEventListener('gestureCursorMove', this.boundGestureCursorMove);
        window.addEventListener('gesturePinch', this.boundGesturePinch);
    }

    /**
     * Remove gesture event listeners
     * @private
     */
    _removeGestureListeners() {
        window.removeEventListener('gestureCursorMove', this.boundGestureCursorMove);
        window.removeEventListener('gesturePinch', this.boundGesturePinch);
    }

    /**
     * Handle gesture cursor movement - update slipper position
     * @private
     */
    _handleGestureCursorMove(e) {
        const { x, y } = e.detail;
        this.cursor.x = x;
        this.cursor.y = y;

        if (this.slipper) {
            this.slipper.style.left = `${x}px`;
            this.slipper.style.top = `${y}px`;
        }
    }

    /**
     * Handle gesture pinch - slap slipper
     * @private
     */
    _handleGesturePinch(e) {
        if (!this.slipper || this.isFailed) return;

        // Update cursor position from pinch event
        this.cursor.x = e.detail.x;
        this.cursor.y = e.detail.y;

        // Trigger slap animation
        this.slipper.classList.remove('slapping');
        void this.slipper.offsetWidth; // Trigger reflow
        this.slipper.classList.add('slapping');

        // Check for spider kills
        this._checkSpiderKill();
    }


    // ==========================================
    // VISIBILITY PAUSE (TAB HIDDEN)
    // ==========================================

    /**
     * @private
     */
    _initVisibilityListener() {
        document.addEventListener('visibilitychange', this.boundVisibilityChange);
    }

    /**
     * @private
     */
    _removeVisibilityListener() {
        document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    }

    /**
     * @private
     */
    _handleVisibilityChange() {
        this.isPaused = document.hidden;
    }


    // Scoreboard logic moved to Scoreboard.js component

    // ==========================================
    // FAIL SEQUENCE
    // ==========================================

    /**
     * Trigger fail sequence when spider reaches emoji
     * @private
     */
    _triggerFail() {
        if (this.isFailed) return;
        this.isFailed = true;

        // Stop spider spawning
        if (this.spiderInterval) {
            clearInterval(this.spiderInterval);
            this.spiderInterval = null;
        }

        // Freeze all spiders (stop animation)
        this.spiders.forEach(spider => {
            if (spider.element) {
                spider.element.classList.add('frozen');
            }
        });

        console.log('Save the Emoji: Game Over! Spider reached the emoji!');

        // Play fail glow sequence, then show restart button
        this._playFailGlow(() => {
            this._showRestartButton();
        });
    }

    /**
     * Play the fail glow animation sequence
     * @param {Function} callback - Called after glow sequence completes
     * @private
     */
    _playFailGlow(callback) {
        this._createFailGlow();
        
        // Start with glow active immediately
        this.failGlowElement.classList.add('active');

        let glowCount = 1; // Already showed first glow
        const glowInterval = setInterval(() => {
            // Toggle glow visibility
            if (this.failGlowElement) {
                this.failGlowElement.classList.toggle('active');
            }

            glowCount++;

            // Each toggle is half of a flash cycle
            // We need FAIL_GLOW_COUNT full cycles = FAIL_GLOW_COUNT * 2 toggles
            if (glowCount >= FAIL_GLOW_COUNT * 2) {
                clearInterval(glowInterval);
                if (callback) callback();
            }
        }, FAIL_GLOW_INTERVAL);
    }

    /**
     * Create the fail glow overlay element
     * @private
     */
    _createFailGlow() {
        if (this.failGlowElement) return;

        this.failGlowElement = document.createElement('div');
        this.failGlowElement.className = 'game-fail-glow';
        document.body.appendChild(this.failGlowElement);
    }

    /**
     * Remove the fail glow element
     * @private
     */
    _removeFailGlow() {
        if (this.failGlowElement) {
            this.failGlowElement.remove();
            this.failGlowElement = null;
        }
    }

    /**
     * Show the restart button below scoreboard
     * @private
     */
    _showRestartButton() {
        if (this.restartButton) return;

        this.restartButton = document.createElement('button');
        this.restartButton.className = 'game-restart-btn';
        this.restartButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
            </svg>
        `;
        this.restartButton.title = 'Restart';
        
        // Add click handler
        this.restartButton.addEventListener('click', () => {
            this._restart();
        });

        document.body.appendChild(this.restartButton);
    }

    /**
     * Remove the restart button
     * @private
     */
    _removeRestartButton() {
        if (this.restartButton) {
            this.restartButton.remove();
            this.restartButton = null;
        }
    }

    /**
     * Restart the game
     * @private
     */
    _restart() {
        // Clean up current game state but keep game active
        this._stopLetterFall();
        this._stopSpiderInvasion();
        this._removeSlipper();
        this.scoreboard.remove();
        this._removeRestartButton();
        this._removeFailGlow();

        // Reset state
        this.isActive = false;
        this.isFailed = false;
        this.score = 0;

        // Start fresh
        this.start();
    }
}
