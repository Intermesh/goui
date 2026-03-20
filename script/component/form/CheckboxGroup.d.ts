import { Component } from "../Component.js";
import { CheckboxFieldConfig } from "./CheckboxField.js";
import { Config } from "../Observable.js";
export declare class CheckboxGroup extends Component {
    private _itemContainerEl?;
    constructor();
    set options(options: CheckboxFieldConfig[]);
    protected createLabel(): HTMLDivElement | void;
    label: string;
    protected renderItems(): void;
    protected get itemContainerEl(): HTMLDivElement;
}
/**
 * Create a {@link CheckboxGroup}
 *
 * @link https://goui.io/#form/ChecksAndRadios Example
 *
 * @param config
 */
export declare const checkboxgroup: (config?: Config<CheckboxGroup>) => CheckboxGroup;
