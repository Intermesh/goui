import {Container} from "./Container.js";

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
 * 								items: [Component.create({tagName: "h1", cls: "go-pad", html: "Just saying hi!"})]
 * 							}).open();
 * 						}
 * 					})]
 * 			})
 * 		})
 * 	]
 * });
 *  ```
 */
export class Toolbar extends Container {
	protected baseCls = "go-toolbar"
	protected tagName = "menu" as keyof HTMLElementTagNameMap
}


