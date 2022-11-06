import {comp, Component, Config} from "./Component.js";


/**
 * Toolbar component
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

	constructor() {
		super("menu");
	}

}

/**
 * Create a {@see Toolbar} component
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

export const tbarItems = (items: (Component | "->" | "-")[]) : Component[] => {
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


