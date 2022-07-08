import {TextField} from "./TextField.js";
import {CheckboxField} from "./CheckboxField.js";
import {Config} from "../Component.js";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends TextField {

	protected createControl(): undefined | HTMLElement {

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

		this.input = document.createElement("textarea");
		if (this.autocomplete) {
			this.input.autocomplete = this.autocomplete;
		}

		if (this.placeholder) {
			this.input.placeholder = this.placeholder;
		}

		this.input.required = this.required;
		this.input.name = this.name;

		if (v) {
			this.input.value = v;
		}

		this.input.addEventListener("change", () => {
			this.fire("change", this);
		});

		return this.input;
	}
}

/**
 * Shorthand function to create {@see TextAreaField}
 *
 * @param config
 */
export const textarea = (config?: Config<TextAreaField>) => Object.assign(new TextAreaField(), config);