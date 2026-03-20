/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Config, InferComponentEventMap, ListenersConfig, Observable, ObservableEventMap } from "./Observable.js";
import { Collection } from "../util/index.js";
import { MaterialIcon } from "./MaterialIcon";
/**
 * A component identifier by id, itemId, Component instance or custom function
 */
export type FindComponentPredicate = string | number | Component | ((comp: Component) => boolean | void);
export type Length = number | "auto" | "fit-content" | "min-content" | "max-content";
/**
 * Gets the class type of an instance and allows abstract constructors. Opposite of the InstanceOf<>
 */
type ClassTypeOf<T> = abstract new (...args: any[]) => T;
export interface Constraints {
    /**
     * Left in px
     */
    left: number;
    /**
     * Right in px
     */
    right: number;
    /**
     * Bottom in px
     */
    bottom: number;
    /**
     * Top in px
     */
    top: number;
}
/**
 * A mapping of component events
 *
 * The key is the event name and the describes the listener argument that gets passed to it. This event object always
 * gets an extra property "target" which contains the component emitting the event.
 */
export interface ComponentEventMap extends ObservableEventMap {
    /**
     * Fires when the component renders and is added to the DOM
     *
     * @see Component.render()
     */
    render: {};
    /**
     * Fires just before rendering
     *
     * @see Component.render()
     */
    beforerender: {};
    /**
     * Fires before the element is removed. You can cancel the remove by returning false.
     *
     * @see Component.remove()
     */
    beforeremove: {};
    /**
     * Fires after the component has been removed
     *
     * @see Component.remove()
     */
    remove: {};
    /**
     * Fires before show. You can cancel the show by returning false
     *
     * @see Component.show()

     */
    beforeshow: {};
    /**
     * Fires after showing the component
     *
     * @see Component.show()

     */
    show: {};
    /**
     * Fires before hide. You can cancel the hide by returning false.
     *
     * @see Component.hide()

     */
    beforehide: {};
    /**
     * Fires after hiding the component
     *
     * @see Component.show()

     */
    hide: {};
    /**
     * Fires on focus
     */
    focus: {
        options?: FocusOptions;
    };
    /**
     * Fires when this component is added to a parent but before rendering
     *
     * @param me
     * @param index the index in the parents' items
     */
    added: {
        /**
         * Represents the index of an element in the parents' item collection.
         * The value is zero-based, meaning an index of 0 indicates the first element.
         */
        index: number;
        /**
         * Represents the parent component in a hierarchical structure.
         * This property holds a reference to the parent `Component`,
         * allowing for relationships and communication between
         * components in the system.
         *
         * It is commonly used to establish and manage component
         * dependencies and to maintain the structural hierarchy.
         */
        parent: Component;
    };
    /**
     * Fires when the component is disabled
     *

     */
    disable: {};
    /**
     * Fires when the component is enabled
     *

     */
    enable: {};
}
/**
 * State object for saving and restoring state of component in browser storage for example
 */
export type ComponentState = Record<string, any>;
/**
 * Component
 *
 * A component in its simplest form.
 *
 * @example
 *
 * ```typescript
 * comp({
 *   tagName: "hr",
 *   cls: "special"
 * })
 * ```
 *
 * @link https://goui.io/#component Examples
 */
