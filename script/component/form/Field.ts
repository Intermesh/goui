/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap} from "../Component.js";
import {Config, Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "../Observable.js";
import {Button} from "../Button.js";
import {tbar, Toolbar} from "../Toolbar.js";
import {t} from "../../Translate.js";
import {E} from "../../util";
import {MaterialIcon} from "../MaterialIcon.js";
import {Menu} from "../menu";

/**
 * @inheritDoc
 */
export interface FieldEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the field changes. It fires on blur.
	 *
	 * Note: this event does not fire on {@link ContainerField} and {@link Form}
	 *
	 * @param field
	 */
	change: (field: Type, newValue: any, oldValue: any) => void

	/**
	 * Fires when setValue() is called
	 *
	 * You can alter this._value
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	beforesetvalue: (field: Type, e:{value: any, oldValue: any}) => void

	/**
	 * Fires when setValue() is called
	 *
	 * You can alter this._value
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	beforegetvalue: (field: Type, e:{value: any}) => void

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
	 * Use {@link setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	validate: (field: Type) => void

	/**
	 * Fires when the field is invalid
	 *
	 * Use {@link setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	invalid: (field: Type) => void
}


export type FieldValue = string|number|boolean|any[]|undefined|null|Record<string,any>;


export interface Field extends Component {
	on<K extends keyof FieldEventMap<this>, L extends Listener>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K]): boolean
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
	protected _labelEl?: HTMLElement;
	private _icon: MaterialIcon | "" | undefined;
	protected iconEl?: HTMLElement;

	/**
	 * Tracks if the field currently has focus.
	 *
	 * @private
	 */
	private hasFocus: boolean = false;

	constructor(tagName: keyof HTMLElementTagNameMap = "label") {
		super(tagName);
		this.control = this.createControl();
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

	protected _value: FieldValue;

	protected control: HTMLElement | undefined;

	/**
	 * The value this field resets to when a form is reset with the reset() function
	 * Changes when a form loads.
	 * @protected
	 */
	protected resetValue: any;

	/**
	 * The value that was set before adding this component to a parent. This is used with the clear() function.
	 * Useful when reusing a form for multiple save and load actions.
	 *
	 * @protected
	 */
	protected defaultValue: any;

	public invalidMsg = "";

	private _hint = "";

	private hintEl?: HTMLDivElement;

	/**
	 * Used for "change" event
	 * @protected
	 */
	protected valueOnFocus?: FieldValue;

	/**
	 * Validate the field on blur.
	 *
	 * Not recommended as it's causing annoying GUI jumping when adding the validation messages. It causes to click
	 * next to the desired element.
	 */
	public validateOnBlur = false;

	/**
	 * Fires a change event if the field's value is different since it got focus
	 * @protected
	 */
	protected fireChangeOnBlur = true;

	public onAdded(index: number){
		super.onAdded(index);
		this.trackReset();
		this.defaultValue = this.value;
	}

	protected onFocusOut(e:FocusEvent) {

		if (this.eventTargetIsInFocus(e)) {
			//focus is still within this field
			return;
		}

		this.hasFocus = false;

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

	/**
	 * Checks if the focus out or focus in is relevant for capturing the change event.
	 * Useful to override when using a menu in the field. Then you should also check if the focus is in the menu.
	 *
	 * @param e
	 * @protected
	 */
	protected eventTargetIsInFocus(e:FocusEvent) {
		return (e.relatedTarget instanceof HTMLElement) && this.el.contains(e.relatedTarget);
	}

	protected onFocusIn(e:FocusEvent) {

		if (this.hasFocus || this.eventTargetIsInFocus(e)) {
			//focus is still within this field
			return;
		}

		// In safari and brave focusin fired while focusout didn't fire when selecting a value from the picker.
		// This caused that the "setvalue" and "change" event didn't fire.
		this.hasFocus = true;

		this.captureValueForChange();
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

	// get el(): HTMLElement {
	// 	const el = super.el;
	//
	// 	// if(!this.wrap) {
	// 	// 	el.append(this.wrap = E("div").cls('+wrap'));
	// 	// }
	// 	return el;
	// }

	/**
	 * A wrapper DIV element that contains input and toolbar for input buttons like an expand button for a drop-down
	 */
	get wrap() {
		// wrap required to place buttons after element
		if(!this._wrap) {
			this.el.append(this._wrap = E("div").cls('+wrap'));
		}

		return this._wrap;
	}


	protected renderControl() {


		// label must follow input so we can make the transform transition with pure css with input::focus & input::placeholder-shown + label
		const label = this.createLabel();
		if (label) {
			this.wrap!.append(label);
		}

		this.renderIcon();

		if (this.control) {
			this.wrap.append(this.control.cls('+control'));

			if (this.title) {
				this.control.title = this.title;
			}
		}

		this.renderButtons();

		const hint = this.createHint();
		if (hint) {
			this.el.appendChild(hint);
		}

//		this.internalSetValue(this.value);
	}

	private renderButtons() {
		if (this._buttons && this._buttons.length) {
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
	public set buttons(buttons: Button[]) {
		this._buttons = buttons;

		if(this.rendered) {
			this.renderButtons();
		}
	}

	public get buttons() {
		return this._buttons ?? [];
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
		if(!this._label) {
			return "";
		}
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
	 * The field's icon rendered at the left inside the field
	 */
	public set icon(icon: MaterialIcon | "" | undefined) {
		this._icon = icon;
		this.createIcon();
		if(this.rendered) {
			this.renderIcon();
		}
	}

	public get hint() {
		return this._hint + "";
	}

	/**
	 * The field's hint text
	 */
	public set hint(hint: string) {
		this._hint = hint;
		if (this.rendered) {
			//this sets hint if not invalid
			this.applyInvalidMsg();
		}
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
	 * Check if the field was modified since create or when a form was loaded and @see trackReset() was called.
	 */
	public isModified() : boolean {
		// We use stringify to support object and array values
		// console.log("isModified()", JSON.stringify(this.resetValue), JSON.stringify(this.value))
		return JSON.stringify(this.resetValue) !== JSON.stringify(this.value);
	}

	/**
	 * Get the old value before user modifications were made after {@link trackReset()}
	 */
	public getOldValue() {
		return this.resetValue;
	}

	/**
	 * Copies the current value to the reset value. Typically happens when this component was added to a parent and
	 * when the form it belongs too loads.
	 *
	 * @see Form in the trackModifications method
	 */
	public trackReset(){
		// use structuredclone to support arrays and objects
		this.resetValue = structuredClone(this.value);
	}

	/**
	 * Set the field value
	 */
	public set value(v: FieldValue) {
		// Store old value through getter because it might do some extra processing. Like DateField does.
		const old = this.value;
		if(v === old) {
			return;
		}
		this._value = v;

		const e = {value: v, oldValue: old};
		this.fire("beforesetvalue", this, e);
		this._value = e.value;
		this.internalSetValue(this._value);
		this.checkHasValue();
		this.fire("setvalue", this, this._value, old);
	}

	protected checkHasValue() {
		this.el.classList.toggle("has-value", !this.isEmpty());
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
		this.valueOnFocus = v;

		this.checkHasValue();
	}

	public get value() {
		let v = this.internalGetValue();
		const e = {value: v};
		this.fire("beforegetvalue", this, e);

		return e.value;
	}

	protected internalGetValue() {
		return structuredClone(this._value);
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
		this.fire("change", this, this.resetValue, old);
	}


	/**
	 * Clears the field to it's original state set in the code.
	 *
	 *
	 * @param setValue When the form loads it's cleared but we don't need to set the value
	 *
	 */
	public clear(setValue:boolean = true) {
		if(setValue) {
			this.value = this.defaultValue;
		}
		this.resetValue = undefined;
		if(setValue) {
			this.trackReset();
		}
		this.clearInvalid();
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
		return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length == 0) ;
	}

	protected validate() {

		this.clearInvalid();

		if (this._required && this.isEmpty()) {
			this.setInvalid(t("This field is required"));
		}

		this.fire("validate", this);
	}

	protected internalRemove() {
		if(this.toolbar) {
			this.toolbar.remove();
		}
		super.internalRemove();
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
	 * Check if the field is marked invalid without doing any validation
	 */
	public isMarkedInvalid() {
		return this.invalidMsg != "";
	}

	/**
	 * Checks if the field is valid. It performs validation too.
	 * If you want to check if the field is marked as invalid without validation use isMarkedInvalid()
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

			return this.iconEl;
		} else {
			if(this.iconEl) {
				this.iconEl.remove();
				this.el.classList.remove("with-icon");
			}
		}
	}

	protected renderIcon() {
		if(this.wrap && this.iconEl) {
			this.wrap.insertBefore(this.iconEl, this.wrap.firstChild);
		}
	}
}

export type FieldConfig<Cmp extends Field, EventMap extends ObservableEventMap<Observable> = ComponentEventMap<Cmp>, Required extends keyof Cmp = never> = Omit<Config<Cmp, EventMap, Required>,
	"isValid" |
	"clearInvalid" |
	"isEmtpy" |
	"isFocussable" |
	"isModified" |
	"reset" |
	"setInvalid" |
	"trackReset"
>;