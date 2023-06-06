/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "../Component.js";
import {root} from "../Root.js";
import {Button} from "../Button.js";
import {Toolbar} from "../Toolbar.js";
import {Config} from "../Observable";


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
export class Menu extends Toolbar {

	constructor() {
		super();
		this.baseCls = "";
		this.orientation = "vertical";
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

		if (this.parentButton) {
			el.classList.add("goui-dropdown");
			el.classList.add("goui-fade-out");
		}

		this.el.addEventListener('keydown', (ev) => {
			switch ((ev as KeyboardEvent).key) {

				case 'Escape':
					this.close();
					ev.stopPropagation();
					ev.preventDefault();
					break;
			}
		});

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

	public alignEl?: HTMLElement;


	/**
	 * Show aligned to the given component.
	 *
	 * It will align the top left of the menu top the bottom left of the component. It will also be at least as wide as
	 * the given component by setting the min-width style.
	 *
	 * @todo avoid going out of the viewport
	 * @param cmp
	 */
	showFor(alignEl: HTMLElement) {
		const rect = alignEl.getBoundingClientRect();

		//must be rendered and visible to get width below
		if (!this.rendered) {
			this.renderMenu();
		}

		//show first for positioning correctly below
		this.show();

		// make the menu at least as wide as the component it aligns too.
		this.el.style.minWidth = rect.width + "px";

		this.showAt({
			x: this.expandLeft ? rect.right - this.width : rect.x,
			y: rect.bottom
		});

		//put back fade out class removed in mouseenter listener above
		this.el.classList.add("goui-fade-out");
	}

	private renderMenu() {
		this.hidden = true;

		// if this menu belongs to a button we set the parent to the button even though it's rendered to the
		// root element of goui. This way we can easily find the parents from menu's and it's children (pickers)
		// using {@see Component.findAncestor()};
		if(this.parentButton) {
			this.on("added", comp => {
				comp.parent =this.parentButton
			}, {once: true})
		}

		root.items.add(this);


	}

	/**
	 * Show menu at coordinates on the page
	 *
	 * @param coords
	 */
	showAt(coords: { x: number, y: number } | MouseEvent) {
		this.el.style.left = coords.x + "px";
		this.el.style.top = coords.y + "px";

		if (!this.rendered) {
			this.renderMenu();
		}

		if(Menu.openedMenu == this) {
			return;
		}

		this.show();

		if (Menu.openedMenu) {
			Menu.openedMenu.el.classList.remove("goui-fade-out");
			Menu.openedMenu.close();
		}

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
