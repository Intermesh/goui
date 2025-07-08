/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {assignComponentConfig, comp, Component, ComponentEventMap, hr} from "./Component.js";
import {btn, Button} from "./Button.js";
import {Config} from "./Observable.js";
import {menu} from "./menu/index.js";
import {AbstractMenu} from "./AbstractMenu";
import {FunctionUtil} from "../util";



/**
 * Toolbar Component
 *
 * eg.
 *
 * ```
 * tbar({},
 * 		btn({
 * 			text: "Menu",
 * 			menu: menu({
 * 				},
 *
 * 					btn({
 * 						text: "Hello World",
 * 						handler: () => {
 *
 * 						}
 * 					})
 * 			})
 * );
 *  ```
 */
export class Toolbar extends AbstractMenu {

	/**
	 * Set to true if the toolbar might be larger than its container. In that case the buttons will overflow in to a menu
	 * button.
	 */
	public overflowMenu = false;

	protected baseCls = "goui-toolbar"

	private overflowMenuBtn?: Button;

	private overflowSpacer?: Component;
	private gap?: number;

	/**
	 * Configuration for the overflowMenu button
	 *
	 * @link this.overflowMenu
 	 */
	public overflowMenuBtnConfig:undefined|Config<Button> = undefined;

	render(parentEl?: Node, insertBefore?: Node): HTMLElement {
		if(this.overflowMenu) {
			this.initOverFlowMenu();
		}
		const el = super.render(parentEl, insertBefore);

		if(this.overflowMenu) {
			const ro = new ResizeObserver( FunctionUtil.onRepaint((entries) => {
				this.syncOverFlowMenu();
			}));

			ro.observe(this.el);
		}

		return el;
	}

	private initOverFlowMenu() {

		const cfg = this.overflowMenuBtnConfig || {};
		if(!cfg.icon) {
			cfg.icon = "more_vert";
		}
		cfg.menu = menu()

		this.overflowMenuBtn = btn(cfg);

		this.overflowSpacer = comp({flex: 1, style:{padding:"0", margin:"0"}});
		this.items.add(this.overflowSpacer, this.overflowMenuBtn);

		// make sure new toolbar items are not after the overflow elements
		this.items.on("add", e => {
			const maxIndex = e.target.count() - 3;
			if(e.index > maxIndex) {
				this.items.move(e.index, maxIndex);
			}
		})
	}

	private moveLastToMenu() {
		const last = this.items.get(this.items.count() - 3);

		if(!last)	{
			return false;
		}

		// cache the width the item takes in the toolbar as it might be different in the menu,
		// take a minimum of 40 px as a quick fix for separators. The margin of the separator is not part of the with.
		last.dataSet.tbWidth = Math.max(last.el.getBoundingClientRect().width + this.gap!, 40);
		last.dataSet.tbText = last.text;

		if(!last.text && last.title) {
			last.text = last.title;
		}

		this.overflowMenuBtn!.menu!.items.insert(0, last);

		return true;
	}

	private moveFirstToToolbar()  {
		const first = this.overflowMenuBtn!.menu!.items.first();

		if(!first)	{
			return false;
		}

		first.text = first.dataSet.tbText;
		//insert before spacer
		this.items.insert(this.items.count() - 2, first);
		return true;
	}

	private firstToolBarItemWidth() {
		const first = this.overflowMenuBtn!.menu!.items.first();
		if(!first) {
			return 0;
		}

		return first.dataSet.tbWidth;
	}


	private syncOverFlowMenu() {

		if(!this.overflowMenuBtn) {
			return;
		}

		if(!this.gap) {
			this.gap = parseFloat(window.getComputedStyle(this.el)["gap"]);
		}

		const moreBtnWidth = this.overflowMenuBtn.el.getBoundingClientRect().width + this.gap;
		this.overflowMenuBtn.hide();

		if(this.overflowSpacer!.el.getBoundingClientRect().width < moreBtnWidth) {
			while (this.overflowSpacer!.el.getBoundingClientRect().width < moreBtnWidth) {
				if(!this.moveLastToMenu()) {
					break;
				}
			}

		} else {
			// add buttons back to the toolbar if they fit
			while(this.overflowSpacer!.el.getBoundingClientRect().width > (moreBtnWidth + this.firstToolBarItemWidth())) {
				if(!this.moveFirstToToolbar()) {
					break;
				}
			}
		}

		if(this.overflowMenuBtn.menu!.items.count()) {
			this.overflowMenuBtn.show();
		}
	}
}

/**
 * Create a {@link Toolbar} Component
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
		assignComponentConfig(c, config);
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



