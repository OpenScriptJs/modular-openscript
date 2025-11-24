import { h } from "../component/h.js"; // Assuming h is here
import { broker } from "../index.js"; // Assuming broker is exported from index
import State from "../core/State.js"; // Assuming State is in core

/**
 * OpenScript's Router Class
 */
export default class Router {
    /**
     *
     */
    constructor() {
        /**
         * Current Prefix
         * @type {Array<string>}
         */
        this.__prefix = [""];

        /**
         * Prefix to append
         * To all the runtime URL changes
         * @type {string}
         */
        this.__runtimePrefix = "";

        /**
         * Currently resolved string
         * @type {string}
         */
        this.__resolved = null;

        /**
         * The routes Map
         * @type {Map<string,Map<string,function>|string|function>}
         */
        this.map = new Map();

        this.nameMap = new Map();

        /**
         * The Params in the URL
         * @type {object}
         */
        this.params = {};

        /**
         * The Query String
         * @type {URLSearchParams}
         */
        this.qs = {};

        /**
         * Should the root element be cleared?
         */
        this.reset;

        /**
         * The default path
         */
        this.path = "";

        /**
         * Create a route action
         */
        this.RouteAction = class RouteAction {
            action;
            name;

            middleware = () => true;

            children = new Map();

            run() {
                return this.action();
            }
        };

        this.GroupedRoute = class GroupedRoute {};

        this.reset = State.state(false);

        window.addEventListener("popstate", () => {
            this.reset.value = true;
            this.listen();
        });

        /**
         * Default Action
         * @type {function}
         */
        this.defaultAction = () => {
            alert("404 File Not Found");
        };

        this.RouteName = class RouteName {
            name;
            route;

            constructor(name, route) {
                this.name = name;
                this.route = route;
            }
        };

        /**
         * Allows Grouping of routes
         */
        this.PrefixRoute = class PrefixRoute {
            /**
             * Creates a new PrefixRoute
             * @param {Router} router
             */
            constructor(router) {
                /**
                 * Parent Router
                 * @type {Router}
                 */
                this.router = router;
            }

            /**
             * Creates a Group
             * @param {function} func
             * @returns {Router}
             */
            group(func = () => {}) {
                func();

                this.router.__prefix.pop();

                return this.router;
            }
        };
    }

    /**
     * Sets the global runtime prefix
     * to use when resolving routes
     * @param {string} prefix
     */
    runtimePrefix(prefix) {
        this.__runtimePrefix = prefix;
    }

    /**
     * Sets the default path
     * @param {string} path
     * @returns
     */
    basePath(path) {
        this.path = path;
        return this;
    }

    /**
     * Sets the default action if a route is not found
     * @param {function} action
     */
    default(action) {
        this.defaultAction = action;
    }

    isQualifiedUrl(url) {
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlPattern.test(url);
    }

    /**
     * Adds an action on URL path
     * @param {string} path
     * @param {function} action action to perform
     * @param {string} name the route name
     */
    on(path, action, name = null) {
        let _path = `${this.path}/${this.__prefix.join(
            "/"
        )}/${path}`.replace(/\/{2,}/g, "/");

        if (name) {
            this.nameMap.set(name, _path);
        }

        const paths = _path.split("/");

        let key = null;
        let map = this.map;

        for (const cmp of paths) {
            if (cmp.length < 1) continue;

            key = /^\{\w+\}$/.test(cmp) ? "*" : cmp;

            let val = map.get(key);
            if (!val) val = [cmp, new Map()];

            map.set(key, val);
            map = map.get(key)[1];
        }

        map.set("->", [true, action]);

        return this;
    }

    /**
     * Used to add multiple routes to the same action
     * @param {Array<string>} paths
     * @param {function} action
     * @param {string[]} names path names respectively
     */
    orOn(paths, action, names = []) {
        let i = 0;

        for (let path of paths) {
            this.on(path, action, names[i] ?? null);
            i++;
        }

        return this;
    }

    /**
     * Creates a prefix for a group of routes
     * @param {string} name
     */
    prefix(name) {
        this.__prefix.push(name);

        return new this.PrefixRoute(this);
    }

