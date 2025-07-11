/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent, hr} from "../Component.js";
import {root} from "../Root.js";
import {Toolbar} from "../Toolbar.js";
import {Config, Listener, ObservableListenerOpts} from "../Observable.js";
import {AbstractMenu} from "../AbstractMenu";



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
export class Menu<EventMap extends ComponentEventMap = ComponentEventMap> extends AbstractMenu<EventMap> {
	private _parentMenu?: Menu | Toolbar | boolean;

	constructor() {
		super();
		this.baseCls = "";
		this.orientation = "vertical";
	}

	/**
	 * Automatically close the menu when the user clicks outside.
	 */
	public autoClose = true;

	/**
	 * Align the menu to this element
	 */
	public alignTo?: HTMLElement;

	/**
	 * Make the menu at least as wide as the component it aligns too.
	 */
	public alignToInheritWidth = false;


	public constrainToViewport = true;

	/**
	 * The element it renders to. By default it's rendered to the root element of GOUI.
	 */
	public renderTo? = root.el;

	/**
	 * Remove menu when closed
	 */
	public removeOnClose = true;



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

			if(this.parentMenu) {
				if(this.parentMenu.openedMenu == this) {
					this.parentMenu.openedMenu = undefined;
				}
			}

		}

		this.on("hide", onClose);
		this.on("remove", onClose);

		this.el.addEventListener("click", e => {

			if(e.target == this.el) {
				this.close();
			} else {
				// Menus are rendered inside buttons. So buttons are inside buttons.
				// We have to stop propagation for the click event otherwise the parent button will fire too.
				// not sure if this will cause problems.
				e.stopPropagation();
			}

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

	protected renderItem(item: Component) {

		if(item.el.tagName == "LI") {
			return super.renderItem(item);
		}

		const insertBefore = this.getInsertBeforeForMenuItem(item);

		if (!insertBefore) {
			this.itemContainerEl.appendChild(this.wrapLI(item));
		} else {
			this.itemContainerEl.insertBefore(this.wrapLI(item), insertBefore);
		}
	}

	/**
	 * Finds the DOM node in the parent's children to insert before when rendering a child component
	 *
	 * @protected
	 */
	protected getInsertBeforeForMenuItem(item: Component) {
		if (!this.rendered) {
			return undefined;
		}

		const index = this.items.indexOf(item);

		let refItem: HTMLElement | undefined = undefined;
		//find nearest rendered item
		for (let i = index + 1, l = this.items.count(); i < l; i++) {
			const beforeItem = this.items.get(i)!;
			if (beforeItem.rendered) {
				refItem = beforeItem.el.parentElement ?? undefined;
				break;
			}
		}

		return refItem;
	}

	private wrapLI(item: Component) {

		const li = document.createElement("li");

		item.render(li);

		// cleanup li when item is removed
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
	 * @param alignEl
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

		let x = Math.max(0, rect.x);
		let y = Math.max(0, rect.bottom);

		if(this.isSubMenu()) {
			x += rect.width;
			y -= rect.height;
		}

		if(this.alignToInheritWidth) {
			// make the menu at least as wide as the component it aligns too.
			this.el.style.minWidth = rect.width + "px";
		}

		// make sure menu is not off screen
		this.constrainTo(window);

		//aligns down by default. If it runs off screen then align on top
		if(this.constrainToViewport && y + this.el.offsetHeight > window.innerHeight) {
			if(this.isSubMenu()) {
				y = rect.bottom;
			} else {
				y = rect.top;
			}
			y -= this.el.offsetHeight;

			y = Math.max(0, y);
		}

		//aligns left by default. If it runs off screen then align right
		if(this.constrainToViewport && x + this.el.offsetWidth > window.innerWidth) {

			if(this.isSubMenu()) {
				x = rect.left;
			} else {
				x = rect.right;
			}
			x -= this.el.offsetWidth;
			x = Math.max(0, x);

		}

		this.x = x;
		this.y = y;
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

	get parentMenu():Menu|Toolbar | undefined {
		if(this._parentMenu === undefined) {
			this._parentMenu = this.findAncestorByType(Menu);
			if(!this._parentMenu) {

				this._parentMenu = this.findAncestorByType(Toolbar) ?? false;
			}
		}
		return this._parentMenu !== false ? this._parentMenu as Menu|Toolbar : undefined;
	}


	protected internalSetHidden(hidden:boolean) {

		if(!hidden) {

			if (!this.parent) {
				root.items.add(this);
			}

			if (!this.rendered) {
				this.render();
			}

			super.internalSetHidden(hidden);

			this.align();

			if(this.parentMenu)
			{
				if(this.parentMenu.openedMenu) {
					this.parentMenu.openedMenu.el.classList.remove("goui-fade-out");
					this.parentMenu.openedMenu.close();
				}
				this.parentMenu.openedMenu = this;
			}

			if(this.autoClose) {
				//hide menu when clicked elsewhere
				window.addEventListener("mousedown", (ev) => {
					this.close();
				}, {once: true});

				// stop clicks on menu from hiding menu, otherwise it hides before button handlers fire.
				this.el.addEventListener("mousedown", (ev) => {
					ev.stopPropagation();
				});
			}

			//put back fade out class removed in mouseenter listener above
			this.el.classList.add("goui-fade-out");
		} else {
			if(this.openedMenu) {
				this.openedMenu.hide();
			}
			super.internalSetHidden(hidden);
		}


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

		this.constrainTo(window);
	}

	/**
	 * Closes the menu.
	 *
	 * It will hide or remove it depending on the "removeOnClose" property.
	 */
	public close() {
		return this.removeOnClose ? this.remove() : this.hide();
	}


	private isSubMenu() {
		return this.parentMenu instanceof Menu;
	}
}

/**
 * Shorthand function to create {@link Menu}
 *
 * @param config
 * @param items
 */
export const menu = (config?: Config<Menu>, ...items: ( Component | "-")[]) => {

	return createComponent(new Menu(), config, items.map(i => {
		if(i == "-") {
			return hr();
		} else {
			return i;
		}
	}));

}
