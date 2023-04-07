/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field} from "./Field.js";
import {Config, createComponent} from "../Component.js";
import {E} from "../../util/Element.js";

type CheckBoxType = 'box' | 'switch' | 'button';

/**
 * Checkbox field
 *
 * @see Form
 */
export class CheckboxField extends Field {
	/**
	 *
	 * @param type Render the checkbox as a checkbox, switch or toggle button
	 */
	constructor(public readonly type: CheckBoxType = 'box') {
		super();
		this.type = type;
		this.el.cls(type,true);
	}

	protected input: HTMLInputElement | undefined;

	protected baseCls = 'goui-form-field check';

	protected applyTitle() {
		if (this.title) {
			this.input!.title = this.title;
		}
	}

	focus(o?: FocusOptions) {
		if (!this.input) {
			super.focus(o);
		}
		this.input?.focus(o);
	}

	protected createLabel() {
		const old = this.label;
		this.label = "";
		const span = super.createLabel();
		this.label = old;
		return span;
	}

	protected createControl(): undefined | HTMLElement {

		const el = E('input').on("change", () => {this.fireChange();});
		el.type = "checkbox";
		el.required = this.required;
		el.name = this.name;
		el.readOnly = this.readOnly;
		el.checked = !!this.value;

		this.input = el;

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}
		const lbl = E('span',this.label).cls('box-label');

		if(this._cls) {
			lbl.cls("+" + this._cls);
		}

		return E('div',
			this.input,
			lbl
		);
	}

	setInvalid(msg: string) {

		super.setInvalid(msg);

		if (this.rendered) {
			this.applyInvalidMsg();
		}
	}

	protected applyInvalidMsg() {
		super.applyInvalidMsg();

		this.input!.setCustomValidity(this.invalidMsg);

		//check if el is visible (https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom)
		if (this.input!.offsetParent) {
			this.input!.reportValidity();
		}


		if (this.invalidMsg != "") {
			//clear the field on change
			this.input!.addEventListener('input', () => {
				this.clearInvalid();
			}, {once: true});
		}
	}

	clearInvalid() {
		super.clearInvalid();
		this.applyInvalidMsg();
	}

	getInput() {
		return this.input;
	}

	set value(v: boolean) {

		if (this.input) {
			this.input.checked = v;
		}

		super.value = v;
	}

	get value() {
		if (!this.input) {
			return super.value;
		} else {
			return this.input.checked;
		}
	}


	set name(name: string) {
		super.name = name;

		if (this.input) {
			this.input.name = this.name;
		}
	}

	get name() {
		return super.name;
	}

	protected validate() {
		super.validate();

		//this implements the native browser validation
		if (!this.input!.validity.valid) {
			this.setInvalid(this.input!.validationMessage);
		}
	}


}

export type CheckboxFieldConfig = Omit<Config<CheckboxField>, "type"> & {
	type?: CheckBoxType
};

/**
 * Shorthand function to create {@see CheckboxField}
 *
 * @param config
 */
export const checkbox = (config?: Config<CheckboxField>) => createComponent(new CheckboxField(config?.type||'box'), config);