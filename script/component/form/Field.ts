import {Component, ComponentEventMap} from "../Component.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {Button} from "../Button.js";
import {tbar, Toolbar} from "../Toolbar.js";


/**
 * @inheritDoc
 */
export interface FieldEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires when the field changes. It fires on blur.
	 *
	 * @param field
	 */
	change: <Sender extends T> (field: Sender, newValue: any, oldValue: any) => void

	/**
	 * Fires when setValue() is called
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	setvalue: <Sender extends T> (field: Sender, newValue: any, oldValue: any) => void


	/**
	 * Fires when field is reset
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	reset: <Sender extends T> (field: Sender, newValue: any, oldValue: any) => void

	/**
	 * Fires when validated
	 *
	 * Use {@see setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	validate: <Sender extends T> (field: Sender) => void
}


export interface Field extends Component {
	on<K extends keyof FieldEventMap<this>>(eventName: K, listener: Partial<FieldEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof FieldEventMap<this>>(eventName: K, ...args: Parameters<FieldEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<FieldEventMap<this>>)
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

	constructor(tagName:keyof HTMLElementTagNameMap = "label") {
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

	protected validateOnBlur() {
		// Validate field on blur
		this.el.addEventListener("focusout", (e) => {
			// When a user clicks a button, perhaps submit or navigates then don't validate
			if (!e.relatedTarget || (<HTMLElement>e.relatedTarget).tagName != "BUTTON") {
				this.clearInvalid();
				this.validate();
			}

		});
	}

	protected internalRender() {

		const el = super.internalRender();

		// if(this.hideLabel) {
		// 	el.classList.add('hide-label');
		// }

		this.validateOnBlur();

		const control = this.createControl();
		if (control) {
			control.classList.add("control");
			el.appendChild(control);
		}

		if(this._buttons) {
			this.toolbar = tbar({}, ...this._buttons);
			this.toolbar.parent = this;
			this.toolbar.render(el);

			this.el.classList.add("with-toolbar");
		}

		const label = this.createLabel();
		if (label) {
			el.appendChild(label);
		}

		const hint = this.createHint();
		if (hint) {
			el.appendChild(hint);
		}



		return el;
	}

	protected createControl(): HTMLElement | undefined {
		return undefined;
	}

	public set buttons(buttons: Button[] | undefined) {
		this._buttons = buttons;
	}

	public get buttons() {
		return this._buttons;
	}

	protected createHint() {

		this.hintEl = document.createElement("div");
		this.hintEl.classList.add("hint");

		this.hintEl.innerText = this._hint;
		return this.hintEl;

	}

	protected createLabel() {
		const label = document.createElement("div");
		label.classList.add("label");

		label.innerText = this._label;
		return label;
	}

	/**
	 * Form element name which will be the key in values
	 * If omitted the field won't be included in the form values.
	 */
	public get name() {
		return this._name + "";
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
	}



	public get label() {
		return this._label + "";
	}

	/**
	 * The field's label
	 */
	public set label(label: string) {
		this._label = label;
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

		if(!this.resetValue) {
			this.resetValue = v;
		}

		this.oldValue = v;

		this.fire("setvalue", this, this._value, old);
	}

	/**
	 * Helper to fire "change" event. Child classes must implement this.
	 * @protected
	 */
	protected fireChange() {
		//used set timeout so focusout event happens first and field validates before change event
		setTimeout(() => {
			this.fire("change", this, this.value, this.oldValue);
			this.oldValue = this.value;
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
		if (this._required && this.isEmpty()) {
			this.setInvalid("Please fill in this field");
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
}