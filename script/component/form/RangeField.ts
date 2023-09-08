/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Joachim van de Haterd <jhaterd@intermesh.nl>
 */

import {TextField, TextFieldType} from "./TextField.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable";
import {FieldEventMap} from "./Field";

export class RangeField extends TextField {

    public type: TextFieldType = "range" as TextFieldType;

    decimals: number = 0;
    min: number = 0;
    max: number = 100;

    protected validate() {
        super.validate();
        const v = super.value;
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
        if (isNaN(v!)) {
            throw new Error("Invalid number");
        } else if (v) {
            super.value = +v.toFixed(this.decimals);
        }

    }

    get value(): number | undefined {
        const v = super.value;
        return (v === undefined || isNaN(v)) ? undefined : +(+v).toFixed(this.decimals);
    }

    protected createControl(): undefined | HTMLElement {
        super.createControl();
        this.el.cls('+range')
        // this._input!.attr('type','number');
        if (this.min !== undefined) {
            this._input!.attr('min', this.min);
        }
        if (this.max !== undefined) {
            this._input!.attr('max', this.max);
        }
        if(this.decimals) {
            this._input!.attr('step', '0.'.padEnd(this.decimals + 1, "0") + "1")
        }
        return this._input;
    }
}

export const rangefield = (config?: Config<RangeField, FieldEventMap<RangeField>>) => createComponent(new RangeField(), config);