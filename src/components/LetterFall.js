import Matter from 'matter-js';

/**
 * Default configuration for LetterFall
 */
const DEFAULT_CONFIG = {
    // Physics settings
    gravity: { x: 0, y: 1.5 },
    restitution: 0.4,
    friction: 0.3,
    frictionAir: 0.005,

    // Motion settings
    initialVelocity: { x: 5, y: 2 },
    angularVelocity: 0.3,
    initialAngle: 0.5,

    // Auto fade out settings
    autoFadeOut: true,
    fadeOutDelay: 3000,
    fadeOutDuration: 500,

    // Selectors
    containerSelector: '.container',
    textSelectors: '.intro-text, .title',

    // Explosion settings
    explosion: false,
    explosionStrength: 15
};

/**
 * LetterFall Component
 * 
 * A reusable physics-based letter falling effect using Matter.js.
 * Makes text elements fall with realistic physics simulation.
 * 
 * @example
 * // Basic usage with defaults
 * const letterFall = new LetterFall();
 * letterFall.start();
 * 
 * @example
 * // Custom configuration
 * const letterFall = new LetterFall({
 *     autoFadeOut: false,
 *     gravity: { x: 0, y: 2 }
 * });
 * letterFall.start();
 * 
 * // Manually fade out later
 * letterFall.fadeOut();
 */
