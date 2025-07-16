import { broker, EventData, route } from "./open-script";

export function ifElse(condition, statement1 = null, statement2 = null) {
	const value = (s) => {
		return typeof s === "function" ? s() : s;
	};

	return condition ? value(statement1) : value(statement2);
}

export function either(statement1 = null, statement2 = null) {
	const value = (s) => {
		return typeof s === "function" ? s() : s;
	};

	return value(statement1) ?? value(statement2);
}

/**
 * Returns an object's property value if it exist or the default value
 * @param {object} object object to search
 * @param {string} property property to look for in object
 * @param {*} def default
 */
export function notIn(object, property, def = null) {
	if (property in object) return object[property];
	return def;
}

/**
 * The monetary function formats a given value as a currency using the specified currency code.
 * @param {number} value - The value parameter represents the numerical value that you want to format as a
 * monetary value. It can be any number, positive or negative.
 * @param {string} [currency=KES] - The currency parameter is a string that represents the currency code. In the
 * provided code, the default currency is set to 'KES', which represents Kenyan Shilling.
 * @returns {string} a formatted string representation of the value with the specified currency symbol.
 */
export function monetary(value, currency = "KES") {
	return Intl.NumberFormat("en-Us", { style: "currency", currency }).format(
		value
	);
}

export function parsePayload(ed) {
	return EventData.parse(ed);
}

/**
 * Broadcasts an event from an HTML visible markup with no event payload.
 * @param {string|Array<event>} event
 */
export function sendEvent(event, _payload = null) {
	broker.send(event, _payload ? _payload : payload());
}

/**
 * Broadcasts an event from an HTML visible markup with no event payload.
 * @param {string|Array<string>} event
 */
export function fireEvent(event, payload = null) {
	sendEvent(event, payload);
}


/**
 * Checks if the user has a permission
 * @param {string} permission
 * @returns
 */
function can(permission) {
	return uc.permissions.value[permission] == true;
}


function randomColor() {
	let color = Math.floor(Math.random() * 16777215).toString(16);

	for (let i = color.length; i < 6; i++) {
		color += "0";
	}

	return color;
}

export function formatThousand(num) {
	if (num >= 1e12) {
		// Convert to trillion
		return (num / 1e12).toFixed(num % 1e12 !== 0 ? 1 : 0) + "T";
	} else if (num >= 1e9) {
		// Convert to billion
		return (num / 1e9).toFixed(num % 1e9 !== 0 ? 1 : 0) + "B";
	} else if (num >= 1e6) {
		// Convert to million
		return (num / 1e6).toFixed(num % 1e6 !== 0 ? 1 : 0) + "M";
	} else if (num >= 1000) {
		// Convert to thousands (k)
		return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + "k";
	} else {
		return num.toString();
	}
}

export function getDayOfTheWeek() {
	const dayOfWeek = new Date().toLocaleString("default", {
		weekday: "long",
	});

	return dayOfWeek;
}

export function getGreetings() {
	var currentHour = new Date().getHours();

	if (currentHour >= 5 && currentHour < 12) {
		return "Good morning";
	} else if (currentHour >= 12 && currentHour < 18) {
		return "Good afternoon";
	} else {
		return "Good evening";
	}
}

export function isCurrentTimeInRange(startTime, endTime) {
	const now = new Date();
	const currentTime = now.toTimeString().split(" ")[0];

	function timeToSeconds(time) {
		const [hours, minutes, seconds] = time.split(":").map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	}

	const startSeconds = timeToSeconds(startTime);
	const endSeconds = timeToSeconds(endTime);
	const currentSeconds = timeToSeconds(currentTime);

	return currentSeconds >= startSeconds && currentSeconds <= endSeconds;
}

export function appIsLocal() {
	return /^(127\.0\.0\.1|localhost)$/.test(route.url().hostname);
}


export class CookieWrapper {
	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {int} expireAfter days
	 */
	static save(name, value, expireAfter = 365) {
		const d = new Date();
		d.setTime(d.getTime() + expireAfter * 24 * 60 * 60 * 1000);
		let expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	static get(name) {
		name = name + "=";
		let ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}

		return null;
	}

	static has(name, empty = false) {
		let value = Cookie.get(name);

		if (value == null || (value?.length == 0 && !empty)) return false;

		return true;
	}
}

export function delay(callback, seconds) {
	setTimeout(callback, seconds * 1000);
}


export function safeJSONParse(jsonString) {
	try {
		// Step 1: Unescape JSON strings to handle double-escaped characters
		const unescapedJSON = jsonString.replace(/\\./g, (match) => {
			switch (match) {
				case '\\"':
					return '"';
				case "\\n":
					return "\n";
				case "\\t":
					return "\t";
				// Add more escape sequences as needed
				default:
					return match[1]; // Remove the backslash
			}
		});

		// Step 2: Parse the unescaped JSON
		const parsedData = JSON.parse(unescapedJSON);

		return parsedData;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return null; // Handle the error gracefully or throw an exception if necessary
	}
}

/**
 * Checks if the element was clicked
 * @description This function checks if the clicked element is the same as the provided element or if the clicked element is a child of the provided element.
 * @example
 * const element = document.getElementById('myElement');
 * document.addEventListener('click', (event) => {
 *   if (wasClicked(element, event)) {
 *     console.log('Element was clicked!');
 *   } else {
 *     console.log('Element was not clicked.');
 *   }
 * });
 * @function wasClicked
 * @param {HTMLElement} element
 * @param {MouseEvent} event
 * @returns
 */
export function wasClicked(element, event) {
	return element == event.target || element?.contains(event.target);
}

export function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function empty(variable) {
	if (!variable) return true;
	if (Array.isArray(variable) && variable.length == 0) return true;
	if (typeof variable == "object" && Object.keys(variable).length == 0)
		return true;
	if (typeof variable == "undefined") return true;

	return false;
}

export function insertSpaces(input) {
	return input.replace(/([A-Z])/g, " $1").trim();
}

export function arrayFlip(obj) {
    let flipped = {};
	
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            flipped[obj[key]] = key;
        }
    }
    return flipped;
}

export function lastOf(arr) {
    
	if (arr.length === 0) {
        return null;
    }

    return arr[arr.length - 1];
}

/**
 * 
 * @param {string} path - or route name 
 * @returns {OpenScript.Router} router
 */
export function redirect(path = null) {
	if(empty(path)) return route;

	return route.to(path);
}

export function range(start, end, increment = 1) {
	output = [];
	for(let i = start; i <= end; i += increment) output.push(i);
	return output;
}
