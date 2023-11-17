/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap} from "../Component.js";
import {ObservableListenerOpts} from "../Observable.js";
import {Button} from "../Button.js";
import {tbar, Toolbar} from "../Toolbar.js";
import {t} from "../../Translate.js";
import {E} from "../../util/Element.js";
import {MaterialIcon} from "../MaterialIcon";
import {Menu} from "../menu";


/**
 * @inheritDoc
 */
export interface FieldEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the field changes. It fires on blur.
	 *
	 * Note: this event does not fire on {@see ContainerField} and {@see Form}
	 *
	 * @param field
	 */
	change: (field: Type, newValue: any, oldValue: any) => void

	/**
	 * Fires when setValue() is called
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	setvalue: (field: Type, newValue: any, oldValue: any) => void


	/**
	 * Fires when field is reset
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	reset: (field: Type, newValue: any, oldValue: any) => void

	/**
	 * Fires when validated
	 *
	 * Use {@see setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	validate: (field: Type) => void

	/**
	 * Fires when the field is invalid
	 *
	 * Use {@see setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	invalid: (field: Type) => void
}


export interface Field extends Component {
	on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<any>[K]>): boolean
}

/**
 * Base class for a form field
 *
 * Field components should at least implement "createControl" and "internalSetValue".
 */
export abstract class Field extends Component {
	private _buttons?: Button[];
	private toolbar?: Toolbar;
	private _wrap?: HTMLDivElement;
	private _labelEl?: HTMLElement;
	private _icon: MaterialIcon | "" | undefined;
	private iconEl?: HTMLElement;

	constructor(tagName: keyof HTMLElementTagNameMap = "label") {
		super(tagName);
	}

	readonly isFormField = true

	/**
	 * Adds standard style. You may want to remove this if you don't want the standard
	 * look of a form field.
	 *
	 * @protected
	 */
	protected baseCls = "goui-form-field"

	private _name?: string;

	private _required = false

	private _readOnly = false

	private _label = ""

	protected _value: any;

	protected resetValue: any;

	public invalidMsg = "";

	private _hint = "";

	private hintEl?: HTMLDivElement;

	/**
	 * Used for "change" event
	 * @protected
	 */
	protected valueOnFocus?: string;

	/**
	 * Validate the field on blur
	 */
	public validateOnBlur = true;

	/**
	 * Fires a change event if the field's value is different since it got focus
	 * @protected
	 */
	protected fireChangeOnBlur = true;

	protected onFocusOut(e:FocusEvent) {

		if (e.relatedTarget instanceof HTMLElement && this.el.contains(e.relatedTarget)) {
			//focus is still within this field
			return;
		}

		if(this.validateOnBlur) {
			this.validate();
		}

		// detect changed value. Handle objects by comparing JSON values
		if(this.fireChangeOnBlur && this.isChangedSinceFocus()) {
			this.fireChange();
		}
	}

	/**
	 * Return true if the field was modified
	 */
	protected isChangedSinceFocus():boolean {
		// detect changed value. Handle objects by comparing JSON values
		const v = this.value;
		if(typeof(v) == 'object') {
			return JSON.stringify(this.valueOnFocus) != JSON.stringify(v);
		} else {
			return this.valueOnFocus  != v;
		}
	}

	protected onFocusIn(e:FocusEvent) {

		if (e.relatedTarget instanceof HTMLElement && this.el.contains(e.relatedTarget)) {
			//focus is still within this field
			return;
		}

		if(this.fireChangeOnBlur) {
			this.captureValueForChange();
		}
	}

	protected captureValueForChange() {
		const v = this.value;
		this.valueOnFocus = typeof(v) == 'object' ? structuredClone(v) : v;
	}

	protected internalRender() {

		const el = super.internalRender();

		this.renderControl();

		this.el.addEventListener("focusin", this.onFocusIn.bind(this));
		this.el.addEventListener("focusout", this.onFocusOut.bind(this));

		return el;
	}

	isFocusable(): boolean {
		return !this.hidden;
	}

	get el(): HTMLElement {
		const el = super.el;

		// if(!this.wrap) {
		// 	el.append(this.wrap = E("div").cls('+wrap'));
		// }
		return el;
	}

	/**
	 * A wrapper DIV element that contains input and toolbar for input buttons like an expand button for a drop down
	 */
	get wrap() {
		// wrap required to place buttons after element
		if(!this._wrap) {
			this.el.append(this._wrap = E("div").cls('+wrap'));
		}

		return this._wrap;
	}

