import {Component, ComponentEventMap, Config} from "./Component.js";
import {Menu} from "./menu/Menu.js";
import {root} from "./Root.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {MaterialIcon} from "./MaterialIcon.js";

type ButtonType = "button" | "submit" | "reset";

/**
 * @inheritDoc
 */
export interface ButtonEventMap<Sender extends Observable> extends ComponentEventMap<Sender> {
	/**
	 * Fires before showing the button menu. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeshowmenu: <T extends Sender> (button: T, menu: Menu, ev: MouseEvent) => false | void

	/**
	 * Fires when the button menu is shown
	 *
	 * @param button
	 * @param menu
	 * @param ev
	 */
	showmenu: <T extends Sender> (button: T, menu: Menu, ev: MouseEvent) => false | void,

	/**
	 * Fires when the button is clicked.
	 *
	 * You can also pass a handler function to the button config
	 *
	 * @see ButtonConfig.handler
	 * @param button
	 * @param ev
	 */
	click: <T extends Sender> (button: T, ev: MouseEvent) => void
}

export interface Button extends Component {
	on<K extends keyof ButtonEventMap<this>>(eventName: K, listener: Partial<ButtonEventMap<this>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof ButtonEventMap<this>>(eventName: K, ...args: Parameters<ButtonEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<ButtonEventMap<this>>)

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

	constructor() {
		super("button");
	}

	protected baseCls = "button"

	/**
	 * Function to be executed on click (added to el.onclick)
	 *
	 * The handler only fires on the primary mouse button and when the button is duoble clicked it will
	 * only fire once!
	 */
	public handler?: (button: this, ev?: MouseEvent) => any;

	private _menu?: Menu;

	private _icon?: MaterialIcon;

	private block = false;

	private _text?: string;


	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopMenu(): Menu | undefined {
		if (this.parent instanceof Menu) {
			if (this.parent.parentButton && this.parent.parentButton.parent instanceof Menu) {
				return this.parent.parentButton.findTopMenu();
			} else {
				return this.parent as Menu;
			}
		} else {
			return undefined;
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
				this.menu.render(el);
			}
		}

		el.addEventListener("click", (e) => {
			// prevent double submissions for 1s
			if (this.block) {
				this.disabled = true;
				e.preventDefault();
				return;
			}
			this.block = true;
			setTimeout(() => {
				this.block = false;
				this.disabled = false;
			}, 1000);

			// check detail for being the first click. We don't want double clicks to call the handler twice.
			// the detail property contains the click count. When spacebar is used it will be 0
			if (this.handler && e.button == 0 && e.detail < 2) {
				this.handler.call(this, this, e);

				// close menu if handler is set
				const topMenu = this.findTopMenu();
				if (topMenu) {
					topMenu.close();
				}
			}


			this.fire("click", this, e);
		});

		return el;
	}

	private onMenuButtonClick(ev: MouseEvent) {
		if (this._menu!.hidden) {
			this.showMenu(this.el, ev);
		} else {
			this._menu!.hide();
		}
	}

	private onMenuMouseEnter(ev: MouseEvent) {
		if (Menu.openedMenu && Menu.openedMenu != this._menu) {
			Menu.openedMenu.el.classList.remove("fade-out");
			Menu.openedMenu.close();
			this.showMenu(this.el, ev);
		}
	}

	/**
	 * Add menu to this button
	 */
	set menu(menu: Menu | undefined) {

		// if (this._menu) {
		// 	this._menu.remove();
		// 	this.el.removeEventListener("mouseenter", this.onMenuMouseEnter);
		// 	this.el.removeEventListener("click", this.onMenuButtonClick);
		// }else
		// {
		// 	this.onMenuMouseEnter = this.onMenuMouseEnter.bind(this);
		// 	this.onMenuButtonClick = this.onMenuButtonClick.bind(this);
		// }

		if (menu) {
			menu.parentButton = this;
			menu.removeOnClose = false;

			this.el.classList.add("has-menu");
		}

		this._menu = menu;
	}

	public get menu() {
		return this._menu;
	}

	private showMenu(el: HTMLButtonElement, ev: MouseEvent) {

		// noinspection PointlessBooleanExpressionJS
		if (this.fire("beforeshowmenu", this, this._menu!, ev) === false) {
			return;
		}
		const rect = el.getBoundingClientRect();

		//must be rendered and visible to get width below
		if (!this._menu!.rendered) {
			root.items.add(this._menu!);
		}

		//show first for positioning correctly below
		this._menu!.show();

		this._menu!.showAt({
			x: this._menu!.expandLeft ? rect.right - this._menu!.width : rect.x,
			y: rect.bottom
		});

		//put back fade out class removed in mouseenter listener above
		this._menu!.el.classList.add("fade-out");

		this.fire("showmenu", this, this._menu!, ev);
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

		if (text) {
			this._text = text;

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
	set icon(icon: MaterialIcon | undefined) {
		this._icon = icon;

		if (this._icon) {
			this.el.classList.add("with-icon");
		}

		this.el.classList.remove("with-icon");

		this.iconEl!.innerText = icon + "";
	}

	get icon() {
		return this._icon;
	}


	private get iconEl() {
		if (!this._iconEl) {
			this.createIconAndTextEls();
		}
		return this._iconEl;
	}

	private get textEl() {
		if (!this._textEl) {
			this.createIconAndTextEls();
		}
		return this._textEl;
	}

	private createIconAndTextEls() {
		if (this.icon && !this._iconEl) {
			this._iconEl = document.createElement("i");
			this._iconEl.classList.add("icon");
			this.el.appendChild(this._iconEl);
		}

		if (this._text && !this._textEl) {
			this._textEl = document.createElement("span");
			this._textEl.classList.add("text");
			this.el.appendChild(this._textEl);
		}
	}
}

/**
 * Shorthand function to create {@see Button}
 *
 * @param config
 */
export const btn = (config?: Config<Button>): Button => Object.assign(new Button(), config);
