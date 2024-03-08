/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {Component, createComponent} from "../Component.js";


export type ContainerFieldValue = Record<string, any>;


export interface ContainerField extends Field {
	on<K extends keyof FieldEventMap<this>, L extends Listener>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K]): boolean
	fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<Component>[K]>): boolean
}

/**
 * Field that contains fields.
 *
 * The value that it returns is an object with the field names as keys.
 */
export class ContainerField<ValueType extends ContainerFieldValue = ContainerFieldValue> extends Field {

	constructor(tagName: keyof HTMLElementTagNameMap = "div") {
		super(tagName);

		this.cls = "flow";
	}

	protected baseCls = "";

	public hideLabel = true;

	protected fireChangeOnBlur = false;

	protected get itemContainerEl() :HTMLElement{
		return this.el;
	}

	/**
	 * Find all form fields
	 *
	 * @param nameOrItemId If given only items with matching name or itemId are returned
	 */
	public findFields(nameOrItemId: string | undefined = undefined) {
		const fields: Field[] = [];

		const fn = (item: any) => {

			if (item == this) {
				return;
			}

			if (item.isFormField) {
				if (!nameOrItemId || (item.name == nameOrItemId || item.itemId == nameOrItemId)) {
					fields.push(item);
				}
				return false;
			}
		};

		this.cascade(fn);

		return fields;
	}

	/**
	 * Find form field by name or item ID
	 *
	 * It cascades down the component hierarchy.
	 *
	 * @param nameOrItemId
	 */
	public findField<FieldType extends Field = Field>(nameOrItemId: string): FieldType | undefined {

		let field;

		const fn = (item: any) => {
			if ((item.isFormField) && item.name == nameOrItemId || item.itemId == nameOrItemId) {
				field = item;

				return false;
			}
		};

		this.cascade(fn);


		return field;
	}

	/**
	 * Copies the current value to the reset value. Typically happens when this component was added to a parent and
	 * when the form it belongs too loads.
	 */
	public trackReset() {
		this.findFields().forEach((field) => {
			field.trackReset();
		})
	}

	public isModified(): boolean {
		const f = this.findFields();

		for(let i =0,l=f.length; i < l; i++) {
			if(f[i].isModified()) {
				return true;
			}
		}
		return false;
	}

	set value(v: Partial<ValueType>) {

		for (let name in v) {
			// We cast to any[] for Ext compatibility. We try setValue() for Ext if it exists
			let fields = this.findFields(name) as any[];
			fields.forEach(field => field.setValue ? field.setValue(v[name]) : field.value = v[name]);
		}

		super.value = v;
	}

	public get value(): ValueType {

		// we have to clone the value to avoid side effects when the value is modified outside the form's
		// scope. We don't want any external modifications to leak in here because reference is a value.
		const formProps: ValueType = structuredClone(super.value) as ValueType || {};

		this.findFields().forEach((field: any) => {
			//for Extjs compat try .getName() and .getValue()
			const fieldName = (field.getName ? field.getName() : field.name) as keyof ValueType
			const fieldVal = field.getValue ? field.getValue() : field.value;

			if (fieldName && !field.disabled) {
				formProps[fieldName] = fieldVal;
			}
		});

		return formProps;
	}

	protected validate() {
		super.validate();
		let invalid;
		this.findFields().forEach((i) => {
			if (!i.disabled && !i.isValid()) {
				invalid = i;
			}
		})
		if (invalid) {
			this.setInvalid("There's an invalid field");
		}
	}

	/**
	 * Find the first invalid field
	 */
	public findFirstInvalid(): Field | undefined {
		const items = this.findFields();

		for(let i = 0, l = items.length; i < l; i++) {
			if (!items[i].disabled && !items[i].isValid()) {
				return items[i];
			}
		}

		return undefined;
	}

	protected renderControl() {

	}

	public clearInvalid() {

		super.clearInvalid();
		const items = this.findFields();

		items.forEach((field) => {
			field.clearInvalid();
		});
	}

	/**
	 * Not needed on container field as the fields within handle this.
	 */
	public validateOnBlur = false;

	protected applyInvalidMsg() {
		if (this.invalidMsg) {
			this.el.classList.add("invalid");
		} else {
			this.el.classList.remove("invalid");
		}
	}

	/**
	 * @inheritDoc
	 */
	public focus(o?: FocusOptions) {
		const fields = this.findFields();
		if (fields.length) {
			fields[0].focus(o);
			this.fire("focus", this, o);
		} else {
			super.focus(o);
		}
	}
}

/**
 * Shorthand function to create {@see ContainerField}
 *
 * @param config
 * @param items
 */
export const containerfield = (config?: FieldConfig<ContainerField, FieldEventMap<ContainerField>>, ...items: Component[]) => createComponent(new ContainerField(), config, items);