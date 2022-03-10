import { Field } from "./Field.js";
/**
 * TextField component
 *
 * @see Form
 */
export class TextField extends Field {
    constructor() {
        super(...arguments);
        this.type = "text";
        this.placeholder = " ";
    }
    static create(config) {
        return super.create(config);
    }
    applyTitle() {
        if (this.title && this.input) {
            this.input.title = this.title;
        }
    }
    focus(o) {
        var _a;
        if (!this.input) {
            super.focus(o);
        }
        (_a = this.input) === null || _a === void 0 ? void 0 : _a.focus(o);
    }
    // protected internalRender() {
    // 	this.createControl();
    //
    // 	const el = super.internalRender();
    //
    // 	el.appendChild(this.input!);
    // 	return el;
    // }
    createControl() {
        this.input = document.createElement("input");
        this.input.classList.add("text");
        this.input.type = this.type;
        if (this.pattern) {
            this.input.pattern = this.pattern;
        }
        if (this.autocomplete) {
            this.input.autocomplete = this.autocomplete;
        }
        if (this.placeholder) {
            this.input.placeholder = this.placeholder;
        }
        this.input.required = this.required;
        this.input.name = this.name;
        this.input.readOnly = this.readOnly;
        if (this.value) {
            this.input.value = this.value;
        }
        if (this.title) {
            this.input.title = this.title;
        }
        this.input.addEventListener("change", () => {
            //used set timeout so focusout event happens first and field validates before change event
            setTimeout(() => {
                this.fire("change", this);
            });
        });
        if (this.invalidMsg) {
            this.applyInvalidMsg();
        }
        return this.input;
    }
    setInvalid(msg) {
        super.setInvalid(msg);
        if (this.isRendered()) {
            this.applyInvalidMsg();
        }
    }
    // protected applyInvalidMsg() {
    // 	super.applyInvalidMsg();
    //
    // 	this.input!.setCustomValidity(this.invalidMsg);
    //
    // 	//check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
    // 	if(this.input!.offsetParent) {
    // 		this.input!.reportValidity();
    // 	}
    //
    //
    // 	if(this.invalidMsg != "") {
    // 		//clear the field on change
    // 		this.input!.addEventListener('input', () => {
    // 			this.clearInvalid();
    // 		}, {once: true});
    // 	}
    // }
    clearInvalid() {
        super.clearInvalid();
        this.applyInvalidMsg();
    }
    getInput() {
        return this.input;
    }
    setValue(v, useForReset = true) {
        if (this.input) {
            this.input.value = v;
        }
        super.setValue(v, useForReset);
    }
    getValue() {
        if (!this.input) {
            return super.getValue();
        }
        else {
            return this.input.value;
        }
    }
    setName(name) {
        super.setName(name);
        if (this.isRendered()) {
            this.input.name = this.name;
        }
    }
    validate() {
        super.validate();
        //this implements the native browser validation
        if (!this.input.validity.valid) {
            this.setInvalid(this.input.validationMessage);
        }
    }
}
//# sourceMappingURL=TextField.js.map