import {Component, ComponentConfig, ComponentEventMap} from "./Component.js";
import {Menu} from "./menu/Menu.js";
import {root} from "./Root.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {MaterialIcon} from "./MaterialIcon.js";

type ButtonType = "button" | "submit" | "reset";

/**
 * @inheritDoc
 */
export interface ButtonEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires before showing the button menu. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeshowmenu?: (button: Button, menu: Menu, ev:MouseEvent) => false | void

	/**
	 * Fires when the button menu is shown
	 *
	 * @param button
	 * @param menu
	 * @param ev
	 */
	showmenu?: (button: Button, menu: Menu, ev:MouseEvent) => false | void,

	/**
	 * Fires when the button is clicked.
	 *
	 * You can also pass a handler function to the button config
	 *
	 * @see ButtonConfig.handler
	 * @param button
	 * @param ev
	 */
	click?: (button: Button, ev:MouseEvent) => void
}


/**
 * @inheritDoc
 */
export interface ButtonConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * Function to be executed on click (added to el.onclick)
	 *
	 * The handler only fires on the primary mouse button and when the button is duoble clicked it will
	 * only fire once!
	 */
	handler?: (button: T, ev: MouseEvent) => any,

	/**
	 * Button type. "button" or "submit", defaults to "button".
	 */
	type?: ButtonType,

	/**
	 * Add menu to this button
	 */
	menu?: Menu,

	/**
	 * Set's the button icon and adds a "icon" css class
	 */
	icon?:MaterialIcon

	/**
	 * Button text
	 *
	 * Set's the button text and adds a "text" css class
	 *
	 * This overrides the "html" property. Use html if you want something custom.
	 */
	text?:string

	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ButtonEventMap<T>>
}

export interface Button {
	on<K extends keyof ButtonEventMap<Button>>(eventName: K, listener: ButtonEventMap<Button>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof ButtonEventMap<Button>>(eventName: K, ...args: Parameters<NonNullable<ButtonEventMap<Button>[K]>>): boolean
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

	protected tagName = "button" as keyof HTMLElementTagNameMap

	protected type:ButtonType = "button"

	baseCls = "button"

	protected handler?: (button: this, ev?: MouseEvent) => any;

	protected menu!: Menu;

	protected icon: MaterialIcon | undefined;

	private block = false;

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findTopMenu(): Menu|undefined {
		if(this.parent instanceof Menu) {
			if(this.parent.parentButton && this.parent.parentButton.parent instanceof Menu) {
				return this.parent.parentButton.findTopMenu();
			} else
			{
				return this.parent;
			}
		} else
		{
			return undefined;
		}
	}

	protected internalRender() {

		const el = super.internalRender() as HTMLButtonElement;
		el.type = this.type;

		el.addEventListener("click", (e) => {
			// prevent double submissions for 1s
			if(this.block) {
				this.setDisabled(true);
				e.preventDefault();
				return;
			}
			this.block = true;
			setTimeout(() => {
				this.block = false;
				this.setDisabled(false);
			}, 1000);

			// check detail for being the first click. We don't want double clicks to call the handler twice.
			// the detail property contains the click count. When spacebar is used it will be 0
			if (this.handler && e.button == 0 && e.detail < 2) {
				this.handler.call(this, this, e);

				// close menu if handler is set
				const topMenu = this.findTopMenu();
				if(topMenu) {
					topMenu.close();
				}

			}

			this.fire("click", this, e);
		});

		this.applyTextAndIcon();

		if (this.menu) {
			this.menu.parentButton = this;
			this.menu.removeOnClose = false;

			el.classList.add("has-menu");

			// The first menu of a button will expand on click, sub menus will show on hover and are hidden with css.
			// Before I made this without JS with the :focus-within selector but that didn't work in Safari because it
			// doesn't focus buttons on click.
			// First menu is rendered directly in body so it's positioned absolute on the page and there's no need for overflow
			// visible in windows.
			if(!(this.parent instanceof Menu)) {
				this.menu.hide();

				// When a menu is opened. other top level will open on mouse enter
				el.addEventListener("mouseenter", (ev) => {
					if(Menu.openedMenu && Menu.openedMenu != this.menu) {
						Menu.openedMenu.getEl().classList.remove("fade-out");
						Menu.openedMenu.close();
						this.showMenu(el, ev);
					}
				});

				el.addEventListener("click", ev => {
					if (this.menu.isHidden()) {
						this.showMenu(el, ev);
					} else {
						this.menu.hide();
					}
				});
			} else {
				this.menu.render(el);
			}
		}
		return el;
	}

	public getMenu() {
		return this.menu;
	}

	private showMenu(el:HTMLButtonElement, ev:MouseEvent) {
		// noinspection PointlessBooleanExpressionJS
		if(this.fire("beforeshowmenu", this, this.menu, ev) === false) {
			return;
		}
		const rect = el.getBoundingClientRect();

		//must be rendered and visible to get width below
		if(!this.menu.isRendered()) {
			root.getItems().add(this.menu);
		}

		//show first for positioning correctly below
		this.menu.show();

		this.menu.showAt({
				x: this.menu.isLeftExpanding() ? rect.right - this.menu.getWidth()!  : rect.x,
				y: rect.bottom
			});

		//put back fade out class removed in mouseenter listener above
		this.menu.getEl().classList.add("fade-out");

		this.fire("showmenu", this, this.menu, ev);
	}

	protected internalRemove() {
		if(this.menu) {
			this.menu.remove();
		}
		super.internalRemove();
	}


	setText(text:string) {
		this.text = text;

		if(this.rendered) {
			this.applyTextAndIcon();
		}
	}

	getText() {
		return this.text;
	}

	setIcon(icon:MaterialIcon|undefined) {
		this.icon = icon;
		if(this.rendered) {
			this.applyTextAndIcon();
		}
	}

	getIcon() {
		return this.icon;
	}

	private applyTextAndIcon() {

		const el = this.getEl();

		if(this.text) {
			el.classList.add("with-text");
		} else if(this.rendered) {
			el.classList.remove("with-text");
		}

		if(this.icon) {
			el.classList.add("with-icon");
		} if(this.rendered) {
			el.classList.remove("with-icon");
		}

		let html = "";
		if(!this.text && !this.icon) {
			html = this.html + "";
		} else {
			if(this.icon) {
				html = `<i class="icon">${this.icon}</i>`;
			}

			if(this.text) {
				html += `<span class="text">${this.text}</span>`;
			}
		}

		el.innerHTML = html;

	}
}

/**
 * Shorthand function to create {@see Button}
 *
 * @param config
 */
export const btn = (config?:ButtonConfig<Button>) => Button.create(config);