import {Field, FieldEventMap} from "./Field.js";
import {Config, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Component} from "../Component.js";


export type FieldComponentValue = Record<string, any>;


export interface ContainerField extends Field {
	on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<ContainerField>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<ContainerField>[K]>): boolean

	set listeners(listeners: ObservableListener<FieldEventMap<this>>)
}

/**
 * Field that contains fields.
 *
 * The value that it returns is an object with the field names as keys.
 */
export class ContainerField extends Field {

	get tagName() {
		return "div" as keyof HTMLElementTagNameMap;
	}

	protected baseCls = "";

	public hideLabel = true;


	public findFields() {
		const fields: Field[] = [];

		const fn = (item: any) => {

			if (item == this) {
				return true;
			}

			if (item.isFormField) {
				fields.push(item);
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
	public findField(nameOrItemId: string): Field | undefined {

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


	set value(v: FieldComponentValue) {
		for (let name in v) {
			let field = <Field>this.findField(name);
			if (field) {
				field.value = v[name];
			}
		}

		super.value = v;
	}

	public get value(): FieldComponentValue {
		const formProps: FieldComponentValue = super.value || {};

		this.findFields().forEach((field) => {
			if (field.name) {
				formProps[field.name] = field.value;
			}
		});

		return formProps;
	}

	protected validate() {

		super.validate();

		const items = this.findFields();

		let invalid = false;
		items.forEach((field) => {
			if (!field.isValid()) {
				invalid = true;
			}
		});

		if (invalid) {
			this.setInvalid("There's an invalid field");
		}
	}

	clearInvalid() {

		super.clearInvalid();
		const items = this.findFields();

		items.forEach((field) => {
			field.clearInvalid();
		});
	}

	protected validateOnBlur() {
		//not needed on container field
	}

	protected applyInvalidMsg() {
		if (this.invalidMsg) {
			this.el.classList.add("invalid");
		} else {
			this.el.classList.remove("invalid");
		}
	}
}

/**
 * Shorthand function to create {@see ContainerField}
 *
 * @param config
 * @param items
 */
export const containerfield = (config?: Config<ContainerField>, ...items: Component[]) => {
	const c = new ContainerField();
	if(config) {
		Object.assign(c, config);
	}
	if(items.length) {
		c.items.add(...items);
	}
	return c;
}
