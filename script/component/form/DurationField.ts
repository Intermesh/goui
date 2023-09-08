import {TextField, TextFieldType} from "./TextField";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";
import {createComponent} from "../Component";
import {Format} from "../../util";

export class DurationField extends TextField {

    public type: TextFieldType = "time" as TextFieldType;

    interval?: number;
    min: number = 0;
    max: number = 1440;

    inMinutes: boolean = true;

    protected validate() {
        super.validate();
        const v = Format.minutes(super.value);
        if (v && isNaN(v)) {
            this.setInvalid("Incorrect number format");
        }
        if (this.max !== undefined && v > this.max) {
            this.setInvalid("Number is too big");
        }
        if (this.min !== undefined && v < this.min) {
            this.setInvalid("Number is too small");
        }
    }

    set value(v: number | undefined) {
        if (v && isNaN(v!)) {
            throw new Error("Invalid number");
        } else if (v) {
            super.value = Format.duration(v, true);
        }

    }

    get value(): number | undefined {
        const v = super.value;
        if(typeof v === "string") {
            return Format.minutes(v);
        }
        return v;
    }

    protected createControl(): undefined | HTMLElement {
        const v = this.value,
            name = this.name;

        this._input = document.createElement("input");
        this._input.classList.add("text");
        this._input.type = "time";

        this._input.required = this.required;
        if (name) {
            this._input.name = name;
        }
        this._input.readOnly = this.readOnly;

        if (this.title) {
            this._input.title = this.title;
        }

        this._input.addEventListener("change", this.onInputChange);

        if (this.invalidMsg) {
            this.applyInvalidMsg();
        }

        if (this.min !== undefined) {
            this._input!.attr('min', this.min);
        }
        if (this.max !== undefined) {
            this._input!.attr('max', this.max);
        }
        if(this.interval) {
            this._input!.attr('step', this.interval);
        }
        if(v!==undefined) {
            this._input!.attr('value', Format.duration(v, true));
        }


        return this._input;
    }
}

export const durationfield = (config?: Config<DurationField, FieldEventMap<DurationField>>) => createComponent(new DurationField(), config);