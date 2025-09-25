/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {FieldConfig, FieldValue} from "./Field.js";
import {DateTime} from "../../util";
import {InputField} from "./InputField.js";


export interface DateField {
	/**
	 * The value of the date is in Y-m-d  or  Y-m-d H:i when withTime is true. {@link DateTime.format}
	 * @param v
	 */
	set value(v: string | undefined)
	get value(): string | undefined

	get input(): HTMLInputElement

}

/**
 * Date field
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 *
 * @property min The minimum value allowed. Same format as {@link DateField.value}.
 * @property max The maximum value allowed. Same format as {@link DateField.value}.
 *
 * @see Form
 */
export class DateField extends InputField {

	protected baseCls = "goui-form-field date no-floating-label";

	// Don't use native event as chrome fires change on every key stroke
	protected fireChangeOnBlur = true;

	constructor() {
		super();
		this.type = "date";
	}

	protected createInput() : HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement{
		const control = document.createElement("input");
		if (this.invalidMsg) {
			this.applyInvalidMsg();
		}
		return control;
	}

	protected internalSetValue(v:FieldValue) {
		if(this.type === 'date' && v) {
			v = v.toString().substring(0,10); // remove possible time part
		}
		super.internalSetValue(v);
	}

	/**
	 * The minimum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param min
	 */
	public set min(min:DateTime|undefined) {
		this.input!.attr('min', min?.format("Y-m-d"));
	}

	public get min() {
		const min = this.input!.attr('min');
		if(!min) {
			return undefined;
		}

		return DateTime.createFromFormat(min, "Y-m-d");
	}

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public set max(max:DateTime|undefined) {
		this.input!.attr('max', max?.format("Y-m-d"));
	}

	public get max() {
		const max = this.input!.attr('max');
		if(!max) {
			return undefined;
		}

		return DateTime.createFromFormat(max, "Y-m-d");
	}


	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

		let v = this.value as string, date;
		if (!v || !(date = DateTime.createFromFormat(v, 'Y-m-d'))) {
			return undefined;
		}
		return date;
	}

}

/**
 * Shorthand function to create {@link DateField}
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 * @param config
 */
export const datefield = (config?: FieldConfig<DateField>) => createComponent(new DateField(), config);
