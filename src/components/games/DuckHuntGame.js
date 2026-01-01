/**
 * Duck Hunt Game
 */

// ==========================================
// GAME CONFIGURATION
// ==========================================
const DUCK_SPAWN_INTERVAL = 2.0;      // Seconds between duck spawns
const DUCK_SPEED = 3;                  // Pixels per frame
const DUCK_DIRECTION_CHANGE_INTERVAL = 1.5;  // Seconds between possible direction changes

// Direction constants
const DIRECTIONS = {
    UP: 'up',
    DIAGONAL_LEFT: 'diagonal-left',
    DIAGONAL_RIGHT: 'diagonal-right',
    HORIZONTAL_LEFT: 'horizontal-left',
    HORIZONTAL_RIGHT: 'horizontal-right'
};

// Initial spawn directions (only upward movements)
const INITIAL_DIRECTIONS = [
    DIRECTIONS.UP,
    DIRECTIONS.DIAGONAL_LEFT,
    DIRECTIONS.DIAGONAL_RIGHT
];

// All possible directions for direction changes
const ALL_DIRECTIONS = [
    DIRECTIONS.UP,
    DIRECTIONS.DIAGONAL_LEFT,
    DIRECTIONS.DIAGONAL_RIGHT,
    DIRECTIONS.HORIZONTAL_LEFT,
    DIRECTIONS.HORIZONTAL_RIGHT
];

export class DuckHuntGame {
    constructor() {
        this.isActive = false;
        this.backgroundElement = null;
        this.leftGrass = null;
        this.rightGrass = null;
        this.container = null;
        this.previousTheme = null;

        // Duck system
        this.ducks = [];
        this.duckSpawnInterval = null;
        this.animationFrameId = null;
        this.titleRect = null;
    }

    /**
     * Start the game
     * @returns {DuckHuntGame} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        this._savePreviousTheme();
        this._switchToLightTheme();

        // First zoom and position the container, then show background
        this._setupGamePosition().then(() => {
            this._createBackground();
            this._startDuckSpawning();
        });

        console.log('Duck Hunt: Game started!');
        return this;
    }

    /**
     * Stop the game and cleanup
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;

        this._stopDuckSpawning();
        this._removeBackground();
        this._resetGamePosition();
        this._restorePreviousTheme();

        console.log('Duck Hunt: Game stopped!');
    }

    /**
     * Check if the game is currently active
     * @returns {boolean}
     */
    get active() {
        return this.isActive;
    }

    // ==========================================
    // THEME MANAGEMENT
    // ==========================================

    /**
     * @private
     */
    _savePreviousTheme() {
        this.previousTheme = document.documentElement.getAttribute('data-theme') || 'light';
    }

    /**
     * @private
     */
    _switchToLightTheme() {
        document.documentElement.setAttribute('data-theme', 'light');

        // Update theme toggle button state
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.classList.remove('theme-toggle--toggled');
        }

