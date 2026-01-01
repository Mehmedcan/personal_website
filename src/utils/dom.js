/**
 * Gets an element by ID with null safety
 * @param {string} id 
 * @returns {HTMLElement|null}
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Queries a single element
 * @param {string} selector 
 * @param {Element} context 
 * @returns {Element|null}
 */
export function query(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Queries all matching elements
 * @param {string} selector 
 * @param {Element} context 
 * @returns {NodeListOf<Element>}
 */
export function queryAll(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Inserts HTML at specified position in an element
 * @param {Element} element 
 * @param {string} position 
 * @param {string} html 
 */
export function insertHTML(element, position, html) {
    element.insertAdjacentHTML(position, html);
}

/**
 * Checks if a point is inside an element's bounding box
 * @param {number} x 
 * @param {number} y 
 * @param {DOMRect} rect 
 * @returns {boolean}
 */
export function isPointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
