/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {TextField, TextFieldType} from "./TextField.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";

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
		if (this.max !== undefined && v > this.max) {
			this.setInvalid("Number is too big");
		}
		if (this.min !== undefined && v < this.min) {
			this.setInvalid("Number is too small");
		}
	}

	set value(v: number | undefined) {
		if (isNaN(v!)) {
			throw new Error("Invalid number");
		} else if (!this.isEmptyNumber(v)) {
			super.value = + v!.toFixed(this.decimals);
		}

	}

	private isEmptyNumber(v:any) {
		return (v === undefined || v === null || v === "")
	}

	get value(): number | null {
		const v = super.value;
		return (this.isEmptyNumber(v)  || isNaN(v)) ? null : +(+v).toFixed(this.decimals);
	}

	protected createControl(): undefined | HTMLElement {
		super.createControl();
		this._input!.cls('+number');
		this._input!.inputMode = "numeric";
		// this._input!.attr('type','number');
		if (this.min !== undefined) {
			this._input!.attr('min', this.min);
		}
		if (this.max !== undefined) {
			this._input!.attr('max', this.max);
		}
		if(this.decimals) {
			this._input!.attr('step', '0.'.padEnd(this.decimals + 1, "0") + "1")
		}
		return this._input;
	}
}

export const numberfield = (config?: Config<NumberField, FieldEventMap<NumberField>>) => createComponent(new NumberField(), config);