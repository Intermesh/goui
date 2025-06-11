/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
import {t} from "../../Translate.js";
import {InputField} from "./InputField.js";

export interface NumberField {
	set value(v: number | undefined)

	get value(): number | undefined
}
/**
 * NumberField component
 */
export class NumberField extends InputField {

	protected baseCls = 'goui-form-field number';

	/**
	 * Multiply value with this number on set and divide on get value
	 */
	public multiplier = 1;

	constructor() {
		super();

		this.type = "number";

	}

	protected validate() {
		super.validate();
		const v = this.value;
		if (v && isNaN(v)) {
			this.setInvalid("Incorrect number format");
		}
		if (this.max !== undefined && !this.isEmptyNumber(v) && v! > this.max) {
			this.setInvalid(t("Number is bigger than the maximum of {max}.").replace("{max}", this.max.toLocaleString()));
		}
		if (this.min !== undefined &&  (this.isEmptyNumber(v) || v! < this.min)) {
			this.setInvalid(t("Number is smaller than the maximum of {min}.").replace("{min}", this.min.toLocaleString()));
		}
	}

	protected internalSetValue(v?:  number | undefined) {

		if(this.isEmptyNumber(v)) {
			v= undefined;
		} else if (isNaN(v!)) {
			console.error("Invalid number given for field " + this.name, v);
			v = undefined;
		} else {
			v= +(v! * this.multiplier).toFixed(this.decimals);
		}

		super.internalSetValue(v);
	}

	private isEmptyNumber(v:any) {
		return (v === undefined || v === null || v === "")
	}

	protected internalGetValue() {

		let v = this.input!.value == "" ? undefined : parseInt(this.input!.value);
		if((v === undefined || this.isEmptyNumber(v)  || isNaN(v))) {
			return undefined;
		}
		return +(v / this.multiplier).toFixed(this.decimals);
	}

	/**
	 * The step attribute is a number that specifies the granularity that the value must adhere to or the keyword any.
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step
	 * @param step
	 */
	public set step(step:number|undefined|"any") {
		if(step === undefined) {
			this.input!.removeAttribute('step');
		} else {
			this.input!.setAttribute('step', step.toString())
		}
	}

	public get step() {
		return parseFloat(this.input!.getAttribute('step') ?? "0");
	}

	/**
	 * Set the number of decimals. It uses the step attribute to accomplish this.
	 *
	 * @param decimals
	 */
	public set decimals(decimals:number|undefined) {
		if(!decimals) {
			this.input!.removeAttribute('step');
		} else {
			this.input!.setAttribute('step', '0.' . padEnd(decimals + 1, "0") + "1")
		}
	}

	public get decimals() {
		const step= this.input!.attr('step');
		if(!step) {
			return undefined;
		}

		return step.length - 2;
	}

	/**
	 * The minimum number allowed
	 *
	 * @param min
	 */
	public set min(min:number|undefined) {
		if(min === undefined) {
			this.input!.removeAttribute("min");
		} else {
			this.input!.setAttribute('min', min.toString());
		}
	}

	public get min() {
		const min = this.input!.getAttribute('min');
		if(min === null) {
			return undefined;
		}
		return parseFloat(min);
	}

	/**
	 * The maximum number allowed
	 *
	 * @param max
	 */
	public set max(max:number|undefined) {
		if(max === undefined) {
			this.input!.removeAttribute("max");
		} else {
			this.input!.setAttribute('max', max.toString());
		}
	}

	public get max() {
		const max = this.input!.getAttribute('max');
		if(max === null) {
			return undefined;
		}
		return parseFloat(max);
	}
}

export const numberfield = (config?: FieldConfig<NumberField, FieldEventMap<NumberField>>) => createComponent(new NumberField(), config);