	protected renderControl() {

		// const icon = this.createIcon();
		// if(icon) {
		// 	this.wrap.append(icon);
		// }

		const control = this.createControl();
		if (control instanceof HTMLElement) {
			this.wrap.append(control.cls('+control'));

			if (this.title) {
				control.title = this.title;
			}
		} else if (control instanceof Component) {
			control.render(this.wrap);
			control.parent = this;

			if (this.title) {
				control.title = this.title;
			}
		}

		// label must follow input so we can make the transform transition with pure css with input::focus & input::placeholder-shown + label
		const label = this.createLabel();
		if (label) {
			this.wrap!.append(label);
		}

		this.renderButtons();

		const hint = this.createHint();
		if (hint) {
			this.el.appendChild(hint);
		}

		this.internalSetValue(this.value);
	}

	private renderButtons() {
		if (this._buttons) {
			this.toolbar = tbar({}, ...this._buttons);
			this.toolbar.parent = this;
			this.toolbar.render(this.wrap);

			this._buttons.forEach((btn) => {
				if(btn.menu) {
					this.setupMenu(btn.menu);
				}
			})

		} else {
			if(this.toolbar) {
				this.toolbar.remove();
			}
		}
	}

	/**
	 * When buttons with menus are added it is handy to delay the validation on blur.
	 * Because when the user will click something in the menu it will blur the field and you probably don't
	 * want it to validate at that point. It's important that the menu will return focus to the field
	 * and sets the value afterward.
	 *
	 * @param menu
	 * @protected
	 */
	protected setupMenu(menu:Menu) {

		let origValidateOnBlur= false;
		menu.on("beforeshow", () => {
			origValidateOnBlur = this.validateOnBlur;
			this.validateOnBlur = false;
		});
		menu.on("hide", () => {
			this.validateOnBlur = origValidateOnBlur;
			this.focus();
		});
	}

	protected createControl(): Component | HTMLElement | undefined {
		return undefined;
	}

	/**
	 * Render buttons inside the text field
	 *
	 * @example
	 * ```
	 * buttons: [
	 * 				 		btn({icon: "clear", handler:(btn) => (btn.parent!.parent! as Field).value = ""})
	 * 					]
	 * ```
	 * @param buttons
	 */
	public set buttons(buttons: Button[] | undefined) {
		this._buttons = buttons;

		if(this.rendered) {
			this.renderButtons();
		}
	}

	public get buttons() {
		return this._buttons;
	}

	protected createHint(): HTMLDivElement | void {
		this.hintEl = E('div', this._hint).cls('hint');
		return this.hintEl;
	}

	protected createLabel(): HTMLElement | void {
		this._labelEl = E('div', this.getLabelText()).cls('label');
		return this._labelEl;
	}

	private getLabelText() {
		let labelText = this._label;
		if(this._required) {
			labelText += ' *';
		}
		return labelText;
	}

	/**
	 * Form element name which will be the key in values
	 * If omitted the field won't be included in the form values.
	 */
	public get name() {
		return this._name || "";
	}

	/**
	 * The field's name
	 */
	public set name(name: string) {
		this._name = name;
	}

	public get required() {
		return this._required;
	}

	/**
	 * Required or not
	 */
	public set required(required: boolean) {
		this._required = required;
		if(this._labelEl) {
			this._labelEl.innerHTML = this.getLabelText();
		}
		if (this.rendered) {
			this.clearInvalid();
		}
	}


	public get label() {
		return this._label + "";
	}

	/**
	 * The field's label
	 */
	public set label(label: string) {
		this._label = label;
		if(this._labelEl) {
			this._labelEl.innerHTML = this.getLabelText();
		}
	}


	public get icon() {
		return this._icon;
	}

	/**
	 * The field's label
	 */
	public set icon(icon: MaterialIcon | "" | undefined) {
		this._icon = icon;

		this.createIcon()

	}

	public get hint() {
		return this._hint + "";
	}

	/**
	 * The field's hint text
	 */
	public set hint(hint: string) {
		this._hint = hint;
	}


	public get readOnly() {
		return this._readOnly;
	}

	/**
	 * Make the field read only
	 */
	public set readOnly(readOnly: boolean) {

		this.el.classList.toggle("readonly", readOnly);
		this._readOnly = readOnly;
	}

