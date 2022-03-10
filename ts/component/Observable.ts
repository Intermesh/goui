import {FunctionUtil} from "../util/FunctionUtil.js";

type Func = ((...args:any[]) => any) ;

/**
 * Component events
 *
 * @see ComponentEventMap
 */
export interface ObservableEventMap<T extends Observable> {}


/**
 * Observable listener configuration.
 *
 * A listener can be passed as a function or a config option.
 *
 * {@see ObservableListenerWithOpts}
 * {@see ObservableConfig.listeners}
 */
export type ObservableListener<Map extends ObservableEventMap<Observable>> =  {
	[P in keyof Map]: ObservableListenerWithOpts<Map[P]> | Map[P]
};

/**
 * Config object with properties to apply to the component
 */
export interface ObservableConfig<T extends Observable> {
	/**
	 * Add listeners
	 *
	 * You can pass them in two ways:
	 *
	 * @example
	 * ```
	 * Component.create({
	 * 		listeners: {
	 *
	 * 			//simple syntax add the listener directly
	 * 			additem:(container, item, index) => {
	 * 				//do something when an item was added
	 * 			},
	 *
	 * 	    // extended syntax to pass extra listener options
	 * 			beforeadditem: {
	 * 				//with this syntax you can pass extra options
	 * 				fn:(container, item, index) => {
	 * 					//do something before an item will be added but only once
	 * 				},
	 * 				once: true
	 * 			}
	 * 		}
	 * 	})
	 * 	```
	 *
	 * 	@see Observable.on()
	 */
	listeners?: ObservableListener<ObservableEventMap<T>>
}

/**
 * Options for event listener functions
 */
export interface ObservableListenerOpts {
	/**
	 * Fire the listener only once
	 */
	once?: boolean

	/**
	 * Buffer the listener with this number of milliseconds.
	 * When an event is fired multiple times within the buffer period only the last event listener will be called
	 */
	buffer?:number,

	/**
	 * Delay the listener with this number of milliseconds.
	 */
	delay?:number,

	/**
	 * Put this listener before existing listeners instead of after
	 */
	unshift?:boolean
}

/**
 * The listener with options can be passed to a component config object's listeners property.
 */
interface ObservableListenerWithOpts<fn> extends ObservableListenerOpts {
	/**
	 * The listener function to execute on the event
	 */
	fn: fn
}


/**
 * Observable
 *
 * Adds event listener functionality
 */
export class Observable {

	/**
	 *
	 * Create the component with config object.
	 *
	 * It constructs and initializes the object.
	 *
	 * @param config
	 */
	public static create<T extends typeof Observable>(config?: ObservableConfig<InstanceType<T>>) {
		const c = new this() as InstanceType<T>;
		Object.assign(c, config);
		c.init();
		return c;
	}

	private lisnrs: { [key: string]: { listener: Function, unbindkey:Function, options?: ObservableListenerOpts }[] } | undefined;

	protected listeners: ObservableEventMap<Observable> | undefined;

	protected initCalled = false;

	/**
	 * Initialise your object with this method. Call super.init() at the end of your override.
	 * This method is called after construction by the create() function.
	 */
	protected init() {

		this.initCalled = true;

		if(this.listeners) {
			for(let key in this.listeners) {
				const eventName = key as keyof ObservableEventMap<Observable>;
				if(typeof this.listeners[eventName] == 'function') {
					this.on(eventName, this.listeners[eventName] as Func);
				} else
				{
					const o = this.listeners[eventName] as Partial<ObservableListenerWithOpts<Func>>;
					const fn = <Func> o.fn;
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
	on(eventName: keyof ObservableEventMap<Observable>, listener: Function, options?: ObservableListenerOpts) {

		//store original listener for the un() method. Because options may change the function
		const unbindkey = listener;
		if (options) {
			if(options.buffer) {
				listener = FunctionUtil.buffer(options.buffer, listener);
			}

			if(options.once) {
				listener = this.once(eventName, listener);
			}

			if(options.delay) {
				listener = FunctionUtil.delay(options.delay, listener);
			}
		}
		this.lisnrs = this.lisnrs || {};
		this.lisnrs[eventName] = this.lisnrs[eventName] || [];
		if(options?.unshift) {
			this.lisnrs[eventName].unshift({listener: listener, options: options, unbindkey: unbindkey});
		} else
		{
			this.lisnrs[eventName].push({listener: listener, options: options, unbindkey: unbindkey});
		}

	}

	private once(eventName: keyof ObservableEventMap<Observable>, listener: Function) {
		const newfn = (...args: any[]) => {
			listener.apply(null, args);
			this.un(eventName, newfn);
		}
		return newfn;
	}


	/**
	 * Remove listener
	 *
	 * @param eventName
	 * @param listener
	 */
	un(eventName: keyof ObservableEventMap<Observable>, listener: Function) {
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
	fire<K extends keyof ObservableEventMap<Observable>>(eventName: K, ...args: Parameters<ObservableEventMap<Observable>[K]>) {
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