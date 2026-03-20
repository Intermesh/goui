/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Observable, ObservableEventMap } from "./component";
export interface Route {
    re: RegExp;
    handler: Function;
}
/**
 * @inheritDoc
 */
export interface RouterEventMap extends ObservableEventMap {
    change: {
        path: string;
        oldPath: string;
    };
}
export type RouterMethod = (...args: string[]) => Promise<any> | any;
/**
 * Router class
 *
 * @see router
 */
export declare class Router extends Observable<RouterEventMap> {
    private routes;
    private suspendEvent;
    private loadedPath;
    private defaultRoute?;
    private debug;
    private params;
    private routing;
    constructor();
    /**
     * Get the router path
     */
    getPath(): string;
    /**
     * Get the parameters evaluated from the router path
     */
    getParams(): string[];
    /**
     * Set route path without executing matching routes.
     */
    setPath(...pathParts: any[]): void;
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
    add(re: RegExp | RouterMethod, handler?: RouterMethod): this;
    /**
     * Start the router and run the matching route handlers
     */
    start(): Promise<any>;
    private handleRoute;
    /**
     * Returns true if the router is currently handling a routing task.
     */
    isRouting(): boolean;
    /**
     * Reload current page.
     */
    reload(): Promise<any>;
    /**
     * Go to the give router path
     *

     * @return Promise<Router>
     */
    goto(...pathParts: any[]): Promise<Router>;
}
/**
 * Router instance
 *
 * The router will execute all matching route methods!
 *
 * so if the route is /home then both routes will execute
 *
 * @link https://github.com/Intermesh/goui-docs/blob/main/script/Index.ts Example of GOUI Documentation site
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
 *
 *
 */
export declare const router: Router;
