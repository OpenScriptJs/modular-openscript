/**
 * Checks if a function is a class
 * @param {function} func 
 * @returns {boolean}
 */
export function isClass(func) {
    return (
        typeof func === "function" &&
        /^class\s/.test(Function.prototype.toString.call(func))
    );
}

/**
 * Adds a new Namespace to the window
 * @param {string} name
 */
export function namespace(name) {
    if (!window[name]) window[name] = {};
    return window[name];
}
