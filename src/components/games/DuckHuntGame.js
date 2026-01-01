/**
 * Duck Hunt Game
 * 
 * TODO: Game logic will be implemented later
 */
export class DuckHuntGame {
    constructor() {
        this.isActive = false;
        this.backgroundElement = null;
    }

    /**
     * Start the game
     * @returns {DuckHuntGame} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        this._createBackground();

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
    // BACKGROUND
    // ==========================================

    /**
     * Create and position the background image
     * @private
     */
    _createBackground() {
        const title = document.querySelector('.title');
        if (!title) return;

        // Get title's bounding box
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

        // Add keyframes animation if not already added
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
            `;
            document.head.appendChild(style);
        }

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