export declare class Component<EventMapType extends ComponentEventMap = ComponentEventMap> extends Observable<EventMapType> {
    protected _cls?: string;
    private maskTimeout?;
    /**
     * Component constructor
     *
     * @param tagName The tag name used for the root HTMLElement of this component
     */
    constructor(tagName?: keyof HTMLElementTagNameMap);
    protected initEl(tagName: keyof HTMLElementTagNameMap): HTMLElement | HTMLObjectElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLMapElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLScriptElement | HTMLSelectElement | HTMLSlotElement | HTMLSourceElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement;
    /**
     * A base class not configurable. cls can be used to add extra classes leaving this class alone
     *
     * @protected
     */
    protected baseCls: string;
    /**
     * True when added to the DOM tree
     *
     * @private
     */
    private _rendered;
    /**
     * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
     * Component.findItemIndex();
     *
     * if stateId is given it will also be used as itemId
     */
    private _itemId;
    /**
     * ID used for storing state of the component in the State storage.
     *
     * If stateId is given it will also be used as itemId
     *
     * If not set then the component won't store it's state.
     */
    stateId?: string;
    /**
     * When this item is added to a Component this is set to the parent Component
     */
    parent?: Component;
    readonly el: HTMLElement;
    /**
     * Normally components are rendered to its parent component's element. But in some cases like menu's it's desired
     * to render them to the root and position them absolute.
     */
    renderTo?: HTMLElement;
    private _items?;
    private _mask;
    /**
     * Set arbitrary data on a component.
     *
     * Should be used with caution as this data is not typed.
     */
    readonly dataSet: Record<string, any>;
    /**
     * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
     * Component.findItemIndex();
     *
     * if stateId is given it will also be used as itemId
     */
    get itemId(): string | number;
    set itemId(itemId: string | number);
    private initItems;
    /**
     * Called when this component is added to a parent. Useful to override in an extend or with a module:
     *
     * @link https://github.com/Intermesh/goui-docs/blob/main/script/OverrideTest.ts
     *
     * @param index
     */
    onAdded(index: number): void;
    protected getState(): Record<string, any>;
    protected hasState(): boolean | "" | undefined;
    /**
     * Restore state of the component in this function. It's called during rendering.
     *
     * @see saveState();
     * @param state
     *
     * @protected
     */
    protected restoreState(state: ComponentState): void;
    /**
     * Call save start when something relevant to the state changes.
     * Implement buildState() to save relevant state properties and restore it in restoreState()
     *
     * stateId must be set on components to be stateful
     *
     * @protected
     */
    protected saveState(): void;
    /**
     * Build state for the component
     *
     * @see saveState();
     * @protected
     */
    protected buildState(): ComponentState;
    /**
     * Title of the dom element
     */
    set title(title: string);
    get title(): string;
    /**
     * Check if the component has been rendered and added to the DOM tree
     */
    get rendered(): boolean;
    /**
     * Class name to add to element
     *
     * Some common classes to add for layout:
     *
     * - hbox: Set's flex layout to horizontal boxes. Use flex: n to stretch columns
     * - vbox: As above but vertical
     * - fit: Fit the parent's size
     * - scroll: Set's autoscroll: true
     * - pad: Set common padding on the element
     * - border-(top|bottom|left|right) to add a border
     *
     * Other:
     *
     * - goui-fade-in: The component will fade in when show() is used.
     * - goui-fade-out: The component will fade out when hide is used.
     *
     */
    set cls(cls: string);
    get cls(): string;
    private initClassName;
    /**
     * Renders the component and it's children
     */
    protected internalRender(): HTMLElement;
    /**
     * The tabindex attribute specifies the tab order of an element (when the "tab" button is used for navigating).
     */
    set tabIndex(tabIndex: number);
    get tabIndex(): number;
    /**
     * CSS flex value
     */
    set flex(flex: number | string);
    /**
     * CSS flex value
     */
    get flex(): number | string;
    /**
     * Render the component
     *
     * For overriding from another module see:
     * @link https://github.com/Intermesh/goui-docs/blob/main/script/OverrideTest.ts
     *
     * @param parentEl The element this componennt will render into
     * @param insertBefore If given, the element will be inserted before this child
     */
    render(parentEl?: Node, insertBefore?: Node): HTMLElement;
    private addToDom;
    /**
     * Finds the DOM node in the parent's children to insert before when rendering a child component
     *
     * @protected
     */
    protected getInsertBefore(): Node | undefined;
    /**
     * Remove component from the component tree
     */
    remove(): boolean;
    protected internalRemove(): void;
    protected detach(): void;
    /**
     * Hide element
     */
    set hidden(hidden: boolean);
    /**
     * Overridable method so that the (before)show/hide event fire before and after.
     *
     * @param hidden
     * @protected
     */
    protected internalSetHidden(hidden: boolean): void;
    get hidden(): boolean;
    /**
     * Hide this component
     *
     * This sets the "hidden" attribute on the DOM element which set's CSS display:none.
     * You can change this to fade with css class "goui-fade-in" and "goui-fade-out"
     *
     * If you want to override this function, please override internalSetHidden instead so the beforeshow and show event
     * fire at the right time.
     */
    hide(): boolean;
    /**
     * Show the component
     *
     * If you want to override this function, please override internalSetHidden instead so the beforeshow and show event
     * fire at the right time.
     */
    show(): boolean;
    /**
     * Disable component
     */
    set disabled(disabled: boolean);
    get disabled(): boolean;
    /**
     * Set the HTML contents of the component (innerHTML)
     */
    set html(html: string);
    get html(): string;
    /**
     * Set the innerText
     */
    set text(text: string);
    get text(): string;
    /**
     * Set the width in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     *
     */
    set width(width: Length);
    get width(): number;
    /**
     * Set the minimum width in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     *
     */
    set minWidth(width: Length);
    get minWidth(): number;
    /**
     * Set the minimum height in scalable pixels
     *
     * The width is applied in rem units divided by 10. Because the font-size of the html
     * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
     * scaled easily for different themes.
     *
     */
    set minHeight(height: Length);
    get minHeight(): number;
    /**
     * Set inline style
     */
    set style(style: Partial<CSSStyleDeclaration>);
    get style(): Partial<CSSStyleDeclaration>;
    computeZIndex(): number;
    /**
     * The height in scalable pixels
     *
     * @see width
     */
    set height(height: Length);
    get height(): number;
    /**
     * Convert pixels to rem units
     *
     * See also the width property
     * @param px
     */
    static pxToRem(px: number): number;
    private static _remUnitSize;
    /**
     * Calculates and retrieves the size of one rem unit based on the root HTML element's font size.
     * If the value is already computed, it will return the cached value.
     *
     * @return The size of one rem unit in pixels.
     */
    private static remUnitSize;
    /**
     * Convert rem units to pixels
     *
     * See also the width property
     *
     * @param rem
     */
    static remToPx(rem: number): number;
    /**
     * Element ID
     */
    set id(id: string);
    get id(): string;
    /**
     * Focus the component
     *
     * @param o
     */
    focus(o?: FocusOptions): void;
    isFocusable(): boolean;
    /**
     * Get the component that's next to this one
     */
    nextSibling(): Component<ComponentEventMap> | undefined;
    /**
     * Get the component that's previous to this one
     */
    previousSibling(): Component<ComponentEventMap> | undefined;
    /**
     * Find ancestor
     *
     * The method traverses the Component's ancestors (heading toward the document root) until it finds
     * one where the given function returns true.
     *
     * @param fn When the function returns true the item will be returned. Otherwise it will move up to the next parent.
     */
    findAncestor(fn: (cmp: Component) => void | boolean): Component | undefined;
    /**
     * Find parent by instance type of the parent
     *
     * @example
     * ```
     * const form = textField.findAncestorByType(Form);
     * ```
     * @param cls
     */
    findAncestorByType<T extends Component>(cls: ClassTypeOf<T>): T | undefined;
    /**
     * The child components of this component
     */
    get items(): Collection<Component<ComponentEventMap>, import("../index.js").CollectionEventMap<Component<ComponentEventMap>>>;
    protected renderItems(): void;
    protected get itemContainerEl(): HTMLElement;
    /**
     * Can be overridden to wrap the component
     *
     * @param item
     * @protected
     */
    protected renderItem(item: Component): void;
    /**
     * Find the item by element ID, itemId property, Component instance or custom function
     */
    findItemIndex(predicate: FindComponentPredicate): number;
    /**
     * Find the item by element ID, itemId property, Component instance or custom function.
     *
     * If you want to search the component tree hierarchy use {@link findChild()}
     *
     */
    findItem(predicate: FindComponentPredicate): Component | undefined;
    /**
     * Cascade down the component hierarchy
     *
     * @param fn When the function returns false then the cascading will not go into that component. The current Component will be finished!
     */
    cascade(fn: (comp: Component) => boolean | void): void;
    private createFindPredicateFunction;
    /**
     * Find a child at any level by element ID, itemId property, Component instance or custom function.
     *
     * It cascades down the component hierarchy. See also {@link findChildByType}
     *
     */
    findChild(predicate: FindComponentPredicate): Component | undefined;
    /**
     * Find children at any level by element ID, itemId property, Component instance or custom function.
     *
     * It cascades down the component hierarchy. See also {@link findChildByType}
     *
     */
    findChildren(predicate: FindComponentPredicate): Component[];
    /**
     * Find child by instance type of the parent
     *
     * @example
     * ```
     * const form = textField.findAncestorByType(Form);
     * ```
     * @param cls
     */
    findChildByType<T extends Component>(cls: ClassTypeOf<T>): T | undefined;
    /**
     * Find children by instance type of the parent
     *
     * @example
     * ```
     * const form = textField.findAncestorByType(Form);
     * ```
     * @param cls
     */
    findChildrenByType<T extends Component>(cls: ClassTypeOf<T>): T[];
    /**
     * Set attributes of the DOM element
     *
     * @param attr
     */
    set attr(attr: Record<string, string>);
    /**
     * Mask the component to disable user interaction
     * It creates an absolute positioned Mask
     * component. This component should have a non-static position style for this to work.
     */
    mask<T extends Promise<any>>(promise?: T | undefined, delay?: number): T | undefined;
    /**
     * Unmask the body
     */
    unmask(): void;
    private static _uniqueID;
    static uniqueID(): string;
    /**
     * Print this component. Everything else will be left out.
     */
    print(): void;
    protected elToConstraints(el: HTMLElement | Window, pad?: Partial<Constraints>): Constraints;
    /**
     * Constrain the component to the given element.
     *
     * Note that this only works on absolute positioned elements
     *
     * @param el
     * @param pad
     */
    constrainTo(el: HTMLElement | Window, pad?: Partial<Constraints>): void;
}
/**
 * Mask element
 *
 * Shows a mask over the entire (position:relative) element it's in.
 *
 * Used in {@link Body.mask()}
 */
