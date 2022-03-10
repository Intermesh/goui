/**
 * Buffer or delay a function
 */
class BufferedFunction {
    /**
     * Constructor
     * @param delay Delay to execute function
     * @param fn Function to buffer
     */
    constructor(delay, fn) {
        this.delay = delay;
        this.fn = fn;
    }
    buffer(args = []) {
        this.cancel();
        this.id = window.setTimeout(() => {
            this.cancel();
            this.fn.apply(null, args);
        }, this.delay);
    }
    cancel() {
        if (this.id) {
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
    static buffer(delay, fn) {
        const bf = new BufferedFunction(delay, fn);
        return (...args) => {
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
    static delay(delay, fn) {
        return (...args) => {
            const bf = new BufferedFunction(delay, fn);
            bf.buffer(args);
        };
    }
    static onRepaint(fn) {
        let frame = -1;
        return (...args) => {
            if (frame > -1) {
                cancelAnimationFrame(frame);
            }
            frame = window.requestAnimationFrame(() => {
                fn.apply(null, args);
            });
        };
    }
}
//# sourceMappingURL=FunctionUtil.js.map