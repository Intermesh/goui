import {Field} from "./Field";

export abstract class InputField extends Field {

	protected _input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined;

	/**
	 * Get the DOM HTMLInputElement
	 */
	public get input() {
		return this._input;
	}

	set title(title: string) {
		super.title = title;

		if (this._input) {
			this._input.title = this.title;
		}
	}

	public focus(o?: FocusOptions) {
		if (!this._input) {
			super.focus(o);
		}
		this._input?.focus(o);
	}

	protected createControl() : HTMLElement {
		this._input = this.createInput();
		return this._input;
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
		this._input!.value = v ?? "";
	}

	set value(v: any) {
		super.value = v;
	}

	get value() {
		return this._input!.value;
	}

	set name(name: string) {
		super.name = name;
		this._input!.name = this.name;
	}

	get name() {
		return super.name;
	}

	set type(type: string) {
		if(this._input instanceof HTMLInputElement)
			this._input!.type = type;
	}

	get type() {
		return this._input!.type;
	}

	/**
	 * Autocomplete value
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
	 *
	 * @param autocomplete
	 */

	set autocomplete(autocomplete: AutoFill) {
		this._input!.autocomplete = this.autocomplete;
	}

	get autocomplete() {
		return this._input!.autocomplete;
	}

	/**
	 * When the field is empty this will be displayed inside the field
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/placeholder
	 *
	 * @param placeholder
	 */
	set placeholder(placeholder: string) {
		if(!(this._input instanceof HTMLSelectElement))
			this._input!.placeholder = this.placeholder;

		if(this.placeholder !== " ") {
			this.el.classList.add("no-floating-label");
		}
	}

	get placeholder() {
		if(!(this._input instanceof HTMLSelectElement))
			return this._input!.placeholder;
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

		if(!(this._input instanceof HTMLSelectElement))
			this._input!.readOnly = this.readOnly;
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
		this._input!.required = this.required;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (this._input) {

			this.setValidityState(this._input);
		}
	}

}