/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "../Component.js";
import {root} from "../Root.js";
import {Button} from "../Button.js";
import {Toolbar} from "../Toolbar.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable";
import HTML = Mocha.reporters.HTML;


export interface Menu extends Toolbar {
	on<K extends keyof ComponentEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ComponentEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof ComponentEventMap<this>>(eventName: K, listener: Partial<ComponentEventMap<this>>[K]): boolean
	fire<K extends keyof ComponentEventMap<this>>(eventName: K, ...args: Parameters<ComponentEventMap<any>[K]>): boolean
}

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
	 * The element it renders to. By default it's rendered to the root element of GOUI.
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

		this.el.addEventListener("click", e => {
			// Menus are rendered inside buttons. So buttons are inside buttons.
			// We have to stop propagation for the click event otherwise the parent button will fire too.
			// not sure if this will cause problems.
			e.stopPropagation();
		})
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
		this.hidden = true;
	}

	public get isDropdown() {
		return this.el.classList.contains("goui-dropdown");
	}

	/**
	 * Expand menu on the left side of the parent button.
	 * If not set then it will automatically detect that it goes outside the right side off the screen and set this to true
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
		//cleanup li when item is removed
		item.on("remove", () => {
			li.remove();
		});

		return li;
	}

	/**
	 * Align the menu on this element.
	 * The menu aligns at the bottom by default. If it runs off screen then it will align on top.
	 */
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

	/**
	 * Align the menu with it's "alignTo" element.
	 */
	public align() {
		if(!this.alignTo) {
			return;
		}
		const rect = this.alignTo.getBoundingClientRect();

		const x = Math.max(0, this.expandLeft ? rect.right - this.el.offsetWidth : rect.x);
		const y = Math.max(0, rect.bottom);

		this.x = x;
		this.y = y;

		if(this.alignToInheritWidth) {
			// make the menu at least as wide as the component it aligns too.
			this.el.style.minWidth = rect.width + "px";
		}

		// make sure menu is not wider than screen
		if(this.el.offsetWidth > window.innerWidth) {
			this.el.style.width = window.innerWidth + "px";
		}

		if(this.el.offsetHeight > window.innerHeight) {
			this.el.style.height = window.innerHeight + "px";
		}

		//aligns down by default. If it runs off screen then align on top
		if(y + this.el.offsetHeight > window.innerHeight) {
			this.y = Math.max(0, rect.top - this.el.offsetHeight);
		}

		//aligns left by default. If it runs off screen then align right
		if(!this.expandLeft && x + this.el.offsetWidth > window.innerWidth) {
			this.expandLeft = true;
			this.x = Math.max(0, rect.right - this.el.offsetWidth);
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

	public get x() {
		return parseInt(this.el.style.left);
	}

	/**
	 * Set Y coordinate
	 *
	 * @param y
	 */
	public set y(y:number) {
		this.el.style.top = y + "px";
	}


	public get y() {
		return parseInt(this.el.style.top);
	}


	protected internalSetHidden(hidden:boolean) {

		if(!hidden) {

			if (!this.parent) {
				root.items.add(this);
			}

			if (!this.rendered) {
				this.render();
			}

			this.align();

			if (Menu.openedMenu == this) {
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


}

/**
 * Shorthand function to create {@see Menu}
 *
 * @param config
 * @param items
 */
export const menu = (config?: Config<Menu, ComponentEventMap<Menu>>, ...items: Component[]) => createComponent(new Menu(), config, items);
