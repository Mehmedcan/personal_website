import { query, queryAll } from '../utils/index.js';
import { SaveTheEmojiGame } from './games/SaveTheEmojiGame.js';
import { DuckHuntGame } from './games/DuckHuntGame.js';

/**
 * Games Menu Component
 * 
 * Manages the games menu UI and coordinates game lifecycle.
 * Individual game logic is delegated to separate game classes.
 */
export class GamesMenu {
    constructor() {
        this.container = query('#games-menu-container');
        this.toggleBtn = query('#games-menu-toggle');
        this.gamesList = query('.games-list');
        this.heroContainer = query('.container');

        this.isGameActive = false;
        this.currentGame = null;
        this.currentGameInstance = null;
        this.closeBtn = null;

        if (!this.container || !this.toggleBtn) return;

        this._init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * @private
     */
    _init() {
        this._setupMenuToggle();
        this._setupOutsideClickHandler();
        this._setupGameButtons();
        this._setupKeyboardShortcuts();
    }

    /**
     * @private
     */
    _setupMenuToggle() {
        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('open');
            this.toggleBtn.classList.toggle('active');
        });
    }

    /**
     * @private
     */
    _setupOutsideClickHandler() {
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this._closeMenu();
            }
        });
    }

    /**
     * @private
     */
    _setupGameButtons() {
        const gameBtns = queryAll('.game-item-btn');
        gameBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const game = btn.dataset.game;
                this.openGame(game);
                e.stopPropagation();
            });
        });
    }

    /**
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isGameActive) {
                this.closeGame();
            }
        });
    }

    /**
     * @private
     */
    _closeMenu() {
        this.container.classList.remove('open');
        this.toggleBtn.classList.remove('active');
    }

    // ==========================================
    // GAME LIFECYCLE
    // ==========================================

    /**
     * Open and start a game
     * @param {string} gameId - The game identifier
     */
    openGame(gameId) {
        this.currentGame = gameId;
        this.isGameActive = true;

        this._closeMenu();
        this._scrollToTop();

        // Wait for scroll to complete
        setTimeout(() => {
            this._enterGameMode();
            this._startGame(gameId);
            console.log(`Game started: ${gameId}`);
        }, 500);
    }

    /**
     * Close the current game
     */
    closeGame() {
        if (!this.isGameActive) return;

        this._stopCurrentGame();
        this._exitGameMode();

        this.isGameActive = false;
        this.currentGame = null;
        this.currentGameInstance = null;

        console.log('Game closed');
    }

    // ==========================================
    // GAME MODE UI
    // ==========================================

    /**
     * @private
     */
    _scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * @private
     */
    _enterGameMode() {
        // Lock scroll
        document.body.style.overflow = 'hidden';
        document.body.classList.add('game-mode');

        // Activate game mode on hero container
        this.heroContainer?.classList.add('game-active');

        // Hide theme toggle
        this._setThemeToggleVisibility(false);

        // Hide games menu
        this.container.style.display = 'none';

        // Create close button
        this._createCloseButton();
    }

    /**
     * @private
     */
    _exitGameMode() {
        // Unlock scroll
        document.body.style.overflow = '';
        document.body.classList.remove('game-mode');

        // Deactivate game mode on hero container
        this.heroContainer?.classList.remove('game-active');

        // Show theme toggle
        this._setThemeToggleVisibility(true);

        // Show games menu
        this.container.style.display = 'flex';

        // Remove close button
        this._removeCloseButton();
    }

    /**
     * @private
     */
    _setThemeToggleVisibility(visible) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.display = visible ? 'flex' : 'none';
        }
    }

    /**
     * @private
     */
    _createCloseButton() {
        this.closeBtn = document.createElement('button');
        this.closeBtn.id = 'close-game-btn';
        this.closeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        this.closeBtn.addEventListener('click', () => this.closeGame());
        document.body.appendChild(this.closeBtn);
    }

    /**
     * @private
     */
    _removeCloseButton() {
        if (this.closeBtn) {
            this.closeBtn.remove();
            this.closeBtn = null;
        }
    }

    // ==========================================
    // GAME FACTORY
    // ==========================================

    /**
     * Create and start the appropriate game instance
     * @private
     */
    _startGame(gameId) {
        // Game factory - add new games here
        switch (gameId) {
            case 'save-the-emoji':
                this.currentGameInstance = new SaveTheEmojiGame();
                break;

            case 'duck-hunt':
                this.currentGameInstance = new DuckHuntGame();
                break;

            // Future games:
            // case 'another-game':
            //     this.currentGameInstance = new AnotherGame();
            //     break;

            default:
                console.warn(`Unknown game: ${gameId}`);
                return;
        }

        this.currentGameInstance.start();
    }

    /**
     * Stop the current game instance
     * @private
     */
    _stopCurrentGame() {
        if (this.currentGameInstance) {
            this.currentGameInstance.stop();
        }
    }
}
