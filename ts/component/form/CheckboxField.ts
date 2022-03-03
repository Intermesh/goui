import {Field, FieldConfig} from "./Field.js";
import {Observable} from "../Observable.js";

/**
 * @inheritDoc
 */
export interface CheckboxFieldConfig<T extends Observable> extends FieldConfig<T> {
}

/**
 * Checkbox field
 *
 * @see Form
 */
export class CheckboxField extends Field {

	protected input: HTMLInputElement | undefined;

	protected baseCls = 'go-form-field checkbox';


	public static create<T extends typeof Observable>(this: T, config?: CheckboxFieldConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected applyTitle() {
		if(this.title) {
			this.input!.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if(!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	protected createLabel() {
		const old = this.label;
		this.label = "";
		const span =  super.createLabel();
		this.label = old;
		return span;
	}

	protected createControl() : undefined | HTMLElement {

		const control = document.createElement("div");

		this.input = document.createElement("input");
		this.input.type = "checkbox";

		this.input.required = this.required;
		this.input.name = this.name;
		this.input.readOnly = this.readOnly;
		// this.input.hidden = true;

		if (this.value) {
			this.input.checked = this.value;
		}

		if(this.invalidMsg) {
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

		if(this.isRendered()) {
			this.applyInvalidMsg();
		}
	}

	protected applyInvalidMsg() {
		super.applyInvalidMsg();

		this.input!.setCustomValidity(this.invalidMsg);

		//check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
		if(this.input!.offsetParent) {
			this.input!.reportValidity();
		}


		if(this.invalidMsg != "") {
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

	setValue(v: boolean, useForReset = true) {

		if (this.input) {
			this.input.checked = v;
		}

		super.setValue(v, useForReset);
	}

	getValue() {
		if (!this.input) {
			return super.getValue();
		} else {
			return this.input.checked;
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