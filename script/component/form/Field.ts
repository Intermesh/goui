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


/**
 * @inheritDoc
 */
export interface FieldEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the field changes. It fires on blur.
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
}


export interface Field extends Component {
	on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<any>[K]>): boolean
}

// /**
//  * @inheritDoc
//  */
// export interface FieldInterface extends Component {
// 	readonly isFormField: true
// 	getName():string
// 	setName(name:string):void
// 	getValue():any
// 	setValue(value:any, useForReset?:boolean):any
// 	reset():void
// 	setInvalid(msg: string):void
// 	clearInvalid():void
// 	isValid():boolean,
// 	isEmpty():boolean
// 	on<K extends keyof FieldEventMap<FieldInterface>>(eventName: K, listener: FieldEventMap<FieldInterface>[K], options?: ObservableListenerOpts): void;
// 	fire<K extends keyof FieldEventMap<FieldInterface>>(eventName: K, ...args: Parameters<NonNullable<FieldEventMap<FieldInterface>[K]>>): boolean
// }

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
	protected oldValue?: string;

	/**
	 * Validate the field on blur
	 */
	public validateOnBlur = true;

	private _validateOnBlur() {
		// Validate field on blur
		this.el.addEventListener("focusout", (e) => {

			if(!this.validateOnBlur) {
				return;
			}
			// When a user clicks a button, perhaps submit or navigates then don't validate
			if (!e.relatedTarget || (<HTMLElement>e.relatedTarget).tagName != "BUTTON") {
				this.validate();
			}

		});
	}

	protected internalRender() {

		const el = super.internalRender();

		this._validateOnBlur();

		this.renderControl();

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
		if (control) {
			this.wrap!.append(control.cls('+control'));
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
	}

	private renderButtons() {
		if (this._buttons) {
			this.toolbar = tbar({}, ...this._buttons);
			this.toolbar.parent = this;
			this.toolbar.render(this.wrap);
		} else {
			if(this.toolbar) {
				this.toolbar.remove();
			}
		}
	}

	protected createControl(): HTMLElement | undefined {
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
			labelText += '*';
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
	 *
	 * @param v
	 * @param useForReset When true, this value is recorded for use when reset() is used.
	 */
	public set value(v: any) {
		const old = this._value;
		this._value = v;

		// if (useForReset) {
		// 	this.resetValue = v;//ObjectUtil.clone(v);
		// }

		if (!this.resetValue) {
			this.resetValue = v;
		}

		this.internalSetValue(v, old);

		this.oldValue = v;

		this.fire("setvalue", this, this._value, old);
	}

	protected internalSetValue(v:any, old:any) {

	}

	/**
	 * Helper to fire "change" event. Child classes must implement this.
	 * @protected
	 */
	protected fireChange(suppresSetValue = false) {
		const v = this.value;
		if (!suppresSetValue) {
			this.fire('setvalue', this, v, this.oldValue);
		}
		//used set timeout so focusout event happens first and field validates before change event
		setTimeout(() => {
			this.fire("change", this, v, this.oldValue);
			this.oldValue = v;
		});
	}

	public get value() {
		return this._value;
	}

	/**
	 * Reset the field value to the initial value
	 * The initial value is set by setValue() when "useForReset" is set to true.
	 * @see setValue()
	 */
	public reset() {
		const old = this.value;
		this.value = this.resetValue;
		this.clearInvalid();
		this.fire("reset", this, this.resetValue, old);
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