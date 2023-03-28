/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, Config, createComponent} from "../Component.js";
import {root} from "../Root.js";
import {Button} from "../Button.js";


/**
 * Menu class
 *
 * Can be used as drop down menu or navigation menu.
 *
 * @example Navigation menu
 * ```typescript
 * const mainMenu = menu({cls: "main"},
 *   btn({
 *     text: "Home",
 *     route: ""
 *   }),
 *   btn({
 *     text: "Buttons",
 *     route:"buttons"
 *   }),
 *   btn({
 *     text: "Form",
 *     route:"form"
 *   }),
 *   btn({
 *     text: "Table",
 *     route:"table"
 *   }),
 *   btn({
 *     text: "Window",
 *     route:"window"
 *   })
 * );
 * ```
 *
 * @example Drop down menu inside a button
 * ```typescript
 * btn({
 * text: "Menu",
 * menu: menu({},
 *
 * 	btn({
 * 		text: "Alerts",
 * 		menu: menu({},
 * 			btn({
 * 				text: "Success",
 * 				handler: () => {
 * 					Notifier.success("That went super!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Error",
 * 				handler: () => {
 * 					Notifier.error("That went wrong!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Warning",
 * 				handler: () => {
 * 					Notifier.warning("Look out!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Notice",
 * 				handler: () => {
 * 					Notifier.notice("Heads up.")
 * 				}
 * 			})
 * 		)
 * 	});
 * ```
 */
export class Menu extends Component {

	constructor() {
		super("menu");
	}

	/**
	 * Remove menu when closed
	 */
	public removeOnClose = true;

	/**
	 * The button this menu belongs to
	 */
	public parentButton: Button | undefined;

	/**
	 * Is true when any menu is visible
	 */
	public static openedMenu?: Menu;

	protected internalRender() {
		const el = super.internalRender();

		if (this.expandLeft) {
			el.classList.add("expand-left");
		}

		if(this.parentButton) {
			el.classList.add("goui-dropdown");
			el.classList.add("goui-fade-out");
		}

		return el;
	}

	set expandLeft(expandLeft: boolean) {
		this.el.classList.add("expand-left");
	}

	get expandLeft() {
		return this.el.classList.contains("expand-left");
	}

	protected renderItem(item: Component) {

		const insertBefore = this.getInsertBefore();

		if (!insertBefore) {
			this.el.appendChild(this.wrapLI(item));
		} else {
			this.el.insertBefore(this.wrapLI(item), insertBefore);
		}
	}

	private wrapLI(item: Component) {
		const li = document.createElement("li");

		item.render(li);

		return li;
	}


	// private getOutOfBounds() {
	// 	const rect = this.el.getBoundingClientRect();
	//
	// 	return {
	// 		x:0,
	// 		y:0
	// 	}
	// }


	/**
	 * Show aligned to the given component.
	 *
	 * It will align the top left of the menu top the bottom left of the component.
	 *
	 * @todo avoid going out of the viewport
	 * @param cmp
	 */
	showFor(cmp:Component) {
		const rect = cmp.el.getBoundingClientRect();

		//must be rendered and visible to get width below
		if (!this.rendered) {
			root.items.add(this);
		}

		//show first for positioning correctly below
		this.show();

		this.showAt({
			x: this.expandLeft ? rect.right - this.width : rect.x,
			y: rect.bottom
		});

		//put back fade out class removed in mouseenter listener above
		this.el.classList.add("goui-fade-out");
	}

	/**
	 * Show menu at coordinates on the page
	 *
	 * @param coords
	 */
	showAt(coords: { x: number, y: number } | MouseEvent) {
		this.el.style.left = coords.x + "px";
		this.el.style.top = coords.y + "px";

		if (!this.parent) {
			root.items.add(this);
		}

		this.show();
		Menu.openedMenu = this;

		//hide menu when clicked elsewhere
		window.addEventListener("mousedown", (ev) => {
			this.close();
		}, {once: true});

		// stop clicks on menu from hiding menu
		this.el.addEventListener("mousedown", (ev) => {
			ev.stopPropagation();
		});
	}

	public close() {
		if (Menu.openedMenu == this) {
			Menu.openedMenu = undefined;
		}
		return this.removeOnClose ? this.remove() : this.hide();
	}

}

/**
 * Shorthand function to create {@see Menu}
 *
 * @param config
 * @param items
 */
export const menu = (config?: Config<Menu>, ...items: Component[]) => createComponent(new Menu(), config, items);
