/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { FieldConfig, FieldValue } from "./Field.js";
import { DateTime } from "../../util";
import { InputField } from "./InputField.js";
export interface DateField {
    /**
     * The value of the date is in Y-m-d  or  Y-m-d H:i when withTime is true. {@link DateTime.format}
     * @param v
     */
    set value(v: string | undefined);
    get value(): string | undefined;
    get input(): HTMLInputElement;
}
/**
 * Date field
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 *
 * @property min The minimum value allowed. Same format as {@link DateField.value}.
 * @property max The maximum value allowed. Same format as {@link DateField.value}.
 *
 * @see Form
 */
export declare class DateField extends InputField {
    protected baseCls: string;
    protected fireChangeOnBlur: boolean;
    constructor();
    protected createInput(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    protected internalSetValue(v: FieldValue): void;
    /**
     * The minimum number allowed
     *
     * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
     *
     * @param min
     */
    set min(min: DateTime | undefined);
    get min(): DateTime | undefined;
    /**
     * The maximum number allowed
     *
     * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
     *
     * @param max
     */
    set max(max: DateTime | undefined);
    get max(): DateTime | undefined;
    /**
     * Get the date as DateTime object
     */
    getValueAsDateTime(): DateTime | undefined;
}
/**
 * Shorthand function to create {@link DateField}
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 * @param config
 */
export declare const datefield: (config?: FieldConfig<DateField>) => DateField;
