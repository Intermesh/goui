import { Toolbar } from "./Toolbar";
import { Config } from "./Observable";
import { Component } from "./Component";
import { Button, ButtonEventMap } from "./Button";
/**
 * @inheritDoc
 */
export interface OverlayToolbarButtonEventMap extends ButtonEventMap {
    /**
     * Fires when the overlay toolbar opens
     */
    open: {};
    /**
     * Fires when the overlay toolbar closes
     */
    close: {};
}
/**
 * Represents a button component that toggles between a main toolbar and an overlay toolbar.
 * Primarily used within a toolbar structure to handle button interactions that display additional controls in an overlay.
 *
 * For example the search button or a multi select toolbar that activates when selecting multiple items
 *
 * @template EventMap - The event map type for the button.
 * @extends Button
 */
export declare class OverlayToolbarButton<EventMap extends OverlayToolbarButtonEventMap = OverlayToolbarButtonEventMap> extends Button<EventMap> {
    private overlayTbar?;
    /**
     * Component it will be placed upon when opened.
     * If not given it will try to find the parent toolbar
     */
    overlayComponent?: Component | ((btn: OverlayToolbarButton) => Component);
    constructor();
    handler: (button: Button, ev?: MouseEvent) => void;
    private readonly tbarItemContainer;
    close(): void;
    protected getOverlayTBar(): Toolbar;
    protected get itemContainerEl(): HTMLElement;
}
/**
 * Shorthand function to create {@link OverlayToolbarButton}
 *
 * @link searchbtn
 */
export declare const overlaytoolbarbutton: (config?: Config<OverlayToolbarButton>, ...items: (Component | "->" | "-")[]) => OverlayToolbarButton<OverlayToolbarButtonEventMap>;
