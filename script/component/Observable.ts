/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {FunctionUtil} from "../util/FunctionUtil.js";
import {ComponentEventMap} from "./Component.js";

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
 * {@link ObservableListenerWithOpts}
 */
export type ObservableListener<Map extends ObservableEventMap<Observable>> = {
	[P in keyof Map]?: ObservableListenerWithOpts<Map[P]> | Map[P]
};

export type Listener<Comp extends Observable = Observable> = (sender: Comp, ...args: any[]) => false|void
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
	unshift?: boolean,

	/**
	 * Call the function with this argument as thisArg.
	 */
	bind?: any
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
		[key: string]: { listener: Function, unbindkey: Listener, options?: ObservableListenerOpts }[]
	} | undefined;

	/**
	 * Add a listener
	 *
	 * @param eventName
	 * @param listener
	 * @param options
	 */
	public on<key extends keyof ObservableEventMap<this>, L extends Listener>(eventName: keyof ObservableEventMap<this>, listener: ObservableEventMap<this>[key], options?: ObservableListenerOpts) : L {

		//store original listener for the un() method. Because options may change the function
		const unbindkey = listener;

		if (options) {
			if (options.buffer !== undefined) {
				listener = FunctionUtil.buffer(options.buffer, listener) as never;
			}

			if (options.once) {
				listener = this.once(eventName, listener) as never;
			}

			if (options.delay) {
				listener = FunctionUtil.delay(options.delay, listener) as never;
			}

			if(options.bind) {
				listener = (listener as Function).bind(options.bind);
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

		//because of the settimeout it can run multiple times within the same event loop
		let executed = false;
		return (...args: any[]) => {
			if(!executed) {
				listener.apply(null, args);
			}

			executed = true;
			// use set timeout so for .. of loop will continue with next listeners
			setTimeout(() => {
				this.un(eventName, listener);
			})
		};
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
	 * Outputs all events to console
 	 */
	public static DEBUG = false;

	/**
	 * Fire an event
	 *
	 * When a listener returns false this function will return false too.
	 *
	 * @param eventName
	 * @param args
	 */
	public fire<K extends keyof ObservableEventMap<this>>(eventName: K, ...args: Parameters<ObservableEventMap<this>[K]>) {

		if(Observable.DEBUG) {
			console.log(eventName, ...args);
		}

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
			return this.fire(type, ...args);
		});
	}

	/**
	 * Remove all listeners
	 */
	public removeAllListeners() {
		this.lisnrs = {};
	}
}


// export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// export type WithRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
type Writeable<T> = { -readonly [P in keyof T]: T[P] };




// export type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T]


type CompFuncs =  "buildState" |
	"cascade" |
	"computeZIndex" |
	"createFindPredicateFunction" |
	"findAncestor" |
	"findAncestorByType" |
	"findChild" |
	"findChildByType" |
	"findChildren" |
	"findChildrenByType" |
	"findItem" |
	"findItemIndex" |
	"fire" |
	"focus" |
	"getInsertBefore" |
	"getState" |
	"hasOwnProperty" |
	"hasState" |
	"hide" |
	"initClassName" |
	"initItems" |
	"internalRemove" |
	"internalRender" |
	"internalSetHidden" |
	"isFocusable" |
	"mask" |
	"nextSibling" |
	"on" |
	"onFirstListenerAdded" |
	"once" |
	"previousSibling" |
	"print" |
	"propertyIsEnumerable" |
	"relayEvent" |
	"remove" |
	"render" |
	"renderItem" |
	"renderItems" |
	"restoreState" |
	"saveState" |
	"show" |
	"toLocaleString" |
	"toString" |
	"un" |
	"unmask" |
	"valueOf" |
	"items" |
	"parent"

// sometimes setters have a different type than the getters. TS prefers the getter type but not if we omit all the getters.
// For example get width() and set width() in component
type LoseGetters<MyType> = Omit<MyType, { [K in keyof MyType]: K extends `get ${string}` ? K : never }[keyof MyType]>;

type WritablePartial<T> = {
	-readonly [P in keyof T]?: T[P];
};

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

	WritablePartial<
		//somehow this breaks generic class sometimes : (
		// Omit<Cmp, Required & FunctionPropertyNames<Cmp>>
	Omit<LoseGetters<Cmp>, CompFuncs >
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

	tagName?: keyof HTMLElementTagNameMap
}
