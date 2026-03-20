/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2024 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "../Component.js";
import { DateTime } from "../../util";
import { Config } from "../Observable.js";
export interface MonthPickerEventMap extends ComponentEventMap {
    /**
     * Fires when a Month is selected
     */
    select: {
        /**
         * The selected start date of the month
         */
        date: DateTime;
    };
}
/**
 * Month picker
 *
 * Select a Month of the year
 *
 * @link https://goui.io/#datepicker Example
 */
export declare class MonthPicker extends Component<MonthPickerEventMap> {
    private _value;
    private now;
    protected baseCls: string;
    private yearField;
    private monthMenu;
    constructor();
    set value(v: DateTime);
    get value(): DateTime;
    private changeYear;
}
/**
 * Create a {@link MonthPicker}
 *
 * Can select a Month of the year
 *
 * @link https://goui.io/#datepicker Example
 *
 * @param config
 */
export declare const monthpicker: (config?: Config<MonthPicker>) => MonthPicker;