export class LetterFall {
    /**
     * Create a LetterFall instance
     * @param {Object} config - Configuration options (merged with defaults)
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this._initState();
    }

    /**
     * Initialize/reset internal state
     * @private
     */
    _initState() {
        this.engine = null;
        this.runner = null;
        this.letterBodies = [];
        this.letterElements = [];
        this.originalPositions = [];
        this.isActive = false;
        this.fadeOutTimeout = null;
        this.animationFrameId = null;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    /**
     * Start the letter fall effect
     * @returns {LetterFall} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        this._createPhysicsEngine();
        this._collectAndCreateLetters();

        if (this.letterElements.length === 0) {
            console.warn('LetterFall: No text elements found');
            this.isActive = false;
            return this;
        }

        this._createPhysicsWorld();
        this._startSimulation();
        this._startAnimationLoop();

        if (this.config.autoFadeOut) {
            this._scheduleFadeOut();
        }

        return this;
    }

    /**
     * Fade out all letters smoothly
     * @param {number} duration - Fade duration in ms (optional, uses config default)
     * @returns {Promise} Resolves when fade is complete
     */
    fadeOut(duration = this.config.fadeOutDuration) {
        return new Promise((resolve) => {
            this.letterElements.forEach(element => {
                if (element) {
                    element.style.transition = `opacity ${duration}ms ease`;
                    element.style.opacity = '0';
                }
            });

            setTimeout(() => {
                this._removeLetterElements();
                resolve();
            }, duration);
        });
    }

    /**
     * Stop the effect and clean up all resources
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;

        this._clearScheduledFadeOut();
        this._stopAnimationLoop();
        this._stopPhysics();
        this._removeLetterElements();
        this._restoreOriginalElements();
        this._initState();
    }

    /**
     * Check if the effect is currently active
     * @returns {boolean}
     */
    get active() {
        return this.isActive;
    }

    // ==========================================
    // PHYSICS ENGINE
    // ==========================================

    /**
     * @private
     */
    _createPhysicsEngine() {
        this.engine = Matter.Engine.create({
            gravity: this.config.gravity
        });
    }

    /**
     * @private
     */
    _createPhysicsWorld() {
        const world = this.engine.world;
        const { innerWidth: width, innerHeight: height } = window;

        const boundaries = [
            // Floor - at the bottom edge of the screen
            Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, { isStatic: true }),
            // Left wall
            Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true }),
            // Right wall
            Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true })
        ];

        Matter.Composite.add(world, [...boundaries, ...this.letterBodies]);
    }

    /**
     * @private
     */
    _startSimulation() {
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
    }

    /**
     * @private
     */
    _stopPhysics() {
        if (this.runner) {
            Matter.Runner.stop(this.runner);
        }
        if (this.engine) {
            Matter.Engine.clear(this.engine);
        }
    }

    // ==========================================
    // LETTER COLLECTION & CREATION
    // ==========================================

    /**
     * @private
     */
    _collectAndCreateLetters() {
        const container = document.querySelector(this.config.containerSelector);
        if (!container) return;

        const textElements = container.querySelectorAll(this.config.textSelectors);

        textElements.forEach(element => {
            this._processTextElement(element);
        });
    }

    /**
     * @private
     */
    _processTextElement(element) {
        const text = element.textContent;
        const rect = element.getBoundingClientRect();
        const computedStyle = getComputedStyle(element);

        // Hide original element
        element.style.visibility = 'hidden';

        let charOffset = 0;

        for (const char of text) {
            if (char.trim() === '') {
                charOffset += this._measureCharWidth(computedStyle, ' ');
                continue;
            }

            const { span, charRect } = this._createCharacterSpan(char, rect, charOffset, computedStyle);
            const body = this._createPhysicsBody(charRect);

            this.letterElements.push(span);
            this.letterBodies.push(body);
            this.originalPositions.push({
                width: charRect.width,
                height: charRect.height
            });

            charOffset += charRect.width;
        }
    }

    /**
     * @private
     */
    _createCharacterSpan(char, parentRect, offset, style) {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'falling-letter';
        span.style.cssText = `
            position: fixed;
            left: ${parentRect.left + offset}px;
            top: ${parentRect.top}px;
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize};
            font-weight: ${style.fontWeight};
            color: ${style.color};
            pointer-events: none;
            z-index: 1000;
            transform-origin: center center;
        `;

        document.body.appendChild(span);
        const charRect = span.getBoundingClientRect();

        return { span, charRect };
    }

    /**
     * @private
     */
    _createPhysicsBody(rect) {
        const { restitution, friction, frictionAir, initialAngle, initialVelocity, angularVelocity } = this.config;

        const body = Matter.Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
                restitution,
                friction,
                frictionAir,
                angle: (Math.random() - 0.5) * initialAngle
            }
        );

        // Apply initial velocity
        if (this.config.explosion) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const dx = body.position.x - centerX;
            const dy = body.position.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            Matter.Body.setVelocity(body, {
                x: (dx / dist) * this.config.explosionStrength,
                y: (dy / dist) * this.config.explosionStrength
            });
        } else {
            // Default downward random velocity
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * initialVelocity.x,
                y: Math.random() * initialVelocity.y
            });
        }

        // Apply angular velocity for tumbling effect
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * angularVelocity);

        return body;
    }

    /**
     * @private
     */
    _measureCharWidth(style, char) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        return ctx.measureText(char).width;
    }

    // ==========================================
    // ANIMATION LOOP
    // ==========================================

    /**
     * @private
     */
    _startAnimationLoop() {
        const animate = () => {
            if (!this.isActive) return;

            this._updateLetterPositions();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * @private
     */
    _stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * @private
     */
    _updateLetterPositions() {
        this.letterBodies.forEach((body, index) => {
            const element = this.letterElements[index];
            const pos = this.originalPositions[index];
            if (!element || !pos) return;

            element.style.left = `${body.position.x - pos.width / 2}px`;
            element.style.top = `${body.position.y - pos.height / 2}px`;
            element.style.transform = `rotate(${body.angle}rad)`;
        });
    }

    // ==========================================
    // FADE OUT & CLEANUP
    // ==========================================

    /**
     * @private
     */
    _scheduleFadeOut() {
        this.fadeOutTimeout = setTimeout(() => {
            this.fadeOut();
        }, this.config.fadeOutDelay);
    }

    /**
     * @private
     */
    _clearScheduledFadeOut() {
        if (this.fadeOutTimeout) {
            clearTimeout(this.fadeOutTimeout);
            this.fadeOutTimeout = null;
        }
    }

    /**
     * @private
     */
    _removeLetterElements() {
        this.letterElements.forEach(element => {
            if (element?.parentNode) {
                element.remove();
            }
        });
    }

    /**
     * @private
     */
    _restoreOriginalElements() {
        const container = document.querySelector(this.config.containerSelector);
        if (!container) return;

        const textElements = container.querySelectorAll(this.config.textSelectors);
        textElements.forEach(element => {
            element.style.visibility = 'visible';
        });
    }
}
