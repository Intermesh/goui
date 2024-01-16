/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {t} from "../../Translate";
import {InputField} from "./InputField";

/**
 * NumberField component
 */
export class NumberField extends InputField {

	protected baseCls = 'goui-form-field number';

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
		if (this.max !== undefined && v && v > this.max) {
			this.setInvalid(t("Number is too big"));
		}
		if (this.min !== undefined &&  (!v || v < this.min)) {
			this.setInvalid(t("Number is too small"));
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

	get value(): number | undefined {
		const v = super.value;
		return (this.isEmptyNumber(v)  || isNaN(v)) ? undefined : +(+v).toFixed(this.decimals);
	}

	/**
	 * The step attribute is a number that specifies the granularity that the value must adhere to or the keyword any.
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step
	 * @param step
	 */
	public set step(step:number|undefined|"any") {
		if(!step) {
			this.input!.attr('step', undefined);
		} else {
			this.input!.attr('step', step)
		}
	}

	public get step() {
		return parseFloat(this.input!.attr('step'));
	}

	/**
	 * Set the number of decimals. It uses the step attribute to accomplish this.
	 *
	 * @param decimals
	 */
	public set decimals(decimals:number|undefined) {
		if(!decimals) {
			this.input!.attr('step', undefined);
		} else {
			this.input!.attr('step', '0.' . padEnd(decimals + 1, "0") + "1")
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
	public set min(min:number) {
		this.input!.attr('min', min);
	}

	public get min() {
		return parseInt(this.input!.attr('min'));
	}

	/**
	 * The maximum number allowed
	 *
	 * @param max
	 */
	public set max(max:number) {
		this.input!.attr('max', max);
	}

	public get max() {
		return parseInt(this.input!.attr('max'));
	}
}

export const numberfield = (config?: Config<NumberField, FieldEventMap<NumberField>>) => createComponent(new NumberField(), config);