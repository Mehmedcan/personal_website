import { isMobileDevice } from './utils/device.js';
import { query, queryAll } from './utils/dom.js';
import {
    PARTICLE_SPACING,
    PARTICLE_SIZE,
    PARTICLE_PUSH_RADIUS,
    PARTICLE_DEFAULT_VISIBILITY_RADIUS,
    PARTICLE_HOVER_VISIBILITY_RADIUS,
    PARTICLE_BUTTON_VISIBILITY_RADIUS,
    CIRCLE_RADIUS_MULTIPLIER,
    CIRCLE_LERP_ENABLED,
    CIRCLE_LERP_SPEED,
    CIRCLE_ROTATION_SPEED,
    DEFAULT_PARTICLE_COLORS
} from './config/constants.js';

/**
 * ParticleSystem
 * Creates and animates interactive particles that respond to mouse/gesture input
 */
export class ParticleSystem {
    constructor() {
        this.isMobile = isMobileDevice();

        // Early exit for mobile - no particles
        if (this.isMobile) {
            this.enableMobileFallback();
            return;
        }

        this.initializeState();
        this.createCanvas();
        this.init();
    }

    initializeState() {
        // Canvas and rendering
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particlePool = []; // Object pool for reusing particles
        this.time = 0;
        this.animationPaused = false;

        // Mouse/cursor tracking
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        this.isGestureActive = false;

        // Button interaction
        this.buttons = [];
        this.buttonsData = [];
        this.isHovering = false;
        this.buttonPositionsDirty = true;

        // Visibility control
        this.forceMultiplier = 1;
        this.currentVisibilityRadius = PARTICLE_DEFAULT_VISIBILITY_RADIUS;
        this.scrollVisibilityMultiplier = 1.0;
        this.targetScrollVisibility = 1.0;

        // Pre-calculated squared radii for faster distance checks
        this.visibilityRadiusSq = PARTICLE_DEFAULT_VISIBILITY_RADIUS * PARTICLE_DEFAULT_VISIBILITY_RADIUS;
        this.pushRadiusSq = PARTICLE_PUSH_RADIUS * PARTICLE_PUSH_RADIUS;
        this.buttonVisibilityRadiusSq = PARTICLE_BUTTON_VISIBILITY_RADIUS * PARTICLE_BUTTON_VISIBILITY_RADIUS;

        // Colors
        this.particleColors = [...DEFAULT_PARTICLE_COLORS];
        this.updateParticleColors();

        // Render batches for path batching optimization
        this.renderBatches = [[], []]; // One batch per color
    }

    enableMobileFallback() {
        const buttons = queryAll('.social-links a');
        buttons.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    }

