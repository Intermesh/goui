import {Field} from "./Field";


export abstract class InputField extends Field {


	protected input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined;

	set title(title: string) {
		super.title = title;

		if (this.input) {
			this.input.title = this.title;
		}
	}

	public focus(o?: FocusOptions) {
		if (!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	protected createControl() : HTMLElement {
		this.input = this.createInput();
		return this.input;
	}

	protected createInput() : HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement{
		const control = document.createElement("input");

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}
		return control;
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
		this.input!.value = v ?? "";
	}

	set value(v: any) {
		super.value = v;
	}

	get value() {
		return this.input!.value;
	}

	set name(name: string) {
		super.name = name;
		this.input!.name = this.name;
	}

	get name() {
		return super.name;
	}

	set type(type: string) {
		if(this.input instanceof HTMLInputElement)
			this.input!.type = type;
	}

	get type() {
		return this.input!.type;
	}

	/**
	 * Autocomplete value
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
	 *
	 * @param autocomplete
	 */

	set autocomplete(autocomplete: AutoFill) {
		this.input!.autocomplete = this.autocomplete;
	}

	get autocomplete() {
		return this.input!.autocomplete;
	}

	/**
	 * When the field is empty this will be displayed inside the field
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/placeholder
	 *
	 * @param placeholder
	 */
	set placeholder(placeholder: string) {
		if(!(this.input instanceof HTMLSelectElement))
			this.input!.placeholder = this.placeholder;

		if(this.placeholder !== " ") {
			this.el.classList.add("no-floating-label");
		}
	}

	get placeholder() {
		if(!(this.input instanceof HTMLSelectElement))
			return this.input!.placeholder;
		else
			return "";
	}


	/**
	 * Make field read only
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
	 * @param readOnly
	 */

	set readOnly(readOnly: boolean) {
		super.readOnly = readOnly;

		if(!(this.input instanceof HTMLSelectElement))
			this.input!.readOnly = this.readOnly;
	}

	get readOnly() {
		return super.readOnly;
	}

	/**
	 * Make field required
	 */
	get required(): boolean {
		return super.required;
	}

	set required(required: boolean) {
		super.required = required;
		this.input!.required = this.required;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (this.input) {

			this.setValidityState(this.input);
		}
	}

}