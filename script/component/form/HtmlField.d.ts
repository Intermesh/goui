/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Field, FieldConfig, FieldEventMap } from "./Field.js";
import { Toolbar } from "../Toolbar.js";
/**
 * @inheritDoc
 */
export interface HtmlFieldEventMap extends FieldEventMap {
    /**
     * Fires when the toolbar updates based on the current editor state. For example when entering bold text the bold
     * button activates.
     */
    updatetoolbar: {};
    /**
     * Fires when an image is selected, pasted or dropped into the field
     */
    insertimage: {
        /**
         * The insert File object
         */
        file: File;
        /**
         * The img element in the editor
         */
        img: HTMLImageElement;
    };
    /**
     * Fires when a non image is pasted or dropped into the field
     */
    attach: {
        /**
         * The insert File object
         */
        file: File;
    };
}
export interface HtmlField extends Field<HtmlFieldEventMap> {
    set value(v: string);
    get value(): string;
}
/**
 * Available toolbar items
 */
type ToolbarItems = "-" | "bold" | "italic" | "underline" | "strikeThrough" | "foreColor" | "backColor" | "removeFormat" | "justifyLeft" | "justifyCenter" | "justifyRight" | "insertOrderedList" | "insertUnorderedList" | "indent" | "outdent" | "image" | "createLink" | "sourceEdit";
/**
 * A HTML editor field component
 *
 * @link https://goui.io/#form/HtmlField Example
 *
 * @see Form
 */
export declare class HtmlField extends Field<HtmlFieldEventMap> {
    protected baseCls: string;
    /**
     * When the field is empty this will be displayed inside the field
     */
    placeholder: string | undefined;
    /**
     * Automatically detect URL input and change them into anchor tags
     */
    autoLink: boolean;
    private editor;
    private tbar?;
    private imageResizer;
    constructor();
    getEditor(): HTMLDivElement;
    private closestStyle;
    /**
     * Toolbar items to enable.
     *
     * If you can't use inline css then use:
     *
     * ```
     * [
     * 		"bold", "italic", "underline",
     * 		"-",
     * 		"foreColor", "removeFormat",
     * 		"-",
     * 		"insertOrderedList",
     * 		"insertUnorderedList",
     * 		"-",
     * 		"indent",
     * 		"outdent",
     * 		"-",
     * 		"image"
     * 	]
     * ```
     */
    toolbarItems: ToolbarItems[];
    private commands;
    private getSelectedNode;
    private updateToolbar;
    private execCmd;
    /**
     * Inserts an HTML string at the insertion point (deletes selection). Requires a valid HTML string as a value argument.
     *
     * @param html
     */
    insertHtml(html: string): void;
    protected internalRemove(): void;
    getToolbar(): Toolbar;
    protected createControl(): undefined | HTMLElement;
    protected internalRender(): HTMLElement;
    protected internalSetValue(v?: any): void;
    protected internalGetValue(): string | number | boolean | any[] | Record<string, any> | undefined;
    focus(o?: FocusOptions): void;
    private lineIndex;
    private lineSequence;
    private onKeyDown;
    private onDrop;
    private static _uid;
    /**
     * Generate unique ID
     */
    private static imgUID;
    private handleImage;
    private onPaste;
    private onKeyUp;
    /**
     * Converts plain text URIs within the editor's content into anchor (link) elements.
     * This method traverses the DOM structure of the editor, identifies URIs in text nodes,
     * and replaces them with clickable anchor elements, while preserving the user's current selection.
     */
    private convertUrisToAnchors;
}
/**
 * Shorthand function to create {@link HtmlField}
 *
 * @link https://goui.io/#form/HtmlField Examples
 *
 * @param config
 */
export declare const htmlfield: (config?: FieldConfig<HtmlField>) => HtmlField;
export {};
