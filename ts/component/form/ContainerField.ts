import {Container, ContainerConfig, ContainerEventMap} from "../Container.js";
import {Fieldify, FieldifyConfig, FieldifyEventMap} from "./Fieldify.js";
import {Field, FieldInterface} from "./Field.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";


/**
 * @inheritDoc
 */
export interface ContainerFieldConfig<T extends Observable> extends ContainerConfig<T>, FieldifyConfig<T> {
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ContainerFieldEventMap<T>>
}

export type FieldContainerValue = Record<string, any>;

/**
 * @inheritDoc
 */
export interface ContainerFieldEventMap<T extends Observable> extends ContainerEventMap<T>, FieldifyEventMap<T> {
}

export interface ContainerField {
	on<K extends keyof ContainerFieldEventMap<ContainerField>>(eventName: K, listener: ContainerFieldEventMap<ContainerField>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof ContainerFieldEventMap<ContainerField>>(eventName: K, ...args: Parameters<NonNullable<ContainerFieldEventMap<ContainerField>[K]>>): boolean
}

/**
 * Field that contains fields.
 *
 * The value that it returns is an object with the field names as keys.
 */
export class ContainerField extends Fieldify(Container) {

	protected tagName = "div" as keyof HTMLElementTagNameMap;

	protected baseCls = "";

	protected hideLabel = true;

	public static create<T extends typeof Observable>(this: T, config?: ContainerFieldConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	findFields() {
		const fields: FieldInterface[] = [];

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
	findField(nameOrItemId: string): FieldInterface | undefined {

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


	setValue(v: FieldContainerValue, useForReset = true) {
		const form = <HTMLFormElement>this.el;

		for (let name in v) {
			let field = <Field>this.findField(name);
			if (field) {
				field.setValue(v[name], useForReset);
			}
		}

		return super.setValue(v, useForReset);
	}

	getValue(): FieldContainerValue {
		const formProps: FieldContainerValue = super.getValue() || {};

		this.findFields().forEach((field) => {
			if(field.getName()) {
				formProps[field.getName()] = field.getValue();
			}
		});

		return formProps;
	}

	protected validate() {

		super.validate();

		const items = this.findFields();

		let invalid = false;
		items.forEach((field) => {
			if(!field.isValid()) {
				invalid = true;
			}
		});

		if(invalid) {
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
		if(this.invalidMsg) {
			this.getEl().classList.add("invalid");
		}else
		{
			this.getEl().classList.remove("invalid");
		}
	}
}