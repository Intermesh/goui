/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Config } from "../Observable.js";
import { Component, ComponentEventMap } from "../Component.js";
/**
 * @inheritDoc
 */
export interface ColorPickerEventMap extends ComponentEventMap {
    /**
     * Fires when a color is selected
     */
    select: {
        /**
         * Hexadecimal color. eg. "000000"
         */
        color: string;
    };
}
/**
 * Color menu component
 */
export declare class ColorPicker extends Component<ColorPickerEventMap> {
    private _value;
    protected baseCls: string;
    protected colors: string[];
    protected moreColors: string[];
    private moreBtn;
    private autoBtn;
    getText(): string;
    setValue(val: string): void;
    constructor();
    set showAuto(v: boolean);
    get showAuto(): boolean;
    private toggleMore;
    private showMore;
    private showLess;
    private clearColors;
    private addColorBtns;
    private static rgb2hex;
    /**
     * Color hex value eg. #000000
     */
    set value(color: string);
    get value(): string;
}
/**
 * Shorthand function to create {@link ColorPicker}
 *
 * @param config
 */
export declare const colorpicker: (config?: Config<ColorPicker>) => ColorPicker;
