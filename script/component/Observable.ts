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
export interface ObservableEventMap<Type> {

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

	private lisnrs: {
		[key: string]: { listener: Function, unbindkey: Function, options?: ObservableListenerOpts }[]
	} | undefined;

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
	 * When a listener returns false this function will return false too.
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


// export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// export type WithRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Generic Config option that allows all public properties as options
 */
export type Config<Cmp extends Observable, EventMap extends ObservableEventMap<Observable> = ComponentEventMap<Cmp>, Required extends keyof Cmp = never> =

	Writeable<
		Partial<
			Pick<Cmp,
				{
					[K in keyof Cmp]: Cmp[K] extends Function ? never : K extends Required ? never : K
				}[keyof Cmp]
			>
		>
	>

	&

	Writeable<Pick<Cmp, Required>>

	& {
	/**
	 * Add listeners
	 *
	 * You can pass them in two ways:
	 *
	 * @example
	 * ```
	 * comp({
	 * 		listeners: {
	 *
	 * 			//simple syntax add the listener directly
	 * 			additem:(container, item, index) => {
	 * 				//do something when an item was added
	 * 			},
	 *
	 * 	    	// extended syntax to pass extra listener options
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
	listeners?: ObservableListener<EventMap>
}
	;