import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {ContainerField, ContainerFieldConfig} from "./ContainerField.js";
import {Collection} from "../../util/Collection.js";
import {Component} from "../Component.js";


/**
 * @inheritDoc
 */
export interface ArrayFieldEventMap<T extends Observable> extends FieldEventMap<T> {

}

/**
 * @inheritDoc
 */
interface ArrayFieldConfig<T extends Observable> extends FieldConfig<T> {
	/**
	 * Function that returns a new form field for an array item
	 */
	itemComponent: ItemComponent
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ArrayFieldEventMap<T>>
}

type ItemComponent = (value?:Record<string, any>) => Field;
type ArrayFieldValue = Record<string, any>[];

export interface ArrayField {
	getItems(): Collection<Field>;
	on<K extends keyof ArrayFieldEventMap<ArrayField>>(eventName: K, listener: ArrayFieldEventMap<ArrayField>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof ArrayFieldEventMap<ArrayField>>(eventName: K, ...args: Parameters<NonNullable<ArrayFieldEventMap<ArrayField>[K]>>): boolean
}

/**
 * Field to return an array with objects
 *
 * @see Form
 */
export class ArrayField extends ContainerField {

	protected tagName = "div" as keyof HTMLElementTagNameMap

	protected itemComponent!: ItemComponent;

	protected value = []

	setValue(v: ArrayFieldValue, useForReset = true) {
		super.setValue(v, useForReset);

		this.getItems().clear();

		v.forEach((item) => {
			const field = this.itemComponent(item);
			field.setValue(item);
			this.getItems().add(field);
		});
	}

	getValue(): ArrayFieldValue {

		const v:ArrayFieldValue = [];

		this.getItems().forEach((item) => {
			v.push(item.getValue());
		});

		return v;
	}


}


/**
 * Shorthand function to create {@see ArrayField}
 *
 * @param config
 * @param items
 */
export const arrayfield = (config?:ArrayFieldConfig<ArrayField>, ...items:Component[]) => ArrayField.create(config, items);
