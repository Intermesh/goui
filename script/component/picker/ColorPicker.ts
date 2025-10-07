/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Button,btn} from "../Button.js";
import {Config} from "../Observable.js";
import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {t} from "../../Translate";

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
		color: string
	}
}

/**
 * Color menu component
 */
export class ColorPicker extends Component<ColorPickerEventMap> {

	private _value = ""


	protected baseCls = "goui-menu-color"

	protected colors = [

		'E91E63', //red / pink
		'FF9800', //orange
		'FFEB3B', // Yellow
		'CDDC39', //Lime
		'2ECC71', // Green
		'009BC9', //Group-Office blue
		'E1BEE7', // Purple
		'7E5627', // Brown
		'BDBDBD', // Grey
	]

	protected moreColors = [
		'B71C1C','C62828','D32F2F','E53935','F44336','EF5350','E57373','EF9A9A','FFCDD2', // Red
		'880E4F','AD1457','C2185B','D81B60','E91E63','EC407A','F06292','F48FB1','F8BBD0', // Pink
		'4A148C','6A1B9A','7B1FA2','8E24AA','9C27B0','AB47BC','BA68C8','CE93D8','E1BEE7', // Purple
		'311B92','4527A0','512DA8','5E35B1','673AB7','7E57C2','9575CD','B39DDB','D1C4E9', // Deep purple
		'1A237E','283593','303F9F','3949AB','3F51B5','5C6BC0','7986CB','9FA8DA','C5CAE9', // Indigo
		'0D47A1','1565C0','1976D2','1E88E5','2196F3','42A5F5','64B5F6','90CAF9','BBDEFB', // Blue
		'01579B','0277BD','0288D1','039BE5','03A9F4','29B6F6','4FC3F7','81D4FA','B3E5FC', // Light blue
		'006064','00838F','0097A7','00ACC1','00BCD4','26C6DA','4DD0E1','80DEEA','B2EBF2', // Cyan
		'004D40','00695C','00796B','00897B','009688','26A69A','4DB6AC','80CBC4','B2DFDB', // Teal
		'1B5E20','2E7D32','388E3C','43A047','4CAF50','66BB6A','81C784','A5D6A7','C8E6C9', // Green
		'33691E','558B2F','689F38','7CB342','8BC34A','9CCC65','AED581','C5E1A5','DCEDC8', // Light Green
		'827717','9E9D24','AFB42B','C0CA33','CDDC39','D4E157','DCE775','E6EE9C','F0F4C3', // Lime
		'F57F17','F9A825','FBC02D','FDD835','FFEB3B','FFEE58','FFF176','FFF59D','FFF9C4', // Yellow
		'FF6F00','FF8F00','FFA000','FFB300','FFC107','FFCA28','FFD54F','FFE082','FFECB3', // Amber
		'E65100','EF6C00','F57C00','FB8C00','FF9800','FFA726','FFB74D','FFCC80','FFE0B2', // Orange
		'212121','424242','616161','757575','BDBDBD','E0E0E0','EEEEEE','F5F5F5','FFFFFF', // Grey
	]

	//picker interfae
	private moreBtn: Button;
	private autoBtn: Button;
	getText() {
		return this.value.substring(1);
	}

	setValue(val: string) {
		this.value = val;
	}

	constructor() {
		super();
		this.items.add(this.autoBtn = btn({
			itemId: "auto",
			text: t("Auto"),
			cls: this.value == "" ? "pressed" : "",

			handler: () => {
				this.value = "";
				this.fire("select", {color: ""});
			}
		}));

		this.addColorBtns(this.colors);

		this.items.add(this.moreBtn = btn({
			text: t("More"),
			handler: () => {
				this.toggleMore()
			}
		}))
	}

	public set showAuto(v:boolean) {
		this.autoBtn.hidden = !v;
	}

	public get showAuto() {
		return !this.autoBtn.hidden;
	}

	private toggleMore() {
		if(this.items.count() > 11) {
			this.showLess()
		} else {
			this.showMore()
		}
	}

	private showMore() {
		this.clearColors();
		this.addColorBtns(this.moreColors);
		this.moreBtn.text = t("Back");
	}

	private showLess() {
		this.clearColors();
		this.addColorBtns(this.colors);
		this.moreBtn.text = t("More");
	}


	private clearColors() {
		for(let i = this.items.count() - 2; i > 0; i--) {
			this.items.removeAt(i);
		}
	}

	private addColorBtns(colors:string[]) {
		this.items.insert(1,
			...colors
				.map(color => btn({
					itemId: color,
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
						this.fire("select", {color: this.value} );
					}
				})
				)
		);
	}

	private static rgb2hex(str: string): string {
		const rgb = str?.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
		if (!rgb) {
			return "";
		}
		return "#" + ((1 << 24) + (parseInt(rgb[1]) << 16) + (parseInt(rgb[2]) << 8) + parseInt(rgb[3])).toString(16).slice(1);
	}

	/**
	 * Color hex value eg. #000000
	 */
	set value(color: string) {

		const hex = ColorPicker.rgb2hex(color);

		if (hex) {
			color = hex.toUpperCase();
		} else {
			color = color ? color.toUpperCase() : '';
		}

		this._value = color;


		if (color == "") {
			color = "auto";
		}

		const toggleToMore = this.colors.indexOf(color) === -1 && this.moreColors.indexOf(color) > -1;

		if(this.items?.count() == 11) {
			if(toggleToMore) {
				this.showMore();
			}
		} else {
			if(!toggleToMore) {
				this.showLess();
			}
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
 * Shorthand function to create {@link ColorPicker}
 *
 * @param config
 */
export const colorpicker = (config?: Config<ColorPicker>) => createComponent(new ColorPicker(), config);