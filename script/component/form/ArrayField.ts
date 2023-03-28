/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Field} from "./Field.js";
import {ContainerField} from "./ContainerField.js";
import {Config, createComponent} from "../Component.js";


/**
 * @inheritDoc
 */
type ArrayFieldConfig = {
	/**
	 * Function that returns a new form field for an array item
	 */
	itemComponent: ItemComponent

} & Config<ArrayField>

type ItemComponent = (value?: Record<string, any>) => Field;
type ArrayFieldValue = Record<string, any>[];

export interface ArrayField {

	// on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void
	//
	// fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<this>[K]>): boolean
}

/**
 * Field to return an array with objects
 *
 * @see Form
 */
export class ArrayField extends ContainerField {



	/**
	 *
	 * @param itemComponent Function that returns a new form field for an array item
	 */
	constructor(public itemComponent: ItemComponent) {
		super("div");
	}

	set value(v: ArrayFieldValue) {
		super.value = v;

		this.items.clear();

		if(v) {
			v.forEach((item) => {
				const field = this.itemComponent(item);
				field.value = item;
				this.items.add(field);
			});
		}
	}

	get value(): ArrayFieldValue {

		const v: ArrayFieldValue = [];

		this.items.forEach((item) => {
			if(item instanceof Field) {
				v.push(item.value);
			}
		});

		return v;
	}

	reset() {
		super.reset();
		this.items.clear();
	}


}


/**
 * Shorthand function to create {@see ArrayField}
 *
 * @param config
 * @param items
 */
export const arrayfield = (config: ArrayFieldConfig, ...items: Field[]) => createComponent(new ArrayField(config.itemComponent), config, items);
