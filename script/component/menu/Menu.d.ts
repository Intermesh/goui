/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "../Component.js";
import { Toolbar } from "../Toolbar.js";
import { Config } from "../Observable.js";
import { AbstractMenu } from "../AbstractMenu";
/**
 * Menu class
 *
 * Can be used as drop down menu or navigation menu.
 *
 * @link @link https://goui.io/#buttons Examples
 *
 * @example Navigation menu
 * ```typescript
 * const mainMenu = menu({cls: "main"},
 *   btn({
 *     text: "Home",
 *     route: ""
 *   }),
 *   btn({
 *     text: "Buttons",
 *     route:"buttons"
 *   }),
 *   btn({
 *     text: "Form",
 *     route:"form"
 *   }),
 *   btn({
 *     text: "Table",
 *     route:"table"
 *   }),
 *   btn({
 *     text: "Window",
 *     route:"window"
 *   })
 * );
 * ```
 *
 * @example Drop down menu inside a button
 * ```typescript
 * btn({
 * text: "Menu",
 * menu: menu({},
 *
 * 	btn({
 * 		text: "Alerts",
 * 		menu: menu({},
 * 			btn({
 * 				text: "Success",
 * 				handler: () => {
 * 					Notifier.success("That went super!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Error",
 * 				handler: () => {
 * 					Notifier.error("That went wrong!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Warning",
 * 				handler: () => {
 * 					Notifier.warning("Look out!")
 * 				}
 * 			}),
 *
 * 			btn({
 * 				text: "Notice",
 * 				handler: () => {
 * 					Notifier.notice("Heads up.")
 * 				}
 * 			})
 * 		)
 * 	});
 * ```
 */
export declare class Menu<EventMap extends ComponentEventMap = ComponentEventMap> extends AbstractMenu<EventMap> {
    private _parentMenu?;
    constructor();
    /**
     * Automatically close the menu when the user clicks outside.
     */
    autoClose: boolean;
    /**
     * Align the menu to this element
     */
    alignTo?: HTMLElement;
    /**
     * Make the menu at least as wide as the component it aligns too.
     */
    alignToInheritWidth: boolean;
    constrainToViewport: boolean;
    /**
     * The element it renders to. By default it's rendered to the root element of GOUI.
     */
    renderTo?: HTMLElement | undefined;
    /**
     * Remove menu when closed
     */
    removeOnClose: boolean;
    protected internalRender(): HTMLElement;
    /**
     * Menu can be rendered as a component in the normal flow or as a
     * floating dropdown.
     *
     * @param value
     */
    set isDropdown(value: boolean);
    get isDropdown(): boolean;
    protected renderItem(item: Component): void;
    /**
     * Finds the DOM node in the parent's children to insert before when rendering a child component
     *
     * @protected
     */
    protected getInsertBeforeForMenuItem(item: Component): HTMLElement | undefined;
    private wrapLI;
    /**
     * Align the menu on this element.
     * The menu aligns at the bottom by default. If it runs off screen then it will align on top.
     */
    alignEl?: HTMLElement;
    /**
     * Show aligned to the given component.
     *
     * It will align the top left of the menu top the bottom left of the component. It will also be at least as wide as
     * the given component by setting the min-width style.
     *
     * @param alignEl
     */
    showFor(alignEl: HTMLElement): void;
    /**
     * Align the menu with it's "alignTo" element.
     */
    align(): void;
    /**
     * Set X coordinate
     *
     * @param x
     */
    set x(x: number);
    get x(): number;
    /**
     * Set Y coordinate
     *
     * @param y
     */
    set y(y: number);
    get y(): number;
    get parentMenu(): Menu | Toolbar | undefined;
    private listenForScroll;
    protected internalSetHidden(hidden: boolean): void;
    /**
     * Show menu at coordinates on the page.
     *
     * Useful for a context menu
     *
     * @param coords
     */
    showAt(coords: {
        x: number;
        y: number;
    } | MouseEvent): void;
    /**
     * Closes the menu.
     *
     * It will hide or remove it depending on the "removeOnClose" property.
     */
    close(): boolean;
    private isSubMenu;
}
/**
 * Shorthand function to create {@link Menu}
 *
 * @link @link https://goui.io/#buttons Examples
 *
 * @param config
 * @param items
 */
export declare const menu: (config?: Config<Menu>, ...items: (Component | "-")[]) => Menu<ComponentEventMap>;
