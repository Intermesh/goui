/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {TextField} from "./TextField.js";
import {DateTime} from "../../util";
import {createComponent, FindComponentPredicate} from "../Component.js";
import {datepicker, DatePicker} from "../picker";
import {btn} from "../Button.js";
import {menu} from "../menu";
import {Config} from "../Observable";
import {Field, FieldEventMap} from "./Field";
import {t} from "../../Translate";


/**
 * Date field
 *
 * @see Form
 */
export class DateField extends TextField {

	inputFormat = "d-m-Y";
	outputFormat = "Y-m-d";

	date?: DateTime;

	timeField?: TextField

	minDate?: DateTime;

	maxDate?: DateTime;

	private readonly picker: DatePicker;

	private readonly pickerButton;

	constructor() {
		super();
		this.picker = datepicker({showWeekNbs: false});
		this.buttons = [
			this.pickerButton = btn({
				icon: "calendar_today",
				menu:
					menu({
							alignTo:  this.wrap,
							alignToInheritWidth: false
						},
						this.picker
					)
			})
		];
		this.pattern = DateTime.createFormatRegex(this.inputFormat);
		this.autocomplete = "off";
	}

	protected createControl() {
		const input = super.createControl();

		this.picker.on('select', (_, val) => {
			this.date = val;
			this.pickerButton.menu!.hide();
			this.clearInvalid();

			//important to set value after focus so change event will fire on focusout
			//focus is returned in {@see Field} .setupMenu()} when the picker button's menu hides.
			super.value = val.format(this.outputFormat);
		});

		this.pickerButton.menu!.on("beforeshow", () => {

			this.picker.minDate = this.minDate;
			this.picker.maxDate = this.maxDate;

			const val = this.getValueAsDateTime();

			if(val)
				this.picker.setValue(val);
		})

		return input;
	}


	protected validate() {
		super.validate();

		const v = super.value;
		if(!v) {
			return;
		}
		const dv = this.getValueAsDateTime();

		if (!dv) {
			this.setInvalid(t("'{date}' is not a valid date. The format for dates is {format}").replace('{date}', v).replace('{format}', this.inputFormat));
		} else {
			if (this.maxDate && dv.format("Ymd") > this.maxDate.format("Ymd")) {
				this.setInvalid(t("The date in this field must be before {maxDate}.").replace('{maxDate}', this.maxDate.format(this.inputFormat)));
			} else if(this.minDate && dv.getTime() < this.minDate.getTime()) {
				this.setInvalid(t("The date in this field must be after {minDate}.").replace('{minDate}', this.minDate.format(this.inputFormat)));
			} else {
				this.date = dv; // update date value when valid
			}
		}

	}

	set value(v: string | undefined) {
		// null may come from the server
		if (v === undefined || v === null) {
			if (this.timeField) {
				this.timeField.value = '';
			}
			super.value = '';
			return;
		}

		const [date, time] = v.split('T');

		if (this.timeField && time) {
			this.timeField.value = time.substring(0, 5);
		}

		const d = DateTime.createFromFormat(date, this.outputFormat);
		if (!d) {
			throw new Error("Invalid date format " + date);
		}
		this.picker.setValue(d);
		super.value = date;

		console.log("setvalue", v, this.value);
	}

	protected internalSetValue(v?: string) {

		if(!v) {
			return super.internalSetValue("");
		}
		const d = DateTime.createFromFormat(v + "", this.outputFormat);
		if (!d) {
			throw new Error("Invalid date format " + v);
		}
		v = d.format(this.inputFormat);
		super.internalSetValue(v);
	}

	get value() {
		let dateStr;
		if (!this.rendered) {
			dateStr = super.value;
		} else {
			if(!this._input!.value) {
				return undefined;
			}
			const d = DateTime.createFromFormat(this._input!.value , this.inputFormat);
			if (!d) {
				throw new Error("Invalid date format " + this._input!.value);
			}
			dateStr = d.format(this.outputFormat);
		}

		if(this.timeField) {
			dateStr += "T" + this.timeField.value;
		}

		return dateStr;
	}

	private getValueAsDateTime() {

		let v = this.value,
			timeFormat = '';
		if (this.timeField && !this.timeField.hidden) {
			v += 'T' + this.timeField.value;
			timeFormat = 'TH:i';
		}
		let date;
		if (!v || !(date = DateTime.createFromFormat(v, this.outputFormat + timeFormat))) {
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
export const datefield = (config?: Config<DateField, FieldEventMap<DateField>>) => createComponent(new DateField(), config);
