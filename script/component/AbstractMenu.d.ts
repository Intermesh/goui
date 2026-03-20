import { Component, ComponentEventMap } from "./Component";
import { Menu } from "./menu";
export declare abstract class AbstractMenu<EventMap extends ComponentEventMap = ComponentEventMap> extends Component<EventMap> {
    /**
     * Used by keyboard nav
     *
     * @protected
     */
    protected orientation: string;
    constructor(tagName?: keyof HTMLElementTagNameMap);
    /**
     * Is set to the menu currently open. There can only be one dropdown open at the same time
     */
    openedMenu?: Menu;
    private focusedItemIndex;
    /**
     * Automatically focus the first element.
     *
     * This does not actually focus it but makes it appear selected. Used in the HtmlFieldMentionPLugin
     *
     * @param v
     */
    set autoFocusFirst(v: boolean);
    get autoFocusFirst(): boolean;
    /**
     * Find the first menu in the tree of submenu's
     */
    private findToolbar;
    private setupKeyboardNav;
    focusNext(inc?: number): boolean;
    private focusChild;
    private focusParent;
    focus(o?: FocusOptions): void;
}
