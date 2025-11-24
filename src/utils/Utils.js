import EventData from "../core/EventData.js";

/**
 * Various Utility Functions
 */
export default class Utils {
    /**
     * Runs a foreach on an array
     * @param {Iterable} array
     * @param {Function} callback
     */
    static each = (array, callback = (v, index) => v) => {
        let output = [];
        if (Array.isArray(array)) {
            array.forEach((v, i) => output.push(callback(v, i)));
        } else {
            for (let k in array) output.push(callback(array[k], k));
        }
        return output;
    };

    /**
     * Iterates over array elements using setTimeout
     * @param {Iterable} array
     * @param {Function} callback
     */
    static lazyFor = (array, callback = (v) => v) => {
        let index = 0;

        if (array.length < 1) return;

        const iterate = () => {
            callback(array[index]);
            index++;

            if (index < array.length) return setTimeout(iterate, 0);
        };

        setTimeout(iterate, 0);
    };

    /**
     * Converts kebab case to camel case
     * @param {string} name
     * @param {boolean} upperFirst
     */
    static camel(name, upperFirst = false) {
        let _name = "";
        let upper = upperFirst;

        for (const c of name) {
            if (c === "-") {
                upper = true;
                continue;
            }
            if (upper) {
                _name += c.toUpperCase();
                upper = false;
            } else {
                _name += c;
            }
        }

        return _name;
    }

    /**
     * Converts camel case to kebab case
     * @param {string} name
     */
    static kebab(name) {
        let newName = "";

        for (const c of name) {
            if (c.toLocaleUpperCase() === c && newName.length > 1)
                newName += "-";
            newName += c.toLocaleLowerCase();
        }

        return newName;
    }

    /**
     * Evaluates a condition and returns one of two values.
     * If the values are functions, they are executed.
     * @param {boolean} condition
     * @param {any|Function} trueValue
     * @param {any|Function} falseValue
     */
    static ifElse(condition, trueValue = null, falseValue = null) {
        const value = (s) => {
            return typeof s === "function" ? s() : s;
        };

        return condition ? value(trueValue) : value(falseValue);
    }

    /**
     * Returns the first non-null/undefined value.
     * If the values are functions, they are executed.
     * @param {any|Function} value1
     * @param {any|Function} value2
     */
    static coalesce(value1 = null, value2 = null) {
        const value = (s) => {
            return typeof s === "function" ? s() : s;
        };

        return value(value1) ?? value(value2);
    }

    /**
     * Checks if a variable is empty
     * @param {any} variable
     */
    static isEmpty(variable) {
        if (!variable) return true;
        if (Array.isArray(variable) && variable.length == 0) return true;
        if (typeof variable == "object" && Object.keys(variable).length == 0)
            return true;
        if (typeof variable == "undefined") return true;
        if (typeof variable == "string" && variable.length == 0) return true;

        return false;
    }

    /**
     * Formats a number as currency
     * @param {number} value
     * @param {string} currency
     * @param {string} locale
     */
    static formatCurrency(value, currency = "KES", locale = "en-US") {
        return Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    }

    /**
     * Deep equality check
     * @param {any} a
     * @param {any} b
     */
    static deepEqual(a, b) {
        if (a === b) return true;

        if (
            typeof a !== "object" ||
            typeof b !== "object" ||
            a == null ||
            b == null
        ) {
            return false;
        }

        if (Array.isArray(a) !== Array.isArray(b)) return false;

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false;
            return a.every((item, i) => Utils.deepEqual(item, b[i]));
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => Utils.deepEqual(a[key], b[key]));
    }

    /**
     * Generates a range of numbers
     * @param {number} start
     * @param {number} end
     * @param {number} increment
     */
    static range(start, end, increment = 1) {
        const output = [];
        for (let i = start; i <= end; i += increment) output.push(i);
        return output;
    }

    /**
     * Truncates a string
     * @param {string} str
     * @param {number} length
     */
    static truncate(str, length) {
        if (str.length <= length) return str;

        if (length <= 3) return str.slice(0, length);

        const side = Math.floor((length - 3) / 2);
        const start = str.slice(0, side);
        const end = str.slice(str.length - (length - side - 3));

        return start + "..." + end;
    }

    /**
     * Formats bytes to human readable string
     * @param {number} bytes
     * @param {number} decimals
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
        );
    }

    /**
     * Generates a random color hex string
     */
    static randomColor() {
        let color = Math.floor(Math.random() * 16777215).toString(16);

        for (let i = color.length; i < 6; i++) {
            color += "0";
        }

        return "#" + color;
    }

    /**
     * Generates a random integer
     * @param {number} min
     * @param {number} max
     */
    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Delays execution
     * @param {Function} callback
     * @param {number} seconds
     */
    static delay(callback, seconds) {
        setTimeout(callback, seconds * 1000);
    }

    /**
     * Deep copy of an object
     * @param {object} object
     */
    static deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * Parses an event payload
     * @param {string} eventData
     * @returns {object}
     */
    static parsePayload(eventData) {
        return EventData.parse(eventData);
    }
}
