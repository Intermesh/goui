/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Joachim van de Haterd <jhaterd@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {FieldConfig} from "./Field.js";
import {NumberField} from "./NumberField.js";
import {InputField} from "./InputField";

export class RangeField extends InputField {

	protected baseCls = 'goui-form-field range no-floating-label';
	constructor() {
		super();
		this.type = "range";

		// set the navigator defaults
		this.value = 50;
		this.min = 0;
		this.max = 100;
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

export const rangefield = (config?: FieldConfig<RangeField>) => createComponent(new RangeField(), config);