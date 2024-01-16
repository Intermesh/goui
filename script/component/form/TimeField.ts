import {TextField} from "./TextField";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {DateTime} from "../../util";
import {InputField} from "./InputField";


export interface TimeField {
	get input(): HTMLInputElement
}
/**
 * TimeField component
 *
 * Time input based on the browsers locale. Outputs time in "H:i" format. eg. 09:30 or 15:30 {@link DateTime.format}
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
 */
export class TimeField extends InputField {


	protected baseCls = "goui-form-field time no-floating-label";

	constructor() {
		super();

		this.type = "time";
	}

	public set step(v:number) {
		this.input!.step = v.toString();
	}

	public get step() {
		return parseInt(this.input!.step);
	}

	/**
	 * The minimum number allowed
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
	 * @param max
	 */
	public set max(max:string) {
		this.input!.attr('max', max);
	}

	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

		let v = this.value;
		let date;
		if (!v || !(date = DateTime.createFromFormat(v, "Y-m-dTH:i"))) {
			return undefined;
		}
		return date;
	}
}


/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const timefield = (config?: Config<TimeField, FieldEventMap<TextField>>) => createComponent(new TimeField(), config);