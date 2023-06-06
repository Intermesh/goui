/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component} from "./Component.js";
import {Button} from "./Button.js";
import type {Menu} from "./menu/Menu.js";
import {Config} from "./Observable";


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
	 * Find the first menu in the tree of submenu's
	 */
	private findToolbar(): Toolbar | undefined {

		let parent;
		if ((this as unknown as Menu).parentButton) {
			parent = (this as unknown as Menu).parentButton!.parent;
		} else {
			parent = this.parent;
		}

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

		this.on("focus", () => {
			if (this.focusedItemIndex > -1) {
				this.items.get(this.focusedItemIndex)!.focus();
			}
		});

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
					ev.stopPropagation();
					ev.preventDefault();
					break;
				case 'ArrowDown':
					if (this.orientation == "vertical") {
						this.focusNext();
					} else {
						this.focusChild();

					}
					ev.stopPropagation();
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
					ev.stopPropagation();
					ev.preventDefault();
					break;

				case 'ArrowUp':
					if (this.orientation == "vertical") {
						this.focusNext(-1);
					} else {
						this.focusParent();

					}
					ev.stopPropagation();
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

		const parentButton = (child.parent! as Menu).parentButton! as Button;
		if (!parentButton) {
			return false;
		}
		parentButton.focus();

		return true;
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

export const tbarItems = (items: (Component | "->" | "-")[]): Component[] => {
	const l = items.length;
	if (l) {

		for (let i = 0; i < l; i++) {
			switch (items[i]) {
				case '->':
					items[i] = comp({
						flex: 1
					});
					break;
				case '-':
					items[i] = comp({tagName: "hr"})
					break;
			}
		}
	}
	return items as Component[];
}


