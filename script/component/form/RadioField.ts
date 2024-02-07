/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {E} from "../../util/Element.js";
import {Component, createComponent} from "../Component.js";
import {Field, FieldEventMap} from "./Field.js";
import {Config} from "../Observable";


interface RadioOption {
	value?: string
	text: string
}

type RadioType = 'box' | 'button';

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

	constructor(type: RadioType = 'box') {
		super('div');
		this.type = type;
		this.el.cls(type, true);
	}

	protected createLabel(): HTMLDivElement | void {
		return;
	}

	protected createControl(): undefined | HTMLElement {

		if(!this.name && !this.itemId) {
			this.itemId = "radio-" + Component.uniqueID();
		}

		const label = E("h3").cls("legend");
		label.innerText = this.label;
		this.el.insertBefore(label, this.wrap!);

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
			const btn = E('input').on("change", () => {
				this.fireChange();
			});
			btn.type = "radio";
			btn.name = this.name || this.itemId;
			btn.readOnly = this.readOnly;
			if (o.value) {
				btn.value = o.value;
				if (this._value == o.value) {
					btn.checked = true;
				}
				this.inputs[o.value] = btn;
			}

			this.control!.append(E('label',
				btn,
				E('span', o.text).cls('box-label')
			).cls('control'));
		});
	}

	public get options() {
		return this._options ?? [];
	}

	set value(v: string | undefined) {
		super.value = v;
		if (v && v in this.inputs)
			this.inputs[v].checked = true;
	}

	get value() {
		if(this.rendered) {
			for (let v in this.inputs) {
				if (this.inputs[v].checked) {
					return v;
				}
			}
		}
		return super.value as string | undefined;
	}

}

/**
 * Shorthand function to create {@see RadioField}
 *
 * @param config
 */
export const radio = (config?: Config<RadioField, FieldEventMap<RadioField>>) => createComponent(new RadioField(config?.type || 'box'), config);