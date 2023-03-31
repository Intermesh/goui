/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
type Func = ((...args: any[]) => any);
/**
 * Buffer or delay a function
 */
class BufferedFunction {
	private id:number|undefined;

	/**
	 * Constructor
	 * @param delay Delay to execute function
	 * @param fn Function to buffer
	 */
	constructor(readonly delay:number, readonly fn:Function) {
		this.delay = delay;
		this.fn = fn;
	}

	/**
	 * Bugger the function with the delay set on this class
	 *
	 * @param args
	 */
	buffer(args:any[] = []) {
		this.cancel();
		this.id = window.setTimeout(() => {
			this.cancel();
			this.fn.apply(null, args);
		}, this.delay);
	}

	/**
	 * Cancel the function call
	 */
	cancel() {
		if(this.id) {
			clearTimeout(this.id);
			this.id = undefined;
		}
	}
}

/**
 * Function utilities
 */
export class FunctionUtil {

	/**
	 * Buffer the function with this number of milliseconds.
	 * When the function is called multiple times within the delay period only the last call will execute.
	 *
	 * @param delay
	 * @param fn
	 */
	public static buffer(delay: number, fn: Function) {
		const bf = new BufferedFunction(delay, fn);
		return (...args: any[]) => {
			bf.buffer(args);
		};
	}

	/**
	 *
	 * Delay function execution
	 *
	 * @param delay
	 * @param fn
	 */
	public static delay(delay: number, fn: Function) {
		return (...args: any[]) => {
			const bf = new BufferedFunction(delay, fn);
			bf.buffer(args);
		};
	}

	/**
	 * Execute on the next repaint
	 *
	 * The onRepaint method tells the browser that you wish to perform an animation and requests
	 * that the browser calls a specified function to update an animation before the next repaint.
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	 * @param fn
	 */
	public static onRepaint(fn: Function) {

		let frame = -1;

		return (...args: any[]) => {
			if(frame > -1) {
				cancelAnimationFrame(frame);
			}

			 frame = window.requestAnimationFrame(() => {
				 fn.apply(null, args);
			 });
		}
	}


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
	public static createSequence<F extends Func>(origFn: F, newFn: (retVal: ReturnType<F>, ...args: Parameters<F>) => unknown) : F {
		return function(this: unknown, ...args:Parameters<F>) {
			const r = origFn.apply(this, args);
			return newFn.call(this, r as ReturnType<F>, ...args);
		} as F
	}

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
	public static createInterceptor<F extends Func>(origFn: F, newFn: (...args: Parameters<F>) => unknown): F {
		return function(this: unknown, ...args:Parameters<F>) {
			newFn.apply(this, args);
			return origFn.apply(this, args);
		} as F
	}
}
