import {E} from "../../util/Element.js";
import {Config, createComponent} from "../Component.js";
import {Field} from "./Field.js";


interface RadioOption {
	value?: string
	text: string
}

type RadioType = 'box' | 'button';

/**
 * Checkbox field
 *
 * @see Form
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

export const radio = (config?: Config<RadioField>) => createComponent(new RadioField(config?.type||'box'), config);