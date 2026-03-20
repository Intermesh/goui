/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap } from "./Component.js";
import { Menu } from "./menu";
import { Config } from "./Observable.js";
import { MaterialIcon } from "./MaterialIcon.js";
type ButtonType = "button" | "submit" | "reset";
interface ButtonMenuEvent {
    /**
     * The button's menu
     */
    menu: Menu;
}
/**
 * @inheritDoc
 */
export interface ButtonEventMap extends ComponentEventMap {
    /**
     * Fires before showing the button menu. Return false to abort.
     *
     * @param container
     * @param item
     * @param index
     */
    beforeshowmenu: ButtonMenuEvent;
    /**
     * Fires when the button menu is shown
     *
     * @param button
     * @param menu
     * @param ev
     */
    showmenu: ButtonMenuEvent;
    /**
     * Fires when the button is clicked.
     *
     * You can also pass a handler function to the button config
     *
     * @see ButtonConfig.handler
     */
    click: {
        /**
         * The original browser MouseEvent object
         *
         * @link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvents
         */
        ev: MouseEvent;
    };
}
/**
 * Button component
 *
 * @link https://goui.io/#buttons Examples
 *
 * @example
 *
 * ```typescript
 * btn({
 *   icon: "star",
 *   text: "Test 1",
 *   handler: (e) => alert("Hi!")
 * });
 *
 * ```
 *
 */
export declare class Button<EventMap extends ButtonEventMap = ButtonEventMap> extends Component<EventMap> {
    readonly el: HTMLButtonElement;
    private _iconEl?;
    private _textEl?;
    protected baseCls: string;
    /**
     * If set a handler will be generated with router.goto(this.route);
     */
    route?: string;
    /**
     * Function to be executed on click (added to el.onclick)
     *
     * The handler only fires on the primary mouse button and when the button is duoble clicked it will
     * only fire once!
     */
    handler?: (button: this, ev?: MouseEvent) => any;
    private _menu?;
    private _icon?;
    private _text?;
    /**
     * Turn on if you want this button to be clickable fast.
     * We disable this by default because some users tend to double click on all buttons and we don't
     * want to double submit.
     */
    allowFastClick: boolean;
    constructor();
    /**
     * Find the first menu in the tree of submenu's
     */
    private findTopMenu;
    /**
     * Button type. "button" or "submit", defaults to "button".
     */
    set type(type: ButtonType);
    get type(): ButtonType;
    protected internalRender(): HTMLElement;
    private onMenuButtonClick;
    private onMenuMouseEnter;
    /**
     * Add menu to this button
     */
    set menu(menu: Menu | undefined);
    get menu(): Menu | undefined;
    cascade(fn: (comp: Component) => (boolean | void)): void;
    protected internalRemove(): void;
    /**
     * Button text
     *
     * Set's the button text and adds a "text" css class
     *
     * This overrides the "html" property. Use html if you want something custom.
     */
    set text(text: string);
    get text(): string;
    /**
     * Set's the button icon and adds an "icon" css class
     */
    set icon(icon: MaterialIcon | "" | undefined);
    private _iconCls;
    get iconCls(): string | undefined;
    /**
     * Sets the button icon and adds the given css classes
     */
    set iconCls(iconCls: string | undefined);
    /**
     * The button icon.
     */
    get icon(): MaterialIcon | "" | undefined;
    private get iconEl();
    private get textEl();
}
/**
 * Shorthand function to create {@link Button}
 *
 * @link @link https://goui.io/#buttons Examples
 *
 * @param config
 */
export declare const btn: (config?: Config<Button>) => Button<ButtonEventMap>;
export {};
