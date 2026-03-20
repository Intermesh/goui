import { Field, FieldConfig } from "./Field.js";
/**
 * Date range field
 *
 * Used to select a date range. The value format is:
 *
 * "YYYY-MM-DD..YYYY-MM-DD"
 *
 * @link https://goui.io/#form/DateTime Example
 */
export declare class DateRangeField extends Field {
    private button;
    private startPicker;
    private endPicker;
    private static f;
    private valueDisplay;
    private fromPicker;
    private untilPicker;
    constructor();
    protected get itemContainerEl(): HTMLElement;
    setToday(): void;
    setYesterday(): void;
    setThisWeek(): void;
    setLastWeek(): void;
    private createButton;
    protected internalSetValue(v?: any): void;
    /**
     * Set the month
     *
     * @param month 1 - 12
     * @param year eg. 2024
     * @private
     */
    setMonth(month?: number, year?: number): void;
    /**
     * Set the year
     *
     * @param year eg. 2024
     * @private
     */
    setYear(year?: number): void;
    setQuarter(q: number, year?: number): void;
    private yearsMenu;
}
/**
 * Shorthand function to create {@link DateRangeField}
 *
 * @link https://goui.io/#form/DateTime Example
 *
 * @param config
 */
export declare const daterangefield: (config?: FieldConfig<DateRangeField>) => DateRangeField;
