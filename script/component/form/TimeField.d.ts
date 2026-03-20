import { Field, FieldConfig } from "./Field.js";
import { DateTime } from "../../util/index.js";
import { Button } from "../Button.js";
export interface TimeField {
    get input(): HTMLInputElement;
}
/**
 * TimeField component
 *
 * Time input based on the browser's locale.
 *
 * @property value Outputs time in "H:i" format. eg. 09:30 or 15:30 {@link DateTime.format}
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
 */
export declare class TimeField extends Field {
    protected baseCls: string;
    private hoursInput?;
    private minutesInput?;
    private amPm?;
    readonly menuBtn: Button;
    /**
     * TimeField constructor
     */
    constructor();
    /**
     * Use 12h or 24h format. Defaults to the system settings.
     * @param twelveHour
     */
    set twelveHour(twelveHour: boolean);
    /**
     * Use 12h or 24h format. Defaults to the system settings.
     */
    get twelveHour(): boolean;
    protected createControl(): HTMLElement | undefined;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): string | undefined;
    private createMenu;
    set step(v: number);
    get step(): number;
    /**
     * The minimum number allowed
     *
     * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
     *
     * @param min
     */
    min: string | undefined;
    /**
     * The maximum number allowed
     *
     * The value of the time input is always in 24-hour format that includes leading zeros: hh:mm
     *
     * @param max
     */
    max: string | undefined;
    /**
     * Get the date as DateTime object
     */
    getValueAsDateTime(): DateTime | undefined;
    set value(v: string | undefined);
    get value(): string | undefined;
    protected eventTargetIsInFocus(e: FocusEvent): boolean;
}
/**
 * Creates a {@link TimeField}
 *
 * @link https://goui.io/#form/DateTime Examples
 *
 * @param config
 */
export declare const timefield: (config?: FieldConfig<TimeField>) => TimeField;
