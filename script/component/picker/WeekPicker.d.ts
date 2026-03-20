/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2024 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "../Component.js";
import { DateTime } from "../../util";
import { Config } from "../Observable.js";
export interface WeekPickerEventMap extends ComponentEventMap {
    /**
     * Fires when a week is selected
     */
    select: {
        /**
         * The selected start date of the week
         */
        date: DateTime;
    };
}
/**
 * Week picker
 *
 * Select a week of the year
 */
export declare class WeekPicker extends Component<WeekPickerEventMap> {
    private _value;
    private now;
    protected baseCls: string;
    private yearField;
    private weekMenu;
    constructor();
    set value(v: DateTime);
    get value(): DateTime;
    private changeYear;
}
/**
 * Create a {@link WeekPicker}
 *
 * Can select a week of the year
 *
 * @link https://goui.io/#datepicker Example
 *
 * @param config
 */
export declare const weekpicker: (config?: Config<WeekPicker>) => WeekPicker;
