/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { Button } from "./Button.js";
import { Config } from "./Observable.js";
import { AbstractMenu } from "./AbstractMenu";
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
export declare class Toolbar extends AbstractMenu {
    /**
     * Set to true if the toolbar might be larger than its container. In that case the buttons will overflow in to a menu
     * button.
     */
    overflowMenu: boolean;
    protected baseCls: string;
    private overflowMenuBtn?;
    private overflowSpacer?;
    private gap?;
    /**
     * Configuration for the overflowMenu button
     *
     * @link this.overflowMenu
     */
    overflowMenuBtnConfig: undefined | Config<Button>;
    render(parentEl?: Node, insertBefore?: Node): HTMLElement;
    private initOverFlowMenu;
    private moveLastToMenu;
    private moveFirstToToolbar;
    private firstToolBarItemWidth;
    private syncOverFlowMenu;
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
export declare const tbar: (config?: Config<Toolbar>, ...items: (Component | "->" | "-")[]) => Toolbar;
export declare const tbarItems: (items: (Component | "->" | "-")[]) => Component[];
