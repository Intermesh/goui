import { Observable } from "./component/Observable.js";
/**
 * Router class
 *
 * @see router
 */
class Router extends Observable {
    constructor() {
        super();
        this.routes = [];
        this.suspendEvent = false;
        this.loadedPath = "";
        this.matchingPath = "";
        this.debug = false;
        window.addEventListener('hashchange', () => {
            this.start();
        }, false);
    }
    getPath() {
        return window.location.hash.substr(1);
    }
    /**
     * Set route path without executing matching routes.
     *
     * @param path
     */
    setPath(path) {
        //this._setPath = path; //to cancel event
        if (path != window.location.hash) {
            this.suspendEvent = true;
            const oldPath = this.getPath();
            window.location.hash = path;
            this.fire("change", this.getPath(), oldPath);
        }
    }
    /**
     * Add a route
     *
     * All matching routes will be executed! You can even add routes inside a route handler.
     *
     * @example
     * ```
     * go.Router.add(/([a-zA-Z0-9]*)\/([0-9]*)/, (entity:string, id:string) => {
     *
     * });
     * ```
     *
     * @param re /notes/(.*)/
     * @param handler Is called with the arguments matched in the route regexp. May return Promise. When the
     *  promise is resolved it will continue matching sub routes.
     */
    add(re, handler) {
        if (this.debug) {
            console.debug("Router add: ", re);
        }
        if (typeof re == 'function') {
            handler = re;
            this.defaultRoute = handler;
            return this;
        }
        const route = { re: re, handler: handler };
        this.routes.push(route);
        //if we're currently processing a path then check if we can add this route to the matches on the fly.
        // This allows to dynamically add routes while matching.
        if (this.matches) {
            this.matchRoute(route);
        }
        return this;
    }
    matchRoute(route) {
        const args = this.matchingPath.match(route.re);
        if (args) {
            if (this.debug) {
                console.debug("Router match: ", route.re);
            }
            args.shift();
            this.matches.push({ route: route, args: args });
        }
    }
    /**
     * Start the router and run the matching route handlers
     */
    start() {
        const path = this.getPath();
        const oldPath = this.loadedPath;
        this.matchingPath = path;
        if (this.suspendEvent) {
            setTimeout(() => {
                this.suspendEvent = false;
            });
            return;
        }
        this.matches = [];
        for (let i = 0; i < this.routes.length; i++) {
            this.matchRoute(this.routes[i]);
        }
        this.fire("change", this.getPath(), oldPath);
        if (!this.matches.length) {
            this.loadedPath = path;
            return this.defaultRoute ? this.handleRoute(this.defaultRoute, []) : this;
        }
        else {
            const doNextRoute = (n) => {
                if (this.debug) {
                    console.debug("Router handle:", this.matches[n].route.re);
                }
                this.handleRoute(this.matches[n].route.handler, this.matches[n].args).then(() => {
                    n++;
                    if (n < this.matches.length) {
                        doNextRoute(n);
                    }
                    else {
                        if (this.debug) {
                            console.debug("Router done: ", path, this.matches);
                        }
                        this.loadedPath = path;
                    }
                });
            };
            doNextRoute(0);
        }
    }
    handleRoute(handler, match) {
        for (let n = 0, l = match.length; n < l; n++) {
            match[n] = decodeURIComponent(match[n]);
        }
        // this.routing = true;
        const result = handler.apply({}, match);
        // this.routing = false;
        return result instanceof Promise ? result : Promise.resolve();
    }
    /**
     * Reload current page.
     */
    reload() {
        this.start();
    }
    /**
     * Go to the give router path
     *
     * @param path
     */
    goto(path) {
        window.location.hash = path || "";
        return this;
    }
}
/**
 * Router instance
 *
 * The router will execute all matching route methods!
 *
 * so if the route is /home then both routes will execute
 *
 * @example Dynamic loading and promises
 * ```
 * router.add('/home', () => {})
 *  .add('/home/test', () => {
 *    //may return promise to load a new  module for example and add new sub routes
 *    router.add(/home\/test\/sub/, () => {});
 *
 *    return Promise.resolve();
 *  });
 *
 * ```
 *
 * @example With parameters
 * ```
 * router.
 *  .add(/about/,  () => {
 * 					console.log('about');
 * 				})
 *  .add(/products\/(.*)\/edit\/(.*)/, () => {
 * 					console.log('products', arguments);
 * 				})
 *  .add( () => {
 * 					console.log('default');
 * 				});
 * ```
 */
export const router = new Router();
//# sourceMappingURL=Router.js.map