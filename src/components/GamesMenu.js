import { query, queryAll } from '../utils/index.js';

/**
 * Games Menu component
 * Handles the game menu toggle and game selection
 */
export class GamesMenu {
    constructor() {
        this.container = query('#games-menu-container');
        this.toggleBtn = query('#games-menu-toggle');
        this.gamesList = query('.games-list');
        this.overlay = query('#game-overlay');
        this.closeBtn = query('#close-game');
        this.gameContainer = query('#game-container');

        if (!this.container || !this.toggleBtn) return;

        this.init();
    }

    init() {
        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('open');
            this.toggleBtn.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.container.classList.remove('open');
                this.toggleBtn.classList.remove('active');
            }
        });

        // Handle game selection
        const gameBtns = queryAll('.game-item-btn');
        gameBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const game = btn.dataset.game;
                this.openGame(game);
                e.stopPropagation();
            });
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeGame();
            });
        }
    }

    openGame(game) {
        this.overlay.style.display = 'flex';
        this.overlay.classList.remove('hidden');
        this.gameContainer.innerHTML = `<h2>Playing ${game}...</h2><p>Game engine coming soon!</p>`;
        this.container.classList.remove('open');
        this.toggleBtn.classList.remove('active');
    }

    closeGame() {
        this.overlay.style.display = 'none';
        this.overlay.classList.add('hidden');
        this.gameContainer.innerHTML = '';
    }
}
