import { Component } from "./Component";
import { Config } from "./Observable";
/**
 * Tooltip component
 *
 * @link https://goui.io/#tooltip Examples
 *
 * @example TIP: For long HTML tooltips use the render event:
 * ```
 * tooltip({
 * 	listeners: {'render': (me) => {me.html = 'Long text'}},
 * 	target: someDiv
 * });
 * ```
 */
export declare class ToolTip extends Component {
    renderTo?: HTMLElement | undefined;
    /**
     * Tooltip shows with a delay in ms
     */
    delay: number;
    /**
     * Delay before removing the tooltip in ms
     */
    closeDelay: number;
    /**
     * Timeout before showing the tooltip
     *
     * @type {any}
     */
    private timeout;
    /**
     * Timeout before removing the tooltip
     *
     * @private
     */
    private closeTimeout;
    private observer;
    private targetEl?;
    constructor();
    /**
     * The element to attach the tooltip to
     *
     * @param targetEl
     */
    set target(targetEl: HTMLElement);
    protected internalRender(): HTMLElement;
    protected internalRemove(): void;
    private open;
    private close;
    private align;
}
/**
 * Creates as {@link ToolTip} Component
 *
 * @link https://goui.io/#tooltip Examples
 *
 * @param config
 *
 * @example
 * ```
 * tooltip({
 * 	text: "Hi I am the tooltip",
 * 	target: cmp.el
 * });
 * ```
 */
export declare const tooltip: (config?: Config<ToolTip>) => ToolTip;
