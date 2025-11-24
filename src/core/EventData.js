/**
 * The Event Data class
 */
export default class EventData {
    constructor() {
        /**
         * The Meta Data
         */
        this._meta = {};

        /**
         * Message containing the args
         */
        this._message = {};
    }

    meta(data) {
        this._meta = data;
        return this;
    }

    message(data) {
        this._message = data;
        return this;
    }

    /**
     * Convert the Event Schema to string
     * @returns {string}
     */
    encode() {
        return JSON.stringify(this);
    }

    /**
     * JSON.parse
     * @param {string} str
     * @returns {EventData}
     */
    static decode(str) {
        return JSON.parse(str);
    }
    /**
     * Parse and Event Data
     * @param {string} eventData
     * @returns
     */
    static parse(eventData) {
        let ed = EventData.decode(eventData);

        if (!("_meta" in ed)) ed._meta = {};
        if (!("_message" in ed)) ed._message = {};

        return {
            meta: {
                ...ed._meta,
                has: function (key) {
                    return key in this;
                },
                get: function (key, def = null) {
                    return this[key] ?? def;
                },
                put: function (key, value) {
                    this[key] = value;
                    return this;
                },
                remove: function (key) {
                    delete this[key];
                    return this;
                },
                getAll: function () {
                    return ed._meta;
                },
            },
            message: {
                ...ed._message,
                has: function (key) {
                    return key in this;
                },
                get: function (key, def = null) {
                    return this[key] ?? def;
                },
                put: function (key, value) {
                    this[key] = value;
                    return this;
                },
                remove: function (key) {
                    delete this[key];
                    return this;
                },
                getAll: function () {
                    return ed._message;
                },
            },
            encode: function () {
                // Reconstructing the object to match EventData structure for encoding
                let newEd = new EventData();
                newEd._meta = this.meta;
                newEd._message = this.message;
                return newEd.encode();
            },
        };
    }
}
