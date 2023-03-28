/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {FunctionUtil} from "../util/FunctionUtil.js";
import {ComponentEventMap} from "./Component.js";

type Func = (...args: any[]) => any;

/**
 * Component events
 *
 * @see ComponentEventMap
 */
export interface ObservableEventMap<Sender> {

}


/**
 * Observable listener configuration.
 *
 * A listener can be passed as a function or a config option.
 *
 * {@see ObservableListenerWithOpts}
 * {@see ObservableConfig.listeners}
 */
export type ObservableListener<Map extends ObservableEventMap<Observable>> = {
	[P in keyof Map]?: ObservableListenerWithOpts<Map[P]> | Map[P]
};

// type Listener<Comp, EventParams extends any[]> = (sender: Comp, ...args: EventParams) => false|void
//
// export type ObservableListener2<Comp extends Observable<Map>, Map extends ObservableEventMap2> =  {
// 	[P in keyof Map]?: Map[P] extends Func ? ObservableListenerWithOpts<Map[P]> | Listener<Comp, Parameters<Map[P]>> : never
// };


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
	buffer?: number,

	/**
	 * Delay the listener with this number of milliseconds.
	 */
	delay?: number,

	/**
	 * Put this listener before existing listeners instead of after
	 */
	unshift?: boolean
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

	private lisnrs: { [key: string]: { listener: Function, unbindkey: Function, options?: ObservableListenerOpts }[] } | undefined;

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
	set listeners(listeners: ObservableListener<ObservableEventMap<this>>) {
		for (let key in listeners) {
			const eventName = key as keyof ObservableEventMap<Observable>;
			if (typeof listeners[eventName] == 'function') {
				this.on(eventName, listeners[eventName] as never);
			} else {
				const o = listeners[eventName] as Partial<ObservableListenerWithOpts<Func>>;
				const fn = o.fn as never;
				delete o.fn;
				this.on(eventName, fn, o);
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
	public on<key extends keyof ObservableEventMap<this>>(eventName: keyof ObservableEventMap<this>, listener: ObservableEventMap<this>[key], options?: ObservableListenerOpts) {

		//store original listener for the un() method. Because options may change the function
		const unbindkey = listener!;

		if (options) {
			if (options.buffer) {
				listener = FunctionUtil.buffer(options.buffer, listener!) as never;
			}

			if (options.once) {
				listener = this.once(eventName, listener!) as never;
			}

			if (options.delay) {
				listener = FunctionUtil.delay(options.delay, listener!) as never;
			}
		}
		this.lisnrs = this.lisnrs || {};
		this.lisnrs[eventName] = this.lisnrs[eventName] || [];
		if (options?.unshift) {
			this.lisnrs[eventName].unshift({listener: listener!, options: options, unbindkey: unbindkey});
		} else {
			this.lisnrs[eventName].push({listener: listener!, options: options, unbindkey: unbindkey});
		}

	}

	private once(eventName: keyof ObservableEventMap<Observable>, listener: Function) {
		const newfn = (...args: any[]) => {
			listener.apply(null, args);
			this.un(eventName, listener);
		}
		return newfn;
	}


	/**
	 * Remove listener
	 *
	 * @param eventName
	 * @param listener
	 */
	public un(eventName: keyof ObservableEventMap<this>, listener: Function) {
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
	public fire<K extends keyof ObservableEventMap<this>>(eventName: K, ...args: Parameters<ObservableEventMap<this>[K]>) {
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


// export function initComp<T extends Component>(comp: T, config?: any, items?: Component[]) {
//
// 	if(config.listeners) {
//
// 		for(let key in config.listeners) {
// 			const eventName = key as keyof ObservableEventMap<Observable>;
// 			if(typeof config.listeners[eventName] == 'function') {
// 				comp.on(eventName, config.listeners[eventName] as never);
// 			} else
// 			{
// 				const o = config.listeners[eventName] as Partial<ObservableListenerWithOpts<Func>>;
// 				const fn =  o.fn as never;
// 				delete o.fn;
// 				comp.on(eventName, fn, o);
// 			}
// 		}
//
// 		delete config.listeners;
// 	}
//
// 	if (config) {
// 		Object.assign(comp, config);
// 	}
//
// 	if (items && items.length) {
// 		comp.items.add(...items);
// 	}
//
// 	return comp;
// }

