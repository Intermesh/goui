import {Field} from "./Field.js";
import {CheckboxField} from "./CheckboxField.js";
import {Config} from "../Component.js";

interface SelectFieldOption {
	value?: string
	name: string
}


/**
 * Select field
 *
 * @see Form
 */
export class SelectField extends Field {

	baseCls = "form-field select"

	protected input: HTMLSelectElement | undefined;

	public options: SelectFieldOption[] = [];

	protected createControl(): undefined | HTMLElement {
		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

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

		if (v) {
			// for updating this.input.selectIndex
			this.value = v;
		}

		this.input.addEventListener("change", () => {
			this.fireChange();
		});

		this.el.appendChild(this.input);

		return this.input;
	}

	getInput() {
		return this.input;
	}

	set value(v: string) {

		if (this.input) {
			this.input.selectedIndex = this.options.findIndex((o) => {
				return o.value == v;
			});
		}

		super.value = v;
	}


	get value() {
		if (!this.input) {
			return super.value;
		} else {
			return this.input.value;
		}
	}


	set name(name: string) {
		super.name = (name);

		if (this.input) {
			this.input.name = this.name
		}
	}

	get name() {
		return super.name;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (!this.input!.validity.valid) {
			this.setInvalid(this.input!.validationMessage);
		}
	}


}

/**
 * Shorthand function to create {@see SelectField}
 *
 * @param config
 */
export const select = (config?: Config<SelectField>) => Object.assign(new SelectField(), config);