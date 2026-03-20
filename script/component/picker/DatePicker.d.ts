/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import { Component, ComponentEventMap } from "../Component.js";
import { DateTime } from "../../util/DateTime.js";
import { Config } from "../Observable.js";
/**
 * @inheritDoc
 */
export interface DatePickerEventMap extends ComponentEventMap {
    /**
     * Fires when a date is selected
     */
    'select': {
        /**
         * The selected date
         */
        date: DateTime | undefined;
    };
    /**
     * Fires when a range is selected
     */
    'select-range': {
        start: DateTime | undefined;
        end: DateTime | undefined;
    };
}
export declare class DatePicker extends Component<DatePickerEventMap> {
    showWeekNbs: boolean;
    value: DateTime;
    private now;
    enableRangeSelect: boolean;
    protected baseCls: string;
    protected monthEl: HTMLButtonElement;
    protected yearEl: HTMLButtonElement;
    protected years: HTMLElement;
    protected months: HTMLElement;
    protected grid: HTMLElement;
    protected menu: HTMLElement;
    minDate?: DateTime;
    maxDate?: DateTime;
    /**
     * Used to determine if a refresh() is needed when new value is set.
     * @private
     */
    private renderedMonth?;
    constructor();
    moveMonth(amount: number): void;
    /**
     * Refresh the view
     */
    refresh(): void;
    private constrainValue;
    private setYearClasses;
    private setMonthClasses;
    protected internalRender(): HTMLElement;
    setValue(start: DateTime, end?: DateTime): void;
    private markSelected;
    private setupDraggability;
}
/**
 * Create a {@link DatePicker} component
 *
 * @link https://goui.io/#datepicker Example
 *
 * @param config
 */
export declare const datepicker: (config?: Config<DatePicker>) => DatePicker;
