/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Menu } from "./Menu.js";
import { Config } from "../Observable.js";
import { ComponentEventMap } from "../Component.js";
/**
 * @inheritDoc
 */
export interface ColorMenuEventMap extends ComponentEventMap {
    /**
     * Fires when color is selected
     *
     * @param menu
     * @param color Hexadecimal color. eg. "000000"
     */
    select: {
        color: string;
    };
}
/**
 * Color menu component
 *
 * @example
 * ```
 * Button.create({
 * 	text: "Color",
 * 	menu: ColorMenu.create()
 * });
 * ```
 */
export declare class ColorMenu extends Menu<ColorMenuEventMap> {
    private _value;
    /**
     * Set color value as button text color if this menu belongs to a button
     */
    updateButton: boolean;
    protected baseCls: string;
    protected colors: string[];
    constructor();
    private static rgb2hex;
    /**
     * Color hex value eg. #000000
     */
    set value(color: string);
    get value(): string;
}
/**
 * Shorthand function to create {@link ColorMenu}
 *
 * @param config
 */
export declare const colormenu: (config?: Config<ColorMenu>) => ColorMenu;
