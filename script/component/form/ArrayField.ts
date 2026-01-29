/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Field, FieldConfig, FieldValue} from "./Field.js";
import {createComponent} from "../Component.js";


/**
 * @inheritDoc
 */
type ArrayFieldConfig<Type extends FieldValue = Record<string, any>> = FieldConfig<ArrayField<Type>, "buildField">

type FieldBuilder<Type extends FieldValue = Record<string, any>> = (value: Type) => Field;

export interface ArrayField<Type extends FieldValue = Record<string, any>> extends Field {

	get value() : Type[]
	set value(value: Type[])
}

/**
 * An ArrayField can be used to represent an array of objects like contact e-mail addresses for example
 *
 * @see Form
 * @link https://goui.io/#form/ArrayField Examples
 *
 */
export class ArrayField<Type extends FieldValue = Record<string, any>> extends Field {

	protected baseCls = 'goui-form-field';

	private itemsContainer!: HTMLDivElement;
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

	/**
	 * CSS class to apply to the item container
	 * @default goui vbox gap
	 */
	public itemContainerCls = "goui vbox gap";


	protected renderControl() {
		// empty
		const hint = this.createHint();
		if (hint) {
			this.el.appendChild(hint);
		}
	}

	protected get itemContainerEl(): HTMLElement {
		if(!this.itemsContainer) {
			this.itemsContainer = document.createElement("div");
			this.itemsContainer.className = this.itemContainerCls;
			this.el.appendChild(this.itemsContainer);
		}

		return this.itemsContainer;
	}

	protected validate() {
		super.validate();
		let invalid;
		this.findChildrenByType(Field).forEach((i) => {
			if (!i.disabled && !i.isValid()) {
				invalid = i;
			}
		})
		if (invalid) {
			this.setInvalid("There's an invalid field");
		}
	}

	public clearInvalid() {

		super.clearInvalid();
		const items = this.findChildrenByType(Field);

		items.forEach((field) => {
			field.clearInvalid();
		});
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
 * Shorthand function to create {@link ArrayField}
 *
 * @see https://github.com/Intermesh/goui-docs/blob/main/script/form/ArrayFieldPage.ts
 *
 * @param config
 * @param items
 */
export const arrayfield = <Type extends FieldValue = Record<string,any>>(config: ArrayFieldConfig<Type>, ...items: Field[]) => createComponent(new ArrayField<Type>(config.buildField, config.tagName ?? 'div'), config, items);
