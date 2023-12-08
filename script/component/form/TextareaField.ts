/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {TextField} from "./TextField.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends TextField {

	protected baseCls = 'goui-form-field textarea'
	public autoHeight?: boolean

	protected createControl(): undefined | HTMLElement {

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value,
			input = document.createElement("textarea");


		if (this.autocomplete) {
			input.autocomplete = this.autocomplete;
		}

		if (this.placeholder) {
			input.placeholder = this.placeholder;
		}

		input.required = this.required;
		input.name = this.name;

		if (v) {
			input.value = v;
		}

		if(this.autoHeight) {
			input.rows = 1;
			input.style.overflowY = 'hidden';
			input.on('input',(ev) => {
				this.resize(input);
			});
			this.on('setvalue', ()=>{this.resize(input);});
		}

		this._input = input;
		return input;
	}

	private resize(input: HTMLTextAreaElement) {
		input.style.height = "0";
		input.style.height = (input.scrollHeight) + "px";
	}
}

/**
 * Shorthand function to create {@see TextAreaField}
 *
 * @param config
 */
export const textarea = (config?: Config<TextAreaField, FieldEventMap<TextAreaField>>) => createComponent(new TextAreaField(), config);