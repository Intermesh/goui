/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {TextField} from "./TextField.js";
import {DateTime} from "../../util/DateTime.js";
import {createComponent} from "../Component.js";
import {datepicker, DatePicker} from "../picker/DatePicker.js";
import {btn} from "../Button.js";
import {menu} from "../menu/Menu.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
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

	timefield?: TextField;

	minDate?: DateTime;

	maxDate?: DateTime;

	private readonly picker: DatePicker;

	private readonly pickerButton;

	constructor() {
		super();
		let origValidateOnBlur = true;
		this.picker = datepicker({showWeekNbs: false});
		this.buttons = [
			this.pickerButton = btn({
				icon: "calendar_today",
				menu:
					menu({
							alignTo:  this.el,
							alignToInheritWidth: false,
							listeners: {
								beforeshow: () => {
									origValidateOnBlur = this.validateOnBlur;
									this.validateOnBlur = false;
								},
								hide: () => {
									this.validateOnBlur = origValidateOnBlur;
								}
							}
						},
						this.picker
					)
			})
		];
		this.pattern = DateTime.createFormatRegex(this.inputFormat);
		this.title = "Incorrect date format";
	}

	protected createControl() {
		const input = super.createControl();
		this.picker.on('select', (_, val) => {
			this.date = val;
			super.value = val.format(this.inputFormat);
			this.pickerButton.menu!.hide();
			this.clearInvalid();
			this.focus();
		});

		this.pickerButton.menu!.on("show", () => {
			this.picker.setValue(this.getValueAsDateTime() || new DateTime());
		})

		return input;
	}

	protected validate() {
		super.validate();

		const v = super.value;
		if(!v) {
			return;
		}
		const dv = DateTime.createFromFormat(v, this.inputFormat);

		if (!dv) {
			this.setInvalid(t("{date} is not a valid date. The format for dates is {format}").replace('{date}', v).replace('{format}', this.inputFormat));
		} else {
			if (this.maxDate && dv.getTime() > this.maxDate.getTime()) {
				this.setInvalid(t("The date in this field must be before {maxDate}.").replace('{maxDate}', this.maxDate.format(this.inputFormat)));
			}

			if(this.minDate && dv.getTime() < this.minDate.getTime()) {
				this.setInvalid(t("The date in this field must be after {minDate}.").replace('{minDate}', this.minDate.format(this.inputFormat)));
			}
		}

	}

	set value(v: string | undefined) {
		if (v === undefined) {
			if (this.timefield) {
				this.timefield.value = '';
			}
			super.value = '';
			return;
		}
		// if(v instanceof DateTime) { // from datepicker
		// 	v = v.format(this.inputFormat);
		// }
		const [date, time] = v.split('T');
		const d = DateTime.createFromFormat(date + "", this.outputFormat);

		if (!d) {
			throw new Error("Invalid date format " + v);
		}
		if (this.timefield && time) {
			this.timefield.value = time.substring(0, 5);
		}
		this.date = d;
		this.picker.setValue(d);
		super.value = d.format(this.inputFormat);
	}

	get value(): string | undefined {
		const date = this.getValueAsDateTime();

		if (!date) {
			return undefined;
		}

		const timeFormat = this.timefield ? 'TH:i' : '';

		// return date.format(this.outputFormat + timeFormat);
		return date.format(this.inputFormat + timeFormat);
	}

	private getValueAsDateTime() {
		let v = super.value,
			timeFormat = '';
		if (this.timefield) {
			v += 'T' + this.timefield.value;
			timeFormat = 'TH:i';
		}
		let date;
		if (!v || !(date = DateTime.createFromFormat(v, this.inputFormat + timeFormat))) {
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