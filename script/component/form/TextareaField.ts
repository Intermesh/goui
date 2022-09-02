import {TextField} from "./TextField.js";
import {CheckboxField} from "./CheckboxField.js";
import {Config, createComponent} from "../Component.js";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends TextField {

	protected createControl(): undefined | HTMLElement {

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

		this._input = document.createElement("textarea");
		if (this.autocomplete) {
			this._input.autocomplete = this.autocomplete;
		}

		if (this.placeholder) {
			this._input.placeholder = this.placeholder;
		}

		this._input.required = this.required;
		this._input.name = this.name;

		if (v) {
			this._input.value = v;
		}

		this._input.addEventListener("change", () => {
			this.fireChange();
		});

		return this._input;
	}
}

/**
 * Shorthand function to create {@see TextAreaField}
 *
 * @param config
 */
export const textarea = (config?: Config<TextAreaField>) => createComponent(new TextAreaField(), config);