import {TextField, TextFieldConfig} from "./TextField.js";
import {DateTime} from "../../util/DateTime.js";
import {Observable} from "../Observable.js";

/**
 * @inheritDoc
 */
export interface DateFieldConfig<T extends Observable> extends TextFieldConfig<T> {

}

/**
 * Date field
 *
 * @see Form
 */
export class DateField extends TextField {

	protected inputFormat = "d-m-Y"
	protected outputFormat = "Y-m-d"

	init() {
		super.init();

		this.pattern = DateTime.createFormatRegex(this.inputFormat);
		this.title = "Incorrect date format";
	}

	protected validate() {
		super.validate();

		const v = super.getValue();
		if(v && !DateTime.createFromFormat(v, this.inputFormat)) {
			this.setInvalid("Incorrect date format");
		}

	}

	setValue(v: string, useForReset = true) {

		const d = DateTime.createFromFormat(v, this.outputFormat);

		if(!d) {
			throw new Error("Invalid date format " + v);
		}else
		{
			super.setValue(d.format(this.inputFormat), useForReset);
		}

	}

	getValue(): string | undefined {
		const v = super.getValue();
		let date;
		if(!v || !(date = DateTime.createFromFormat(v, this.inputFormat))) {
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
export const datefield = (config?:DateFieldConfig<DateField>) => DateField.create(config);