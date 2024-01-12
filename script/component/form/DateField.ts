/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {TextField} from "./TextField.js";
import {DateTime, E} from "../../util";
import {createComponent, FindComponentPredicate} from "../Component.js";
import {datepicker, DatePicker} from "../picker";
import {btn} from "../Button.js";
import {menu} from "../menu";
import {Config} from "../Observable";
import {Field, FieldEventMap} from "./Field";
import {t} from "../../Translate";
import {TimeField} from "./TimeField";
import {InputField} from "./InputField";


/**
 * Date field
 *
 * @see Form
 */
export class DateField extends TimeField {

	protected baseCls = "goui-form-field date no-floating-label";
	private oldTime: string = "00:00";

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

			if(withTime) {
				v += "T" + this.oldTime;
			} else {
				const parts = v.split("T");
				v = parts[0];
				this.oldTime = parts[1];
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
