import { LetterFall } from '../LetterFall.js';

// ==========================================
// GAME CONFIGURATION
// ==========================================
const SPIDER_TRAVEL_TIME = 5.0;     // Time in seconds to reach emoji from off-screen
const SPIDER_SPAWN_INTERVAL = 1.0;  // Spawn frequency in seconds
const SPIDER_SPAWN_COUNT = 1;       // Number of spiders to spawn per interval


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
        this.previousTheme = null;
        this.isActive = false;
        this.spiders = [];
        this.spiderInterval = null;
        this.animationFrameId = null;
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

        this._savePreviousTheme();
        this._switchToLightTheme();
        this._startLetterFall();
        this._scheduleSpiderInvasion();

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
        this._restorePreviousTheme();

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

        console.log('Save the Emoji: Switched to light mode');
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
        console.log('Save the Emoji: Restored previous theme');
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
                autoFadeOut: false
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
    }

    /**
     * @private
     */
    _spawnSpider() {
        const emoji = document.querySelector('.emoji-line');
        if (!emoji) return;

        const spider = document.createElement('div');
        spider.className = 'game-spider';
        document.body.appendChild(spider);

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
            speed: speed
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

        const emojiRect = emoji.getBoundingClientRect();
        const emojiX = emojiRect.left + emojiRect.width / 2;
        const emojiY = emojiRect.top + emojiRect.height / 2;

        for (let i = this.spiders.length - 1; i >= 0; i--) {
            const spider = this.spiders[i];

            // Calculate direction to emoji
            const dx = emojiX - spider.x;
            const dy = emojiY - spider.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                // Collision with emoji!
                spider.element.remove();
                this.spiders.splice(i, 1);
                continue;
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

    // ==========================================
    // GAME LOGIC (TO BE IMPLEMENTED)
    // ==========================================

    // Future methods for game mechanics:
    // - _initializeGameState()
    // - _handlePlayerInput()
    // - _updateScore()
    // - _checkWinCondition()
    // - _showGameOver()
    // - _restartGame()
}
