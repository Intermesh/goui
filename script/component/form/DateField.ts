/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldConfig, FieldEventMap} from "./Field";
import {TimeField} from "./TimeField";
import {DateTime} from "../../util";




export interface DateField {
	/**
	 * The value of the date is in Y-m-d  or  Y-m-d H:i when withTime is true. {@link DateTime.format}
	 * @param v
	 */
	set value(v: string | undefined)
	get value(): string | undefined
}

/**
 * Date field
 *
 * @property min The minimum value allowed. Same format as {@link DateField.value}.
 * @property max The maximum value allowed. Same format as {@link DateField.value}.
 *
 * @see Form
 */
export class DateField extends TimeField {

	protected baseCls = "goui-form-field date no-floating-label";

	/**
	 * When switching the "withTime" property, this default time will be used.
	 *
	 * Use H:i format see {@link DateField.format}
	 */
	public defaultTime?: string;

	constructor() {
		super();
		this.type = "date";
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

}

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const datefield = (config?: FieldConfig<DateField, FieldEventMap<DateField>>) => createComponent(new DateField(), config);
