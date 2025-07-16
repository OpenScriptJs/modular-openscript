/**
 * The Doc Class provides shorted API for the document model that is available in the windows object.
 */
export class dom {
	/**
	 * Returns a new DOM object. Add this to the window using `window.dom = new Dom()`;
	 */
	constructor() {}

	/**
	 * Gets a single element
	 * @param {string} selector css selector
	 * @param {HTMLElement} parent defaults to document
	 */
	static get(selector, parent = null) {
		if (!parent) parent = document;
		return parent.querySelector(selector);
	}

	/**
	 * Gets all the elements
	 * @param {string} selector css selector
	 * @param {HTMLElement} parent defaults to document
	 * @returns
	 */
	static all(selector, parent = null) {
		if (!parent) parent = document;
		return parent.querySelectorAll(selector);
	}

	/**
	 * Gets the first element from the selected node list
	 * @param {string} selector css selector
	 * @param {HTMLElement} parent defaults to document
	 */
	static first(selector, parent = null) {
		let list = this.all(selector, parent);
		return list.length == 0 ? null : list[0];
	}

	/**
	 * Gets the last element from the select node list
	 * @param {string} selector css selector
	 * @param {HTMLElement} parent defaults to document
	 */
	static last(selector, parent = null) {
		let list = this.all(selector, parent);
		return list.length == 0 ? null : list[list.length - 1];
	}

	/**
	 * Get element at a position
	 * @param {string} selector css selector
	 * @param {int} position
	 * @param {HTMLElement} parent defaults to document
	 * @returns
	 */
	static at(selector, position, parent = null) {
		let list = this.all(selector, parent);
		return list.length == 0 ? null : list[position];
	}

	/**
	 * Creates an HTML element
	 * @param {string} elementType
	 * @returns
	 */
	static element(elementType) {
		return document.createElement(elementType);
	}

	/**
	 * Puts an inner html in an element
	 * @param {HTMLElement} element
	 * @param {string} innerHTML
	 * @param {bool} append append to current html?
	 */
	static put(innerHTML, element, append = false) {
		if (append) {
			element.innerHTML += innerHTML;
			return;
		}

		element.innerHTML = innerHTML;
	}

	/**
	 * ***document.getElementById(id)***
	 * @param {string} id
	 * @param {HTMLElement} parent defaults to document
	 * @returns {HTMLElement|null}
	 */
	static id(id, parent = null) {
		if (!parent) parent = document;

		return parent.getElementById(`${id}`);
	}

	/**
	 * ***document.getElementsByClass(class)***
	 * @param {string} className
	 * @param {HTMLElement} parent defaults to document
	 * @returns
	 */
	static class(className, parent = null) {
		return dom.all(`.${className}`, parent);
	}

	/**
	 * Sets innerHTML to empty string
	 * @param {HTMLElement} element
	 */
	static empty(element) {
		if (!element) return;
		element.innerHTML = "";
	}

	/**
	 * Checks if the element has no innerHTML
	 * @param {HTMLElement} element
	 */
	static isEmpty(element) {
		if (element?.value) return element?.value.length < 1;

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
		element.removeAttribute("disabled");
	}

	/**
	 * Centers an absolutely positioned element (y) inside another (x),
	 * regardless of where x is in the DOM.
	 * @param {HTMLElement} x - The container element (e.g., #x)
	 * @param {HTMLElement} y - The element to center (e.g., #y)
	 */
	static centerInside(
		x,
		y,
		useOffset = true,
		adjustLeft = null,
		adjustTop = null
	) {
		if (!x || !y) {
			console.warn("Both x and y elements must be provided");
			return;
		}

		let top = 0;
		let left = 0;

		if (useOffset) {
			top = x.offsetTop + (x.offsetHeight / 2);
			left = x.offsetLeft + (x.offsetWidth / 2);
		} else {
			const xRect = x.getBoundingClientRect();

			// x's position relative to the page
			const xTop = xRect.top;
			const xLeft = xRect.left;

			// Compute center position relative to x's top-left corner
			top = xTop + xRect.height / 2;
			left = xLeft + xRect.width / 2;
		}

		if(adjustLeft) left += adjustLeft;
		if(adjustTop) top += adjustTop;

		y.style.top = `${top}px`;
		y.style.left = `${left}px`;
	}
}

