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
        this.heroContainer = query('.container');

        this.isGameActive = false;
        this.currentGame = null;
        this.closeBtn = null;

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

        // ESC key to close game
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isGameActive) {
                this.closeGame();
            }
        });
    }

    openGame(game) {
        this.currentGame = game;
        this.isGameActive = true;

        // Close menu
        this.container.classList.remove('open');
        this.toggleBtn.classList.remove('active');

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Wait for scroll to complete, then activate game mode
        setTimeout(() => {
            // Lock scroll
            document.body.style.overflow = 'hidden';
            document.body.classList.add('game-mode');

            // Activate game mode on hero container
            this.heroContainer?.classList.add('game-active');

            // Hide theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.style.display = 'none';
            }

            // Hide games menu
            this.container.style.display = 'none';

            // Create close button (same position as theme toggle)
            this.createCloseButton();

            console.log(`Game started: ${game}`);
        }, 500);
    }

    createCloseButton() {
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

    closeGame() {
        if (!this.isGameActive) return;

        this.isGameActive = false;
        this.currentGame = null;

        // Unlock scroll
        document.body.style.overflow = '';
        document.body.classList.remove('game-mode');

        // Deactivate game mode on hero container
        this.heroContainer?.classList.remove('game-active');

        // Show theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.display = 'flex';
        }

        // Show games menu
        this.container.style.display = 'flex';

        // Remove close button
        if (this.closeBtn) {
            this.closeBtn.remove();
            this.closeBtn = null;
        }

        console.log('Game closed');
    }
}
