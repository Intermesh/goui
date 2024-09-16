/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {E} from "../../util/Element.js";
import {Component, createComponent} from "../Component.js";
import {Field, FieldConfig, FieldEventMap} from "./Field.js";
import {Config} from "../Observable.js";
import {MaterialIcon} from "../MaterialIcon.js";


interface RadioOption {
	value?: string
	text: string,
	icon?: MaterialIcon
}

export type RadioType = 'box' | 'button' | 'list';

export interface Radiofield {
	set value(v: string | undefined)
	get value(): string | undefined
}

/**
 * Radio field
 *
 * @example
 * ```
 * radio({
 * 		type: "button",
 * 		value: "option1",
 * 	  name: "radio",
 * 		options: [
 * 			{text: "Option 1", value: "option1"},
 * 			{text: "Option 2", value: "option2"},
 * 			{text: "Option 3", value: "option3"}
 * 		]}
 * 	)
 * ```
 */
export class RadioField extends Field {

	private inputs: { [key: string]: HTMLInputElement } = {};
	private _options?: RadioOption[];

	readonly type: RadioType;
	protected baseCls = 'goui-form-field radiogroup';


	private domName: string;

	constructor(type: RadioType = 'box') {
		super('div');
		this.type = type;
		this.el.cls(type, true);

		this.domName = "radio-" + Component.uniqueID();
	}
	// we handle it with the native change event here
	protected fireChangeOnBlur = false;

	protected createLabel(): HTMLDivElement | void {
		return;
	}

	protected createControl(): undefined | HTMLElement {

		if(!this.name && !this.itemId) {
			this.itemId = "radio-" + Component.uniqueID();
		}

		this._labelEl = E("h3").cls("legend");
		this._labelEl.innerText = this.label;
		this.el.insertBefore(this._labelEl, this.wrap!);

		const radio = E('div').cls('radio');

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}

		return radio;
	}

	public set options(options:RadioOption[]) {

		if(this._options) {
			this.control!.empty();
			this.inputs = {};
		}

		options.forEach((o) => {
			const btn = E('input')
				.on("focus", () => {
					this.valueOnFocus = this.value;
				})
				.on("change", () => {
					this.fireChange();
				});
			btn.type = "radio";
			btn.name = this.domName;
			btn.readOnly = this.readOnly;

			if(!o.value) {
				o.value = "";
			}

			btn.value = o.value;
			if (this._value == o.value) {
				btn.checked = true;
			}
			this.inputs[o.value] = btn;


			const lbl = E('span').cls('box-label')

			if(o.icon) {
				lbl.append(E("i", o.icon).cls("icon"))
			}

			lbl.append(o.text);

			this.control!.append(E('label',
				btn,
				lbl
			).cls('control'));
		});
	}

	public get options() {
		return this._options ?? [];
	}

	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined {
		if(this.rendered) {
			for (let v in this.inputs) {
				if (this.inputs[v].checked) {
					return v;
				}
			}
		}
		return this._value as string | undefined;
	}

	protected internalSetValue(v?: any) {
		if (v && v in this.inputs)
			this.inputs[v].checked = true;
	}


}

/**
 * Shorthand function to create {@see RadioField}
 *
 * @param config
 */
export const radio = (config?: FieldConfig<RadioField, FieldEventMap<RadioField>>) => createComponent(new RadioField(config?.type || 'box'), config);