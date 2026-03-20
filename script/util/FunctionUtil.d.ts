/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
type Func = ((...args: any[]) => any);
/**
 * Buffer or delay a function
 * @category Utility
 *
 */
export declare class BufferedFunction<F extends (...args: any) => any> {
    readonly delay: number;
    readonly fn: F;
    private id;
    /**
     * Constructor
     * @param delay Delay to execute function
     * @param fn Function to buffer
     */
    constructor(delay: number, fn: F);
    /**
     * Bugger the function with the delay set on this class
     *
     * @param args
     * @param scope
     */
    buffer(args: any[] | undefined, scope: any): Promise<ReturnType<F>>;
    /**
     * Cancel the function call
     */
    cancel(): void;
    /**
     * Check if it's still pending for execution
     */
    pending(): boolean;
}
/**
 * Function utilities
 *
 * @category Utility
 */
export declare class FunctionUtil {
    /**
     * Buffer the function with this number of milliseconds.
     * When the function is called multiple times within the delay period only the last call will execute.
     *
     * @param delay
     * @param fn
     */
    static buffer<F extends (...args: any) => any>(delay: number, fn: F): (this: any, ...args: Parameters<F>) => Promise<ReturnType<F>>;
    /**
     *
     * Delay function execution
     *
     * @param delay
     * @param fn
     */
    static delay<F extends (...args: any) => any>(delay: number, fn: F): (this: any, ...args: any[]) => Promise<ReturnType<F>>;
    /**
     * Execute on the next repaint
     *
     * The onRepaint method tells the browser that you wish to perform an animation and requests
     * that the browser calls a specified function to update an animation before the next repaint.
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     * @param fn
     */
    static onRepaint<F extends (...args: any) => any>(fn: F): (this: any, ...args: Parameters<F>) => Promise<ReturnType<F>>;
    /**
     * Will combine the given functions into one.
     *
     * The newFn function will be called with the return value of origFn function + the parameters of origFn
     * and function will return the value of newFn
     *
     * @param origFn
     * @param newFn
     *
     * @example
     * ```
     * function test(a:number, b:string) : string {
     * 	return b;
     * }
     *
     * FunctionUtil.createSequence(test, function(r, a, b) {
     * 	return r + "b";
     * })
     * ```
     *
     */
    static createSequence<F extends Func>(origFn: F, newFn: (retVal: ReturnType<F>, ...args: Parameters<F>) => unknown): F;
    /**
     * Create a combined function of an orignal and new function. The new function will be called
     * before the original,
     *
     * @param origFn
     * @param newFn
     *
     * @example
     * ```
     * export function playgroundTableOverride() {
     * 	PlaygroundTable.prototype.render = FunctionUtil.createInterceptor(
     * 		PlaygroundTable.prototype.render,
     * 		function(this:PlaygroundTable) {
     * 			this.el.classList.add("cls-added-by-override");
     * 		}
     * 	)
     * }
     * ```
     */
    static createInterceptor<F extends Func>(origFn: F, newFn: (...args: Parameters<F>) => unknown): F;
}
export {};
