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

	/**
	 * Decimal separator. Defaults to {@link Format.decimalSeparator}
	 */
	public decimalSeparator: string = Format.decimalSeparator;

	/**
	 * Thousands separator. Defaults to {@link Format.thousandsSeparator}
	 */

	public thousandsSeparator: string = Format.thousandsSeparator

	constructor() {
		super();

		// format the number on change
		this.on("change",  ({newValue}) => {

			if(!isNaN(newValue))
				this.internalSetValue(newValue);

		});

		// select number on focus so you can enter a new number immediately
		this._input!.addEventListener("focus", () => {
			this.select();
		})

	}


	protected validate() {
		super.validate();
		const v = this.value;
		if(v === undefined) {
			return;
		}
		if (isNaN(v)) {
			this.setInvalid("Incorrect number format");
			return;
		}
		if (this.max !== undefined && v! > this.max) {
			this.setInvalid(t("Number is bigger than the maximum of {max}.").replace("{max}", Format.number(this.max, this.decimals, this.decimalSeparator, this.thousandsSeparator)));
		}
		if (this.min !== undefined && v! < this.min) {
			this.setInvalid(t("Number is smaller than the maximum of {min}.").replace("{min}", Format.number(this.min, this.decimals, this.decimalSeparator, this.thousandsSeparator)));
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
			s = Format.number(+(v! * this.multiplier), this.decimals, this.decimalSeparator, this.thousandsSeparator);
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
		const v = Format.parseLocalNumber(this.input!.value, this.decimalSeparator, this.thousandsSeparator);
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
export const numberfield = (config?: FieldConfig<NumberField>) => {

	if(config && "decimals" in config) {
		//make sure decimals is applied before value becuase it depends on it
		config = Object.assign({decimals: 2}, config);
	}

	return createComponent(new NumberField(), config);
}