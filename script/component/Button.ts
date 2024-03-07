/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "./Component.js";
import {Menu} from "./menu/Menu.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {MaterialIcon} from "./MaterialIcon.js";
import {router} from "../Router.js";

type ButtonType = "button" | "submit" | "reset";

/**
 * @inheritDoc
 */
export interface ButtonEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires before showing the button menu. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeshowmenu: (button: Type, menu: Menu) => false | void

	/**
	 * Fires when the button menu is shown
	 *
	 * @param button
	 * @param menu
	 * @param ev
	 */
	showmenu: (button: Type, menu: Menu) => false | void,

	/**
	 * Fires when the button is clicked.
	 *
	 * You can also pass a handler function to the button config
	 *
	 * @see ButtonConfig.handler
	 * @param button
	 * @param ev
	 */
	click: (button: Type, ev: MouseEvent) => void
}

export interface Button extends Component {
	on<K extends keyof ButtonEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ButtonEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof ButtonEventMap<this>>(eventName: K, listener: Partial<ButtonEventMap<this>>[K]): boolean
	fire<K extends keyof ButtonEventMap<this>>(eventName: K, ...args: Parameters<ButtonEventMap<any>[K]>): boolean
	get el(): HTMLButtonElement
}

/**
 * Button component
 *
 * @example
 *
 * ```typescript
 * btn({
 *   icon: "star",
 *   text: "Test 1"
 *   handler: (e) => alert("Hi!")
 * })
 * ```
 *
 */
export class Button extends Component {
	private _iconEl?: HTMLElement;
	private _textEl?: HTMLElement;

	protected baseCls = "goui-button";

	/**
	 * If set a handler will be generated with router.goto(this.route);
	 */
	public route?: string;

	/**
	 * Function to be executed on click (added to el.onclick)
	 *
	 * The handler only fires on the primary mouse button and when the button is duoble clicked it will
	 * only fire once!
	 */
	public handler?: (button: this, ev?: MouseEvent) => any;

	private _menu?: Menu;

	private _icon?: MaterialIcon | "";

	private _text?: string;

	/**
	 * Turn on if you want this button to be clickable fast.
	 * We disable this by default because some users tend to double click on all buttons and we don't
	 * want to double submit.
	 */
	public allowFastClick = false;

	constructor() {
		super("button");
		this.type = "button";
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopMenu(): Menu | undefined {
		if(!(this.parent instanceof Menu)) {
			return undefined;
		}

		if(!(this.parent.parent instanceof Button)) {
			return this.parent;
		} else
		{
			const next = this.parent.parent.findTopMenu();
			if(next) {
				return next;
			} else
			{
				return this.parent;
			}
		}
	}

	/**
	 * Button type. "button" or "submit", defaults to "button".
	 */
	set type(type: ButtonType) {
		this.el.type = type;
	}

	get type() {
		return this.el.type as ButtonType;
	}


	protected internalRender() {

		const el = super.internalRender();

		if (this.route != undefined) {
			if (this.handler) {
				throw "You can't set both handler and route on a button";
			}

			this.handler = () => {
				router.goto(this.route!);
			}
		}

		// The first menu of a button will expand on click, sub menus will show on hover and are hidden with css.
		// Before I made this without JS with the :focus-within selector but that didn't work in Safari because it
		// doesn't focus buttons on click.
		// First menu is rendered directly in body so it's positioned absolute on the page and there's no need for overflow
		// visible in windows. Sub menu's are rendered inside the parent menu button.
		if (this.menu) {
			this.menu.hide();

			if (!(this.parent instanceof Menu)) {
				// When a menu is opened. other top level will open on mouse enter
				this.el.addEventListener("mouseenter", this.onMenuMouseEnter.bind(this));
				this.el.addEventListener("click", this.onMenuButtonClick.bind(this));
			} else {
				// Setting renderTo to undefined will make it render to it's parent
				// which is this button
				this.menu.renderTo = undefined;
			}
		}

		el.addEventListener("click", (e) => {
			// check detail for being the first click. We don't want double clicks to call the handler twice.
			// the detail property contains the click count. When spacebar is used it will be 0
			// Michael had problems with e.detail < 2 but we don't remember why. Discuss when we run into this.
			if (this.handler && e.button == 0 && (this.allowFastClick || e.detail < 2)) {

				this.handler.call(this, this, e);

				// close dropdown menu if handler is set
				const topMenu = this.findTopMenu();

				if (topMenu && topMenu.isDropdown) {
					topMenu.close();
				}
			}

			this.fire("click", this, e);
		});

		return el;
	}

	private onMenuButtonClick(ev: MouseEvent) {
		if (this._menu!.hidden) {
			this.showMenu();
		} else {
			this._menu!.hide();
		}
	}

	private onMenuMouseEnter(ev: MouseEvent) {
		if (Menu.openedMenu && Menu.openedMenu != this._menu && Menu.openedMenu.parent!.parent === this._menu!.parent!.parent) {

			this.showMenu();
		}
	}

	/**
	 * Add menu to this button
	 */
	set menu(menu: Menu | undefined) {
		if (menu) {
			menu.parent = this;
			menu.removeOnClose = false;
			menu.isDropdown = true;

			this.el.classList.add("has-menu");
		}

		this._menu = menu;
	}

	public get menu() {
		return this._menu;
	}

	public showMenu() {

		if(!this._menu) {
			return;
		}

		if(!this._menu.hidden) {
			return;
		}

		// noinspection PointlessBooleanExpressionJS
		if (this.fire("beforeshowmenu", this, this._menu) === false) {
			return;
		}
		if(!this._menu.alignTo) {
			this._menu.alignTo = this.el;
		}

		this._menu.show();

		this.fire("showmenu", this, this._menu!);
	}

	protected internalRemove() {
		if (this.menu) {
			this.menu.remove();
		}
		super.internalRemove();
	}


	/**
	 * Button text
	 *
	 * Set's the button text and adds a "text" css class
	 *
	 * This overrides the "html" property. Use html if you want something custom.
	 */
	set text(text: string) {

		this._text = text;
		if (text) {
			this.el.classList.add("with-text");
		} else {
			this.el.classList.remove("with-text");
		}

		this.textEl!.innerText = text + "";
	}

	get text() {
		return this._text + "";
	}

	/**
	 * Set's the button icon and adds a "icon" css class
	 */
	set icon(icon: MaterialIcon | "" | undefined) {
		this._icon = icon;

		if (this._icon != undefined) {
			this.el.classList.add("with-icon");
		} else {
			this.el.classList.remove("with-icon");
		}

		this.iconEl!.innerText = icon + "";
	}

	get icon() {
		return this._icon;
	}


	private get iconEl() {
		if (!this._iconEl) {
			this._iconEl = document.createElement("i");
			this._iconEl.classList.add("icon");
			if (this._textEl) {
				this.el.insertBefore(this._iconEl, this._textEl);
			} else {
				this.el.appendChild(this._iconEl);
			}
		}
		return this._iconEl;
	}

	private get textEl() {
		if (!this._textEl) {
			this._textEl = document.createElement("span");
			this._textEl.classList.add("text");
			this.el.appendChild(this._textEl);
		}
		return this._textEl;
	}
}

/**
 * Shorthand function to create {@see Button}
 *
 * @param config
 */
export const btn = (config?: Config<Button, ButtonEventMap<Button>>) => createComponent(new Button(), config);