/**
 * Tools class contains utility functions
 */
export class tool {
	static emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	constructor() {}

	static addToWindow(...args) {
		for (let item of args) {
			if (
				(typeof item === "function" || typeof item === "object") &&
				item !== null
			) {
				let name;

				// For classes and functions
				if (typeof item === "function") {
					name = Function.prototype.hasOwnProperty.call(item, "name")
						? Function.prototype.toString
								.call(item)
								.match(/(?:class|function)\s+([^\s({]+)/)?.[1]
						: item.name;
				}
				// For object instances, use constructor
				else if (typeof item === "object" && item.constructor) {
					name = item.constructor.name;
				}

				if (name) {
					window[name] = item;
					if (tool.isLocal()) {
						console.log(`[makeGlobal] window.${name} registered.`);
					}
				} else {
					if (tool.isLocal()) {
						console.warn(
							"[makeGlobal] Skipped unnamed item:",
							item
						);
					}
				}
			}
		}
	}

	/**
	 * Builds  **FormData** Object from a JSON object
	 * @param {object} data
	 * @returns
	 */
	static formData(data) {
		let formData = new FormData();

		for (const key in data) {
			formData.append(key, data[key]);
		}

		return formData;
	}

	/**
	 *
	 * @param {string} url
	 * @returns
	 */
	static redirect(url) {
		return (window.location.href = url);
	}

	/**
	 * Reloads the page
	 */
	static reload() {
		return window.location.reload();
	}

	/**
	 * Goes back or forward certain levels
	 * @param {number} level
	 */
	static back(level = 0) {
		if (level !== 0) {
			return window.history.go(level);
		}

		return window.history.back();
	}

	/**
	 * Converts text to JSON
	 * @param {string} text
	 * @returns
	 */
	static json(text) {
		return JSON.parse(text);
	}

	/**
	 * Converts an array to Object
	 * @param {any[]} arr
	 * @returns
	 */
	static toObject(arr) {
		let rv = {};
		for (const k in arr) {
			if (arr[k]) rv[k] = arr[k];
		}
		return rv;
	}

	/**
	 * Takes a url, updates the query string, and returns the updated url.
	 * @author https://stackoverflow.com/users/822711/popnoodles
	 * @param {string} key key to search for in the query string. If the key doesn't exist, it will be added.
	 * @param {string} value new value to give that key. If null,
	 * the key will be removed from the url
	 * @param {string} url the url to update. defaults to the current url is left empty.
	 *
	 * @return {string} updated url
	 */
	static url(key, value, url = null) {
		if (!url) url = window.location.href;
		var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
			hash;

		if (re.test(url)) {
			if (typeof value !== "undefined" && value !== null) {
				return url.replace(re, "$1" + key + "=" + value + "$2$3");
			} else {
				hash = url.split("#");
				url = hash[0].replace(re, "$1$3").replace(/(&|\?)$/, "");
				if (typeof hash[1] !== "undefined" && hash[1] !== null) {
					url += "#" + hash[1];
				}
				return url;
			}
		} else {
			if (typeof value !== "undefined" && value !== null) {
				var separator = url.indexOf("?") !== -1 ? "&" : "?";
				hash = url.split("#");
				url = hash[0] + separator + key + "=" + value;
				if (typeof hash[1] !== "undefined" && hash[1] !== null) {
					url += "#" + hash[1];
				}
				return url;
			} else {
				return url;
			}
		}
	}

	/**
	 * Converts JSON object to url query string
	 * @param {object} data
	 * @returns
	 */
	static toQueryString(data) {
		let qs = "";
		for (const key in data) {
			if (qs != "") qs += "&";
			qs += `${key}=${data[key]}`;
		}

		return qs;
	}

	static toClipboard(text) {
		if (!navigator.clipboard) {
			tool.fallbackToClipboard(text);
			return;
		}
		navigator.clipboard.writeText(text).then(
			function () {
				inform("Copied", STRINGS.INFO);
			},
			function (err) {
				inform("Unable to copy", STRINGS.WARNING);
			}
		);
	}

	static fallbackToClipboard(text) {
		try {
			let textbox = document.createElement("input");
			textbox.value = text;
			document.body.appendChild(textbox);
			textbox.select();
			document.execCommand("copy");
			document.body.removeChild(textbox);
			inform("Copied", STRINGS.INFO);
		} catch (e) {
			inform("Unable to copy", STRINGS.WARNING);
		}
	}

	static isLocal() {
		return Boolean(
			window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1" ||
				// ::1 is IPv6 localhost
				window.location.hostname === "::1" ||
				// 192.168.x.x or 10.x.x.x or 172.16.x.x – private IP ranges
				/^192\.168\./.test(window.location.hostname) ||
				/^10\./.test(window.location.hostname) ||
				/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
		);
	}

	/**
	 *
	 * @param {Object<>} object
	 * @returns {Object<>} new object
	 */
	static deepCopy(object) {
		return JSON.parse(JSON.stringify(object));
	}

	/**
	 * Increments an HTML element value
	 * @param {HTMLElement} element
	 */
	static increment(element, max) {
		let newValue = parseInt(element.value) + 1;
		if (newValue > parseInt(max)) newValue = max;
		element.value = newValue;
	}

	/**
	 * Decrements an input value until 0
	 * @param {HTMLElement} element
	 */
	static decrement(element) {
		let value = parseInt(element.value) - 1;
		if (value < 0) value = 0;
		element.value = value;
	}

	/**
	 * Gets a value from the element dataset
	 *
	 * @param {HTMLElement} elem
	 * @param {string} key
	 * @param {*} def
	 */
	static fromDataset(elem, key, def = null) {
		return elem.dataset[key] ?? def;
	}

	/**
	 * Gets a query string value from the URL
	 * @param {string} key
	 * @param {*} def
	 * @returns
	 */
	static fromUrl(key, def = null, url = null) {
		let u = document.location;
		if (url) u = new URL(url);
		let params = new URLSearchParams(u.search);

		return params.get(key) ?? def;
	}

	/**
	 * Checks if a string is empty
	 * @param {string} str
	 */
	static empty(str) {
		return /^[\s\n\t\r]+$/.test(str) || str.length == 0;
	}

	/**
	 * Converts all \n character to <br>
	 * @param {string} str
	 */
	static enterToBr(str) {
		return str.replace(/\n+/g, "<br/>");
	}
}

/**
 * Event Emitter allows you to use behavior based design pattern
 */
export class FSEventEmitter {
	listeners = {};

	/**
	 * Add Event Listener
	 * @param {string} eventName the event to listen for
	 * @param {Function} fn handler function
	 */
	addListener(eventName, fn) {
		this.listeners[eventName] = this.listeners[eventName] || [];
		this.listeners[eventName].push(fn);
		return this;
	}

	/**
	 * Adds Event Listener
	 * @param {string} eventName
	 * @param {Function} fn
	 */
	on(eventName, fn) {
		return this.addListener(eventName, fn);
	}

	/**
	 * Adds event listener to be executed once
	 * @param {string} eventName
	 * @param {Function} fn
	 * @returns
	 */
	once(eventName, fn) {
		this.listeners[eventName] = this.listeners[eventName] || [];
		const onceWrapper = () => {
			fn();
			this.off(eventName, onceWrapper);
		};
		this.listeners[eventName].push(onceWrapper);
		return this;
	}

	/**
	 * Removes and event listener
	 * @param {string} eventName
	 * @param {Function} fn
	 * @returns
	 */
	off(eventName, fn) {
		return this.removeListener(eventName, fn);
	}

	/**
	 * Removes an event listener
	 * @param {string} eventName
	 * @param {Function} fn
	 * @returns
	 */
	removeListener(eventName, fn) {
		let lis = this.listeners[eventName];
		if (!lis) return this;
		for (let i = lis.length; i > 0; i--) {
			if (lis[i] === fn) {
				lis.splice(i, 1);
				break;
			}
		}
		return this;
	}

	/**
	 * Fires an event
	 * @param {string} eventName
	 * @param  {...any} args
	 * @return {true} true
	 */
	emit(eventName, ...args) {
		let fns = this.listeners[eventName];
		if (!fns) return false;
		fns.forEach((f) => {
			f(...args);
		});
		return true;
	}

	/**
	 * Returns the number of listeners for this event
	 * @param {string} eventName
	 * @returns
	 */
	listenerCount(eventName) {
		let fns = this.listeners[eventName] || [];
		return fns.length;
	}

	/**
	 * Get raw listeners
	 * If the once() event has been fired, then that will not be part of
	 * the return array
	 *
	 * @param {string} eventName
	 * @returns
	 */
	listeners(eventName) {
		return this.listeners[eventName];
	}
}

/**
 * A simple pipelining class
 */
export class Pipeline {
	/**
	 * Filters object
	 * @type {Array<Filter>}
	 */
	filters = [];

	/**
	 * Add a filter to this pipeline
	 * @param {...Filter} filters the filter function takes in an object
	 * and returns an object with
	 * two attributes: `{output: filterOutput, next: true|false}`.
	 *
	 * @returns {Pipeline}
	 */
	add(...filters) {
		for (let filter of filters) {
			this.filters.push(filter);
		}

		return this;
	}

	/**
	 * Pass data through the pipeline
	 * @param {*} data
	 */
	async pass(data) {
		let output = data;
		let next = true;

		for (let f of this.filters) {
			let o = await f.run(output);

			output = o.data;
			next = o.next;

			if (!next) return output;
		}

		return output;
	}

	/**
	 * Removes all filters from the pipeline
	 */
	reset() {
		this.filters = [];
	}
}

/**
 * The filter class
 */
export class Filter {
	/**
	 * The logic to run
	 */
	logic;

	/**
	 *
	 * @param {Function} logic the logic to run
	 */
	constructor(logic) {
		this.logic = logic;
	}

	/**
	 * Runs the filter and returns a response
	 * @param {*} input
	 * @returns
	 */
	async run(input) {
		let o = await this.logic(input);

		if (!("data" in o) || !("next" in o))
			throw Error(
				`A filter must return an object with output and next property. This filter return:`,
				o,
				` instead`
			);

		return o;
	}
	/**
	 * Creates the Filter output
	 * @param {*} data
	 * @param {boolean} next proceed to next filter
	 * @returns
	 */
	static output(data, next = true) {
		return { data, next };
	}
}

/**
 * Network request class
 */
export class Requester {
	/**
	 * @var {string} csrf token
	 */
	csrf;

	/**
	 * @var {string} base url
	 */
	baseUrl;

	/**
	 * Default headers
	 */
	headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	/**
	 * Controls the aborting of a request
	 */
	abortController;

	/**
	 * The abort signal
	 */
	abortSignal;

	_pipeline = new Pipeline();

	callCount = {};

	/**
	 * Request Configs such as mode, cache,
	 * credentials, redirect, refererPolicy are placed here
	 */
	requestConfigs = {};

	/**
	 * Creates a fota object
	 * @param {object<>} config
	 */
	constructor(config = { csrf, baseUrl }) {
		this.baseUrl = config.baseUrl;
		this.csrf = config.csrf;
		this.abortController = new AbortController();
		this.abortSignal = this.abortController.signal;
	}

	/**
	 * The pipeline through which the response
	 * from the request will be passed
	 * @param {Pipeline} pipeline
	 */
	pipeline(pipeline) {
		this._pipeline = pipeline;
		return this;
	}

	/**
	 * Adds a default Filter to the pipeline
	 */
	defaultPipeline() {
		this._pipeline.add(
			new Filter(
				/**
				 *
				 * @param {Response} response
				 * @returns
				 */
				async function (response) {
					if (!response.ok) {
						return Filter.output(
							{ status: "error", message: response.statusText },
							false
						);
					}

					let data = await response.json();

					return Filter.output(data, true);
				}
			)
		);

		return this;
	}

	/**
	 *
	 * Gets a new requester object with an empty Pipeline
	 */
	noPipeline() {
		let r = new Requester();

		for (let k in this) {
			if (k === "_pipeline") continue;

			r[k] = this[k];
		}

		return r;
	}

	/**
	 * Make a POST Request and pass the response through
	 * the object's pipeline.
	 * @param {string} path
	 * @param {object} body
	 * @param {object} headers
	 */
	async post(path, body, headers = {}) {
		return await this._pipeline.pass(
			await this.fetch(path, "post", body, headers)
		);
	}

	/**
	 * makes a GET request. the body object
	 * will be automatically converted to
	 * a query string
	 * @param {string} path
	 * @param {object} body
	 * @param {object} headers
	 * @returns
	 */
	async get(path, body = {}, headers = {}) {
		if (!this.callCount[path]) {
			this.callCount[path] = 1;
		} else {
			this.callCount[path]++;
		}

		if (!body) {
			body = {};
		}

		body["_ftsct"] = this.callCount[path];

		let qs = new URLSearchParams(body).toString();

		return await this._pipeline.pass(
			await this.fetch(`${path}?${qs}`, "get", null, headers)
		);
	}

	/**
	 * Makes a DELETE request and passes the
	 * response through the default object's pipeline pipeline
	 * @param {string} path
	 * @param {object} body
	 * @param {object} headers
	 * @returns
	 */
	async delete(path, body, headers = {}) {
		return await this._pipeline.pass(
			await this.fetch(path, "delete", body, headers)
		);
	}

	/**
	 * Makes a PUT request and passes the
	 * response through the default object's pipeline pipeline
	 * @param {string} path
	 * @param {object} body
	 * @param {object} headers
	 * @returns
	 */
	async put(path, body, headers = {}) {
		return await this._pipeline.pass(
			await this.fetch(path, "put", body, headers)
		);
	}

	/**
	 * The underlying fetch method
	 * @param {string} path
	 * @param {string} method
	 * @param {object} body
	 * @param {object} headers
	 * @returns
	 */
	async fetch(path, method, body, headers) {
		let configs = {
			method,
			headers: {
				"X-CSRF-TOKEN": this.csrf,
				...this.headers,
				...headers,
			},
			...this.requestConfigs,
			signal: this.abortSignal,
		};

		if (body) {
			configs.body = body;

			if (configs.headers["Content-Type"] == "application/json") {
				configs.body = JSON.stringify(body);
			}
		}

		let finalPath = "";
		path = path.trim();

		if (/^https?:\/\//.test(path)) {
			finalPath = path;
		} else {
			path = path.replace(/\/{2,}/g, "/");
			finalPath = `${this.baseUrl}${path[0] != "/" ? "/" : ""}${
				path ?? ""
			}`;
		}

		let response = await fetch(finalPath, configs);

		response.silent = headers.silent ?? false;

		return response;
	}

	/**
	 * Aborts the current network request
	 */
	abort() {
		this.abortController.abort();
	}
}

export class IdGenerator {
	#ID = 1;

	getId() {
		return this.#ID++;
	}

	toString() {
		return this.getId();
	}
}