        console.log('Duck Hunt: Switched to light mode');
    }

    /**
     * @private
     */
    _restorePreviousTheme() {
        if (!this.previousTheme) return;

        document.documentElement.setAttribute('data-theme', this.previousTheme);

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.classList.toggle('theme-toggle--toggled', this.previousTheme === 'dark');
        }

        this.previousTheme = null;
        console.log('Duck Hunt: Restored previous theme');
    }

    // ==========================================
    // GAME POSITION SETUP
    // ==========================================

    /**
     * Zoom in and move the container down for game positioning
     * @private
     * @returns {Promise}
     */
    _setupGamePosition() {
        return new Promise((resolve) => {
            this.container = document.querySelector('.container');
            if (!this.container) {
                resolve();
                return;
            }

            // Add animation styles if not already added
            if (!document.getElementById('duck-hunt-animation-styles')) {
                const style = document.createElement('style');
                style.id = 'duck-hunt-animation-styles';
                style.textContent = `
                    @keyframes duckHuntBounceIn {
                        0% {
                            transform: scaleY(0);
                        }
                        100% {
                            transform: scaleY(1);
                        }
                    }
                    
                    @keyframes duckHuntZoomIn {
                        0% {
                            transform: scale(1) translateY(0);
                        }
                        100% {
                            transform: scale(1.5) translateY(28vh);
                        }
                    }
                    
                    @keyframes duckFlying {
                        0%, 100% {
                            transform: translateY(0) rotate(-3deg);
                        }
                        50% {
                            transform: translateY(-8px) rotate(3deg);
                        }
                    }
                    
                    .game-duck {
                        animation: duckFlying 0.3s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
            }

            // Apply zoom animation to container
            this.container.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.container.style.transformOrigin = 'center center';
            this.container.style.transform = 'scale(1.65) translateY(calc(28vh - 50px))';

            // Wait for animation to complete
            setTimeout(resolve, 850);
        });
    }

    /**
     * Reset container position when game stops
     * @private
     */
    _resetGamePosition() {
        if (this.container) {
            this.container.style.transition = 'transform 0.5s ease-out';
            this.container.style.transform = '';

            // Clean up after transition
            setTimeout(() => {
                if (this.container) {
                    this.container.style.transition = '';
                    this.container.style.transformOrigin = '';
                }
            }, 500);
        }
    }

    // ==========================================
    // DUCK SPAWNING & MOVEMENT
    // ==========================================

    /**
     * Start spawning ducks
     * @private
     */
    _startDuckSpawning() {
        // Get title rect for spawn position
        const title = document.querySelector('.title');
        if (title) {
            this.titleRect = title.getBoundingClientRect();
        }

        // Spawn first duck immediately
        this._spawnDuck();

        // Set up interval for spawning
        this.duckSpawnInterval = setInterval(() => {
            this._spawnDuck();
        }, DUCK_SPAWN_INTERVAL * 1000);

        // Start animation loop
        this._startDuckLoop();

        console.log('Duck Hunt: Ducks are spawning!');
    }

    /**
     * Stop spawning ducks
     * @private
     */
    _stopDuckSpawning() {
        if (this.duckSpawnInterval) {
            clearInterval(this.duckSpawnInterval);
            this.duckSpawnInterval = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove all ducks from DOM
        this.ducks.forEach(duck => {
            if (duck.element && duck.element.parentNode) {
                duck.element.remove();
            }
        });
        this.ducks = [];
    }

    /**
     * Spawn a new duck
     * @private
     */
    _spawnDuck() {
        if (!this.titleRect) return;

        // Create duck element
        const duck = document.createElement('div');
        duck.className = 'game-duck';
        duck.style.cssText = `
            position: fixed;
            width: 120px;
            height: 120px;
            z-index: 50;
            pointer-events: auto;
            cursor: crosshair;
        `;

        // Create duck image
        const img = document.createElement('img');
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        duck.appendChild(img);

        // Random spawn position - center 1/4 of screen width
        const screenWidth = window.innerWidth;
        const spawnAreaWidth = screenWidth / 4;
        const spawnAreaStart = (screenWidth - spawnAreaWidth) / 2;
        const spawnX = spawnAreaStart + Math.random() * spawnAreaWidth;
        const spawnY = this.titleRect.bottom - 30; // Start from behind the text

        // Random initial direction
        const initialDirection = INITIAL_DIRECTIONS[Math.floor(Math.random() * INITIAL_DIRECTIONS.length)];

        // Duck object
        const duckObj = {
            element: duck,
            img: img,
            x: spawnX,
            y: spawnY,
            direction: initialDirection,
            lastDirectionChange: Date.now(),
            isDead: false
        };

        // Set initial sprite
        this._updateDuckSprite(duckObj);

        // Add click handler for killing duck
        duck.addEventListener('click', (e) => {
            e.stopPropagation();
            this._killDuck(duckObj);
        });

        // Position duck
        duck.style.left = `${spawnX}px`;
        duck.style.top = `${spawnY}px`;

        document.body.appendChild(duck);
        this.ducks.push(duckObj);
    }

    /**
     * Kill a duck when clicked
     * @private
     */
    _killDuck(duck) {
        if (duck.isDead) return;

        duck.isDead = true;

        // Change to falling sprite
        duck.img.src = '/images/duck-d0.png';
        duck.img.style.transform = 'scaleX(1)';

        // Stop flying animation, add falling style
        duck.element.style.animation = 'none';
        duck.element.style.transition = 'transform 0.1s';
        duck.element.style.cursor = 'default';
        duck.element.style.pointerEvents = 'none';

        console.log('Duck Hunt: Duck killed!');
    }

    /**
     * Start the duck animation loop
     * @private
     */
    _startDuckLoop() {
        const update = () => {
            if (!this.isActive) return;
            this._updateDucks();
            this.animationFrameId = requestAnimationFrame(update);
        };
        update();
    }

    /**
     * Update all ducks
     * @private
     */
    _updateDucks() {
        const now = Date.now();

        for (let i = this.ducks.length - 1; i >= 0; i--) {
            const duck = this.ducks[i];

            // Handle dead ducks - they fall down
            if (duck.isDead) {
                duck.y += DUCK_SPEED * 2; // Fall faster
                duck.element.style.top = `${duck.y}px`;

                // Remove when below screen
                if (duck.y > window.innerHeight + 100) {
                    duck.element.remove();
                    this.ducks.splice(i, 1);
                }
                continue;
            }

            // Check for direction change
            if ((now - duck.lastDirectionChange) / 1000 >= DUCK_DIRECTION_CHANGE_INTERVAL) {
                // Random chance to change direction
                if (Math.random() < 0.5) {
                    duck.direction = ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)];
                    this._updateDuckSprite(duck);
                }
                duck.lastDirectionChange = now;
            }

            // Calculate velocity based on direction
            let vx = 0, vy = 0;
            switch (duck.direction) {
                case DIRECTIONS.UP:
                    vx = 0;
                    vy = -DUCK_SPEED;
                    break;
                case DIRECTIONS.DIAGONAL_LEFT:
                    vx = -DUCK_SPEED * 0.7;
                    vy = -DUCK_SPEED * 0.7;
                    break;
                case DIRECTIONS.DIAGONAL_RIGHT:
                    vx = DUCK_SPEED * 0.7;
                    vy = -DUCK_SPEED * 0.7;
                    break;
                case DIRECTIONS.HORIZONTAL_LEFT:
                    vx = -DUCK_SPEED;
                    vy = 0;
                    break;
                case DIRECTIONS.HORIZONTAL_RIGHT:
                    vx = DUCK_SPEED;
                    vy = 0;
                    break;
            }

            // Update position
            duck.x += vx;
            duck.y += vy;

            duck.element.style.left = `${duck.x}px`;
            duck.element.style.top = `${duck.y}px`;

            // Check if duck is off screen (top, left, right)
            if (duck.y < -100 || duck.x < -100 || duck.x > window.innerWidth + 100) {
                duck.element.remove();
                this.ducks.splice(i, 1);
            }
        }
    }

    /**
     * Update duck sprite based on direction
     * @private
     */
    _updateDuckSprite(duck) {
        let spriteSrc = '/images/duck-d3.png';
        let flipX = false;

        switch (duck.direction) {
            case DIRECTIONS.UP:
                spriteSrc = '/images/duck-d3.png';
                break;
            case DIRECTIONS.DIAGONAL_LEFT:
                spriteSrc = '/images/duck-d1.png';
                break;
            case DIRECTIONS.DIAGONAL_RIGHT:
                spriteSrc = '/images/duck-d1.png';
                flipX = true; // Mirror for right
                break;
            case DIRECTIONS.HORIZONTAL_LEFT:
                spriteSrc = '/images/duck-d2.png';
                break;
            case DIRECTIONS.HORIZONTAL_RIGHT:
                spriteSrc = '/images/duck-d2.png';
                flipX = true; // Mirror for right
                break;
        }

        duck.img.src = spriteSrc;
        duck.img.style.transform = flipX ? 'scaleX(-1)' : 'scaleX(1)';
    }

    // ==========================================
    // BACKGROUND
    // ==========================================

    /**
     * Create and position the background image
     * @private
     */
    _createBackground() {
        const title = document.querySelector('.title');
        if (!title) return;

        // Get title's bounding box AFTER zoom animation
        const titleRect = title.getBoundingClientRect();

        // Create main background element
        this.backgroundElement = document.createElement('div');
        this.backgroundElement.className = 'duck-hunt-background';
        this.backgroundElement.style.cssText = `
            position: fixed;
            left: ${titleRect.left}px;
            width: ${titleRect.width}px;
            height: auto;
            z-index: 100;
            pointer-events: none;
        `;

        // Create the main image
        const img = document.createElement('img');
        img.src = '/images/duck-hunt-background.png';
        img.alt = 'Duck Hunt Background';
        img.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            transform: scaleY(0);
            transform-origin: bottom;
            animation: duckHuntBounceIn 0.5s cubic-bezier(0.34, 1.7, 0.64, 1) forwards;
        `;

        this.backgroundElement.appendChild(img);
        document.body.appendChild(this.backgroundElement);

        // Position after image loads to get correct height
        img.onload = () => {
            this._positionBackground(titleRect, img);
            this._createSideGrass(titleRect, img);
        };

        // Also try immediate positioning in case image is cached
        if (img.complete) {
            this._positionBackground(titleRect, img);
            this._createSideGrass(titleRect, img);
        }
    }

    /**
     * Create left and right grass elements
     * @private
     */
    _createSideGrass(titleRect, mainImg) {
        const imgHeight = mainImg.offsetHeight;
        const titleHeight = titleRect.height;
        const titleBottom = titleRect.bottom;
        const top = titleBottom - imgHeight + (titleHeight / 3);

        // Calculate available space on each side
        const leftSpace = titleRect.left;
        const rightSpace = window.innerWidth - titleRect.right;

        // Common grass image styles with same animation
        const grassImgStyle = `
            height: ${imgHeight}px;
            width: auto;
            display: block;
            transform: scaleY(0);
            transform-origin: bottom;
            animation: duckHuntBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;

        // Create LEFT grass - positioned to end at main background's left edge
        if (leftSpace > 0) {
            this.leftGrass = document.createElement('div');
            this.leftGrass.className = 'duck-hunt-grass-left';
            this.leftGrass.style.cssText = `
                position: fixed;
                top: ${top}px;
                right: ${window.innerWidth - titleRect.left - 20}px;
                height: ${imgHeight}px;
                z-index: 100;
                pointer-events: none;
            `;

            const leftImg = document.createElement('img');
            leftImg.src = '/images/duck-hunt-grass.png';
            leftImg.alt = '';
            leftImg.style.cssText = grassImgStyle;

            this.leftGrass.appendChild(leftImg);
            document.body.appendChild(this.leftGrass);
        }

        // Create RIGHT grass - positioned to start at main background's right edge
        if (rightSpace > 0) {
            this.rightGrass = document.createElement('div');
            this.rightGrass.className = 'duck-hunt-grass-right';
            this.rightGrass.style.cssText = `
                position: fixed;
                top: ${top}px;
                left: ${titleRect.right - 20}px;
                height: ${imgHeight}px;
                z-index: 100;
                pointer-events: none;
            `;

            const rightImg = document.createElement('img');
            rightImg.src = '/images/duck-hunt-grass.png';
            rightImg.alt = '';
            rightImg.style.cssText = grassImgStyle;

            this.rightGrass.appendChild(rightImg);
            document.body.appendChild(this.rightGrass);
        }
    }

    /**
     * Position background so image bottom aligns with title bottom
     * @private
     */
    _positionBackground(titleRect, img) {
        if (!this.backgroundElement) return;

        const imgHeight = img.offsetHeight;
        const titleHeight = titleRect.height;

        // Title bottom position
        const titleBottom = titleRect.bottom;

        // Position so image bottom aligns with title bottom, then shift down by half title height
        const top = titleBottom - imgHeight + (titleHeight / 3);

        this.backgroundElement.style.top = `${top}px`;
    }

    /**
     * Remove background element
     * @private
     */
    _removeBackground() {
        if (this.backgroundElement) {
            this.backgroundElement.remove();
            this.backgroundElement = null;
        }
        if (this.leftGrass) {
            this.leftGrass.remove();
            this.leftGrass = null;
        }
        if (this.rightGrass) {
            this.rightGrass.remove();
            this.rightGrass = null;
        }
    }
}