    /**
     * Executes the actions based on the url
     */
    listen() {
        let url = new URL(window.location.href);
        this.params = {};
        this.__resolved = null;

        let paths = url.pathname.split("/").filter((a) => a.length);

        let map = this.map;
        let r = [];

        for (const cmp of paths) {
            if (cmp.length < 1) continue;

            let next = map.get(cmp);

            if (!next) {
                next = map.get("*");
                if (next) this.params[next[0].replace(/[\{\}]/g, "")] = cmp;
            }

            if (!next) {
                console.error(`${url.pathname} was not found`);
                this.defaultAction();
                return this;
            }

            r.push(next[0]);
            map = next[1];
        }

        this.qs = new URLSearchParams(url.search);
        this.__resolved = `/${r.join("/")}`;

        broker.send("ojs:beforeRouteChange");

        try {
            let f = map.get("->")[1];
            f();
        } catch (ex) {
            console.error(`${url.pathname} was not found`, ex);
            this.defaultAction();
            return this;
        }

        this.reset.value = false;

        broker.send("ojs:routeChanged");

        return this;
    }

    /**
     * Get a route from a registered route name
     * @param {string} routeName
     * @returns {Router.RouteName}
     */
    from(routeName) {
        if (!this.nameMap.has(routeName)) {
            throw Error(`Unknown Route Name: ${routeName}`);
        }

        return new this.RouteName(routeName, this.nameMap.get(routeName));
    }

    /**
     * Redirects to a named route
     * @param {string} routeName
     * @param {object} params replaces route params and adds the rest as query strings.
     * @returns
     */
    toName(routeName, params = {}) {
        let rn = this.from(routeName);

        let p = {};

        for (let x of rn.route.match(/\{[\w\d-_]+\}/g) ?? []) {
            let k = x.substring(1, x.length - 1);
            let v = params[k] ?? null;

            if (!v) {
                throw Error(
                    `${rn.route} requires ${x} but it wasn't passed`
                );
            }

            delete params[k];

            p[x] = v;
        }

        let r = rn.route;

        for (let k in p) {
            r = r.replace(k, p[k]);
        }

        return this.to(r, params);
    }

    /**
     * Change the URL path without reloading. Prioritizes route name over route path.
     * @param {string} path route or route-name
     * @param {object<>} qs Query strings or Route params (if using route name)
     */
    to(path, qs = {}) {
        if (this.isQualifiedUrl(path)) {
            let link = h.a({
                href: path,
                style: "display: none;",
                target: "_blank",
                parent: document.body,
            });

            link.click();
            link.remove();

            return this;
        }

        if (this.nameMap.has(path)) {
            return this.toName(path, qs);
        }

        let prefix = "";

        if (!path.replace(/^\//, "").startsWith(this.__runtimePrefix)) {
            prefix = this.__runtimePrefix;
        }

        path = `${this.path}/${prefix}/${path}`.trim();

        let paths = path.split("/");

        path = "";

        for (let p of paths) {
            if (p.length === 0 || /^\s+$/.test(p)) continue;

            if (path.length) path += "/";

            path += p.trim();
        }

        let s = "";

        for (let k in qs) {
            if (s.length > 0) s += "&";
            s += `${k}=${qs[k]}`;
        }

        if (s.length > 0) s = `?${s}`;

        this.history().pushState(
            { random: Math.random() },
            "",
            `/${path}${s}`
        );
        this.reset.value = true;

        return this.listen();
    }

    /**
     * Gets the base URL
     * @param {string} path
     * @returns string
     */
    baseUrl(path = "") {
        return (
            new URL(window.location.href).origin +
            (this.path.length > 0 ? "/" + this.path : "") +
            "/" +
            path
        );
    }

    /**
     * Redirects to a page using loading
     * @param {string} to
     */
    redirect(to) {
        return (window.location.href = to);
    }

    /**
     * Refreshes the current page
     */
    refresh() {
        this.history().go();
        return this;
    }

    /**
     * Goes back to the previous route
     * @returns
     */
    back() {
        this.history().back();
        return this;
    }

    /**
     * Goes forward to the next route
     * @returns
     */
    forward() {
        this.history().forward();
        return this;
    }

    /**
     * Returns the Window History Object
     * @returns {History}
     */
    history() {
        return window.history;
    }

    /**
     * Returns the current URL
     * @returns {URL}
     */
    url() {
        return new URL(window.location.href);
    }

    /**
     * Gets the value after hash in the url
     * @returns {string}
     */
    hash() {
        return this.url().hash.replace("#", "");
    }

    /**
     * Current Route Path
     * @returns string
     */
    current() {
        return this.url().pathname;
    }

    /**
     * Checks if the name|route matches the current route.
     * @param {string} nameOrRoute
     * @returns
     */
    is(nameOrRoute) {
        if (nameOrRoute == this.__resolved) return true;

        for (let [n, r] of this.nameMap) {
            if (n == nameOrRoute) {
                return r == this.__resolved;
            }
        }

        return false;
    }
}
