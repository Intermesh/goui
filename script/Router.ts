import {Observable, ObservableEventMap, ObservableListenerOpts} from "./component/Observable.js";

interface Route {
	re: RegExp
	handler: Function
}


/**
 * @inheritDoc
 */
interface RouterEventMap<T extends Observable> extends ObservableEventMap<T> {
	change?: (path: string, oldPath: string) => void
}

interface Router {
	on<K extends keyof RouterEventMap<Router>>(eventName: K, listener: RouterEventMap<Router>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof RouterEventMap<Router>>(eventName: K, ...args: Parameters<NonNullable<RouterEventMap<Router>[K]>>): boolean
}

type RouterMethod = (...args: string[]) => Promise<any> | void;

/**
 * Router class
 *
 * @see router
 */
class Router extends Observable {

	private routes: Route[] = [];

	private suspendEvent = false;

	private loadedPath = "";

	private defaultRoute?: Function;

	private debug = false;

	private params: RegExpMatchArray = [];

	constructor() {
		super();

		window.addEventListener('hashchange', () => {
			this.start();
		}, false);
	}

	/**
	 * Get the router path
	 */
	public getPath() {
		return window.location.hash.substr(1);
	}

	/**
	 * Get the parameters evaluated from the router path
	 */
	public getParams() {
		return this.params;
	}

	/**
	 * Set route path without executing matching routes.
	 *
	 * @param path
	 */
	public setPath(path: string) {
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
	 * The first mathing route will be executed
	 *
	 * @example
	 * ```
	 * go.Router.add(/^([a-zA-Z0-9]*)\/([\d]*)$/, (entity:string, id:string) => {
	 *
	 * });
	 * ```
	 *
	 * @param re /^notes/(.*)$/
	 * @param handler Is called with the arguments matched in the route regexp. May return Promise. When the
	 *  promise is resolved it will continue matching sub routes.
	 */
	add(re: RegExp | RouterMethod, handler?: RouterMethod) {

		if (this.debug) {
			console.debug("Router add: ", re);
		}

		if (typeof re == 'function') {
			handler = re;
			this.defaultRoute = handler;
			return this;
		}

		const route = {re: re, handler: handler!};

		this.routes.push(route);

		return this;
	}

	/**
	 * Start the router and run the matching route handlers
	 */
	public start() {
		const path = this.getPath();

		const oldPath = this.loadedPath;

		if (this.suspendEvent) {
			setTimeout(() => {
				this.suspendEvent = false;
			});

			return;
		}


		this.loadedPath = path;

		for (let i = 0; i < this.routes.length; i++) {
			const args = path.match(this.routes[i].re);
			if (args) {
				if (this.debug) {
					console.debug("Router match: ", this.routes[i].re);
				}
				args.shift();
				return this.handleRoute(this.routes[i].handler, args, oldPath);
			}
		}

		//nothing matched so we load the default

		return this.defaultRoute ? this.handleRoute(this.defaultRoute, [], oldPath) : this;

	}

	private handleRoute(handler: Function, match: RegExpMatchArray, oldPath: string) {

		for (let n = 0, l = match.length; n < l; n++) {
			match[n] = decodeURIComponent(match[n]);
		}

		this.params = match;
		const result = handler.apply({}, match);

		this.fire("change", this.getPath(), oldPath);

		return result instanceof Promise ? result : Promise.resolve();
	}


	/**
	 * Reload current page.
	 */
	public reload() {
		this.start();
	}

	/**
	 * Go to the give router path
	 *
	 * @param path
	 * @return Promise<Router>
	 */
	public goto(path: string) {
		const p = new Promise((resolve, reject) => {
			this.on("change", (path1, oldPath) => {
				resolve(this);
			}, {once: true});
		});
		window.location.hash = path || "";
		return p;
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