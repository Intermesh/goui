import {Field, FieldEventMap, FieldValue} from "./Field.js";
import {FunctionUtil} from "../../util/index";
import {select} from "./SelectField.js";


export interface InputFieldEventMap extends FieldEventMap {

	/**
	 * Fires on input
	 */
	input: {
		value: any
	}
}


export abstract class InputField<EventMap extends InputFieldEventMap = InputFieldEventMap> extends Field<EventMap> {
	
	// we handle it with the native change event here
	protected fireChangeOnBlur = false;

	constructor() {
		super();
	}

	/**
	 * Get the DOM HTMLInputElement
	 */
	public get input() : HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
		return this.control as HTMLInputElement;
	}

	protected onFirstListenerAdded(eventName: keyof EventMap) {
		super.onFirstListenerAdded(eventName);

		if(eventName == "input") {
			if(!this.rendered) {
				this.on("render", () => {
					this.input.addEventListener('input', () => {
						this.fire("input", {value: this.input.value})
					})
				});
			} else {
				this.input.addEventListener('input', () => {
					this.fire("input", {value: this.input.value})
				})
			}
		}
	}

	set title(title: string) {
		super.title = title;

		if (this.input) {
			this.input.title = this.title;
		}
	}

	public focus(o?: FocusOptions) {
		if (!this.input) {
			super.focus(o);
		} else {
			this.input.focus(o);
			this.fire("focus", {options: o});
		}
	}


	/**
	 * Selects all the text in the field
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select)
	 */
	public select() {
		if(!(this.input instanceof HTMLSelectElement))
			(this.input as HTMLInputElement).select();
	}

	protected createControl() : HTMLElement {

		const control = document.createElement("input");

		//hack or detecting browser autofill and make label float
		control.addEventListener("animationstart", ({target, animationName}) => {
			switch (animationName) {
				case 'onautofillstart':
					this.el.classList.toggle("has-value", true);
					break;
				// case 'onautofillcancel':
				// 	this.fireChange();
				// 	break;
			}
		}, false);

		control.on("change", (e)=> {
			this.fireChange();
		});

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

	protected internalSetValue(v:FieldValue) {
		this.input!.value = v !== undefined && v !== null ? v.toString() : "";
	}

	protected internalGetValue() : FieldValue {
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
		this.input!.autocomplete = autocomplete;

		if(autocomplete == "off") {
			// Password manager don't listen to "off" so we must set their own variants :(
			this.input!.dataset['1pIgnore'] = "true"; //1Password
			this.input!.dataset['bwignore'] = "true"; //Bitwarden
			this.input!.dataset['lpignore'] = "true"; //Lastpass
			this.input!.dataset['formType'] = "other"; //Dashlane
		}
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
			this.input!.placeholder = placeholder;

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
	get disabled() {
		return super.disabled;
	}

	set disabled(disabled) {
		this.input!.disabled = disabled;

		super.disabled = disabled;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (this.input) {

			this.setValidityState(this.input);
		}
	}

}