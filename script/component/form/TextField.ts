import {Field, FieldConfig} from "./Field.js";
import {Observable} from "../Observable.js";
import {Component} from "../Component.js";
import {Fieldset, FieldsetConfig} from "./Fieldset.js";

export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search");

export interface TextFieldConfig<T extends Observable> extends FieldConfig<T> {
	/**
	 * input type. text, password, email etc.
	 */
	type?: TextFieldType

	/**
	 * Autocomplete value
	 */
	autocomplete?: string

	/**
	 * When the field is empty this will be dispklayed inside the field
	 */
	placeholder?: string

	/**
	 * Pattern regex for validation
	 */
	pattern?: HTMLInputElement["pattern"]
}

/**
 * TextField component
 *
 * @see Form
 */
export class TextField extends Field {

	protected input: HTMLInputElement | HTMLTextAreaElement | undefined;

	protected type: TextFieldType = "text";
	protected placeholder:string = " ";
	protected autocomplete:string | undefined;
	protected pattern:HTMLInputElement["pattern"] | undefined;

	protected applyTitle() {
		if(this.title && this.input) {
			this.input.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if(!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	// protected internalRender() {
	// 	this.createControl();
	//
	// 	const el = super.internalRender();
	//
	// 	el.appendChild(this.input!);
	// 	return el;
	// }

	protected createControl() : undefined | HTMLElement{
		this.input = document.createElement("input");
		this.input.classList.add("text");
		this.input.type = this.type;

		if(this.pattern) {
			this.input.pattern = this.pattern;
		}

		if(this.autocomplete) {
			this.input.autocomplete = this.autocomplete;
		}

		if(this.placeholder) {
			this.input.placeholder = this.placeholder;
		}
		this.input.required = this.required;
		this.input.name = this.name;
		this.input.readOnly = this.readOnly;

		if (this.value) {
			this.input.value = this.value;
		}

		if(this.title) {
			this.input.title = this.title;
		}

		this.input.addEventListener("change", () => {
			//used set timeout so focusout event happens first and field validates before change event
			setTimeout(() => {
				this.fire("change", this);
			})
		});

		if(this.invalidMsg) {
			this.applyInvalidMsg();
		}

		return this.input;


	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if(this.isRendered()) {
			this.applyInvalidMsg();
		}
	}

	// protected applyInvalidMsg() {
	// 	super.applyInvalidMsg();
	//
	// 	this.input!.setCustomValidity(this.invalidMsg);
	//
	// 	//check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
	// 	if(this.input!.offsetParent) {
	// 		this.input!.reportValidity();
	// 	}
	//
	//
	// 	if(this.invalidMsg != "") {
	// 		//clear the field on change
	// 		this.input!.addEventListener('input', () => {
	// 			this.clearInvalid();
	// 		}, {once: true});
	// 	}
	// }

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	getInput() {
		return this.input;
	}

	setValue(v: string, useForReset = true) {

		if (this.input) {
			this.input!.value = v;
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
			this.input!.name = this.name;
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
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const textfield = (config?:TextFieldConfig<TextField>) => TextField.create(config);