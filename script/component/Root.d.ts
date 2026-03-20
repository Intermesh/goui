/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
/**
 * Root container to add the top level components to the body.
 *
 * Use the export variable body below
 */
declare class Root extends Component {
    protected internalRender(): HTMLElement;
    get rendered(): boolean;
    protected initEl(tagName: keyof HTMLElementTagNameMap): HTMLElement;
    constructor();
    private initColorScheme;
}
/**
 * The body component
 *
 * There's only one body so use this variable.
 *
 * To create a Single Page Application one typically would add a {@link CardContainer} to the body.
 *
 * @example
 * ```
 * root.items.add(cmp({html: "Hello world!"});
 * ```
 */
export declare const root: Root;
export {};
