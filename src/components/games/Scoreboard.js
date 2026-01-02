/**
 * Reusable Game Scoreboard Component
 */
export class Scoreboard {
    /**
     * @param {string} highScoreKey - LocalStorage key for high score
     */
    constructor(highScoreKey) {
        this.highScoreKey = highScoreKey;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem(this.highScoreKey)) || 0;
        this.element = null;
    }

    /**
     * Create and append the scoreboard to the DOM
     */
    init() {
        if (this.element) return;

        this.element = document.createElement('div');
        this.element.className = 'game-scoreboard';

        const scorePanel = document.createElement('div');
        scorePanel.className = 'score-panel';
        scorePanel.innerHTML = `SCORE: <span>${this.score}</span>`;

        const highScorePanel = document.createElement('div');
        highScorePanel.className = 'high-score-panel';
        highScorePanel.textContent = `BEST: ${this.highScore}`;

        this.element.appendChild(scorePanel);
        this.element.appendChild(highScorePanel);
        document.body.appendChild(this.element);
    }

    /**
     * Update the current score and high score
     * @param {number} newScore 
     */
    update(newScore) {
        this.score = newScore;

        if (!this.element) return;

        const scoreSpan = this.element.querySelector('.score-panel span');
        if (scoreSpan) scoreSpan.textContent = this.score;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(this.highScoreKey, this.highScore);
            const highSpan = this.element.querySelector('.high-score-panel');
            if (highSpan) highSpan.textContent = `BEST: ${this.highScore}`;
        }
    }

    /**
     * Remove the scoreboard from the DOM
     */
    remove() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}
