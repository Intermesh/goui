/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Menu} from "./Menu.js";
import {btn} from "../Button.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {t} from "../../Translate";

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
	select: {color: string}
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
export class ColorMenu extends Menu<ColorMenuEventMap> {

	private _value = ""

	/**
	 * Set color value as button text color if this menu belongs to a button
	 */
	public updateButton = true;

	protected baseCls = "goui-dropdown goui-menu-color"

	protected colors = [
		'000000', //Black
		'FFFFFF', //White
		'009BC9', //Group-Office blue
		//'243A80', //Intermesh blue
		'78A22F', //default secondary
		'FF9100',  //Default accent

		'B71C1C', 'C62828', 'D32F2F', 'E53935', 'F44336', // Red
		'880E4F', 'AD1457', 'C2185B', 'D81B60', 'E91E63', // Pink
		'4A148C', '6A1B9A', '7B1FA2', '8E24AA', '9C27B0', // Purple
		'311B92', '4527A0', '512DA8', '5E35B1', '673AB7', // Deep purple
		'1A237E', '283593', '303F9F', '3949AB', '3F51B5', // Indigo
		'0D47A1', '1565C0', '1976D2', '1E88E5', '2196F3', // Blue
		'01579B', '0277BD', '0288D1', '039BE5', '03A9F4', // Light blue
		'006064', '00838F', '0097A7', '00ACC1', '00BCD4', // Cyan
		'004D40', '00695C', '00796B', '00897B', '009688', // Teal
		'1B5E20', '2E7D32', '388E3C', '43A047', '4CAF50', // Green
		'33691E', '558B2F', '689F38', '7CB342', '8BC34A', // Light Green
		'827717', '9E9D24', 'AFB42B', 'C0CA33', 'CDDC39', // Lime
		'F57F17', 'F9A825', 'FBC02D', 'FDD835', 'FFEB3B', // Yellow
		'FF6F00', 'FF8F00', 'FFA000', 'FFB300', 'FFC107', // Amber
		'E65100', 'EF6C00', 'F57C00', 'FB8C00', 'FF9800', // Orange
		'212121', '424242', '616161', '757575', 'BDBDBD', // Grey


	]

	constructor() {
		super();
		this.items.add(btn({
			itemId: "auto",
			text: t("Auto"),
			cls: this.value == "" ? "pressed" : "",

			handler: () => {
				this.value = "";
				this.fire("select", {color: ""});
			}
		}));

		this.colors.forEach(color => {
			this.items.add(btn({
				itemId: "#" + color,
				cls: this.value == color ? 'with-icon pressed' : 'with-icon',
				listeners: {
					beforerender: ({target}) => {
						const colorDiv = document.createElement("div");
						colorDiv.style.backgroundColor = "#" + color;
						target.el.appendChild(colorDiv)
					}
				},
				handler: (btn) => {
					this.value = btn.itemId + "";
					this.fire("select", {color: this.value});
				}
			}))
		});
	}

	private static rgb2hex(str: string): string {
		const rgb = str.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
		if (!rgb) {
			return "";
		}
		return "#" + ((1 << 24) + (parseInt(rgb[1]) << 16) + (parseInt(rgb[2]) << 8) + parseInt(rgb[3])).toString(16).slice(1);
	}

	/**
	 * Color hex value eg. #000000
	 */
	set value(color: string) {
		const hex = ColorMenu.rgb2hex(color);

		if (hex) {
			color = hex.toUpperCase();
		} else {
			color = color.toUpperCase();
		}

		this._value = color;

		if (this.updateButton) {
			this.parent!.el.style.color = color;
		}

		if (!this.rendered) {
			return;
		}

		if (color == "") {
			color = "auto";
		}

		this.items.forEach((btn) => {
			// console.log(btn.itemId, color);
			btn.el.classList.toggle("pressed", btn.itemId == color);
		});
	}

	get value() {
		return this._value;
	}
}

/**
 * Shorthand function to create {@link ColorMenu}
 *
 * @param config
 */
export const colormenu = (config?: Config<ColorMenu>) => createComponent(new ColorMenu(), config);