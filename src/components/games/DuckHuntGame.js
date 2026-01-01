/**
 * Duck Hunt Game
 * 
 * TODO: Game logic will be implemented later
 */
export class DuckHuntGame {
    constructor() {
        this.isActive = false;
        this.backgroundElement = null;
        this.container = null;
    }

    /**
     * Start the game
     * @returns {DuckHuntGame} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        // First zoom and position the container, then show background
        this._setupGamePosition().then(() => {
            this._createBackground();
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

        this._removeBackground();
        this._resetGamePosition();

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

        // Create background element
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

        // Create the image
        const img = document.createElement('img');
        img.src = '/images/duck-hunt-background.png';
        img.alt = 'Duck Hunt Background';
        img.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            transform: scaleY(0);
            transform-origin: bottom;
            animation: duckHuntBounceIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;

        this.backgroundElement.appendChild(img);
        document.body.appendChild(this.backgroundElement);

        // Position after image loads to get correct height
        img.onload = () => {
            this._positionBackground(titleRect, img);
        };

        // Also try immediate positioning in case image is cached
        if (img.complete) {
            this._positionBackground(titleRect, img);
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
    }
}
