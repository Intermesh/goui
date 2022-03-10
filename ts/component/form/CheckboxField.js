import { Field } from "./Field.js";
/**
 * Checkbox field
 *
 * @see Form
 */
export class CheckboxField extends Field {
    constructor() {
        super(...arguments);
        this.baseCls = 'form-field checkbox';
    }
    applyTitle() {
        if (this.title) {
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
    createLabel() {
        const old = this.label;
        this.label = "";
        const span = super.createLabel();
        this.label = old;
        return span;
    }
    createControl() {
        const control = document.createElement("div");
        this.input = document.createElement("input");
        this.input.type = "checkbox";
        this.input.required = this.required;
        this.input.name = this.name;
        this.input.readOnly = this.readOnly;
        // this.input.hidden = true;
        if (this.value) {
            this.input.checked = this.value;
        }
        if (this.invalidMsg) {
            this.applyInvalidMsg();
        }
        this.input.addEventListener("change", () => {
            this.fire("change", this);
        });
        control.appendChild(this.input);
        const boxLabel = document.createElement("span");
        boxLabel.classList.add('box-label');
        boxLabel.innerHTML = this.label;
        control.appendChild(boxLabel);
        return control;
    }
    setInvalid(msg) {
        super.setInvalid(msg);
        if (this.isRendered()) {
            this.applyInvalidMsg();
        }
    }
    applyInvalidMsg() {
        super.applyInvalidMsg();
        this.input.setCustomValidity(this.invalidMsg);
        //check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
        if (this.input.offsetParent) {
            this.input.reportValidity();
        }
        if (this.invalidMsg != "") {
            //clear the field on change
            this.input.addEventListener('input', () => {
                this.clearInvalid();
            }, { once: true });
        }
    }
    clearInvalid() {
        super.clearInvalid();
        this.applyInvalidMsg();
    }
    getInput() {
        return this.input;
    }
    setValue(v, useForReset = true) {
        if (this.input) {
            this.input.checked = v;
        }
        super.setValue(v, useForReset);
    }
    getValue() {
        if (!this.input) {
            return super.getValue();
        }
        else {
            return this.input.checked;
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
//# sourceMappingURL=CheckboxField.js.map