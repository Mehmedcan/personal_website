import { LetterFall } from '../LetterFall.js';

/**
 * Save the Emoji Game
 * 
 * A mini-game where all letters fall down with physics simulation,
 * leaving only the emoji "saved" in its original position.
 * 
 * Game Flow:
 * 1. Switch to dark theme
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
        this._switchToDarkTheme();
        this._startLetterFall();

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
    _switchToDarkTheme() {
        document.documentElement.setAttribute('data-theme', 'dark');

        // Update theme toggle button state
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.classList.add('theme-toggle--toggled');
        }

        console.log('Save the Emoji: Switched to dark mode');
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
                autoFadeOut: true,
                fadeOutDelay: 3000,
                fadeOutDuration: 500
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
