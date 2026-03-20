import { Component } from "./Component.js";
import { Toolbar } from "./Toolbar.js";
import { Config } from "./Observable.js";
export declare class Panel extends Component {
    constructor();
    private titleCmp;
    private headerCmp;
    private _title;
    set title(title: string);
    get title(): string;
    collapsible: boolean;
    set collapsed(collapsed: boolean);
    get collapsed(): boolean;
    getHeader(): Toolbar;
    protected createHeader(): Toolbar;
    protected internalRender(): HTMLElement;
    private _itemContainerEl?;
    protected get itemContainerEl(): HTMLElement;
}
/**
 * Shorthand function to create {@link Panel}
 *
 * @param config
 * @param items
 */
export declare const panel: (config?: Config<Panel>, ...items: Component[]) => Panel;
