/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {TextField} from "./TextField.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldConfig, FieldEventMap} from "./Field";
import {InputField} from "./InputField";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends InputField {

	protected baseCls = 'goui-form-field textarea'
	public _autoHeight: boolean = false;

	protected createInput() {
		return document.createElement("textarea");
	}

	set autoHeight(v: boolean) {
		if(this._autoHeight)
			return
		this._autoHeight = true;
		const input = this._input as HTMLTextAreaElement;
		input.rows = 1;
		input.style.overflowY = 'hidden';
		input.on('input',(ev) => {
			this.resize(input);
		});
		this.on('setvalue', ()=>{this.resize(input);});
	}

	get autoHeight() {
		return this._autoHeight;
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
export const textarea = (config?: FieldConfig<TextAreaField, FieldEventMap<TextAreaField>>) => createComponent(new TextAreaField(), config);