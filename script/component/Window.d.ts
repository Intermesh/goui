/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { Toolbar } from "./Toolbar.js";
import { DraggableComponent, DraggableComponentEventMap } from "./DraggableComponent.js";
import { Config } from "./Observable.js";
import { TextFieldType } from "./form/TextField.js";
interface PromptConfig {
    inputLabel: string;
    defaultValue?: string;
    title?: string;
    text?: string;
    fieldType?: TextFieldType;
}
/**
 * @inheritDoc
 */
export interface WindowEventMap extends DraggableComponentEventMap {
    /**
     * Fires when the window is closed
     */
    close: {
        /**
         * Indicates whether an action or event is performed or initiated by a user.
         * This boolean variable is typically set to `true` if the user is responsible for the action,
         * otherwise it is set to `false`.
         */
        byUser: boolean;
    };
    /**
     * Fires before closing window
     * return false to cancel close
     */
    beforeclose: {
        /**
         * Indicates whether an action or event is performed or initiated by a user.
         * This boolean variable is typically set to `true` if the user is responsible for the action,
         * otherwise it is set to `false`.
         */
        byUser: boolean;
    };
    /**
     * Fires when the window is maximized
     */
    maximize: {};
    /**
     * Fires when the window is restored after being maximized
     */
    unmaximize: {};
}
/**
 * Represents a configurable and interactive window component. The `Window` class extends `DraggableComponent` and
 * provides functionalities such as maximizing, resizing, collapsing, and modal behavior.
 *
 * @template EventMap Type used for the event map for this class.
 *
 * @link https://goui.io/#window Example
 */
export declare class Window<EventMap extends WindowEventMap = WindowEventMap> extends DraggableComponent<EventMap> {
    constructor();
    protected baseCls: string;
    /**
     * Maximize the window
     */
    maximized: boolean;
    /**
     * Enable tool to maximize window
     */
    maximizable: boolean;
    /**
     * Enable resizing on window edges and corners
     */
    resizable: boolean;
    /**
     * Enable tool to close window
     */
    closable: boolean;
    /**
     * Enable tool to collapse window
     */
    collapsible: boolean;
    /**
     * Make the window modal so the user can only interact with this window.
     */
    modal: boolean;
    /**
     * Render a header with title and controls
     */
    header: boolean;
    private titleCmp;
    private headerCmp;
    private modalOverlay;
    /**
     * Return focus to element focussed before opening it when closing the window
     * @private
     */
    private focussedBeforeOpen?;
    private _itemContainerEl?;
    protected get itemContainerEl(): HTMLElement;
    private initMaximizeTool;
    private _title;
    set title(title: string);
    get title(): string;
    protected getDragHandle(): HTMLElement;
    getHeader(): Toolbar;
    protected createHeader(): Toolbar;
    set collapsed(collapsed: boolean);
    get collapsed(): boolean;
    private resizeHandlePadder?;
    protected internalRender(): HTMLElement;
    private resizeWidth;
    private resizeHeight;
    private initResizable;
    protected buildState(): Record<string, any>;
    protected restoreState(s: Record<string, any>): void;
    /**
     * Open the window by rendering it into the DOM body element
     * Use show()
     * @deprecated
     */
    open(): boolean;
    protected internalSetHidden(hidden: boolean): void;
    protected createModalOverlayCls(): string;
    /**
     * Creates the modal overlay behind the window to prevent user interaction
     *
     * @protected
     */
    protected createModalOverlay(): Component<import("./Component.js").ComponentEventMap>;
    protected internalRemove(): void;
    private shrinkToFit;
    private disableBodyScroll;
    private enableBodyScroll;
    /**
 * Close the window by removing it
 */
    close(): void;
    protected internalClose(byUser?: boolean): void;
    /**
     * Center the window in the screen
     */
    center(): this;
    /**
     * Returns true if the window is maximized
     */
    isMaximized(): boolean;
    /**
     * Grow window to the maximum of the viewport
     */
    maximize(): this;
    /**
     * Make the window smaller than the viewport
     */
    unmaximize(): this;
    /**
     * Display an error message
     *
     * @param msg - The error message to be displayed.
     * @return Promise<void> - A promise that resolves when the alert window is closed
     */
    static error(msg: any): Promise<void>;
    static prepareErrorMessage(msg: any): string;
    /**
     * Show modal alert window
     *
     * @param text - The alert message or an object with a 'message' property
     * @param [title="Alert"] - The title of the alert window
     * @param cls Window CSS class to add
     * @return Promise<void> - A promise that resolves when the alert window is closed
     */
    static alert(text: any, title?: string, cls?: string): Promise<void>;
    static prompt(cfg: PromptConfig): Promise<string | undefined>;
    /**
     * Asks the user for confirmation.
     * @param {string} text - The text to display in the confirmation dialog.
     * @param {string} [title=t("Please confirm")] - The title of the confirmation dialog.
     * @return {Promise<boolean>} - A promise that resolves to `true` if the user confirms, or `false` if the user cancels.
     */
    static confirm(text: string, title?: string): Promise<boolean>;
}
type WindowConfig = Omit<Config<Window>, "close" | "maximize" | "center" | "dragConstrainTo" | "constrainTo" | "calcConstrainBox">;
/**
 * Shorthand function to create {@link Window}
 *
 * @param config
 * @param items
 */
export declare const win: (config?: WindowConfig, ...items: Component[]) => Window<WindowEventMap>;
export {};
