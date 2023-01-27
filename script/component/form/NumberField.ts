import {TextField, TextFieldType} from "./TextField.js";
import {Config, createComponent} from "../Component.js";

export class NumberField extends TextField {

	public type: TextFieldType = "number" as TextFieldType;

	decimals: number = 2
	min?: number
	max?: number

	protected validate() {
		super.validate();
		const v = super.value;
		if (v && isNaN(v)) {
			this.setInvalid("Incorrect number format");
		}
		if(this.max !== undefined && v > this.max) {
			this.setInvalid("Number is too big");
		}
		if(this.min !== undefined && v < this.min) {
			this.setInvalid("Number is too small");
		}
	}

	set value(v: number | undefined) {
		if (isNaN(v!)) {
			throw new Error("Invalid number");
		} else if(v) {
			super.value = +v.toFixed(this.decimals);
		}

	}

	get value(): number | undefined {
		const v = super.value;
		return (v === undefined || isNaN(v)) ? undefined : +(+v).toFixed(this.decimals);
	}

	protected createControl() : undefined | HTMLElement{
		super.createControl();
		this._input!.cls('+number')
		// this._input!.attr('type','number');
		if(this.min !== undefined) {
			this._input!.attr('min',this.min);
		}
		if(this.max !== undefined) {
			this._input!.attr('max',this.max);
		}
		return this._input;
	}
}

export const numberfield = (config?: Config<NumberField>) => createComponent(new NumberField(), config);