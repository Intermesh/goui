import {TextField, TextFieldType} from "./TextField";
import {Config} from "../Observable";
import {Field, FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {DateTime, E} from "../../util";

export class TimeField extends Field {

	public input12hr = false;

	private hoursInput?: HTMLInputElement;
	private minutesInput?: HTMLInputElement;

	protected baseCls = "goui-form-field time no-floating-label";
	private AMPMInput?: HTMLSelectElement;

	public getValueAsDateTime() {
		return DateTime.createFromFormat(this.value, "H:i");
	}

	protected createControl(): HTMLElement | undefined {
		const ctrl = E("div").cls("goui hbox");

		if(this.input12hr) {
			this.el.classList.add('input12hr');
		}

		const onBlur = function(this:any) {
			if(!this.value) {
				return;
			}
			this.value = this.value.padStart(2, "0")
			return true;
		}

		const onFocus = function(this:any) {
			this.setSelectionRange(0, this.value.length);
		};

		const onKeyDown = (ev:KeyboardEvent) => {
			if(ev.key != "Tab" && ev.key != "Delete" && ev.key != "Backspace" && ev.key != "Enter" && !/^[0-9]$/i.test(ev.key)) {
				ev.preventDefault();
			}
		}

		this.hoursInput = document.createElement("input");
		this.hoursInput.classList.add("text");
		this.hoursInput.classList.add("hour");
		this.hoursInput.type = "text";
		this.hoursInput.pattern = "[0-9]+";
		this.hoursInput.maxLength = 2;
		this.hoursInput.onblur = onBlur;
		this.hoursInput.onfocus = onFocus;
		// this.hoursInput.onmouseup = onMouseUp;
		this.hoursInput.placeholder = "--";
		this.hoursInput.autocomplete = "off";

		this.hoursInput.onkeydown =onKeyDown

		this.hoursInput.oninput = ev => {

			const max = this.input12hr ? 11 : 23;

			if(parseInt(this.hoursInput!.value) > max) {
				this.hoursInput!.value = max.toString();
				this.hoursInput!.setSelectionRange(0,2);
			} else {

				if (this.hoursInput!.value.length == 2) {
					console.warn(this.hoursInput!.value);
					this.minutesInput!.focus();
				}
			}
		}

		this.minutesInput = document.createElement("input");
		this.minutesInput.classList.add("text");
		this.minutesInput.classList.add("minute");
		this.minutesInput.type = "text";
		this.minutesInput.pattern = "[0-9]+";
		this.minutesInput.maxLength = 2;
		const hoursInput = this.hoursInput!;
		this.minutesInput.onblur = function(this:any) {
			onBlur.call(this);
			if(!this.value && hoursInput.value) {
				this.value = "00";
			}
		};
		this.minutesInput.onfocus = onFocus;
		this.minutesInput.onkeydown = onKeyDown;

		this.minutesInput.oninput = ev => {

			if(parseInt(this.minutesInput!.value) > 59) {
				this.minutesInput!.value = "59";
			}

			if(this.input12hr && this.minutesInput!.value.length == 2) {
				this.AMPMInput!.focus();
			}

		}
		this.minutesInput.placeholder = "--";
		this.minutesInput.autocomplete = "off";

		ctrl.append(this.hoursInput, ":", this.minutesInput);

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



	protected internalSetValue(v?: any) {

		if(v && this.hoursInput && this.minutesInput) {
			const parts = v.split(":");
			if (this.input12hr) {
				let hours = parts[0];
				if (hours > "12") {
					this.AMPMInput!.value = "pm";
					hours -= 12;
				}
				this.hoursInput.value = hours.toString().padStart(2, "0");

			} else {
				this.hoursInput.value = parts[0].padStart(2, "0");
			}

			if (parts[1]) {
				this.minutesInput.value = parts[1].padStart(2, "0");
			} else {
				this.minutesInput.value = "00";
			}
		}
	}

	set value(v: any) {
		super.value = v;
	}

	get value(): any {
		if(this.rendered) {

			if(!this.hoursInput!.value) {
				return undefined;
			}

			let hours = parseInt(this.hoursInput!.value);

			if(this.input12hr && this.AMPMInput!.value == "pm") {
				hours += 12;
			}

			return hours.toString().padStart(2, "0") + ":" + (this.minutesInput!.value ?? "0").padStart(2, "0");
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