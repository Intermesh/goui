import {TextField, TextFieldType} from "./TextField";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {Format} from "../../util";
import {DateInterval} from "../../util/DateInterval";

export class DurationField extends TextField {

    public type: TextFieldType = "time";

    interval?: number;
    // min: number = 0;
    // max: number = 1440;

    inMinutes: boolean = true;

		private dateInterval?: DateInterval;

    // protected validate() {
    //     super.validate();
    //     const v = Format.minutes(super.value);
    //     if (v && isNaN(v)) {
    //         this.setInvalid("Incorrect number format");
    //     }
    //     if (this.max !== undefined && v > this.max) {
    //         this.setInvalid("Number is too big");
    //     }
    //     if (this.min !== undefined && v < this.min) {
    //         this.setInvalid("Number is too small");
    //     }
    // }

    set value(v: string | undefined) {
       if(!v) {
				 super.value = v;
       } else {
				 this.dateInterval = new DateInterval(v);
       }

    }

    get value(): string | undefined {

	    this.dateInterval ??= new DateInterval();

	    const parts = super.value.split(':');

			this.dateInterval.hours = parseInt(parts[0]);
	    this.dateInterval.minutes = parseInt(parts[1]);

	    return this.dateInterval?.toString();
    }
		//
    // protected createControl(): undefined | HTMLElement {
    //     const v = this.value,
    //         name = this.name;
		//
    //     this._input = document.createElement("input");
    //     this._input.classList.add("text");
    //     this._input.type = "time";
		//
    //     this._input.required = this.required;
    //     if (name) {
    //         this._input.name = name;
    //     }
    //     this._input.readOnly = this.readOnly;
		//
    //     if (this.title) {
    //         this._input.title = this.title;
    //     }
		//
    //     if (this.invalidMsg) {
    //         this.applyInvalidMsg();
    //     }
		//
    //     if (this.min !== undefined) {
    //         this._input!.attr('min', this.min);
    //     }
    //     if (this.max !== undefined) {
    //         this._input!.attr('max', this.max);
    //     }
    //     if(this.interval) {
    //         this._input!.attr('step', this.interval);
    //     }
    //     if(v!==undefined) {
    //         this._input!.attr('value', Format.duration(v, true));
    //     }
		//
		//
    //     return this._input;
    // }
}

export const durationfield = (config?: Config<DurationField, FieldEventMap<DurationField>>) => createComponent(new DurationField(), config);