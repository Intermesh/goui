/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {TextField} from "./TextField.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {InputField} from "./InputField.js";

/**
 * Text Area component
 *
 * @see Form
 */
export class TextAreaField extends InputField {

	protected baseCls = 'goui-form-field textarea';

	private _autoHeight: boolean = false;

	protected createInput() : HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
		const control = document.createElement("textarea");
		control.on("change", ()=> {
			this.fireChange();
		});

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}
		return control;
	}

	/**
	 * Let the textarea grow to it's content
	 *
	 * @param v
	 */
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
		this.on("render", ()=>{this.resize(input);});
		this.on("show", ()=>{this.resize(input);});
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
 * Shorthand function to create {@link TextAreaField}
 *
 * @param config
 */
export const textarea = (config?: FieldConfig<TextAreaField, FieldEventMap<TextAreaField>>) => createComponent(new TextAreaField(), config);