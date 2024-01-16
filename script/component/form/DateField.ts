/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {TimeField} from "./TimeField";
import {DateTime} from "../../util";

/**
 * Date field
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
				v += "T" + (this.defaultTime ?? (new DateTime()).format("H:i"));
			} else {
				const parts = v.split("T");
				v = parts[0];
				this.defaultTime = parts[1];
			}
			this.input.value = v;
		}
	}

	public get withTime() {
		return this.type == "datetime-local";
	}

}

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const datefield = (config?: Config<DateField, FieldEventMap<DateField>>) => createComponent(new DateField(), config);