export declare class Mask extends Component {
    protected baseCls: string;
    /**
     * Show loading spinner
     */
    set spinner(spinner: boolean);
}
/**
 * Shorthand function to create a {@link Mask} component
 *
 * @param config
 */
export declare const mask: (config?: Config<Mask>) => Mask;
/**
 * Shorthand function to create a {@link Component}
 *
 * @link https://goui.io/#component Examples
 *
 * ```typescript
 * const c = new comp({
 * 	text: "Hi!"
 * });
 * ```
 */
export declare const comp: (config?: Config<Component>, ...items: Component[]) => Component<ComponentEventMap>;
export declare const i: (config?: Config<Component> | MaterialIcon, ...items: Component[]) => Component<ComponentEventMap>;
export declare const span: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const p: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const small: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const h1: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const h2: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const h3: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const h4: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const code: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const section: (config?: Config<Component> | string, ...items: Component[]) => Component<ComponentEventMap>;
export declare const hr: (config?: Config<Component>) => Component<ComponentEventMap>;
export declare const br: (config?: Config<Component>) => Component<ComponentEventMap>;
export declare const img: (config: Config<Component> & {
    src: string;
    alt?: string;
}) => Component<ComponentEventMap>;
export declare const a: (config: Config<Component> & {
    href?: string;
    target?: string;
}, ...items: Component[]) => Component<ComponentEventMap>;
export declare const progress: (config?: Config<Component>) => Component<ComponentEventMap>;
/**
 * Helper function to create components by fresh instance, configuration and child components
 *
 * @param comp The component instance
 * @param config Configuration object to apply
 * @param items The child components
 */
export declare const createComponent: <T extends Observable, C>(comp: T, config?: C, items?: Component[]) => T;
/**
 * Helper function to assign a Components  configuration object to a Components instance
 *
 * @param comp The component instance
 * @param config Configuration object to apply
 */
export declare function assignComponentConfig<T extends Observable>(comp: T, config: any): void;
/**
 * Helper function to assign component listeners to a component instance
 *
 * @param comp
 * @param listeners
 */
export declare function assignComponentListeners<T extends Observable>(comp: T, listeners: ListenersConfig<T, InferComponentEventMap<T>>): void;
export {};
