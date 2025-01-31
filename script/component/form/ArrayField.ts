/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Field, FieldConfig, FieldEventMap, FieldValue} from "./Field.js";
import {ContainerField} from "./ContainerField.js";
import {createComponent} from "../Component.js";
import {btn} from "../Button.js";
import {Config} from "../Observable.js";


/**
 * @inheritDoc
 */
type ArrayFieldConfig<Type extends FieldValue = Record<string, any>> = FieldConfig<ArrayField<Type>, FieldEventMap<ArrayField<Type>>, "buildField">

type FieldBuilder<Type extends FieldValue = Record<string, any>> = (value?: Type) => Field;

export interface ArrayField<Type extends FieldValue = Record<string, any>> extends Field {

	get value() : Type[]
	set value(value: Type[])

	// on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void
	//
	// fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<Component>[K]>): boolean
}

/**
 * Field to return an array with objects
 *
 * @see Form
 */
export class ArrayField<Type extends FieldValue = Record<string, any>> extends Field {

	protected baseCls = '';
	/**
	 *
	 * @param buildField Function that returns a new form field for an array item
	 */
	constructor(public buildField: FieldBuilder<Type>, tagName: keyof HTMLElementTagNameMap = "div") {
		super(tagName);

		this.cls = "flow";

		this.items.on("datachanged", () => {
			if(this.enableChangeEvent) {
				this.fireChange();
			}
		});
	}

	protected renderControl() {
		// empty
	}

	private enableChangeEvent = true;

	protected internalSetValue(v?: any) {
		this.enableChangeEvent = false;

		this.items.clear();

		if (v) {
			v.forEach((item:any) => {
				this.internalAddValue(item);
			});
		}

		this.enableChangeEvent = true;
	}

	protected internalGetValue(): Type[] {

		const v: Type[] = [];

		this.items.forEach((item) => {
			if (item instanceof Field) {
				v.push(item.value as Type);
			}
		});

		return v;
	}

	/**
	 * Add value to the values array. Also fires change event
	 *
	 * @param value
	 */
	public addValue(value:Type) {

		if(!this.valueOnFocus) {
			this.captureValueForChange();
		}

		return this.internalAddValue(value);
	}

	private internalAddValue(value:Type) {
		const field = this.buildField(value);
		field.value = value;

		this.items.add(field);

		field.focus();

		return field;
	}

	// reset() {
	// 	super.reset();
	//
	// 	if(this.items.count()) {
	// 		this.enableChangeEvent = false;
	// 		this.items.clear();
	// 		this.enableChangeEvent = true;
	// 		this.fireChange();
	// 	}
	// }

	isEmpty(): boolean {
		return this.items.count() === 0;
	}


}


/**
 * Shorthand function to create {@see ArrayField}
 *
 * @see https://github.com/Intermesh/goui-docs/blob/main/script/form/ArrayFieldPage.ts
 *
 * @param config
 * @param items
 */
export const arrayfield = <Type extends FieldValue = Record<string,any>>(config: ArrayFieldConfig<Type>, ...items: Field[]) => createComponent(new ArrayField<Type>(config.buildField, config.tagName ?? 'div'), config, items);
