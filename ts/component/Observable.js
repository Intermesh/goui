import { FunctionUtil } from "../util/FunctionUtil.js";
/**
 * Observable
 *
 * Adds event listener functionality
 */
export class Observable {
    constructor() {
        this.initCalled = false;
    }
    /**
     *
     * Create the component with config object.
     *
     * It constructs and initializes the object.
     *
     * @param config
     */
    static create(config) {
        const c = new this();
        Object.assign(c, config);
        c.init();
        return c;
    }
    /**
     * Initialise your object with this method. Call super.init() at the end of your override.
     * This method is called after construction by the create() function.
     */
    init() {
        this.initCalled = true;
        if (this.listeners) {
            for (let key in this.listeners) {
                const eventName = key;
                if (typeof this.listeners[eventName] == 'function') {
                    this.on(eventName, this.listeners[eventName]);
                }
                else {
                    const o = this.listeners[eventName];
                    const fn = o.fn;
                    delete o.fn;
                    this.on(eventName, fn, o);
                }
            }
        }
    }
    /**
     * Add a listener
     *
     * @param eventName
     * @param listener
     * @param options
     */
    on(eventName, listener, options) {
        //store original listener for the un() method. Because options may change the function
        const unbindkey = listener;
        if (options) {
            if (options.buffer) {
                listener = FunctionUtil.buffer(options.buffer, listener);
            }
            if (options.once) {
                listener = this.once(eventName, listener);
            }
            if (options.delay) {
                listener = FunctionUtil.delay(options.delay, listener);
            }
        }
        this.lisnrs = this.lisnrs || {};
        this.lisnrs[eventName] = this.lisnrs[eventName] || [];
        if (options === null || options === void 0 ? void 0 : options.unshift) {
            this.lisnrs[eventName].unshift({ listener: listener, options: options, unbindkey: unbindkey });
        }
        else {
            this.lisnrs[eventName].push({ listener: listener, options: options, unbindkey: unbindkey });
        }
    }
    once(eventName, listener) {
        const newfn = (...args) => {
            listener.apply(null, args);
            this.un(eventName, newfn);
        };
        return newfn;
    }
    /**
     * Remove listener
     *
     * @param eventName
     * @param listener
     */
    un(eventName, listener) {
        if (!this.lisnrs || !this.lisnrs[eventName]) {
            return false;
        }
        for (let i = 0, l = this.lisnrs[eventName].length; i < l; i++) {
            const l = this.lisnrs[eventName][i];
            if (l.unbindkey === listener) {
                this.lisnrs[eventName].splice(i, 1);
                return true;
            }
        }
        return false;
    }
    /**
     * Fire an event
     *
     * @param eventName
     * @param args
     */
    fire(eventName, ...args) {
        if (!this.lisnrs || !this.lisnrs[eventName]) {
            return true;
        }
        for (let l of this.lisnrs[eventName]) {
            if (l.listener.apply(null, args) === false) {
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=Observable.js.map