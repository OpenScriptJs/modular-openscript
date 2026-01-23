/**
 * DOM Manipulation Utilities
 */
export default class DOM {
    /**
     * Gets a single element
     * @param {string} selector css selector
     * @param {HTMLElement} parent defaults to document
     */
    static get(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Gets all the elements
     * @param {string} selector css selector
     * @param {HTMLElement} parent defaults to document
     * @returns {NodeList}
     */
    static all(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * Gets the first element from the selected node list
     * @param {string} selector css selector
     * @param {HTMLElement} parent defaults to document
     */
    static first(selector, parent = document) {
        const list = this.all(selector, parent);
        return list.length === 0 ? null : list[0];
    }

    /**
     * Gets the last element from the select node list
     * @param {string} selector css selector
     * @param {HTMLElement} parent defaults to document
     */
    static last(selector, parent = document) {
        const list = this.all(selector, parent);
        return list.length === 0 ? null : list[list.length - 1];
    }

    /**
     * Get element at a position
     * @param {string} selector css selector
     * @param {number} position
     * @param {HTMLElement} parent defaults to document
     * @returns
     */
    static at(selector, position, parent = document) {
        const list = this.all(selector, parent);
        return list.length === 0 ? null : list[position];
    }

    /**
     * Creates an HTML element
     * @param {string} elementType
     * @returns {HTMLElement}
     */
    static create(elementType) {
        return document.createElement(elementType);
    }

    /**
     * Puts an inner html in an element
     * @param {string} innerHTML
     * @param {HTMLElement} element
     * @param {boolean} append append to current html?
     */
    static put(innerHTML, element, append = false) {
        if (append) {
            element.innerHTML += innerHTML;
            return;
        }

        element.innerHTML = innerHTML;
    }

    /**
     * Get element by ID
     * @param {string} id
     * @param {HTMLElement} parent defaults to document
     * @returns {HTMLElement|null}
     */
    static id(id, parent = document) {
        return parent.getElementById(`${id}`);
    }

    /**
     * Get elements by Class Name
     * @param {string} className
     * @param {HTMLElement} parent defaults to document
     * @returns {NodeList}
     */
    static byClass(className, parent = document) {
        return this.all(`.${className}`, parent);
    }

    /**
     * Sets innerHTML to empty string
     * @param {HTMLElement} element
     */
    static clear(element) {
        if (!element) return;
        element.innerHTML = "";
    }

    /**
     * Checks if the element has no innerHTML or value
     * @param {HTMLElement} element
     */
    static isEmpty(element) {
        if (element?.value) return element.value.length < 1;
        return /^[\t\r\n\s]*$/g.test(element?.innerHTML);
    }

    /**
     * Disables an element
     * @param {HTMLElement} element
     */
    static disable(element) {
        element?.setAttribute("disabled", "true");
    }

    /**
     * Enables an element
     * @param {HTMLElement} element
     */
    static enable(element) {
        element?.removeAttribute("disabled");
    }

    /**
     * Centers an absolutely positioned element (y) inside another (x),
     * regardless of where x is in the DOM.
     * @param {HTMLElement} container - The container element
     * @param {HTMLElement} element - The element to center
     * @param {boolean} useOffset - Use offsetTop/Left or getBoundingClientRect
     * @param {number} adjustLeft - Adjustment for left position
     * @param {number} adjustTop - Adjustment for top position
     */
    static centerInside(
        container,
        element,
        useOffset = true,
        adjustLeft = 0,
        adjustTop = 0
    ) {
        if (!container || !element) {
            console.warn("Both container and element must be provided");
            return;
        }

        let top = 0;
        let left = 0;

        if (useOffset) {
            top = container.offsetTop + (container.offsetHeight / 2);
            left = container.offsetLeft + (container.offsetWidth / 2);
        } else {
            const rect = container.getBoundingClientRect();
            top = rect.top + rect.height / 2;
            left = rect.left + rect.width / 2;
        }

        if (adjustLeft) left += adjustLeft;
        if (adjustTop) top += adjustTop;

        element.style.top = `${top}px`;
        element.style.left = `${left}px`;
    }
}
