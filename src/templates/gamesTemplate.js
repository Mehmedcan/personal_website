/**
 * Games Menu UI components template
 */
export const gamesTemplate = `
  <div id="games-menu-container">
    <button id="games-menu-toggle" class="gesture-btn glow-button">
      <svg class="joystick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/>
        <rect x="2" y="6" width="20" height="12" rx="2"/>
      </svg>
      <span class="toggle-text">Play Games</span>
    </button>
    <div class="games-list">
      <button class="game-item-btn" data-game="save-the-emoji">
        <span class="game-icon">👋</span>
        <span class="game-label">Save the Emoji</span>
      </button>
      <button class="game-item-btn" data-game="snake">
        <span class="game-icon">🐍</span>
        <span class="game-label">Snake</span>
      </button>
      <button class="game-item-btn" data-game="breakout">
        <span class="game-icon">🥎</span>
        <span class="game-label">Breakout</span>
      </button>
    </div>
  </div>
`;
