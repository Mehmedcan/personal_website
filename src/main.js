import './style.css';
import { ParticleSystem } from './particles.js';
import { isMobileDevice, query, insertHTML } from './utils/index.js';
import { ThemeToggle, GestureController, GamesMenu } from './components/index.js';
import {
  heroTemplate,
  resumeTemplate,
  interestsTemplate,
  footerTemplate,
  themeToggleTemplate,
  gestureUITemplate,
  gamesTemplate
} from './templates/index.js';

/**
 * Main Application Entry Point
 * Initializes all UI components and systems
 */
function initApp() {
  const app = query('#app');

  // Render page structure
  app.innerHTML = `
    ${heroTemplate}
    ${resumeTemplate}
    ${interestsTemplate}
    ${footerTemplate}
    ${themeToggleTemplate}
    ${gamesTemplate}
  `;

  // Initialize systems
  const particles = new ParticleSystem();

  new ThemeToggle(() => particles.updateParticleColors());
  new GamesMenu();

  // Desktop-only: gesture control
  if (!isMobileDevice()) {
    insertHTML(app, 'beforeend', gestureUITemplate);
    new GestureController(particles);
  }
}

initApp();
