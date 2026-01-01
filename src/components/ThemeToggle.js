import { getById } from '../utils/dom.js';
import { THEME_TRANSITION_DURATION } from '../config/constants.js';

/**
 * ThemeToggle Component
 * Handles light/dark theme switching with View Transition API support
 */
export class ThemeToggle {
    constructor(onThemeChange = null) {
        this.currentTheme = this.initTheme();
        this.onThemeChange = onThemeChange;
        this.bindEvents();
    }

    /**
     * Initializes theme from localStorage or system preference
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleState(theme);

        return theme;
    }

    /**
     * Updates toggle button visual state
     */
    updateToggleState(theme) {
        const toggle = getById('theme-toggle');
        if (!toggle) return;

        toggle.classList.toggle('theme-toggle--toggled', theme === 'dark');
    }

    bindEvents() {
        const toggle = getById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => this.toggle(e));
        }
    }

    /**
     * Toggles between light and dark themes with ripple animation
     */
    async toggle(event) {
        const toggle = getById('theme-toggle');
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';

        // Fallback for browsers without View Transition API
        if (!document.startViewTransition) {
            this.applyTheme(nextTheme);
            return;
        }

        const transition = document.startViewTransition(() => {
            this.applyTheme(nextTheme);
        });

        // Ripple effect calculation
        const rect = toggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y)
        );

        await transition.ready;

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: THEME_TRANSITION_DURATION,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    }

    /**
     * Applies the specified theme
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleState(theme);

        if (this.onThemeChange) {
            this.onThemeChange(theme);
        }
    }

    get theme() {
        return this.currentTheme;
    }
}
