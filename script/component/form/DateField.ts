import {TextField} from "./TextField.js";
import {DateTime} from "../../util/DateTime.js";
import {Config} from "../Observable.js";
import {CheckboxField} from "./CheckboxField.js";


/**
 * Date field
 *
 * @see Form
 */
export class DateField extends TextField {

	protected inputFormat = "d-m-Y";
	protected outputFormat = "Y-m-d";


	constructor() {
		super();

		this.pattern = DateTime.createFormatRegex(this.inputFormat);
		this.title = "Incorrect date format";
	}

	protected validate() {
		super.validate();

		const v = super.value;
		if (v && !DateTime.createFromFormat(v, this.inputFormat)) {
			this.setInvalid("Incorrect date format");
		}

	}

	set value(v: string | undefined) {

		const d = DateTime.createFromFormat(v + "", this.outputFormat);

		if (!d) {
			throw new Error("Invalid date format " + v);
		} else {
			super.value = d.format(this.inputFormat);
		}

	}

	get value(): string | undefined {
		const v = super.value;
		let date;
		if (!v || !(date = DateTime.createFromFormat(v, this.inputFormat))) {
			return undefined;
		}

		return date.format(this.outputFormat);
	}


}

/**
 * Shorthand function to create {@see DateField}
 *
 * @param config
 */
export const datefield = (config?: Config<DateField>) => Object.assign(new DateField(), config);