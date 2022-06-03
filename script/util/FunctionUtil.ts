
/**
 * Buffer or delay a function
 */
class BufferedFunction {
	private id:number|undefined;
	readonly delay:number;
	readonly fn:Function;

	/**
	 * Constructor
	 * @param delay Delay to execute function
	 * @param fn Function to buffer
	 */
	constructor(delay:number, fn:Function) {
		this.delay = delay;
		this.fn = fn;
	}

	buffer(args:any[] = []) {
		this.cancel();
		this.id = window.setTimeout(() => {
			this.cancel();
			this.fn.apply(null, args);
		}, this.delay);
	}

	cancel() {
		if(this.id) {
			clearTimeout(this.id);
			this.id = undefined;
		}
	}
}

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
}
