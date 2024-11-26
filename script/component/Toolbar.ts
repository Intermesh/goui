/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, hr} from "./Component.js";
import {Button} from "./Button.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {Menu} from "./menu/index.js";


export interface Toolbar extends Component {
	on<K extends keyof ComponentEventMap<this>, L extends Listener>(eventName: K, listener: Partial<ComponentEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof ComponentEventMap<this>>(eventName: K, listener: Partial<ComponentEventMap<this>>[K]): boolean
	fire<K extends keyof ComponentEventMap<this>>(eventName: K, ...args: Parameters<ComponentEventMap<any>[K]>): boolean
}
/**
 * Toolbar Component
 *
 * eg.
 *
 * ```
 * tbar({},
 * 		btn({
 * 			text: "Menu",
 * 			menu: Menu.create({
 * 				// expandLeft: true,
 * 				},
 *
 * 					btn({
 * 						text: "Hello World",
 * 						handler: () => {
 * 							Window.create({
 * 								title: "Hello World",
 * 								items: [Component.create({tagName: "h1", cls: "pad", html: "Just saying hi!"})]
 * 							}).open();
 * 						}
 * 					})
 * 			})
 * );
 *  ```
 */
export class Toolbar extends Component {

	protected baseCls = "goui-toolbar"

	/**
	 * Used by keyboard nav
	 * @protected
	 */
	protected orientation = "horizontal";

	constructor() {
		super("menu");
		this.setupKeyboardNav();
	}

	private focusedItemIndex = -1;

	/**
	 * Is set to the menu currently open. There can only be one dropdown open at the same time
	 */
	public openedMenu?:Menu;

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findToolbar(): Toolbar | undefined {

		let parent = this.parent;

		if (!parent || !(parent instanceof Toolbar)) {
			return undefined;
		}

		if (parent.orientation == "horizontal") {
			return parent;
		} else {
			return parent.findToolbar();
		}

	}

	private setupKeyboardNav() {

		this.items.on("add", (collection, item, index) => {

			item.el.addEventListener("click", () => {
				this.focusedItemIndex = index;
			})

		})


		this.on("hide", () => {
			this.focusedItemIndex = -1;
		})

		this.el.addEventListener('keydown', (ev) => {


			switch ((ev as KeyboardEvent).key) {
				case 'ArrowRight':
					if (this.orientation == "vertical") {
						if (!this.focusChild()) {
							const tb = this.findToolbar();
							if (tb) {
								tb.focusNext();
							}
						}
					} else {
						this.focusNext();
					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;
				case 'ArrowDown':
					if (this.orientation == "vertical") {
						this.focusNext();
					} else {
						this.focusChild();

					}
					//ev.stopPropagation();
					ev.preventDefault();
					break;

				case 'ArrowLeft':
					if (this.orientation == "vertical") {

						if (!this.focusParent()) {
							const tb = this.findToolbar();
							if (tb) {
								tb.focusNext(-1);
							}
						}
					} else {
						this.focusNext(-1);

					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;

				case 'ArrowUp':
					if (this.orientation == "vertical") {
						this.focusNext(-1);
					} else {
						this.focusParent();

					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;
			}
		});
	}

	public focusNext(inc = 1): boolean {

		const nextIndex = this.focusedItemIndex + inc;

		this.focusedItemIndex = Math.min(Math.max(nextIndex, 0), this.items.count() - 1);

		if (nextIndex != this.focusedItemIndex) {
			return false;
		}

		const cmp = this.items.get(this.focusedItemIndex)!;
		if (!cmp.isFocusable()) {
			return this.focusNext(inc);
		} else {
			cmp.focus();
			if (this.orientation == 'horizontal') {
				cmp.el.click();
			}
			return true;
		}
	}

	private focusChild() {
		const child = this.items.get(this.focusedItemIndex) as Button;
		if (!child || !child.menu) {
			return false;
		}

		child.menu.focusNext();
		return true;
	}

	private focusParent() {
		const child = this.items.get(this.focusedItemIndex) as Button;
		if (!child) {
			return false;
		}

		if(child.parent) {
			child.parent.focus();
		}

		return true;
	}

	public focus(o?: FocusOptions) {
		if (this.focusedItemIndex > -1) {
			this.items.get(this.focusedItemIndex)!.focus();
		} else {
			const i = this.items.get(0);

			if(i) {
				this.focusedItemIndex = 0;
				i.focus(o);
			}
		}
	}

}

/**
 * Create a {@see Toolbar} Component
 *
 * @example
 * ```
 * tbar({},
 * 	"->",
 *
 * 	searchbtn({
 * 		listeners: {
 * 			input:(searchBtn, text) => {
 *
 * 				const filtered = records.filter((r) => {
 * 					return !text || r.description.toLowerCase().indexOf(text.toLowerCase()) === 0;
 * 				});
 *
 * 				//simple local filter on the store
 * 				table.store.loadData(filtered, false)
 * 			}
 * 		}
 * 	}),
 *
 * 	btn({
 * 		icon: "add",
 * 		cls: "primary",
 * 		text: "Add",
 * 		handler: () => {
 * 			router.goto("playground/window");
 * 		}
 * 	}),
 *
 * 	mstbar({table: table}, "->", btn({icon: "delete"})),
 * ),
 *
 * 	```
 * @param config
 * @param items
 */
export const tbar = (config?: Config<Toolbar>, ...items: (Component | "->" | "-")[]) => {
	const c = new Toolbar();
	if (config) {
		Object.assign(c, config);
	}

	c.items.add(...tbarItems(items));
	return c;
}

export const tbarItems = (items: (Component | "->" | "-")[]): Component[] => items.map(i => {
		switch (i) {
			case '->':
				return comp({
					flex: 1
				});
			case '-':
				return hr();

			default:
				return i;

		}
	});



