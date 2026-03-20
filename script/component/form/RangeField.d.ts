/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Joachim van de Haterd <jhaterd@intermesh.nl>
 */
import { FieldConfig } from "./Field.js";
import { InputField } from "./InputField";
export declare class RangeField extends InputField {
    protected baseCls: string;
    constructor();
    /**
     * The step attribute is a number that specifies the granularity that the value must adhere to or the keyword any.
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step
     * @param step
     */
    set step(step: number | undefined | "any");
    get step(): number | undefined | "any";
    /**
     * Set the number of decimals. It uses the step attribute to accomplish this.
     *
     * @param decimals
     */
    set decimals(decimals: number | undefined);
    get decimals(): number | undefined;
    /**
     * The minimum number allowed
     *
     * @param min
     */
    set min(min: number | undefined);
    get min(): number | undefined;
    /**
     * The maximum number allowed
     *
     * @param max
     */
    set max(max: number | undefined);
    get max(): number | undefined;
}
export declare const rangefield: (config?: FieldConfig<RangeField>) => RangeField;
