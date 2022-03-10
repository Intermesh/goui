import { Component } from "../Component.js";
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
    constructor() {
        super(...arguments);
        this.isFormField = true;
        this.baseCls = "form-field";
        this.tagName = "label";
        this.name = "";
        this.required = false;
        this.readOnly = false;
        this.label = "";
        this.invalidMsg = "";
        this.hint = "";
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        super.init();
        this.resetValue = this.value;
    }
    validateOnBlur() {
        // Validate field on blur
        this.getEl().addEventListener("focusout", (e) => {
            // When a user clicks a button, perhaps submit or navigates then don't validate
            if (!e.relatedTarget || e.relatedTarget.tagName != "BUTTON") {
                this.clearInvalid();
                this.validate();
            }
        });
    }
    internalRender() {
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
    createControl() {
        return undefined;
    }
    createHint() {
        this.hintEl = document.createElement("div");
        this.hintEl.classList.add("hint");
        this.hintEl.innerText = this.hint;
        return this.hintEl;
    }
    createLabel() {
        const label = document.createElement("div");
        label.classList.add("label");
        label.innerText = this.label;
        return label;
    }
    /**
     * Get the field's name
     */
    getName() {
        return this.name;
    }
    /**
     * Set the field's name
     *
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * Set the field value
     *
     * @param v
     * @param useForReset When true, this value is recorded for use when reset() is used.
     */
    setValue(v, useForReset = true) {
        const old = this.value;
        this.value = v;
        if (useForReset) {
            this.resetValue = v; //ObjectUtil.clone(v);
        }
        this.fire("setvalue", this, this.value, old);
    }
    getValue() {
        return this.value;
    }
    /**
     * Reset the field value to the initial value
     * The initial value is set by setValue() when "useForReset" is set to true.
     * @see setValue()
     */
    reset() {
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
    setInvalid(msg) {
        this.invalidMsg = msg;
        if (this.isRendered()) {
            this.applyInvalidMsg();
        }
    }
    /**
     * Check if the field is empty
     */
    isEmpty() {
        const v = this.getValue();
        return v == undefined || v == null || v == "";
    }
    validate() {
        if (this.required && this.isEmpty()) {
            this.setInvalid("Please fill in this field");
        }
        this.fire("validate", this);
    }
    applyInvalidMsg() {
        if (this.invalidMsg) {
            this.getEl().classList.add("invalid");
            if (this.hintEl)
                this.hintEl.innerHTML = this.invalidMsg;
        }
        else {
            this.getEl().classList.remove("invalid");
            if (this.hintEl)
                this.hintEl.innerHTML = this.hint || "";
        }
    }
    /**
     * Clears the invalid state
     */
    clearInvalid() {
        if (!this.invalidMsg) {
            return;
        }
        this.invalidMsg = "";
        if (this.isRendered()) {
            this.applyInvalidMsg();
        }
    }
    /**
     * Checks if the field is valid
     */
    isValid() {
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
//# sourceMappingURL=Field.js.map