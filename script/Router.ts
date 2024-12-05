/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "./component/Observable.js";

export interface Route {
	re: RegExp
	handler: Function
}


/**
 * @inheritDoc
 */
export interface RouterEventMap<Type extends Observable> extends ObservableEventMap<Type> {
	change: (path: string, oldPath: string) => void
}

export interface Router extends Observable {
	on<K extends keyof RouterEventMap<this>, L extends Listener>(eventName: K, listener: RouterEventMap<this>[K], options?: ObservableListenerOpts): L
	un<K extends keyof RouterEventMap<this>>(eventName: K, listener: RouterEventMap<this>[K]): boolean
	fire<K extends keyof RouterEventMap<this>>(eventName: K, ...args: Parameters<RouterEventMap<any>[K]>): boolean
}

export type RouterMethod = (...args: string[]) => Promise<any> | any;

/**
 * Router class
 *
 * @see router
 */
export class Router extends Observable {

	private routes: Route[] = [];

	private suspendEvent = false;

	private loadedPath = "";

	private defaultRoute?: Function;

	private debug = false;

	private params: string[] = [];

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
	 */
	public setPath(...pathParts: any[]) {

		const path = pathParts.map(p => p ?? "").join("/");
		//this._setPath = path; //to cancel event
		if ("#" + path != window.location.hash) {
			this.suspendEvent = true;
			const oldPath = this.getPath();
			window.location.hash = path;
			this.fire("change", this.getPath(), oldPath);
		}
	}

	/**
	 * Add a route
	 *
	 * The first matching route will be executed
	 *
	 * @example
	 * ```
	 * go.Router.add(/^([a-zA-Z0-9]*)\/([\d]*)$/, (entity:string, id:string) => {
	 *
	 * });
	 * ```
	 *
	 * @param re eg. /^notes/(.*)$/
	 * @param handler Is called with the arguments matched in the route regexp. May return Promise so the router start()
	 *  promise will resolve when this promise is resolved.
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
	public start(): Promise<void> {
		const path = this.getPath();

		const oldPath = this.loadedPath;



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

		return this.defaultRoute ? this.handleRoute(this.defaultRoute, [], oldPath) : Promise.resolve();

	}

	private handleRoute(handler: Function, match: string[], oldPath: string) {

		for (let n = 0, l = match.length; n < l; n++) {
			//could be undefined
			match[n] = match[n] ? decodeURIComponent(match[n]) : match[n];
		}

		this.params = match;

		if (this.suspendEvent) {
			setTimeout(() => {
				this.suspendEvent = false;
			});

			return Promise.resolve();
		}


		const result = handler.apply({}, match);

		window.scrollTo(0,0);

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

	 * @return Promise<Router>
	 */
	public goto(...pathParts: any[]) :Promise<Router> {

		const path = pathParts.map(p => p ?? "").join("/");

		const p = new Promise((resolve, reject) => {
			this.on("change", (path1, oldPath) => {
				resolve(this);
			}, {once: true});
		});
		window.location.hash = path || "";
		return p as Promise<Router>;
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