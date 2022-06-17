import {Field, FieldConfig} from "./Field.js";
import {Observable} from "../Observable.js";
import {TextFieldConfig} from "./TextField.js";
import {TextAreaField} from "./TextareaField.js";

interface SelectFieldOption {
	value?: string
	name: string
}

/**
 * @inheritDoc
 */
export interface SelectFieldConfig<T extends Observable> extends FieldConfig<T> {
	options?: SelectFieldOption[]
}

/**
 * Select field
 *
 * @see Form
 */
export class SelectField extends Field {

	baseCls = "form-field select"

	protected input: HTMLSelectElement | undefined;

	protected options: SelectFieldOption[] = []

	protected createControl() : undefined | HTMLElement {
		this.input = document.createElement("select");
		this.input.name = this.name;
		if (this.required) {
			this.input.setAttribute("required", "");
		}

		this.options.forEach((o) => {
			const opt = new Option();
			if (o.value) {
				opt.value = o.value;
			}
			opt.innerHTML = o.name;

			this.input?.appendChild(opt);
		});

		if (this.value) {
			// for updating this.input.selectIndex
			this.setValue(this.value, false);
		}

		this.input.addEventListener("change", () => {
			this.fire("change", this);
		});

		this.getEl().appendChild(this.input);

		return this.input;
	}

	getInput() {
		return this.input;
	}

	setValue(v: string, useForReset = true) {

		if (this.input) {
			this.input.selectedIndex = this.options.findIndex((o) => {
				return o.value == v;
			});
		}

		super.setValue(v, useForReset);
	}


	getValue() {
		if (!this.input) {
			return super.getValue();
		} else {
			return this.input.value;
		}
	}

	setName(name: string) {
		super.setName(name);

		if (this.isRendered()) {
			this.input!.name = this.name
		}
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if(!this.input!.validity.valid) {
			this.setInvalid(this.input!.validationMessage);
		}
	}


}

/**
 * Shorthand function to create {@see SelectField}
 *
 * @param config
 */
export const select = (config?:SelectFieldConfig<SelectField>) => SelectField.create(config);