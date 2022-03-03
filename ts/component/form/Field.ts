import {Component, ComponentConfig, ComponentEventMap} from "../Component.js";
import {Fieldify, FieldifyConfig, FieldifyEventMap} from "./Fieldify.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";

/**
 * @inheritDoc
 */
export interface FieldConfig<T extends Observable> extends ComponentConfig<T>, FieldifyConfig<T> {
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<FieldEventMap<T>>
}

/**
 * @inheritDoc
 */
export interface FieldEventMap<T extends Observable> extends ComponentEventMap<T>, FieldifyEventMap<T> {
}

export interface Field {
	on<K extends keyof FieldEventMap<Field>>(eventName: K, listener: FieldEventMap<Field>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof FieldEventMap<Field>>(eventName: K, ...args: Parameters<NonNullable<FieldEventMap<Field>[K]>>): boolean
}

/**
 * @inheritDoc
 */
export interface FieldInterface extends Component {
	readonly isFormField: true
	getName():string
	setName(name:string):void
	getValue():any
	setValue(value:any, useForReset?:boolean):any
	reset():void
	setInvalid(msg: string):void
	clearInvalid():void
	isValid():boolean,
	isEmpty():boolean
	on<K extends keyof FieldEventMap<FieldInterface>>(eventName: K, listener: FieldEventMap<FieldInterface>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof FieldEventMap<FieldInterface>>(eventName: K, ...args: Parameters<NonNullable<FieldEventMap<FieldInterface>[K]>>): boolean
}

export class Field extends Fieldify(Component) {
};