/**
 * Duck Hunt Game
 * 
 * TODO: Game logic will be implemented later
 */
export class DuckHuntGame {
    constructor() {
        this.isActive = false;
    }

    /**
     * Start the game
     * @returns {DuckHuntGame} Returns this for chaining
     */
    start() {
        if (this.isActive) return this;
        this.isActive = true;

        console.log('Duck Hunt: Game started!');
        return this;
    }

    /**
     * Stop the game and cleanup
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;

        console.log('Duck Hunt: Game stopped!');
    }

    /**
     * Check if the game is currently active
     * @returns {boolean}
     */
    get active() {
        return this.isActive;
    }
}
