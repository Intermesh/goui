import { Button } from "./Button";
import { Component, ComponentState } from "./Component";
import { Config } from "./Observable";
type CollapseTarget = ((btn: CollapseButton) => Component) | Component;
/**
 * Button that can be used to hide and show another component
 * Use "stateId" to remember the collapsed state.
 */
export declare class CollapseButton extends Button {
    private target;
    /**
     * Constructor
     *
     * @param target Pass a component or a function that returns the component after render
     */
    constructor(target: CollapseTarget);
    protected buildState(): ComponentState;
    protected restoreState(state: ComponentState): void;
    private getCollapseTarget;
}
/**
 * Button that can be used to hide and show another component
 * Use "stateId" to remember the collapsed state.
 *
 * @param config
 */
export declare const collapsebtn: (config: Config<CollapseButton> & {
    /**
     * Pass a component or a function that returns the component after render
     */
    target: CollapseTarget;
}) => CollapseButton;
export {};
