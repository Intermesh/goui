/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {FunctionUtil} from "../util/FunctionUtil.js";
import {Component, ComponentEventMap} from "./Component.js";

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
	public on<key extends keyof ObservableEventMap<this>, L extends Function>(eventName: keyof ObservableEventMap<this>, listener: ObservableEventMap<this>[key], options?: ObservableListenerOpts) : L {

		//store original listener for the un() method. Because options may change the function
		const unbindkey = listener!;

		if (options) {
			if (options.buffer !== undefined) {
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
		if(!this.lisnrs[eventName]) {
			this.lisnrs[eventName] = [];
			this.onFirstListenerAdded(eventName);
		}
		if (options?.unshift) {
			this.lisnrs[eventName].unshift({listener: listener!, options: options, unbindkey: unbindkey});
		} else {
			this.lisnrs[eventName].push({listener: listener!, options: options, unbindkey: unbindkey});
		}

		return unbindkey;

	}

	/**
	 * Override this function to lazily initialize events
	 * @param eventName
	 * @protected
	 */
	protected onFirstListenerAdded(eventName: string) {

	}

	private once(eventName: keyof ObservableEventMap<Observable>, listener: Function) {
		const newfn = (...args: any[]) => {
			listener.apply(null, args);
			// use set timeout so for .. of loop will continue with next listeners
			setTimeout(() => {
				this.un(eventName, listener);
			})
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

		// console.log(eventName, ...args);

		if (!this.lisnrs || !this.lisnrs[eventName]) {
			return true;
		}

		let ret = true;

		for (let l of this.lisnrs[eventName]) {

			if (l.listener.apply(null, args) === false) {
				ret = false;
			}
		}

		return ret;
	}

	protected relayEvent(comp:Observable, type: any) {
		//@ts-ignore
		comp.on(type, (...args:any[]) =>{
			//@ts-ignore
			this.fire(type, ...args);
		});
	}
}


// export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// export type WithRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type ExcludeFunctionPropertyNames<T> = Pick<T, {
	[K in keyof T]: T[K] extends Function ? never : K
}[keyof T]>;

/**
 * Generic Config option that allows all public properties as options.
 * It excludes all function types. If you need to pass functions as config options you will need to add them like this:
 *
 * ```
 * type ChipsConfig = Config<ChipsField, FieldEventMap<ChipsField>> &
 *   // Add the function properties as they are filtered out
 * 	Partial<Pick<ChipsField, "textInputToValue" | "chipRenderer">>
 * ```
 */
export type Config<Cmp extends Observable, EventMap extends ObservableEventMap<Observable> = ComponentEventMap<Cmp>, Required extends keyof Cmp = never> =

	Writeable<
		Partial<
			ExcludeFunctionPropertyNames<
				Omit<Cmp, Required>
			>
		>
	>

	&

	Writeable<
		Pick<Cmp, Required>
	>

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