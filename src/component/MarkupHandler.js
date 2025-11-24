import MarkupEngine from "./MarkupEngine.js";

/**
 * Handler for the MarkupEngine
 */
export default class MarkupHandler {
	static proxyInstance = null;

	constructor() {
		let keys = Object.keys(new MarkupEngine());
		/**
		 * The reserved properties of the Markup engine
		 */
		this.reserved = new Map();
		keys.forEach((e) => this.reserved.set(e, true));
	}

	get(target, prop, receiver) {
		if (this.reserved.has(prop)) {
			return target[prop];
		}

		return (...args) => target.handle(prop, ...args);
	}

	/**
	 * For Documentation, we return a proxy of Markup Engine
	 * @returns {MarkupEngine}
	 */
	static proxy() {
		if (!MarkupHandler.proxyInstance)
			MarkupHandler.proxyInstance = new Proxy(
				new MarkupEngine(),
				new MarkupHandler()
			);

		return MarkupHandler.proxyInstance;
	}
}
