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
import HTML = Mocha.reporters.HTML;


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
	 * Align the menu to this element
	 */
	public alignTo?: HTMLElement;

	/**
	 * Make the menu at least as wide as the component it aligns too.
	 */
	public alignToInheritWidth = false;

	/**
	 * @inheritDoc
	 */
	public renderTo? = root.el;

	/**
	 * Remove menu when closed
	 */
	public removeOnClose = true;

	/**
	 * Is set to the menu currently open. There can only be one dropdown open at the same time
	 */
	public static openedMenu?: Menu;

	protected internalRender() {
		const el = super.internalRender();

		this.el.addEventListener('keydown', (ev) => {
			switch ((ev as KeyboardEvent).key) {

				case 'Escape':
					this.close();
					ev.stopPropagation();
					ev.preventDefault();
					break;
			}
		});

		const onClose = () => {
			if (Menu.openedMenu == this) {
				Menu.openedMenu = undefined;
			}
		}

		this.on("hide", onClose);
		this.on("remove", onClose);
		return el;
	}

	/**
	 * Menu can be rendered as a component in the normal flow or as a
	 * floating dropdown.
	 *
	 * @param value
	 */
	public set isDropdown(value: boolean) {
		this.el.classList.toggle("goui-dropdown", value);
		this.el.classList.toggle("goui-fade-out", value);
	}

	public get isDropdown() {
		return this.el.classList.contains("goui-dropdown");
	}

	/**
	 * Expand menu on the left side of the parent button
	 * @param expandLeft
	 */
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

		if(item instanceof Button && item.menu) {
			item.menu!.render(li);
		}

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

		this.alignTo = alignEl;

		//show first for positioning correctly below
		this.show();
	}

	private setAlignTo() {
		if(!this.alignTo) {
			return;
		}
		const rect = this.alignTo.getBoundingClientRect();

		this.x = this.expandLeft ? rect.right - this.width : rect.x;
		this.y = rect.bottom;

		if(this.alignToInheritWidth) {
			// make the menu at least as wide as the component it aligns too.
			this.el.style.minWidth = rect.width + "px";
		}
	}

	/**
	 * Set X coordinate
	 *
	 * @param x
	 */
	public set x(x:number) {
		this.el.style.left = x + "px";
	}

	/**
	 * Set Y coordinate
	 *
	 * @param y
	 */
	public set y(y:number) {
		this.el.style.top = y + "px";
	}


	protected internalSetHidden(hidden:boolean) {

		if(!hidden) {

			if (!this.parent) {
				root.items.add(this);
			}

			if (!this.rendered) {
				this.render();
			}

			this.setAlignTo();

			if (Menu.openedMenu == this) {
				console.warn("Already open");
				return true;
			}

			if (Menu.openedMenu) {
				Menu.openedMenu.el.classList.remove("goui-fade-out");
				Menu.openedMenu.close();
			}

			Menu.openedMenu = this;


			//hide menu when clicked elsewhere
			window.addEventListener("mousedown", (ev) => {
				this.close();
			}, {once: true});

			// stop clicks on menu from hiding menu, otherwise it hides before button handlers fire.
			this.el.addEventListener("mousedown", (ev) => {
				ev.stopPropagation();
			});

			//put back fade out class removed in mouseenter listener above
			this.el.classList.add("goui-fade-out");
		}

		super.internalSetHidden(hidden);
	}

	/**
	 * Show menu at coordinates on the page.
	 *
	 * Useful for a context menu
	 *
	 * @param coords
	 */
	showAt(coords: { x: number, y: number } | MouseEvent) {
		this.x = coords.x;
		this.y = coords.y;

		this.show();
	}

	/**
	 * Closes the menu.
	 *
	 * It will hide or remove it depending on the "removeOnClose" property.
	 */
	public close() {
		return this.removeOnClose ? this.remove() : this.hide();
	}


	/**
	 * @inheritDoc
	 */
	public focus(o?: FocusOptions) {
		this.items.get(0)?.focus(o);
	}

}

/**
 * Shorthand function to create {@see Menu}
 *
 * @param config
 * @param items
 */
export const menu = (config?: Config<Menu>, ...items: Component[]) => createComponent(new Menu(), config, items);
