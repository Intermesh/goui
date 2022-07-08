import {Field} from "./Field.js";
import {Config} from "../Component.js";

/**
 * Checkbox field
 *
 * @see Form
 */
export class CheckboxField extends Field {

	protected input: HTMLInputElement | undefined;

	protected baseCls = 'form-field checkbox';

	protected applyTitle() {
		if (this.title) {
			this.input!.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if (!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	protected createLabel() {
		const old = this.label;
		this.label = "";
		const span = super.createLabel();
		this.label = old;
		return span;
	}

	protected createControl(): undefined | HTMLElement {

		const control = document.createElement("div");

		//grab value before creating this.input otherwise it will return the input value
		const v = this.value;

		this.input = document.createElement("input");
		this.input.type = "checkbox";

		this.input.required = this.required;
		this.input.name = this.name;
		this.input.readOnly = this.readOnly;
		// this.input.hidden = true;

		if (v) {
			this.input.checked = v;
		}

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}

		this.input.addEventListener("change", () => {
			this.fire("change", this);
		});

		control.appendChild(this.input);

		const boxLabel = document.createElement("span");
		boxLabel.classList.add('box-label');
		boxLabel.innerHTML = this.label;
		control.appendChild(boxLabel);


		return control;

	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if (this.rendered) {
			this.applyInvalidMsg();
		}
	}

	protected applyInvalidMsg() {
		super.applyInvalidMsg();

		this.input!.setCustomValidity(this.invalidMsg);

		//check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
		if (this.input!.offsetParent) {
			this.input!.reportValidity();
		}


		if (this.invalidMsg != "") {
			//clear the field on change
			this.input!.addEventListener('input', () => {
				this.clearInvalid();
			}, {once: true});
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	getInput() {
		return this.input;
	}

	set value(v: boolean) {

		if (this.input) {
			this.input.checked = v;
		}

		super.value = v;
	}

	get value() {
		if (!this.input) {
			return super.value;
		} else {
			return this.input.checked;
		}
	}


	set name(name: string) {
		super.name = name;

		if (this.input) {
			this.input.name = this.name;
		}
	}

	get name() {
		return super.name;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (!this.input!.validity.valid) {
			this.setInvalid(this.input!.validationMessage);
		}
	}


}


/**
 * Shorthand function to create {@see CheckboxField}
 *
 * @param config
 */
export const checkbox = (config?: Config<CheckboxField>) => Object.assign(new CheckboxField(), config);