	/**
	 * Set the field value
	 */
	public set value(v: any) {
		const old = this._value;
		this._value = v;

		// not sure if this is allright. We track the value to reset if it's set while not added to a parent yet.
		// it should be the value it gets when configured logically and not loaded or changed by the user. AFAIK
		// this is the easiest way to do it.
		if(!this.parent && !this.resetValue) {
			this.resetValue = v;
		}

		this.internalSetValue(v);
		this.fire("setvalue", this, this._value, old);
	}

	/**
	 * Applies set value to the control.
	 *
	 * This is also called when the control is rendered. Note that this.rendered is still false when that happens.
	 *
	 * @param v
	 * @protected
	 */
	protected internalSetValue(v?:any) {

	}

	/**
	 * Helper to fire "change" event. Child classes must implement this.
	 */
	protected fireChange() {
		const v = this.value;
		this.fire("setvalue", this, v, this.valueOnFocus);
		this.fire("change", this, v, this.valueOnFocus);
		this.valueOnFocus = undefined;
	}

	public get value() {
		return this._value;
	}

	/**
	 * Reset the field value to the value that was given to the field's constructor
	 * @see setValue()
	 */
	public reset() {
		const old = this.value;
		this.value = this.resetValue;
		this.clearInvalid();
		this.fire("reset", this, this.resetValue, old);
		this.fire("setvalue", this, this.resetValue, old);
		this.fire("change", this, this.resetValue, old);
	}

	/**
	 * Set the field as invalid and set a message
	 *
	 * @param msg
	 */
	public setInvalid(msg: string) {
		this.invalidMsg = msg;
		if (this.rendered) {
			this.applyInvalidMsg();
		}

		this.fire("invalid", this);
	}

	/**
	 * Check if the field is empty
	 */
	public isEmpty() {
		const v = this.value;

		return v == undefined || v == null || v == "";
	}

	protected validate() {

		this.clearInvalid();

		if (this._required && this.isEmpty()) {
			this.setInvalid(t("This field is required"));
		}

		this.fire("validate", this);
	}


	/*

			badInput
:
false
customError
:
false
patternMismatch
:
false
rangeOverflow
:
false
rangeUnderflow
:
false
stepMismatch
:
false
tooLong
:
false
tooShort
:
false
typeMismatch
:
false

			 */
	protected setValidityState(input:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement) {

		const validity = input.validity;

		if(validity.valid) {
			return;
		}

		if(validity.typeMismatch) {
			switch(input.type){
				case 'email':
					this.setInvalid(t("Please enter a valid e-mail address"));
					return;

				default:
					this.setInvalid(t("Please enter a valid value"));
					return;
			}

		} else if(validity.valueMissing) {
			this.setInvalid(t("This field is required"));
		} else if(validity.tooLong) {
			this.setInvalid(t("The maximum length for this field is {max}").replace("{max}", (input as HTMLInputElement).maxLength));
		} else if(validity.tooShort) {
			this.setInvalid(t("The minimum length for this field is {max}").replace("{max}", (input as HTMLInputElement).minLength));
		}else if(validity.patternMismatch) {
			this.setInvalid(t("Please match the format requested").replace("{max}", (input as HTMLInputElement).minLength));
		} else {
			console.warn("TODO: Implement translated message");
			this.setInvalid(input.validationMessage);
		}


	}

	protected applyInvalidMsg() {
		if (this.invalidMsg) {
			this.el.classList.add("invalid");
			if (this.hintEl)
				this.hintEl.innerHTML = this.invalidMsg;
		} else {
			this.el.classList.remove("invalid");
			if (this.hintEl)
				this.hintEl.innerHTML = this._hint || "";
		}
	}

	/**
	 * Clears the invalid state
	 */
	public clearInvalid() {
		if (!this.invalidMsg) {
			return;
		}
		this.invalidMsg = "";
		if (this.rendered) {
			this.applyInvalidMsg();
		}
	}

	/**
	 * Checks if the field is valid
	 */
	public isValid() {
		if (this.invalidMsg != "") {
			return false;
		}
		this.validate();
		if (this.invalidMsg != "") {
			console.warn("Field '" + this.name + "' is invalid: " + this.invalidMsg, this);
		}
		return this.invalidMsg == "";
	}

	private createIcon() {

		if(this._icon) {
			if(!this.iconEl) {
				this.iconEl = E("i").cls("icon");
			}

			this.iconEl.innerText = this._icon;

			this.el.classList.add("with-icon");

			if(this.wrap) {
				this.wrap.insertBefore(this.iconEl, this.wrap.firstChild);
			}

			return this.iconEl;
		} else {
			if(this.iconEl) {
				this.iconEl.remove();
				this.el.classList.remove("with-icon");
			}
		}

	}
}