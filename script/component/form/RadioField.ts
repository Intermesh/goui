import {E} from "../../util/Element.js";
import {Config, createComponent} from "../Component.js";
import {Field} from "./Field.js";


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

	options: RadioOption[] = [];
	inputs: {[key:string]:HTMLInputElement} = {};

	readonly type : RadioType;
	protected baseCls = 'goui-form-field check';

	constructor(type: RadioType = 'box') {
		super('div');
		this.type = type;
		this.el.cls(type,true);
	}

	protected createControl(): undefined | HTMLElement {

		const radio = E('div').cls('radio');

		this.options.forEach((o) => {
			const btn =E('input').on("change", () => {this.fireChange();});
			btn.type = "radio";
			btn.name = this.name || this.itemId;
			btn.readOnly = this.readOnly;
			if (o.value) {
				btn.value = o.value;
				if(this._value == o.value) {
					btn.checked = true;
				}
				this.inputs[o.value] = btn;
			}

			radio.append(E('label',
				btn,
				E('span',o.text).cls('box-label')
			).cls('control'));
		});

		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}

		return radio
	}

	set value(v: string | undefined) {
		super.value = v;
		if(v && v in this.inputs)
			this.inputs[v].checked = true;
	}

	get value() {
		for(let v in this.inputs) {
			if(this.inputs[v].checked){
				return v;
			}
		}
		return undefined;
	}

}

/**
 * Shorthand function to create {@see RadioField}
 *
 * @param config
 */
export const radio = (config?: Config<RadioField>) => createComponent(new RadioField(config?.type||'box'), config);