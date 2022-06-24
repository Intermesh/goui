import {TextField} from "./TextField.js";
import {Config} from "../Observable.js";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends TextField {

	protected createControl(): undefined | HTMLElement {
		this.input = document.createElement("textarea");
		if (this.autocomplete) {
			this.input.autocomplete = this.autocomplete;
		}

		if (this.placeholder) {
			this.input.placeholder = this.placeholder;
		}

		this.input.required = this.required;
		this.input.name = this.name;

		if (this.value) {
			this.input.value = this.value;
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
export const textarea = (config?: Config<TextAreaField>) => TextAreaField.create(config);