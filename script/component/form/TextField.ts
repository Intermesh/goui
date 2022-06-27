import {Field} from "./Field.js";
import {Config} from "../Observable.js";


export type TextFieldType = ("text" | "password" | "email" | "url" | "tel" | "search");

/**
 * TextField component
 *
 * @see Form
 */
export class TextField extends Field {

	protected input: HTMLInputElement | HTMLTextAreaElement | undefined;

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

	set title(title: string) {
		super.title = title;

		if(this.input) {
			this.input.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if(!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	protected createControl() : undefined | HTMLElement{

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

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

		if (v) {
			this.input.value = v;
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

		if(this.rendered) {
			this.applyInvalidMsg();
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}


	set value(v: string | undefined) {

		if (this.input) {
			this.input.value = v + "";
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
		super.name = name;

		if (this.rendered) {
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
export const textfield = (config?:Config<TextField>) => TextField.create(config);