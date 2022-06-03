import {Menu} from "./Menu.js";
import {Button} from "../Button.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {ComponentConfig, ComponentEventMap} from "../Component.js";

/**
 * @inheritDoc
 */
export interface ColorMenuEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires when color is selected
	 *
	 * @param menu
	 * @param color Hexadecimal color. eg. "000000"
	 */
	select?: (menu: T, color: string) => void
}

export interface ColorMenu {
	on<K extends keyof ColorMenuEventMap<ColorMenu>>(eventName: K, listener: ColorMenuEventMap<ColorMenu>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof ColorMenuEventMap<ColorMenu>>(eventName: K, ...args: Parameters<NonNullable<ColorMenuEventMap<ColorMenu>[K]>>): boolean
}

/**
 * @inheritDoc
 */
export interface ColorMenuConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * Color hex value eg. #000000
	 */
	value?: string,
	/**
	 * Set color value as button text color if this menu belongs to a button
	 */
	updateButton?:boolean,

	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ColorMenuEventMap<T>>
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
export class ColorMenu extends Menu {

	protected value = ""

	protected updateButton = true;

	protected baseCls = "dropdown menu-color"

	protected colors = [
		'000000', //Black
		'FFFFFF', //White
		'009BC9', //Group-Office blue
		//'243A80', //Intermesh blue
		'78A22F', //default secondary
		'FF9100',  //Default accent

		'B71C1C','C62828','D32F2F','E53935','F44336', // Red
		'880E4F','AD1457','C2185B','D81B60','E91E63', // Pink
		'4A148C','6A1B9A','7B1FA2','8E24AA','9C27B0', // Purple
		'311B92','4527A0','512DA8','5E35B1','673AB7', // Deep purple
		'1A237E','283593','303F9F','3949AB','3F51B5', // Indigo
		'0D47A1','1565C0','1976D2','1E88E5','2196F3', // Blue
		'01579B','0277BD','0288D1','039BE5','03A9F4', // Light blue
		'006064','00838F','0097A7','00ACC1','00BCD4', // Cyan
		'004D40','00695C','00796B','00897B','009688', // Teal
		'1B5E20','2E7D32','388E3C','43A047','4CAF50', // Green
		'33691E','558B2F','689F38','7CB342','8BC34A', // Light Green
		'827717','9E9D24','AFB42B','C0CA33','CDDC39', // Lime
		'F57F17','F9A825','FBC02D','FDD835','FFEB3B', // Yellow
		'FF6F00','FF8F00','FFA000','FFB300','FFC107', // Amber
		'E65100','EF6C00','F57C00','FB8C00','FF9800', // Orange
		'212121','424242','616161','757575','BDBDBD', // Grey


	]
	//whites = ['fff', 'f4f2ef', 'a1a8ab', '535f65', '000']


	public static create<T extends typeof Observable>(this: T, config?: ColorMenuConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected init() {


		this.getItems().add(Button.create({
			itemId: "auto",
			text: "Auto",
			cls: this.value == "" ? "pressed" : "",

			handler: () => {
				this.setValue("");
				this.fire("select", this, "");
			}
		}));

		this.colors.forEach(color => {
			this.getItems().add(Button.create({
				itemId: "#" + color,
				cls: this.value == color ? 'with-icon pressed' : 'with-icon',
				html: `<div style="background-color: #${color}"></div>`,
				handler: (btn) => {
					this.setValue(btn.itemId);
					this.fire("select", this, btn.itemId);
				}
			}))
		});

		super.init();
	}

	private static rgb2hex(str: string): string {
		const rgb = str.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
		if(!rgb) {
			return "";
		}
		return "#" + ((1 << 24) + (parseInt(rgb[1]) << 16) + (parseInt(rgb[2]) << 8) + parseInt(rgb[3])).toString(16).slice(1);
	}

	setValue(color:string) {
		const hex = ColorMenu.rgb2hex(color);

		if(hex) {
			color = hex.toUpperCase();
		} else
		{
			color = color.toUpperCase();
		}

		this.value = color;

		if(this.updateButton && this.parentButton) {
			this.parentButton.getStyle().color = color;
		}

		if(!this.isRendered()) {
			return;
		}

		if(color == "") {
			color = "auto";
		}

		this.getItems().forEach((btn) => {
			// console.log(btn.itemId, color);
			btn.getEl().classList.toggle("pressed", btn.itemId == color);
		});
	}

	getValue() {
		return this.value;
	}
}