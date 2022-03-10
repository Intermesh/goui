import {Component, ComponentConfig, ComponentEventMap} from "../Component.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";

export interface FieldConfig<T extends Observable> extends ComponentConfig<T>{
	/**
	 * Form element name which will be the key in values
	 * If omitted the field won't be included in the form values.
	 */
	name?: string
	/**
	 * Field label
	 */
	label?: string

	/**
	 * A value is required before it will be submitted
	 */
	required?: boolean

	/**
	 * Readonly input
	 */
	readOnly? : boolean

	/**
	 * When field is invalid supply the message
	 */
	invalidMsg?: string

	/**
	 * field value
	 */
	value?: any

	/**
	 * Display hint underneath form field
	 */
	hint?:string,
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<FieldEventMap<T>>
}

/**
 * @inheritDoc
 */
export interface FieldEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires when the field changes. It fires on blur.
	 *
	 * @param field
	 */
	change?: (field: T) => void

	/**
	 * Fires when setValue() is called
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	setvalue?: (field: T, newValue:any, oldValue: any) => void


	/**
	 * Fires when field is reset
	 *
	 * @param field
	 * @param newValue
	 * @param oldValue
	 */
	reset?:  (field: T, newValue:any, oldValue: any) => void

	/**
	 * Fires when validated
	 *
	 * Use {@see setInvalid()} to mark field invalid
	 *
	 * @param field
	 */
	validate?: (field: T) => void

}



export interface Field extends Component {
	on<K extends keyof FieldEventMap<Field>>(eventName: K, listener: FieldEventMap<Field>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof FieldEventMap<Field>>(eventName: K, ...args: Parameters<NonNullable<FieldEventMap<Field>[K]>>): boolean
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

export class Field extends Component {

	public static create<T extends typeof Observable>(this: T, config?: FieldConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	readonly isFormField = true

	protected baseCls = "form-field"

	protected tagName = "label" as keyof HTMLElementTagNameMap

	protected name = ""

	protected required = false

	protected readOnly = false

	protected label = ""

	protected value: any;

	protected resetValue: any;

	protected invalidMsg = "";

	protected hint = "";

	private hintEl?: HTMLDivElement;

	protected init() {
		super.init();

		this.resetValue = this.value;
	}

	protected validateOnBlur() {
		// Validate field on blur
		this.getEl().addEventListener("focusout", (e) => {
			// When a user clicks a button, perhaps submit or navigates then don't validate
			if(!e.relatedTarget || (<HTMLElement>e.relatedTarget).tagName != "BUTTON") {
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
		if(control) {
			control.classList.add("control");
			el.appendChild(control);
		}

		const label = this.createLabel();
		if(label) {
			el.appendChild(label);
		}

		const hint = this.createHint();
		if(hint) {
			el.appendChild(hint);
		}

		return el;
	}

	protected createControl(): HTMLElement | undefined {
		return undefined;
	}

	protected createHint() {

		this.hintEl = document.createElement("div");
		this.hintEl.classList.add("hint");

		this.hintEl.innerText = this.hint;
		return this.hintEl;

	}

	protected createLabel() {
		const label = document.createElement("div");
		label.classList.add("label");

		label.innerText = this.label;
		return label;
	}

	/**
	 * Get the field's name
	 */
	public getName() {
		return this.name;
	}

	/**
	 * Set the field's name
	 *
	 * @param name
	 */
	public setName(name:string) {
		this.name = name;
	}

	/**
	 * Set the field value
	 *
	 * @param v
	 * @param useForReset When true, this value is recorded for use when reset() is used.
	 */
	public setValue(v: any, useForReset = true) {
		const old = this.value;
		this.value = v;

		if(useForReset) {
			this.resetValue = v;//ObjectUtil.clone(v);
		}

		this.fire("setvalue", this, this.value, old);
	}

	public getValue() {
		return this.value;
	}

	/**
	 * Reset the field value to the initial value
	 * The initial value is set by setValue() when "useForReset" is set to true.
	 * @see setValue()
	 */
	public reset() {
		const old = this.value;
		this.setValue(this.resetValue, false);
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
		if(this.isRendered()) {
			this.applyInvalidMsg();
		}
	}

	/**
	 * Check if the field is empty
	 */
	public isEmpty() {
		const v = this.getValue();

		return v == undefined || v == null || v == "";
	}

	protected validate() {
		if(this.required && this.isEmpty()) {
			this.setInvalid("Please fill in this field");
		}

		this.fire("validate", this);
	}

	protected applyInvalidMsg() {
		if(this.invalidMsg) {
			this.getEl().classList.add("invalid");
			if(this.hintEl)
				this.hintEl.innerHTML = this.invalidMsg;
		}else
		{
			this.getEl().classList.remove("invalid");
			if(this.hintEl)
				this.hintEl.innerHTML = this.hint || "";
		}
	}

	/**
	 * Clears the invalid state
	 */
	public clearInvalid() {
		if(!this.invalidMsg) {
			return;
		}
		this.invalidMsg = "";
		if(this.isRendered()) {
			this.applyInvalidMsg();
		}
	}

	/**
	 * Checks if the field is valid
	 */
	public isValid() {
		if(this.invalidMsg != "") {
			return false;
		}
		this.validate();
		if(this.invalidMsg != "") {
			console.warn("Field '" + this.name +"' is invalid: " + this.invalidMsg, this);
		}
		return this.invalidMsg == "";
	}
}