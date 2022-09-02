import {Field} from "./Field.js";
import {CheckboxField} from "./CheckboxField.js";
import {Config, createComponent} from "../Component.js";


export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search");

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
	 * When the field is empty this will be dispklayed inside the field
	 */
	public placeholder:string = " ";

	/**
	 * Autocomplete value
	 */
	public autocomplete:string | undefined;

	/**
	 * Pattern regex for validation
	 */
	public pattern:HTMLInputElement["pattern"] | undefined;


	get input() {
		return this._input;
	}

	set title(title: string) {
		super.title = title;

		if(this._input) {
			this._input.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if(!this._input) {
			super.focus(o);
		}
		this._input?.focus(o);
	}

	protected createControl() : undefined | HTMLElement{

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value, name = this.name;

		this._input = document.createElement("input");
		this._input.classList.add("text");
		this._input.type = this.type;

		if(this.pattern) {
			this._input.pattern = this.pattern;
		}

		if(this.autocomplete) {
			this._input.autocomplete = this.autocomplete;
		}

		if(this.placeholder) {
			this._input.placeholder = this.placeholder;
		}
		this._input.required = this.required;
		if(name) {
			this._input.name = name;
		}
		this._input.readOnly = this.readOnly;

		if (v) {
			this._input.value = v;
		}

		if(this.title) {
			this._input.title = this.title;
		}

		this._input.addEventListener("change", () => {
			this.fireChange();
		});

		if(this.invalidMsg) {
			this.applyInvalidMsg();
		}

		return this._input;


	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if(this.rendered) {
			this.applyInvalidMsg();
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	protected setInputValue(v: string) {
		if (this._input) {
			this._input.value = v + "";
		}
	}

	set value(v: any) {

		this.setInputValue(v || "");

		super.value = v;
	}

	get value() {
		if (!this._input) {
			return super.value;
		} else {
			return this._input.value;
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

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if(!this._input!.validity.valid) {
			this.setInvalid(this._input!.validationMessage);
		}
	}

}

/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const textfield = (config?:Config<TextField>) => createComponent(new TextField(), config);