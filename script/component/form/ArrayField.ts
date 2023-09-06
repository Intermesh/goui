/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Field, FieldEventMap} from "./Field.js";
import {ContainerField} from "./ContainerField.js";
import {createComponent} from "../Component.js";
import {btn} from "../Button";
import {Config} from "../Observable";


/**
 * @inheritDoc
 */
type ArrayFieldConfig = Config<ArrayField, FieldEventMap<ArrayField>, "buildField">

type FieldBuilder = (value?: Record<string, any>) => Field;
type ArrayFieldValue = Record<string, any>[];

export interface ArrayField {

	// on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void
	//
	// fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<Component>[K]>): boolean
}

/**
 * Field to return an array with objects
 *
 * @see Form
 */
export class ArrayField extends ContainerField {

	/**
	 *
	 * @param buildField Function that returns a new form field for an array item
	 */
	constructor(public buildField: FieldBuilder) {
		super("div");
	}

	set value(v: ArrayFieldValue) {
		super.value = v;

		this.items.clear();

		if (v) {
			v.forEach((item) => {
				this.addValue(item);
			});
		}
	}

	get value(): ArrayFieldValue {

		const v: ArrayFieldValue = [];

		this.items.forEach((item) => {
			if (item instanceof Field) {
				v.push(item.value);
			}
		});

		return v;
	}

	/**
	 * Add value to the values array
	 *
	 * @param value
	 */
	public addValue(value:Record<string,any> = {}) {
		const field = this.buildField(value);
		field.value = value;
		field.items.add(btn({
				// style: {
				// 	alignSelf: "center"
				// },
				icon: "delete",
				title: "Delete",
				handler: (btn) => {
					btn.parent!.remove();
				}
			})
		);
		this.items.add(field);

		return this;
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
export const arrayfield = (config: ArrayFieldConfig, ...items: Field[]) => createComponent(new ArrayField(config.buildField), config, items);
