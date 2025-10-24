/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {E} from "../../util/Element.js";
import {Component, createComponent} from "../Component.js";
import {Field, FieldConfig} from "./Field.js";
import {MaterialIcon} from "../MaterialIcon.js";


interface RadioOption {
	value?: string|number|null
	text: string,
	icon?: MaterialIcon
}

export type RadioType = 'box' | 'button' | 'list';

export interface Radiofield extends Field{
	set value(v: string | number | null)
	get value(): string | number | null
}

/**
 * Radio field
 *
 * @link @link https://goui.io/#form/ChecksAndRadios Example
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

	private inputs: HTMLInputElement[]  = [];
	private _options: RadioOption[] = [];

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
			this.inputs = [];
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

			// if(!o.value) {
			// 	o.value = "";
			// }

			//btn.value = o.value;
			if (this._value == o.value) {
				btn.checked = true;
			}
			this.inputs.push(btn);


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

		this._options = options;
	}

	public get options() {
		return this._options;
	}

	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined | null {
		if(this.rendered) {
			for(let i = 0, l = this._options.length;i < l; i++) {
				if (this.inputs[i].checked) {
					return this._options[i].value;
				}
			}
		}
		return this._value as string | undefined;
	}

	protected internalSetValue(v?: any) {
		for(let i = 0, l = this._options.length;i < l; i++) {
			this.inputs[i].checked = this._options[i].value == v;
		}
	}


}

/**
 * Shorthand function to create {@link RadioField}
 *
 * @link @link https://goui.io/#form/ChecksAndRadios Example
 *
 * @param config
 */
export const radio = (config?: FieldConfig<RadioField>) => createComponent(new RadioField(config?.type || 'box'), config);