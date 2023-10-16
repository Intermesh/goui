/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";


export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search" | "time" | "date" | "datetime-local");

/**
 * TextField component
 *
 * @see Form
 */
export class TextField extends Field {

	protected _input: HTMLInputElement | HTMLTextAreaElement | undefined;

	/**
	 * input type. text, password, email etc.
	 */
	public type: TextFieldType = "text";
	/**
	 * When the field is empty this will be displayed inside the field
	 */
	public placeholder: string = " ";

	/**
	 * Autocomplete value
	 */
	public autocomplete: AutoFill | undefined;

	/**
	 * Pattern regex for validation
	 */
	public pattern: HTMLInputElement["pattern"] | undefined;


	get input() {
		return this._input;
	}

	set title(title: string) {
		super.title = title;

		if (this._input) {
			this._input.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if (!this._input) {
			super.focus(o);
		}
		this._input?.focus(o);
	}

	protected createControl(): undefined | HTMLElement {

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value,
			name = this.name;

		this._input = document.createElement("input");
		this._input.classList.add("text");
		this._input.type = this.type;

		if (this.pattern) {
			this._input.pattern = this.pattern;
		}

		if (this.autocomplete) {
			this._input.autocomplete = this.autocomplete;
		}

		if (this.placeholder) {
			this._input.placeholder = this.placeholder;
		}
		this._input.required = this.required;
		if (name) {
			this._input.name = name;
		}
		this._input.readOnly = this.readOnly;



		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}

		return this._input;
	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if (this.rendered) {
			this.applyInvalidMsg();
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	protected internalSetValue(v?: string) {
		if (this._input) {
			this._input.value = v ?? "";
		}
	}

	set value(v: any) {
		super.value = v;
	}

	get value() {
		if (!this.rendered) {
			return super.value;
		} else {
			return this._input!.value;
		}
	}

	set name(name: string) {
		super.name = name;

		if (this._input) {
			this._input.name = this.name;
		}
	}

	get name() {
		return super.name;
	}

	set readOnly(readOnly: boolean) {
		super.readOnly = readOnly;
		if(this._input) {
			this._input.readOnly = this.readOnly;
		}
	}

	get readOnly() {
		return super.readOnly;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (this._input) {

			this.setValidityState(this._input);
		}
	}

}

/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const textfield = (config?: Config<TextField, FieldEventMap<TextField>>) => createComponent(new TextField(), config);