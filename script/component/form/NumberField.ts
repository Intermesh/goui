/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {FieldConfig} from "./Field.js";
import {t} from "../../Translate.js";
import {InputField} from "./InputField.js";
import {TextField} from "./TextField";
import {Format} from "../../util/index";
import {Form} from "./Form";

export interface NumberField {
	set value(v: number | undefined)

	get value(): number | undefined
}
/**
 * NumberField component
 *
 * @link https://goui.io/#form/NumberField Examples
 */
export class NumberField extends InputField {

	protected baseCls = 'goui-form-field number';

	/**
	 * Multiply value with this number on set and divide on get value
	 */
	public multiplier = 1;

	constructor() {
		super();

		// format the number on change
		this.on("change",  ({newValue}) => {

			if(!isNaN(newValue))
				this.internalSetValue(newValue);

		});

	}

	protected validate() {
		super.validate();
		const v = this.value;
		if (v !== undefined && isNaN(v)) {
			this.setInvalid("Incorrect number format");
		}
		if (this.max !== undefined && !this.isEmptyNumber(v) && v! > this.max) {
			this.setInvalid(t("Number is bigger than the maximum of {max}.").replace("{max}", this.max.toLocaleString()));
		}
		if (this.min !== undefined && (this.isEmptyNumber(v) || v! < this.min)) {
			this.setInvalid(t("Number is smaller than the maximum of {min}.").replace("{min}", this.min.toLocaleString()));
		}
	}

	protected internalSetValue(v?: number | undefined) {

		let s;
		if (this.isEmptyNumber(v)) {
			s = undefined;
		} else if (isNaN(v!)) {
			console.error("Invalid number given for field " + this.name, v);
			s = undefined;
		} else {
			s = Format.number(+(v! * this.multiplier));
		}

		super.internalSetValue(s);
	}

	private isEmptyNumber(v: any) {
		return (v === undefined || v === null || v === "")
	}

	protected internalGetValue() {
		if (!this.input!.value) {
			return undefined;
		}
		const v = Format.parseLocalNumber(this.input!.value);
		return +(v / this.multiplier).toFixed(this.decimals);
	}

	/**
	 * Set the number of decimals.
	 */

	public decimals = 2;


	/**
	 * The minimum number allowed
	 *
	 * @param min
	 */
	public min: number | undefined;


	/**
	 * The maximum number allowed
	 *
	 * @param max
	 */
	public max: number | undefined;


}

/**
 * Creator function for a {@link NumberField}
 *
 * @link https://goui.io/#form/NumberField Example
 * @param config
 */
export const numberfield = (config?: FieldConfig<NumberField>) => createComponent(new NumberField(), config);