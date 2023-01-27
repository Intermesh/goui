import {TextField} from "./TextField.js";
import {DateTime} from "../../util/DateTime.js";
import {Config, createComponent} from "../Component.js";
import {pickerbutton} from "../picker/PickerButton.js";
import {datepicker, DatePicker} from "../picker/DatePicker.js";
import {E} from "../../util/Element.js";


/**
 * Date field
 *
 * @see Form
 */
export class DateField extends TextField {

	inputFormat = "d-m-Y";
	outputFormat = "Y-m-d";

	date?: DateTime

	timefield?: TextField

	picker: DatePicker

	constructor() {
		super();
		this.picker = datepicker({showWeekNbs:false});
		this.buttons = [pickerbutton({picker:this.picker})]
		this.pattern = DateTime.createFormatRegex(this.inputFormat);
		this.title = "Incorrect date format";
	}

	protected createControl() {
		const input = super.createControl();
		this.picker.on('select', (_,val) => {
			this.date = val;
			super.value = val.format(this.inputFormat);
		});
		// this.on('setvalue', (_,val) => {
		// 	this.picker.setValue(val);
		// })
		return input;
	}

	protected validate() {
		super.validate();

		const v = super.value;
		if (v && !DateTime.createFromFormat(v, this.inputFormat)) {
			this.setInvalid("Incorrect date format");
		}

	}

	set value(v: string  | undefined) {
		if(v === undefined) {
			if(this.timefield)
				this.timefield.value = '';
			super.value = '';
			return;
		}
		// if(v instanceof DateTime) { // from datepicker
		// 	v = v.format(this.inputFormat);
		// }
		const [date ,time] = v.split('T');
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
		let v = super.value,
			timeFormat ='';
		if(this.timefield) {
			v += 'T'+this.timefield.value;
			timeFormat = 'TH:i';
		}
		let date;
		if (!v || !(date = DateTime.createFromFormat(v, this.inputFormat+timeFormat))) {
			return undefined;
		}

		return date.format(this.outputFormat+timeFormat);
	}


}

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const datefield = (config?: Config<DateField>) => createComponent(new DateField(), config);