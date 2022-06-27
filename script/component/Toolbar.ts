import {comp, Component} from "./Component.js";
import {Config} from "./Observable.js";


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

	constructor() {
		super("menu");
	}

}

export const tbar = (config?: Config<Toolbar>, ...items: (Component | "->" | "-")[]) => {


	const c = new Toolbar();
	if (config) {
		Object.assign(c, config);
	}

	if (items && items.length) {

		for (let i = 0, l = items?.length; i < l; i++) {
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

		c.items.add(...items as Component[]);

	}

	return c;

}


