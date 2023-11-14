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


/**
 * Date field
 *
 * @see Form
 */
export class DateField extends Field {

	/**
	 * The input format must contain the chars d, m and Y but may be in any order.
	 */
	public inputFormat = "d-m-Y";

	/**
	 * A valid date format.
	 *
	 * @see DateTime.format()
	 */
	public outputFormat = "Y-m-d";


	public timeField?: TextField

	/**
	 * Minimum date allowed
	 */
	public minDate?: DateTime;

	/**
	 * Maximum date allowed
	 */
	public maxDate?: DateTime;

	protected baseCls = "goui-form-field date no-floating-label";

	private readonly picker: DatePicker;

	private readonly pickerButton;
	private dayInput?: HTMLInputElement;
	private monthInput?: HTMLInputElement;
	private yearInput?: HTMLInputElement;

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
		// this.pattern = DateTime.createFormatRegex(this.inputFormat);
		// this.autocomplete = "off";
	}

	private selectNextInput(current:string) {
		const currentPos = this.inputFormat.indexOf(current);

		const dayPos = this.inputFormat.indexOf("d");
		const monthPos = this.inputFormat.indexOf("m");
		const yearPos = this.inputFormat.indexOf("Y");

		const higher = [];

		if(dayPos > currentPos) {
			higher.push(dayPos);
		}

		if(monthPos > currentPos) {
			higher.push(monthPos);
		}

		if(yearPos > currentPos) {
			higher.push(yearPos);
		}


		if(higher.length == 0) {
			return false;
		}

		higher.sort();

		switch(this.inputFormat.charAt(higher[0])) {
			case 'd':
				return this.dayInput!.select();

			case 'm':
				return this.monthInput!.select();

			case 'Y':
				return this.yearInput!.select();
		}

		return false;

	}

	protected createControl() {

		const onFocus = function(this:any) {
			this.setSelectionRange(0, this.value.length);
		};

		const onKeyDown = function(ev:KeyboardEvent){

			if(ev.key != "Tab" && ev.key != "Enter" && ev.key != "Backspace" && ev.key != "Delete" && !/^[0-9]$/i.test(ev.key)) {
				//only allow numbers
				ev.preventDefault();

				return false;
			} else
			{
				return true;
			}
		};

		const onBlur = function(this:any) {
			if (this.value.length > 0 && this.value.length < this.maxLength) {
				this.value = this.value.padStart(this.maxLength, "0")
			}

			return true;
		}

		const onMouseUp = () => false;

		this.dayInput = document.createElement("input");
		this.dayInput.classList.add("text");
		this.dayInput.classList.add("day");
		this.dayInput.type="text";
		this.dayInput.pattern = "[0-9]+";
		this.dayInput.maxLength = 2;
		this.dayInput.onfocus = onFocus;
		this.dayInput.onmouseup = onMouseUp;
		this.dayInput.placeholder = "dd";
		this.dayInput.onkeydown = onKeyDown;
		this.dayInput.autocomplete = "off";

		this.dayInput.onkeyup = ev => {

			if(!/^[0-9]$/i.test(ev.key)) {
				return;
			}

			if(this.dayInput!.value > "31") {
				this.dayInput!.value = "31";
			}

			if(this.dayInput!.value.length == 2 || this.dayInput!.value > "3") {
				this.selectNextInput("d");
			}
		}
		this.dayInput.onblur = onBlur;


		this.monthInput = document.createElement("input");
		this.monthInput.classList.add("text");
		this.monthInput.classList.add("month");
		this.monthInput.type="text";
		this.monthInput.pattern = "[0-9]+";
		this.monthInput.maxLength = 2;
		this.monthInput.max="12";
		this.monthInput.onfocus = onFocus;
		this.monthInput.onmouseup = onMouseUp;
		this.monthInput.placeholder = "mm";
		this.monthInput.onkeydown = onKeyDown;
		this.monthInput.autocomplete = "off";
		this.monthInput.onkeyup = (ev) => {

			if(!/^[0-9]$/i.test(ev.key)) {
				return;
			}

			if(this.monthInput!.value > "12") {
				this.monthInput!.value = "12";
			}

			if (this.monthInput!.value.length == 2 || this.monthInput!.value > "1") {
				this.selectNextInput("m")
			}
		};
		this.monthInput.onblur = onBlur;

		// this.monthInput.size = 2;

		this.yearInput = document.createElement("input");
		this.yearInput.classList.add("text");
		this.yearInput.classList.add("year");
		this.yearInput.type="text";
		this.yearInput.pattern = "[0-9]+";
		this.yearInput.maxLength = 4;
		this.yearInput.onfocus = onFocus;
		this.yearInput.onmouseup = onMouseUp;
		this.yearInput.placeholder = "yyyy";
		this.yearInput.autocomplete = "off";
		this.yearInput.onkeydown = onKeyDown;
		this.yearInput.onblur = onBlur;


		this.picker.on('select', (_, val) => {

			this.pickerButton.menu!.hide();
			this.clearInvalid();

			//important to set value after focus so change event will fire on focusout
			//focus is returned in {@see Field} .setupMenu()} when the picker button's menu hides.
			super.value = val.format(this.outputFormat);

			if(this.dayInput) {
				onFocus.call(this.dayInput);
			}
		});

		this.pickerButton.menu!.on("beforeshow", () => {

			this.picker.minDate = this.minDate;
			this.picker.maxDate = this.maxDate;

			const val = this.getValueAsDateTime();

			if(val)
				this.picker.setValue(val);
		})

		const ctrl = E("div").cls("goui hbox");

		for(let i = 0, l = this.inputFormat.length; i < l; i++) {
			switch(this.inputFormat.charAt(i)) {
				case 'd':
					ctrl.append(this.dayInput);
					break;

				case 'm':
					ctrl.append(this.monthInput);
					break;

				case 'Y':
					ctrl.append(this.yearInput);
					break;

				default:
					ctrl.append(this.inputFormat.charAt(i));
					break;
			}
		}

		return ctrl;
	}


	protected validate() {
		super.validate();

		// const v = super.value;
		// if(!v) {
		// 	return;
		// }
		try {
			const dateInputStr = this.yearInput!.value+this.monthInput!.value+this.dayInput!.value;
			if (!dateInputStr) {
				if(this.required) {
					this.setInvalid(t("This field is required"));
				}
			} else {
				const dv = DateTime.createFromFormat(dateInputStr , "Ymd")!;

				if(!dv || !this.dayInput!.value || !this.monthInput!.value || !this.yearInput!.value) {
					this.setInvalid(t("Please enter a valid date"))
				} else if (this.maxDate && dv.format("Ymd") > this.maxDate.format("Ymd")) {
					this.setInvalid(t("The date in this field must be before {maxDate}.").replace('{maxDate}', this.maxDate.format(this.inputFormat)));
				} else if(this.minDate && dv.getTime() < this.minDate.getTime()) {
					this.setInvalid(t("The date in this field must be after {minDate}.").replace('{minDate}', this.minDate.format(this.inputFormat)));
				}
			}

		} catch(e:any) {
			this.setInvalid(e.message);
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

	}

	protected internalSetValue(v?: string) {

		if(!this.dayInput) {
			return;
		}

		if(!v) {
			this.dayInput!.value = "";
			this.monthInput!.value = "";
			this.yearInput!.value = "";
			return;
		}

		const d = DateTime.createFromFormat(v + "", this.outputFormat);
		if (!d) {
			throw new Error("Invalid date format " + v);
		}

		this.dayInput!.value = d.format("d");
		this.monthInput!.value = d.format("m");
		this.yearInput!.value = d.format("Y");

	}

	get value() {
		let dateStr;
		if (!this.rendered) {
			dateStr = super.value;
			if(dateStr === undefined) return undefined;
		} else {
			if(!this.dayInput!.value) {
				return undefined;
			}
			const dateInputStr = this.yearInput!.value+this.monthInput!.value+this.dayInput!.value;
			const d = DateTime.createFromFormat(dateInputStr , "Ymd")!;
			if (!d) {
				return undefined;
			}
			dateStr = d.format(this.outputFormat);
		}

		if(dateStr && this.timeField) {
			dateStr += "T" + this.timeField.value;
		}

		return dateStr;
	}

	/**
	 * Get the date as DateTime object
	 */
	public getValueAsDateTime() {

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
