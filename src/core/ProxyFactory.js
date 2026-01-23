/**
 * Creates a Proxy
 */
export default class ProxyFactory {
    /**
     * Makes a Proxy
     * @param {class} Target
     * @param {class} Handler
     * @param {Array} targetArgs
     * @param {Array} handlerArgs
     * @returns
     */
    static make(Target, Handler, targetArgs = [], handlerArgs = []) {
        return new Proxy(new Target(...targetArgs), new Handler(...handlerArgs));
    }
}
