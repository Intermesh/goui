/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { DraggableComponent } from "./DraggableComponent.js";
import { Config } from "./Observable.js";
type ResizeComponent = Component | ((splitter: Splitter) => Component);
/**
 * Splitter
 *
 * Used to resize panels
 */
export declare class Splitter extends DraggableComponent {
    private _resizeComponent?;
    /**
     * Resize the widths when this hr is styled as a vertical splitter, otherwise the height is set.
     */
    resizeWidth?: boolean;
    /**
     * When the panel is on the left of a center panel that auto sizes. The x offset can be added to the width. But if
     * the panel is on the right the x offset must be inverted.
     * If not given the splitter will auto detect it's position relative to the component it resizes
     */
    invert?: boolean;
    /**
     *
     * @param resizeComponent 	The component to resize in height or width.
     *    Can be a component ID, itemId property, Component instance or custom function
     *
     */
    constructor(resizeComponent: ResizeComponent);
    private applyStateToResizeComp;
    protected buildState(): {
        width: number;
        height?: undefined;
    } | {
        height: number;
        width?: undefined;
    };
    /**
     * If a splitter is between two containers. It will check the minWidth of the container next to the container
     * we are resizing so it will not go bigger than allowed by the minWidth.
     *
     * @private
     */
    private initAutoMaxHeight;
    /**
     * If a splitter is between two containers. It will check the minWidth of the container next to the container
     * we are resizing so it will not go bigger than allowed by the minWidth.
     *
     * @private
     */
    private initAutoMaxWidth;
    protected internalRender(): HTMLElement;
}
type SplitterConfig = Config<Splitter> & {
    resizeComponent: ResizeComponent;
};
/**
 * Shorthand function to create {@link Splitter}
 */
export declare const splitter: (config: SplitterConfig) => Splitter;
export {};
