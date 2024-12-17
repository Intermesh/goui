/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {FieldConfig, FieldEventMap} from "./Field.js";
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
 * @property min The minimum value allowed. Same format as {@link DateField.value}.
 * @property max The maximum value allowed. Same format as {@link DateField.value}.
 *
 * @see Form
 */
export class DateField extends InputField {

	protected baseCls = "goui-form-field date no-floating-label";

	/**
	 * When switching the "withTime" property, this default time will be used.
	 *
	 * Use H:i format see {@link DateField.format}
	 */
	public defaultTime?: string;

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

	/**
	 * Also render time input
	 *
	 * @param withTime
	 */
	public set withTime(withTime: boolean) {

		let v = this.value, newType = withTime ? "datetime-local" : "date";

		if(newType != this.input.type) {
			this.input.type = newType;

			if(!v) {
				return;
			}

			if(withTime) {
				v = this.appendTime(v);
			} else {
				const parts = v.split("T");
				v = parts[0];
				this.defaultTime = parts[1];
			}
			this.input.value = v;
		}
	}

	private appendTime(v:string) {
		return v + "T" + (this.defaultTime ?? (new DateTime()).format("H:i"));
	}

	public get withTime() {
		return this.type == "datetime-local";
	}


	protected internalSetValue(v?: string | undefined) {

		if(v) {
			const Tindex = v.indexOf("T");
			if (this.withTime) {
				if (Tindex == -1) {
					v = this.appendTime(v);
				}
			} else {
				if (Tindex != -1) {
					const parts = v.split("T");
					v = parts[0];
					this.defaultTime = parts[1];
				}
			}
		}

		super.internalSetValue(v);
	}

	protected outputFormat(): string {
		return this.withTime ? "Y-m-dTH:i" : 'Y-m-d';
	}

	/**
	 * The minimum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param min
	 */
	public set min(min:string) {
		this.input!.attr('min', min);
	}

	public get min() {
		return this.input!.attr('min');
	}

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public set max(max:string) {
		this.input!.attr('max', max);
	}

	public get max() {
		return this.input!.attr('max');
	}


	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

		let v = this.value as string, date;
		if (!v || !(date = DateTime.createFromFormat(v, this.outputFormat()))) {
			return undefined;
		}
		return date;
	}

}

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const datefield = (config?: FieldConfig<DateField, FieldEventMap<DateField>>) => createComponent(new DateField(), config);
