/**
 * Creates a Proxy
 */
export default class ProxyFactory {
    /**
     * Makes a Proxy
     * @param {class} Target
     * @param {class} Handler
     * @returns
     */
    static make(Target, Handler) {
        return new Proxy(new Target(), new Handler());
    }
}
