/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, ComponentEventMap, hr} from "./Component.js";
import {btn, Button} from "./Button.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {menu, Menu} from "./menu/index.js";
import {AbstractMenu} from "./AbstractMenu";
import {FunctionUtil} from "../util";


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

	protected baseCls = "goui-toolbar"

	private overflowMenuBtn?: Button;

	public overflowMenu = false;




	render(parentEl?: Node, insertBefore?: Node): HTMLElement {
		if(this.overflowMenu) {
			this.initOverFlowMenu();
		}
		const el = super.render(parentEl, insertBefore);
		if(this.overflowMenu) {
			//settimeout needed for browser to render first
			setTimeout(() => {
				this.fillOverFlowMenu();
			})

			// const ro = new ResizeObserver(FunctionUtil.onRepaint( () => {
			// 	this.fillOverFlowMenu();
			// }));
			//
			// ro.observe(this.el);

		}

		return el;
	}

	private initOverFlowMenu() {

		this.overflowMenuBtn = btn({
			icon: "more_vert",
			menu: menu()
		});

	}

	private fillOverFlowMenu() {


		const move = () => {
			const last = this.items.pop();

			if(!last)	{
				return;
			}
			if(!last.text && last.title) {
				last.text = last.title;
			}

			this.overflowMenuBtn!.menu!.items.insert(0, last);
		}

		while(this.el.scrollWidth > this.el.offsetWidth) {
			move()
		}
		move();

		const spacer = comp({flex: 1});
		this.items.add(spacer, this.overflowMenuBtn!);
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



