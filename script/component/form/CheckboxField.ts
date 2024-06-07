/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {E} from "../../util/Element.js";
import {Config} from "../Observable";
import {InputField} from "./InputField";

type CheckBoxType = 'box' | 'switch' | 'button';

export interface CheckboxField {
	get input(): HTMLInputElement
}

/**
 * Checkbox field
 *
 * @see Form
 */
export class CheckboxField extends InputField {
	/**
	 *
	 * @param type Render the checkbox as a checkbox, switch or toggle button
	 */
	constructor(type: CheckBoxType = 'box') {
		super();

		this.el.cls(type, true);

		this.type = "checkbox";
	}


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

		const lbl = E('span').cls('box-label');
		lbl.innerHTML = this.label;

		if (this._cls) {
			lbl.cls("+" + this._cls);
		}
		this.control!.append(lbl);

		this._labelEl = lbl;
	}

	// we handle it with the native change event here
	protected fireChangeOnBlur = false;

	protected createControl() {

		this._input = this.createInput() as HTMLInputElement;
		this._input.on("change", ()=> this.fireChange());

		this._input.on("click", ()=> this.validate());

		const control = E('div',
			this._input
		);

		return control;
	}

	set color(v: string) {
		this.input!.style.backgroundColor = v || '';
	}

	get color(): string {
		return this.input!.style.backgroundColor;
	}

	set value(v: boolean) {
		if (this.input) {
			this.input.checked = v;
		}

		super.value = v;
	}

	get value() {
		if (!this.input) {
			//always return bool
			return !!super.value;
		} else {
			return this.input.checked;
		}
	}
}

export type CheckboxFieldConfig = Omit<FieldConfig<CheckboxField, FieldEventMap<CheckboxField>>, "type"> & {
	type?: CheckBoxType
}

/**
 * Shorthand function to create {@see CheckboxField}
 *
 * @param config
 */
export const checkbox = (config?: CheckboxFieldConfig) => {
	const type = config?.type || 'box';
	delete config?.type;
	return createComponent(new CheckboxField(type), config);
}