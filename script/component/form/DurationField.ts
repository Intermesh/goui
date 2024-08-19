import {Config} from "../Observable";
import {Field, FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {DateInterval, E} from "../../util";
import {t} from "../../Translate";

/**
 * Duration field
 *
 * Represents a period of time
 */
export class DurationField extends Field {

	protected baseCls = "goui-form-field duration no-floating-label";

	private hoursInput?: HTMLInputElement;
	private minutesInput?: HTMLInputElement;

	/**
	 * Minimum allowed duration to be entered
	 */
	public min : DateInterval|undefined = undefined;

	/**
	 * Maximum allowed duration to be entered
	 */
	public max : DateInterval|undefined = undefined;

	/**
	 *
	 * @param outputFormat Format it will as value
	 *
	 * {@link DurationField.value}
	 *
	 * It can be any string format supported by {@link DateInterval.format}
	 */
	constructor(public outputFormat = "h:I") {
		super();
	}

  protected validate() {
    super.validate();

		const v = this.getValueAsDateInterval();

    if (this.max !== undefined && v.compare(this.max) == 1) {
      this.setInvalid(t("The maximum duration is {duration}").replace("{duration}", this.max.format("h:I")));
    }
    if (this.min !== undefined && v.compare(this.min) == -1) {

      this.setInvalid(t("The minimum duration is {duration}").replace("{duration}", this.min.format("h:I")));
    }
  }

	/**
	 * Get the value DateInterval object
	 */
	public getValueAsDateInterval() {
		const di = new DateInterval();
		di.hours = parseInt(this.hoursInput!.value);
		di.minutes = parseInt(this.minutesInput!.value);

		return di;
	}

	protected createControl(): HTMLElement | undefined {
		const ctrl = E("div").cls("goui hbox");


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
			switch(ev.key) {
				case "Tab":
				case "Enter":
				case "Backspace":
				case "Delete":
					return true;

				case ':':
					this.minutesInput!.focus();
					ev.preventDefault();
					break;

				default:
					if(!/^[0-9]$/i.test(ev.key)) {
						//only allow numbers
						ev.preventDefault();
					}
			}
		};


		this.hoursInput = document.createElement("input");
		this.hoursInput.classList.add("text");
		this.hoursInput.classList.add("hour");
		this.hoursInput.inputMode = "numeric";
		this.hoursInput.type = "text";
		this.hoursInput.pattern = "[0-9]+";
		this.hoursInput.onblur = onBlur;
		this.hoursInput.onfocus = onFocus;
		this.hoursInput.placeholder = "--";
		this.hoursInput.autocomplete = "off";
		this.hoursInput.onkeydown = onKeyDown;

		this.minutesInput = document.createElement("input");
		this.minutesInput.classList.add("text");
		this.minutesInput.classList.add("minute");
		this.minutesInput.inputMode = "numeric";
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

		this.hoursInput.onkeydown = onKeyDown;
		this.minutesInput.oninput = _ev => {

			if(parseInt(this.minutesInput!.value) > 59) {
				this.minutesInput!.value = "59";
			}

		}
		this.minutesInput.placeholder = "--";
		this.minutesInput.autocomplete = "off";

		ctrl.append(this.hoursInput, ":", this.minutesInput);

		return ctrl;
	}

	protected internalSetValue(v?: any) {
		if(v && this.hoursInput && this.minutesInput) {
			const dateInterval = DateInterval.createFromFormat(v, this.outputFormat);
			if (dateInterval) {
				this.hoursInput.value = dateInterval.format("h");
				this.minutesInput.value = dateInterval.format("I");
			} else {
				this.minutesInput.value = "00";
			}
		}
	}

	protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined {
		if(!this.hoursInput!.value) {
			return undefined;
		}

		const dateInterval = new DateInterval();
		dateInterval.hours = parseInt(this.hoursInput!.value);
		dateInterval.minutes = parseInt(this.minutesInput!.value);
		return dateInterval.format(this.outputFormat);
	}
}

export const durationfield = (config?: Config<DurationField, FieldEventMap<DurationField>>) => createComponent(new DurationField(config?.outputFormat ?? "h:I"), config);