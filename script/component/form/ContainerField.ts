/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {Listener, ObservableListenerOpts} from "../Observable.js";
import {Component, createComponent} from "../Component.js";


export type ContainerFieldValue = Record<string, any>;


export interface ContainerField<EventMap extends FieldEventMap = FieldEventMap, ValueType extends ContainerFieldValue = ContainerFieldValue> extends Field<EventMap> {
	set value(v: Partial<ValueType>)
	get value(): ValueType
}

/**
 * Field that contains fields.
 *
 * The value that it returns is an object with the field names as keys.
 */
export class ContainerField<EventMap extends FieldEventMap = FieldEventMap, ValueType extends ContainerFieldValue = ContainerFieldValue> extends Field<EventMap> {

	constructor(tagName: keyof HTMLElementTagNameMap = "div") {
		super(tagName);

		this.cls = "flow";
	}

	protected baseCls = "";

	public hideLabel = true;

	protected fireChangeOnBlur = false;


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
	 * @inheritDoc
	 */
	public reset() {
		this.findFields().forEach((field) => {
			field.reset();
		})
	}

	/**
	 * @inheritDoc
	 */
	public clear(setValue:boolean = true) {
		this.findFields().forEach((field) => {
			if(field.clear) {
				field.clear(setValue);
			} else {
				field.reset(); // for Ext
			}
		})
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


	/**
	 * Add some additional values to the form.
	 * setting the value will reset the entire form or container. Patching will leave the other values alone.
	 * @param v
	 */
	public patch(v: Partial<ValueType>) {
		for(const name in v) {
			const field = this.findField(name);
			if(!field) {
				throw "Field " + name + " not found";
			}

			field.value = v[name];
		}
		return this;
	}

	protected internalSetValue(v: Partial<ValueType>) {

		this.findFields().forEach((field:any) => {
			const name = field.getName ? field.getName() : field.name;
			// We cast to any[] for Ext compatibility. We try setValue() for Ext if it exists
			if(name in v) {
				if(field.setValue) {
					field.setValue(v[name]);
				} else {
					field.value = v[name]
				}
			} else if(field.clear) {
				field.clear();
			} else {
				// for Ext
				field.reset();
			}
		})
	}

	protected internalGetValue()  {

		// we have to clone the value to avoid side effects when the value is modified outside the form's
		// scope. We don't want any external modifications to leak in here because reference is a value.
		const formProps: ValueType = structuredClone(this._value) as ValueType || {};

		this.findFields().forEach((field: any) => {
			//for Extjs compat try .getName() and .getValue()
			const fieldName = (field.getName ? field.getName() : field.name) as keyof ValueType
			let fieldVal;
			if( field.getValue ) {
				fieldVal = field.getValue();
				// @ts-ignore
				if(Ext.isDate(fieldVal)) {
					fieldVal = fieldVal.serialize();
				}
			} else {
				fieldVal = field.value
			}

			if (fieldName) {
				if(field.disabled) {
					delete formProps[fieldName];
				} else {
					formProps[fieldName] = fieldVal;
				}
			}
		});

		return formProps;
	}

	public getOldValue(): any {
		const old:any = {};
		this.findFields().forEach((field: any) => {
			//for Extjs compat try .getName() and .getValue()
			const fieldName = (field.getName ? field.getName() : field.name) as keyof ValueType

			if (fieldName) {
				if(!field.disabled) {
					old[fieldName] = field.resetValue;
				}
			}
		});

		return old;
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
			this.fire("focus", {options:o});
		} else {
			super.focus(o);
		}
	}
}

/**
 * Shorthand function to create {@link ContainerField}
 *
 * @param config
 * @param items
 */
export const containerfield = (config?: FieldConfig<ContainerField>, ...items: Component[]) => createComponent(new ContainerField(config?.tagName ?? 'div'), config, items);