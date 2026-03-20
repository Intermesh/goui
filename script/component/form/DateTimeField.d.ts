import { Field, FieldConfig } from "./Field";
import { DateTime } from "../../util/index";
/**
 * DateTimeField class
 *
 * @link https://goui.io/#form/DateTime Examples
 */
export declare class DateTimeField extends Field {
    private dateField;
    private timeField;
    _max?: DateTime;
    _min?: DateTime;
    constructor();
    protected get itemContainerEl(): HTMLDivElement;
    /**
     * The maximum number allowed
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
    protected validate(): void;
    get withTime(): boolean;
    /**
     * Also render time input
     *
     * @param withTime
     */
    set withTime(withTime: boolean);
    /**
     * When switching the "withTime" property, this default time will be used.
     *
     * Use "H:i" format see {@link DateTime.format}
     */
    defaultTime?: string;
    /**
     * Include timezone information in the value submitted
     */
    withTimeZone: boolean;
    protected outputFormat(): string;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | null | undefined;
    /**
     * Get the date as DateTime object
     */
    getValueAsDateTime(): DateTime | undefined;
    protected eventTargetIsInFocus(e: FocusEvent): boolean;
}
/**
 * Shorthand function to create {@link DateTimeField}
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 * @param config
 */
export declare const datetimefield: (config?: FieldConfig<DateTimeField>) => DateTimeField;
