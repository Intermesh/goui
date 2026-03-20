/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Length } from "./Component";
/**
 * A mapping of component events
 *
 * The key is the event name and the describes the listener argument that gets passed to it. This event object always
 * gets an extra property "target" which contains the component emitting the event.
 *
 * See {@link ComponentEventMap} for an example
 */
export interface ObservableEventMap {
}
/**
 * Observable listener configuration.
 *
 * A listener can be passed as a function or a config option.
 *
 * {@link ObservableListenerWithOpts}
 */
export type ListenersConfig<Comp extends Observable, Map extends ObservableEventMap> = {
    [P in keyof Map]?: ObservableListenerWithOpts<Listener<Comp, Map[P]>> | Listener<Comp, Map[P]>;
};
export type InferComponentEventMap<ObservableType> = ObservableType extends Observable<infer EventMap extends ObservableEventMap> ? EventMap : never;
export type Listener<Comp extends Observable, EventData> = (this: Comp, ev: EventData & {
    /**
     * The component that dispatched the event
     */
    readonly target: Comp;
}) => any;
/**
 * Options for event listener functions
 */
export interface ObservableListenerOpts {
    /**
     * Fire the listener only once
     */
    once?: boolean;
    /**
     * Buffer the listener with this number of milliseconds.
     * When an event is fired multiple times within the buffer period only the last event listener will be called
     */
    buffer?: number;
    /**
     * Delay the listener with this number of milliseconds.
     */
    delay?: number;
    /**
     * Put this listener before existing listeners instead of after
     */
    unshift?: boolean;
    /**
     * Call the function with this argument as thisArg.
     */
    bind?: any;
}
/**
 * The listener with options can be passed to a component config object's listeners property.
 */
interface ObservableListenerWithOpts<fn> extends ObservableListenerOpts {
    /**
     * The listener function to execute on the event
     */
    fn: fn;
}
/**
 * Observable
 *
 * Adds event listener functionality
 */
export declare class Observable<EventMapType extends ObservableEventMap = ObservableEventMap> {
    /**
     * We need this dummy property to infer the eventmap with InferComponentEventMap:
     *
     * This limitation is discussed in GitHub issues like #26242 and #32794, which request better inference for
     * generic parameters in classes and interfaces. The workaround of adding a dummy property is frequently mentioned in such discussions.
     *
     * @protected
     */
    protected _eventMapAnchor: EventMapType;
    private lisnrs;
    /**
     * Add a listener
     *
     * @todo test un() when using buffer
     *
     * @param eventName
     * @param listener
     * @param options
     */
    on<key extends keyof EventMapType>(eventName: key, listener: Listener<this, EventMapType[key]>, options?: ObservableListenerOpts): this;
    /**
     * Override this function to lazily initialize events
     * @param eventName
     * @protected
     */
    protected onFirstListenerAdded(eventName: keyof EventMapType): void;
    private once;
    /**
     * Remove listener
     *
     * @param eventName
     * @param listener
     */
    un<K extends keyof EventMapType>(eventName: K, listener: Listener<this, EventMapType[K]>): boolean;
    /**
     * Outputs all events to console
     */
    static DEBUG: boolean;
    /**
     * Fire an event
     *
     * When a listener returns false this function will return false too.
     *
     * @param eventName
     * @param ev
     */
    fire<K extends keyof EventMapType>(eventName: K, ev: EventMapType[K]): boolean;
    protected relayEvent(comp: Observable<ObservableEventMap>, type: any): void;
    /**
     * Remove all listeners
     */
    removeAllListeners(): void;
}
type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
type CompFuncs = "buildState" | "cascade" | "computeZIndex" | "createFindPredicateFunction" | "findAncestor" | "findAncestorByType" | "findChild" | "findChildByType" | "findChildren" | "findChildrenByType" | "findItem" | "findItemIndex" | "fire" | "focus" | "getInsertBefore" | "getState" | "hasOwnProperty" | "hasState" | "hide" | "initClassName" | "initItems" | "internalRemove" | "internalRender" | "internalSetHidden" | "isFocusable" | "mask" | "nextSibling" | "on" | "onFirstListenerAdded" | "once" | "previousSibling" | "print" | "propertyIsEnumerable" | "relayEvent" | "remove" | "render" | "renderItem" | "renderItems" | "restoreState" | "saveState" | "show" | "toLocaleString" | "toString" | "un" | "unmask" | "valueOf" | "items" | "parent" | "width" | "minWidth" | "height" | "minHeight";
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
export type Config<Cmp extends Observable, Required extends keyof Cmp = never> = WritablePartial<Omit<Cmp, CompFuncs>> & Writeable<Pick<Cmp, Required>> & {
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
    listeners?: ListenersConfig<Cmp, InferComponentEventMap<Cmp>>;
    /**
     * The tagname of the HTMLElement created by the component
     */
    tagName?: keyof HTMLElementTagNameMap;
    /**
     * Set the width in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     */
    width?: Length;
    /**
     * Set the minimum width in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     */
    minWidth?: Length;
    /**
     * Set the height in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     */
    height?: Length;
    /**
     * Set the minimum height in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     */
    minHeight?: Length;
};
export {};
