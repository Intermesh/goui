import {TextField, TextFieldType} from "./TextField";
import {Config} from "../Observable";
import {Field, FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {DateTime, E} from "../../util";

export class TimeField extends Field {


	private static inputFormat = "h:i:a";
	private static outputFormat = "H:i";

	public input12hr = true;

	private hoursInput?: HTMLInputElement;
	private minutesInput?: HTMLInputElement;

	protected baseCls = "goui-form-field date no-floating-label";
	private AMPMInput?: HTMLSelectElement;

	public getValueAsDateTime() {
		return DateTime.createFromFormat(this.value, TimeField.outputFormat);
	}

	protected createControl(): HTMLElement | undefined {
		const ctrl = E("div").cls("goui hbox");

		const onBlur = function(this:any) {
			this.value = this.value.padStart(2, "0")
			return true;
		}

		this.hoursInput = document.createElement("input");
		this.hoursInput.classList.add("text");
		this.hoursInput.classList.add("hours");
		this.hoursInput.type = "text";
		this.hoursInput.pattern = "[0-9]+";
		this.hoursInput.maxLength = 2;
		this.hoursInput.onblur = onBlur;
		// this.hoursInput.onfocus = onFocus;
		// this.hoursInput.onmouseup = onMouseUp;
		this.hoursInput.placeholder = "HH";
		this.hoursInput.autocomplete = "off";

		this.minutesInput = document.createElement("input");
		this.minutesInput.classList.add("text");
		this.minutesInput.classList.add("hours");
		this.minutesInput.type = "text";
		this.minutesInput.pattern = "[0-9]+";
		this.minutesInput.maxLength = 2;
		this.minutesInput.onblur = onBlur;
		// this.hoursInput.onfocus = onFocus;
		// this.hoursInput.onmouseup = onMouseUp;
		this.minutesInput.placeholder = "MM";
		this.minutesInput.autocomplete = "off";

		ctrl.append(this.hoursInput, this.minutesInput);

		if(this.input12hr) {
			this.AMPMInput = document.createElement("select");

			const amOpt = new Option();
			amOpt.value = "am";
			amOpt.innerHTML = "am";
			amOpt.selected = true;
			this.AMPMInput.appendChild(amOpt);

			const pmOpt = new Option();
			pmOpt.value = "pm";
			pmOpt.innerHTML = "pm";
			this.AMPMInput.appendChild(pmOpt);

			ctrl.append(this.AMPMInput);
		}

		return ctrl;
	}

	set value(v: any) {
		super.value = v;
	}

	get value(): any {
		if(this.hoursInput && this.minutesInput) {

			if(!this.hoursInput.value) {
				return undefined;
			}

			let hours = parseInt(this.hoursInput.value);
			if(this.input12hr && this.AMPMInput!.value == "pm") {
				hours *= 2;
			}

			return hours.toString().padStart(2, "0") + ":" + (this.minutesInput.value ?? "0").padStart(2, "0");
		} else {
			return super.value;
		}
	}
}


/**
 * Shorthand function to create {@see TextField}
 *
 * @param config
 */
export const timefield = (config?: Config<TimeField, FieldEventMap<TextField>>) => createComponent(new TimeField(), config);