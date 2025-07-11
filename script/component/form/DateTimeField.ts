import {Field, FieldConfig} from "./Field";
import {DateField, datefield} from "./DateField";
import {TimeField, timefield} from "./TimeField";
import {DateTime, Format} from "../../util/index";
import {createComponent} from "../Component";
import {t} from "../../Translate";

export class DateTimeField extends Field {
	private dateField: DateField;
	private timeField: TimeField;

	public _max?:DateTime;
	public _min?:DateTime;
	constructor() {
		super();

		this.cls = "datetime";

		this.items.add(
			this.dateField = datefield({flex:1, cls: "no-border"}),
			this.timeField = timefield({cls: "no-border"})
		)
	}

	protected get itemContainerEl() {
		return this.wrap;
	}


	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param min
	 */
	public set min(min:DateTime|undefined) {
		this._min = min;
		this.dateField.min  = min;
	}

	public get min() {
		return this._min;
	}

	/**
	 * The maximum number allowed
	 *
	 * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
	 *
	 * @param max
	 */
	public set max(max:DateTime|undefined) {
		this._max = max;
		this.dateField.max = max;
	}

	public get max() {
		return this._max;
	}

	protected validate() {
		super.validate();
		if(this._max || this._min) {

			const v = this.getValueAsDateTime();

			if(v) {
				const format = this.withTime ? Format.dateFormat + " " + Format.timeFormat : Format.dateFormat;

				if (this._max !== undefined && v.compare(this._max) == 1) {

					this.setInvalid(t("Please select a value that is no later than {max}").replace("{max}", this._max.format(format)));
				}
				if (this._min !== undefined && v.compare(this._min) == -1) {
					this.setInvalid(t("Please select a value that is not earlier than {min}").replace("{min}", this._min.format(format)));
				}
			}
		}
	}

	public get withTime() {
		return !this.timeField.hidden;
	}

	/**
	 * Also render time input
	 *
	 * @param withTime
	 */
	public set withTime(withTime: boolean) {

		if(this.timeField.hidden == !withTime) {
			return;
		}

		this.timeField.hidden = !withTime;
	}

	/**
	 * When switching the "withTime" property, this default time will be used.
	 *
	 * Use H:i format see {@link DateField.format}
	 */
	public defaultTime?: string;

	protected outputFormat(): string {
		return this.withTime ? "Y-m-dTH:i" : 'Y-m-d';
	}
	protected internalSetValue(v?: any) {
		super.internalSetValue(v);

		if(v) {
			if(this.withTime) {
				//reformat to strip off timezone info
				const dt = DateTime.createFromFormat(v, this.outputFormat());
				if(dt) {
					v = dt.format(this.outputFormat())
				}
				const parts = v.split("T");
				this.dateField.value = parts[0];
				if (parts[1]) {
					this.timeField.value = this.defaultTime = parts[1];
				} else {
					this.timeField.value = this.defaultTime ?? (new DateTime()).format("H:i")
				}
			} else {
				this.dateField.value = v;
			}
		}
	}

	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | null | undefined {
		if(!this.dateField.value) {
			return undefined;
		}
		if(!this.withTime) {
			return this.dateField.value;
		}

		if(!this.timeField.value) {
			return undefined;
		}

		return this.dateField.value + "T" + this.timeField.value;
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
 * Shorthand function to create {@link DateTimeField}
 *
 * @param config
 */
export const datetimefield = (config?: FieldConfig<DateTimeField>) => createComponent(new DateTimeField(), config);
