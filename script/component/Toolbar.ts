import {Component, ComponentConfig} from "./Component.js";
import {Table, TableConfig} from "./Table.js";
import {Splitter} from "./Splitter.js";

/**
 * Toolbar component
 *
 * eg.
 *
 * ```
 * Toolbar.create({
 * 	items: [
 * 		Button.create({
 * 			text: "Menu",
 * 			menu: Menu.create({
 * 				// expandLeft: true,
 * 				items: [
 * 					Button.create({
 * 						text: "Hello World",
 * 						handler: () => {
 * 							Window.create({
 * 								title: "Hello World",
 * 								items: [Component.create({tagName: "h1", cls: "pad", html: "Just saying hi!"})]
 * 							}).open();
 * 						}
 * 					})]
 * 			})
 * 		})
 * 	]
 * });
 *  ```
 */
export class Toolbar extends Component {
	protected baseCls = "toolbar"
	protected tagName = "menu" as keyof HTMLElementTagNameMap
}

export const tbar = (config?:ComponentConfig<Toolbar>,...items: (Component|"->"|"-")[]) => {
	if(items && items.length) {

		for(let i = 0, l = items?.length; i < l; i++) {
			switch(items[i]) {
				case '->':
					items[i] = Component.create({
						flex: 1
					});
					break;
				case '-':
					items[i] = Splitter.create();
					break;
			}
		}

	}

	return Toolbar.create(config, items as Component[]);
}


