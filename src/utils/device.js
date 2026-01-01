import { MOBILE_REGEX, MOBILE_BREAKPOINT } from '../config/constants.js';

/**
 * Detects if the current device is mobile based on user agent and viewport width
 * @returns {boolean}
 */
export function isMobileDevice() {
    return MOBILE_REGEX.test(navigator.userAgent) || window.innerWidth <= MOBILE_BREAKPOINT;
}
