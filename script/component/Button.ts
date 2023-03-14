import {Component, ComponentEventMap, Config, createComponent} from "./Component.js";
import {Menu} from "./menu/Menu.js";
import {root} from "./Root.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {MaterialIcon} from "./MaterialIcon.js";
import {router} from "../Router.js";

type ButtonType = "button" | "submit" | "reset";

/**
 * @inheritDoc
 */
export interface ButtonEventMap<Type extends Observable> extends ComponentEventMap<Type> {
	/**
	 * Fires before showing the button menu. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeshowmenu: <Sender extends Type> (button: Sender, menu: Menu, ev: MouseEvent) => false | void

	/**
	 * Fires when the button menu is shown
	 *
	 * @param button
	 * @param menu
	 * @param ev
	 */
	showmenu: <Sender extends Type> (button: Sender, menu: Menu, ev: MouseEvent) => false | void,

	/**
	 * Fires when the button is clicked.
	 *
	 * You can also pass a handler function to the button config
	 *
	 * @see ButtonConfig.handler
	 * @param button
	 * @param ev
	 */
	click: <Sender extends Type> (button: Sender, ev: MouseEvent) => void
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

	private _icon?: MaterialIcon;

	private _text?: string;

	constructor() {
		super("button");
		this.type = "button";
	}
	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopMenu(): Menu | undefined {
		if (this.parent instanceof Menu) {
			if(!this.parent.parentButton) {
				return undefined;
			}
			if (this.parent.parentButton.parent instanceof Menu) {
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

		if(this.route != undefined) {
			if(this.handler) {
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
				this.menu.parent = this;
				this.menu.render(el);
			}
		}

		el.addEventListener("click", (e) => {


			// check detail for being the first click. We don't want double clicks to call the handler twice.
			// the detail property contains the click count. When spacebar is used it will be 0
			// Michael had problems with e.detail < 2 but we don't remember why. Discuss when we run into this.
			if (this.handler && e.button == 0 && e.detail < 2) {

				e.preventDefault(); // prevent submitting form

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
		if (Menu.openedMenu && Menu.openedMenu != this._menu && Menu.openedMenu.parentButton!.parent === this._menu!.parentButton!.parent) {
			Menu.openedMenu.el.classList.remove("goui-fade-out");
			Menu.openedMenu.close();
			this.showMenu(this.el, ev);
		}
	}


	/**
	 * Align menu to this component when it's shown. If not set it will align to the button.
	 */
	public menuAlignTo: Component|undefined;

	/**
	 * Add menu to this button
	 */
	set menu(menu: Menu | undefined) {
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
		this._menu!.showFor(this.menuAlignTo || this);

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
		}else {
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
			if(this._textEl) {
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
export const btn = (config?: Config<Button>) => createComponent(new Button(), config);