    createCanvas() {
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '0',
            pointerEvents: 'none',
            contain: 'strict'
        });
        document.body.appendChild(this.canvas);
    }

    updateParticleColors() {
        const accent = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color').trim();

        if (accent) {
            this.particleColors = [accent, '#9089fc'];
        }
    }

    init() {
        // DOM references
        this.containerElement = query('.container');
        this.resumeSectionElement = query('.resume-section');
        this.buttons = Array.from(queryAll('.social-links a'));

        this.setupButtonHoverListeners();
        this.setupEventListeners();
        this.resize();
        this.updateScrollVisibility();
        this.updateParticleGrid();
        this.animate();
    }

    setupButtonHoverListeners() {
        this.buttons.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => {
                this.isHovering = true;
                if (this.buttonsData[index]) {
                    this.buttonsData[index].isHovered = true;
                }
            });

            btn.addEventListener('mouseleave', () => {
                this.isHovering = false;
                if (this.buttonsData[index]) {
                    this.buttonsData[index].isHovered = false;
                    this.resetButtonCircleState(index);
                }
            });
        });
    }

    resetButtonCircleState(buttonIndex) {
        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            const p = this.particles[i];
            if (p.circleState?.buttonIndex === buttonIndex) {
                p.circleState = null;
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.buttonPositionsDirty = true;
        });

        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        }, { passive: true });

        window.addEventListener('scroll', () => {
            this.updateScrollVisibility();
            this.buttonPositionsDirty = true;
            // Resume animation if it was paused and we're scrolling back up
            this.resumeAnimation();
        }, { passive: true });

        // Pause animation when tab is hidden (background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.animationPaused = true;
            } else {
                this.resumeAnimation();
            }
        });
    }

    setTarget(x, y) {
        this.targetMouseX = x;
        this.targetMouseY = y;
    }

    setIsGestureActive(active) {
        this.isGestureActive = active;
    }

    updateButtonPositions() {
        // Only update if positions are dirty (scroll/resize happened)
        if (!this.buttonPositionsDirty) return;

        this.buttonsData = this.buttons.map((btn, index) => {
            const rect = btn.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                radius: rect.width,
                radiusSq: rect.width * rect.width, // Pre-calculate squared radius
                isHovered: this.buttonsData[index]?.isHovered ?? false,
                element: btn
            };
        });

        this.buttonPositionsDirty = false;
    }

    updateScrollVisibility() {
        if (!this.containerElement || !this.resumeSectionElement) {
            this.targetScrollVisibility = 1.0;
            return;
        }

        const resumeRect = this.resumeSectionElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Fade thresholds
        const fadeStartPoint = viewportHeight * 0.7;
        const fadeEndPoint = viewportHeight * 0.5;

        if (resumeRect.top < fadeStartPoint) {
            if (resumeRect.top <= fadeEndPoint) {
                this.targetScrollVisibility = 0;
            } else {
                const fadeProgress = (fadeStartPoint - resumeRect.top) / (fadeStartPoint - fadeEndPoint);
                this.targetScrollVisibility = Math.max(0, 1 - fadeProgress);
            }
        } else {
            this.targetScrollVisibility = 1.0;
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updateParticleGrid();
        this.buttonPositionsDirty = true;
    }

    /**
     * Update particle grid with pooling - reuses existing particles
     * instead of creating new ones on every resize
     */
    updateParticleGrid() {
        const rows = Math.ceil(this.canvas.height / PARTICLE_SPACING);
        const cols = Math.ceil(this.canvas.width / PARTICLE_SPACING);
        const requiredCount = rows * cols;
        const currentCount = this.particles.length;

        // Reuse existing particles and update their positions
        let index = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (index < currentCount) {
                    // Reuse existing particle - just update position
                    this.particles[index].originX = i * PARTICLE_SPACING;
                    this.particles[index].originY = j * PARTICLE_SPACING;
                    this.particles[index].circleState = null;
                    this.particles[index].circleLerpProgress = 0;
                } else {
                    // Need more particles - create from pool or new
                    const particle = this.particlePool.length > 0
                        ? this.recycleParticle(this.particlePool.pop(), i, j)
                        : this.createParticle(i, j);
                    this.particles.push(particle);
                }
                index++;
            }
        }

        // Move excess particles to pool (don't delete, reuse later)
        if (currentCount > requiredCount) {
            const excess = this.particles.splice(requiredCount);
            this.particlePool.push(...excess);
            // Limit pool size to prevent memory bloat
            if (this.particlePool.length > 500) {
                this.particlePool.length = 500;
            }
        }
    }

    /**
     * Recycle a particle from pool with new position
     */
    recycleParticle(particle, col, row) {
        particle.originX = col * PARTICLE_SPACING;
        particle.originY = row * PARTICLE_SPACING;
        particle.circleState = null;
        particle.circleLerpProgress = 0;
        return particle;
    }

    createParticle(col, row) {
        return {
            originX: col * PARTICLE_SPACING,
            originY: row * PARTICLE_SPACING,
            size: PARTICLE_SIZE,
            colorIndex: Math.random() > 0.5 ? 0 : 1,

            // Wave animation frequencies and phases
            fx1: 0.01 + Math.random() * 0.04,
            fx2: 0.01 + Math.random() * 0.04,
            fy1: 0.01 + Math.random() * 0.04,
            fy2: 0.01 + Math.random() * 0.04,
            phaseX1: Math.random() * Math.PI * 2,
            phaseX2: Math.random() * Math.PI * 2,
            phaseY1: Math.random() * Math.PI * 2,
            phaseY2: Math.random() * Math.PI * 2,
            amp: 10 + Math.random() * 10,

            // Circle animation state
            circleState: null,
            circleRadiusOffset: (Math.random() - 0.5) * 8,
            circleAngleOffset: (Math.random() - 0.5) * 0.15,
            circleScale: 0.3 + Math.random() * 0.5,
            circleLerpProgress: 0
        };
    }

    animate() {
        // Update scroll visibility first (always needed to detect when to resume)
        this.updateVisibilityState();

        // If particles are completely invisible, pause animation loop
        if (this.scrollVisibilityMultiplier < 0.01) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animationPaused = true;
            return; // Stop the animation loop completely
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 1;

        this.updateMousePosition();
        this.updateButtonPositions();
        this.updateButtonVisibility();
        this.renderParticlesBatched();

        requestAnimationFrame(() => this.animate());
    }

    /**
     * Resume animation if it was paused
     */
    resumeAnimation() {
        if (this.animationPaused) {
            this.animationPaused = false;
            this.animate();
        }
    }

    updateVisibilityState() {
        // Smooth lerp for scroll visibility
        this.scrollVisibilityMultiplier += (this.targetScrollVisibility - this.scrollVisibilityMultiplier) * 0.1;

        // Dynamic visibility radius based on hover
        const targetRadius = this.isHovering
            ? PARTICLE_HOVER_VISIBILITY_RADIUS
            : PARTICLE_DEFAULT_VISIBILITY_RADIUS;
        this.currentVisibilityRadius += (targetRadius - this.currentVisibilityRadius) * 0.1;

        this.visibilityRadiusSq = this.currentVisibilityRadius * this.currentVisibilityRadius;

        // Force direction: positive = repulsion, negative = attraction
        const targetMultiplier = this.isHovering ? -2.5 : 1.0;
        this.forceMultiplier += (targetMultiplier - this.forceMultiplier) * 0.1;
    }

    updateMousePosition() {
        if (this.isGestureActive) {
            // Direct assignment when using gesture (lerp handled externally)
            this.currentMouseX = this.targetMouseX;
            this.currentMouseY = this.targetMouseY;
        } else {
            this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.1;
            this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.1;
        }
    }

    updateButtonVisibility() {
        if (!this.buttonsData) return;

        // Gesture mode: determine hover state from cursor position
        if (this.isGestureActive) {
            this.updateGestureHoverState();
        }

        // Update button opacity based on distance (using squared distance)
        const len = this.buttonsData.length;
        for (let i = 0; i < len; i++) {
            const btnData = this.buttonsData[i];
            const dx = this.currentMouseX - btnData.x;
            const dy = this.currentMouseY - btnData.y;
            const distSq = dx * dx + dy * dy;

            let opacity = 0;
            if (distSq < this.buttonVisibilityRadiusSq) {
                const dist = Math.sqrt(distSq);
                opacity = Math.max(0, 1 - Math.pow(dist / PARTICLE_BUTTON_VISIBILITY_RADIUS, 2));
                opacity = Math.pow(opacity, 0.5);
            }

            btnData.element.style.opacity = opacity;
            btnData.element.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        }
    }

    updateGestureHoverState() {
        let anyHovered = false;

        const len = this.buttonsData.length;
        for (let i = 0; i < len; i++) {
            const btnData = this.buttonsData[i];
            const rect = btnData.element.getBoundingClientRect();
            const isInside = (
                this.currentMouseX >= rect.left &&
                this.currentMouseX <= rect.right &&
                this.currentMouseY >= rect.top &&
                this.currentMouseY <= rect.bottom
            );

            if (isInside) {
                if (!btnData.isHovered) {
                    btnData.isHovered = true;
                    btnData.element.classList.add('gesture-hover');
                }
                anyHovered = true;
            } else if (btnData.isHovered) {
                btnData.isHovered = false;
                btnData.element.classList.remove('gesture-hover');
                this.resetButtonCircleState(i);
            }
        }

        this.isHovering = anyHovered;
    }

    /**
     * Batched rendering - groups particles by color and renders each group
     * with a single stroke call, dramatically reducing draw calls
     */
    renderParticlesBatched() {
        // Clear batches
        this.renderBatches[0].length = 0;
        this.renderBatches[1].length = 0;

        const len = this.particles.length;
        const mouseX = this.currentMouseX;
        const mouseY = this.currentMouseY;
        const visRadiusSq = this.visibilityRadiusSq;

        for (let i = 0; i < len; i++) {
            const p = this.particles[i];

            const dx = mouseX - p.originX;
            const dy = mouseY - p.originY;
            const distSq = dx * dx + dy * dy;

            if (distSq >= visRadiusSq) continue;

            const distance = Math.sqrt(distSq);

            const renderData = this.processParticle(p, dx, dy, distance);
            if (renderData) {
                this.renderBatches[p.colorIndex].push(renderData);
            }
        }

        this.renderBatch(0);
        this.renderBatch(1);
    }

    processParticle(p, dx, dy, distance) {
        // Calculate wave animation
        const waveX = (Math.sin(this.time * p.fx1 + p.phaseX1) + Math.cos(this.time * p.fx2 + p.phaseX2)) * p.amp;
        const waveY = (Math.sin(this.time * p.fy1 + p.phaseY1) + Math.cos(this.time * p.fy2 + p.phaseY2)) * p.amp;

        // Calculate push force
        const { pushX, pushY } = this.calculatePushForce(dx, dy, distance);

        const currentAnimX = p.originX + waveX + pushX;
        const currentAnimY = p.originY + waveY + pushY;

        // Update circle state
        this.updateParticleCircleState(p, currentAnimX, currentAnimY);

        // Calculate final position (lerp between normal and circle animation)
        const { x, y, angle, scale } = this.calculateParticleTransform(p, currentAnimX, currentAnimY, distance);

        // Calculate opacity
        let opacity = Math.max(0, 1 - Math.pow(distance / this.currentVisibilityRadius, 2));
        opacity *= 0.5 * this.scrollVisibilityMultiplier;

        if (opacity <= 0) return null;

        return { x, y, angle, scale, opacity, size: p.size };
    }

    renderBatch(colorIndex) {
        const batch = this.renderBatches[colorIndex];
        if (batch.length === 0) return;

        const ctx = this.ctx;
        ctx.strokeStyle = this.particleColors[colorIndex];
        ctx.lineCap = 'round';

        const len = batch.length;
        for (let i = 0; i < len; i++) {
            const { x, y, angle, scale, opacity, size } = batch[i];

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 3 * scale;

            ctx.beginPath();
            ctx.moveTo(-size * 2 * scale, 0);
            ctx.lineTo(size * 2 * scale, 0);
            ctx.stroke();

            ctx.restore();
        }
    }

    calculatePushForce(dx, dy, distance) {
        if (distance >= PARTICLE_PUSH_RADIUS) {
            return { pushX: 0, pushY: 0 };
        }

        const angleToParticle = Math.atan2(-dy, -dx);
        const force = (1 - distance / PARTICLE_PUSH_RADIUS) * 120 * this.forceMultiplier;

        return {
            pushX: Math.cos(angleToParticle) * force,
            pushY: Math.sin(angleToParticle) * force
        };
    }

    updateParticleCircleState(p, animX, animY) {
        const circleData = this.findHoveredButtonCircle(animX, animY);

        if (circleData) {
            if (!p.circleState || p.circleState.buttonIndex !== circleData.buttonIndex) {
                // Entering new circle
                const angle = Math.atan2(animY - circleData.y, animX - circleData.x);
                p.circleState = {
                    buttonIndex: circleData.buttonIndex,
                    angle: angle,
                    targetRadius: circleData.radius
                };
                p.circleLerpProgress = 0;
            } else {
                // Rotating in circle
                p.circleState.angle += CIRCLE_ROTATION_SPEED;
                if (p.circleState.angle > Math.PI * 2) {
                    p.circleState.angle -= Math.PI * 2;
                }
            }

            // Lerp towards circle animation
            if (CIRCLE_LERP_ENABLED) {
                p.circleLerpProgress = Math.min(1, p.circleLerpProgress + CIRCLE_LERP_SPEED);
            } else {
                p.circleLerpProgress = 1;
            }
        } else {
            // Exiting circle
            if (p.circleState) {
                if (CIRCLE_LERP_ENABLED) {
                    p.circleLerpProgress = Math.max(0, p.circleLerpProgress - CIRCLE_LERP_SPEED);
                    if (p.circleLerpProgress <= 0) {
                        p.circleState = null;
                    }
                } else {
                    p.circleLerpProgress = 0;
                    p.circleState = null;
                }
            } else {
                p.circleLerpProgress = 0;
            }
        }
    }

    findHoveredButtonCircle(x, y) {
        if (!this.buttonsData) return null;

        const len = this.buttonsData.length;
        for (let i = 0; i < len; i++) {
            const btn = this.buttonsData[i];
            if (!btn.isHovered) continue;

            const radius = btn.radius * CIRCLE_RADIUS_MULTIPLIER;
            const dx = x - btn.x;
            const dy = y - btn.y;
            const distSq = dx * dx + dy * dy;
            const radiusSq = radius * radius;

            if (distSq <= radiusSq) {
                return { buttonIndex: i, x: btn.x, y: btn.y, radius };
            }
        }

        return null;
    }

    calculateParticleTransform(p, animX, animY, distance) {
        const normalAngle = Math.atan2(this.currentMouseY - animY, this.currentMouseX - animX);

        let circleX = animX;
        let circleY = animY;
        let circleAngle = normalAngle;

        // Calculate circle position if in circle state
        if (p.circleState) {
            const btnData = this.buttonsData[p.circleState.buttonIndex];
            if (btnData) {
                const radius = btnData.radius * CIRCLE_RADIUS_MULTIPLIER + p.circleRadiusOffset;
                const angle = p.circleState.angle + p.circleAngleOffset;

                circleX = btnData.x + radius * Math.cos(angle);
                circleY = btnData.y + radius * Math.sin(angle);
                circleAngle = angle + Math.PI / 2; // Tangent direction
            }
        }

        // Lerp between normal and circle positions
        const lerp = p.circleLerpProgress;
        const x = animX + (circleX - animX) * lerp;
        const y = animY + (circleY - animY) * lerp;

        // Lerp angle with wrapping
        let angleDiff = circleAngle - normalAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const angle = normalAngle + angleDiff * lerp;

        // Calculate scale
        let scale = 1;
        if (p.circleState) {
            scale = p.circleScale;
        } else if (distance < PARTICLE_PUSH_RADIUS) {
            scale = 0.1 + (distance / PARTICLE_PUSH_RADIUS) * 0.9;
        }

        return { x, y, angle, scale };
    }
}
