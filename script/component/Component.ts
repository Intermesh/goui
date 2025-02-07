/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */


import {
	Config,
	Listener,
	Observable,
	ObservableEventMap,
	ObservableListener,
	ObservableListenerOpts,
} from "./Observable.js";
import {State} from "../State.js";
import {browser, Collection} from "../util/index.js";

/**
 * A component identifier by id, itemId, Component instance or custom function
 */
export type FindComponentPredicate = string | number | Component | ((comp: Component) => boolean | void);

// interface ClassTypeOf<T> {
// 	new(...args: any[]): T
// }

type ClassTypeOf<T> = abstract new (...args: any[]) => T;

// type ClassTypeOf<T> = Function & { prototype: T };

const html = document.querySelector('html')!;
export const REM_UNIT_SIZE = parseFloat(window.getComputedStyle(html).fontSize);


export interface ComponentEventMap<Type> extends ObservableEventMap<Type> {
	/**
	 * Fires when the component renders and is added to the DOM
	 *
	 * @see Component.render()
	 * @param comp
	 */
	render: (comp: Type) => void

	/**
	 * Fires just before rendering
	 *
	 * @see Component.render()
	 * @param comp
	 */
	beforerender: (comp: Type) => void

	/**
	 * Fires before the element is removed. You can cancel the remove by returning false
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	beforeremove: (comp: Type) => false | void

	/**
	 * Fires after the component has been removed
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	remove: (comp: Type) => void

	/**
	 * Fires before show. You can cancel the show by returning false
	 *
	 * @see Component.show()
	 * @param comp
	 */
	beforeshow: (comp: Type) => false | void

	/**
	 * Fires after showing the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	show: (comp: Type) => void

	/**
	 * Fires before hide. You can cancel the hide by returning false.
	 *
	 * @see Component.hide()
	 * @param comp
	 */
	beforehide: (comp: Type) => false | void

	/**
	 * Fires after hiding the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	hide: (comp: Type) => void,

	/**
	 * Fires on focus
	 *
	 * @param comp
	 * @param o
	 */
	focus: (comp: Type, o?: FocusOptions) => void

	/**
	 * Fires when this component is added to a parent but before rendering
	 *
	 * @param me
	 * @param index the index in the parents' items
	 */
	added: (comp: Type, index: number, parent: Component) => void

	/**
	 * Fires when the component is disabled
	 *
	 * @param comp
	 */
	disable: (comp: Type) => void

	/**
	 * Fires when the component is enabled
	 *
	 * @param comp
	 */
	enable: (comp: Type) => void
}

export interface Component extends Observable {
	on<K extends keyof ComponentEventMap<Component>, L extends Listener>(eventName: K, listener: Partial<ComponentEventMap<Component>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof ComponentEventMap<this>>(eventName: K, listener: Partial<ComponentEventMap<this>>[K]): boolean
	fire<K extends keyof ComponentEventMap<Component>>(eventName: K, ...args: Parameters<ComponentEventMap<any>[K]>): boolean
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
 * Component.create({
 *   tagName: "hr",
 *   cls: "special"
 * })
 * ```
 */
export class Component extends Observable {

	protected _cls?: string;
	private maskTimeout?: any;

	/**
	 * Component constructor
	 *
	 * @param tagName The tagname used for the root HTMLElement of this component
	 */
	constructor(readonly tagName: keyof HTMLElementTagNameMap = "div") {
		super();
	}

	/**
	 * A base class not configurable. cls can be used to add extra classes leaving this class alone
	 *
	 * @protected
	 */
	protected baseCls: string = "";

	/**
	 * True when added to the DOM tree
	 *
	 * @private
	 */
	private _rendered = false;

	/**
	 * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
	 * Component.findItemIndex();
	 *
	 * if stateId is given it will also be used as itemId
	 */

	private _itemId: string|number = "";

	/**
	 * ID used for storing state of the component in the State storage.
	 *
	 * If stateId is given it will also be used as itemId
	 *
	 * If not set then the component won't store it's state.
	 */
	public stateId?: string;

	/**
	 * When this item is added to a Component this is set to the parent Component
	 */
	public parent?: Component;

	/**
	 * Normally components are rendered to its parent component's element. But in some cases like menu's it's desired
	 * to render them to the root and position them absolute.
	 */
	public renderTo?: HTMLElement;

	private _items?: Collection<Component>;

	private _mask: Mask | undefined;


	/**
	 * Set arbitrary data on a component.
	 *
	 * Should be used with caution as this data is not typed.
	 */
	public readonly dataSet : Record<string, any> = {};

	/**
	 * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
	 * Component.findItemIndex();
	 *
	 * if stateId is given it will also be used as itemId
	 */
	get itemId() {
		if(this._itemId !== undefined) {
			return this._itemId;
		}

		if(this.stateId !== undefined) {
			return this.stateId;
		}

		return this.el.id || "";
	}

	set itemId(itemId: string|number) {
		this._itemId = itemId;
	}

	private initItems() {

		this.items.on("add", (_collection, item, index) => {

			item.parent = this;
			//@ts-ignore hack for ext comps. They have a supr() method
			if(!item.supr) {
				item.onAdded(index);
			}

			if (this.rendered) {
				this.renderItem(item);
			}

		});

		this.items.on("remove", (_collection, item) => {
			if (item.parent) {
				item.parent = undefined;
				item.remove();
			}
		});
	}

	/**
	 * Called when this component is added to a parent. Useful to override in an extend or with a module:
	 *
	 * @link https://github.com/Intermesh/goui-docs/blob/main/script/OverrideTest.ts
	 *
	 * @param index
	 */
	public onAdded(index:number) {
		// fires before render! Menu uses this to modify item.parent
		this.fire("added", this, index, this.parent!);
	}

	protected getState() {
		return State.get().getItem(this.stateId!);
	}

	protected hasState() {
		return this.stateId && State.get().hasItem(this.stateId);
	}

	/**
	 * Restore state of the component in this function. It's called before render in init().
	 *
	 * @see saveState();
	 * @param state
	 *
	 * @protected
	 */
	protected restoreState(state: ComponentState) {

	}

	/**
	 * Call save start when something relevant to the state changes.
	 * Implement buildState() to save relevant state properties and restore it in restoreState()
	 *
	 * stateId must be set on components to be stateful
	 *
	 * @protected
	 */
	protected saveState() {
		if (this.stateId) {
			State.get().setItem(this.stateId, this.buildState());
		}
	}

	/**
	 * Build state for the component
	 *
	 * @see saveState();
	 * @protected
	 */
	protected buildState(): ComponentState {
		return {};
	}

	/**
	 * Title of the dom element
	 */
	set title(title: string) {
		this.el.title = title;
	}

	get title() {
		return this.el.title;
	}

	/**
	 * Check if the component has been rendered and added to the DOM tree
	 */
	public get rendered() {
		return this._rendered;
	}

	private _el?: HTMLElement;

	get el() {
		if (!this._el) {
			this._el = document.createElement(this.tagName);
		}
		return this._el;
	}

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
	set cls(cls: string) {

		//remove previously set
		if(this._cls) {
			this.el.classList.remove(...this._cls.split(/\s+/));
		}

		this._cls = cls ? cls.trim() : undefined;
		this.initClassName();
		if(this._cls) {
			this.el.classList.add(...this._cls.split(/\s+/));
		}
	}

	get cls() {
		return this._cls ?? "";
	}

	private initClassName() {
		if (this.el.classList.contains("goui")) {
			return;
		}
		this.el.classList.add("goui");
		if (this.baseCls) {
			this.el.classList.add(...this.baseCls.trim().split(/\s+/));
		}
	}

	/**
	 * Renders the component and it's children
	 */
	protected internalRender() {
		this.initClassName();
		this.renderItems();

		if (this.stateId) {
			this.restoreState(this.getState());
		}

		return this.el;
	}

	/**
	 * The tabindex attribute specifies the tab order of an element (when the "tab" button is used for navigating).
	 */
	set tabIndex(tabIndex: number) {
		this.el.tabIndex = tabIndex;
	}

	get tabIndex() {
		return this.el.tabIndex;
	}

	/**
	 * CSS flex value
	 */
	set flex(flex: number | string) {
		this.el.style.flex = flex + "";
	}

	/**
	 * CSS flex value
	 */
	get flex() {
		return this.el.style.flex;
	}

	/**
	 * Render the component
	 *
	 * For overriding from another module see:
	 * @link https://github.com/Intermesh/goui-docs/blob/main/script/OverrideTest.ts
	 *
	 * @param parentEl The element this componennt will render into
	 * @param insertBefore If given, the element will be inserted before this child
	 */
	public render(parentEl?: Node, insertBefore?: Node) {

		if (this._rendered) {
			throw new Error("Already rendered");
		}

		this.fire("beforerender", this);

		// If parent is already rendered then we must determine the DOM index of this child item
		// if parent is rendering then we can simply add it
		if (!parentEl) {

			if(this.renderTo) {
				parentEl = this.renderTo;
			} else {

				if (!this.parent) {
					throw new Error("No parent set for " + (typeof this));
				}
				parentEl = this.parent.itemContainerEl;
				insertBefore = this.getInsertBefore();
			}
		}

		if (!insertBefore) {
			parentEl.appendChild(this.el);
		} else {
			parentEl.insertBefore(this.el, insertBefore);
		}

		// It actually makes more sense to me to render before inserting to the DOM. Perhaps
		// that also performs better but there is a problem with rendering ExtJS components inside GOUI
		// components if we do that. ExtJS relies on the elements alread being in the DOM tree.
		// For now we have to do it afterwards.
		this.internalRender();

		this._rendered = true;

		this.fire("render", this);

		return this.el;
	}

	/**
	 * Finds the DOM node in the parent's children to insert before when rendering a child component
	 *
	 * @protected
	 */
	protected getInsertBefore() {
		if (!this.parent!.rendered) {
			return undefined;
		}

		const index = this.parent!.items.indexOf(this);

		let refItem: Node | undefined = undefined;
		//find nearest rendered item
		for (let i = index + 1, l = this.parent!.items.count(); i < l; i++) {
			if (this.parent!.items.get(i)!.rendered) {
				refItem = this.parent!.items.get(i)!.el;
				break;
			}
		}

		return refItem;
	}

	/**
	 * Remove component from the component tree and destroy it's dom.
	 */
	public remove() {
		if (!this.fire("beforeremove", this)) {
			return false;
		}

		this.internalRemove();

		this.fire("remove", this);

		return true;
	}

	protected internalRemove() {
		this.items.clear();

		// remove this item from parent the Component
		if (this.parent) {

			// detach from parent here so parent won't call this.remove() again
			const p = this.parent;
			this.parent = undefined;

			p.items.remove(this);
		}

		//remove it from the DOM
		if (this.el) {
			this.el.remove();
		}
	}

	/**
	 * Hide element
	 */
	set hidden(hidden: boolean) {

		if (this.el.hidden == hidden) {
			return;
		}

		const eventName = hidden ? "hide" : "show";

		// noinspection PointlessBooleanExpressionJS
		if (this.fire("before" + eventName as keyof ComponentEventMap<Component>, this) === false) {
			return;
		}

		this.internalSetHidden(hidden);

		this.fire(eventName, this);

	}

	/**
	 * Overridable method so that the (before)show/hide event fire before and after.
	 *
	 * @param hidden
	 * @protected
	 */
	protected internalSetHidden(hidden: boolean) {
		this.el.hidden = hidden;
	}

	get hidden() {
		return this.el.hidden;
	}

	/**
	 * Hide this component
	 *
	 * This sets the "hidden" attribute on the DOM element which set's CSS display:none.
	 * You can change this to fade with css class "goui-fade-in" and "goui-fade-out"
	 *
	 * If you want to override this function, please override internalSetHidden instead so the beforeshow and show event
	 * fire at the right time.
	 */
	public hide() {
		this.hidden = true;

		return this.hidden;
	}

	/**
	 * Show the component
	 *
	 * If you want to override this function, please override internalSetHidden instead so the beforeshow and show event
	 * fire at the right time.
	 */
	public show() {
		this.hidden = false;

		return !this.hidden;
	}

	/**
	 * Disable component
	 */
	set disabled(disabled: boolean) {
		if (!disabled) {
			this.el.removeAttribute("disabled");
			this.fire("enable", this);
		} else {
			this.el.setAttribute("disabled", "");
			this.fire("disable", this);
		}
	}

	get disabled() {
		return this.el.hasAttribute('disabled');
	}

	/**
	 * Set the HTML contents of the component (innerHTML)
	 */
	set html(html: string) {
		this.el.innerHTML = html;
	}

	get html() {
		return this.el.innerHTML;
	}

	/**
	 * Set the innerText
	 */
	set text(text: string) {
		this.el.innerText = text;
	}

	get text() {
		return this.el.innerText;
	}

	/**
	 * Set the width in scalable pixels
	 *
	 * The width is applied in rem units divided by 10. Because the font-size of the html
	 * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
	 * scaled easily for different themes.
	 *
	 */
	set width(width: number | "auto") {
		if(width == "auto") {
			this.el.style.width = "auto";
		} else {
			this.el.style.width = (width / 10) + "rem";
		}
	}

	get width()  {
		const px = this.el.offsetWidth;
		if(px) {
			return Component.pxToRem(px);
		}

		const styleWidth = this.el.style.width;
		if(styleWidth.substring(styleWidth.length - 3) == "rem") {
			return parseFloat(styleWidth) * 10;
		} else if(styleWidth.substring(styleWidth.length - 2) == "px") {
			return Component.pxToRem(parseFloat(styleWidth));
		}
		return 0;
	}

	/**
	 * Set the minimum width in scalable pixels
	 *
	 * The width is applied in rem units divided by 10. Because the font-size of the html
	 * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
	 * scaled easily for different themes.
	 *
	 */
	set minWidth(width: number) {
		this.el.style.minWidth = (width / 10) + "rem";
	}

	get minWidth() {
		const w = this.el.style.minWidth;
		if(w.substring(w.length - 3) == "rem") {
			return parseFloat(w) * 10;
		} else if(w.substring(w.length - 2) == "px") {
			return Component.pxToRem(parseFloat(w));
		}
		return 0;
	}


	/**
	 * Set the minimum height in scalable pixels
	 *
	 * The width is applied in rem units divided by 10. Because the font-size of the html
	 * element has a font-size of 62.5% this is equals the amount of pixels, but it can be
	 * scaled easily for different themes.
	 *
	 */
	set minHeight(height: number) {
		this.el.style.minHeight = (height / 10) + "rem";
	}

	get minHeight() {
		const h = this.el.style.minHeight;
		if(h.substring(h.length - 3) == "rem") {
			return parseFloat(h) * 10;
		} else if(h.substring(h.length - 2) == "px") {
			return Component.pxToRem(parseFloat(h));
		}
		return 0;
	}

	/**
	 * Set inline style
	 */
	set style(style: Partial<CSSStyleDeclaration>) {
		Object.assign(this.el.style, style);
	}

	get style() {
		return this.el.style;
	}

	public computeZIndex(): number {
		const z = parseInt(window.getComputedStyle(this.el).getPropertyValue('z-index'));
		if (!z) {
			return this.parent ? this.parent.computeZIndex() : 0;
		} else {
			return z;
		}
	};


	/**
	 * The height in scalable pixels
	 *
	 * @see width
	 */
	set height(height: number | "auto") {
		if(height == "auto") {
			this.el.style.height = "auto";
		} else {
			this.el.style.height = (height / 10) + "rem";
		}
	}

	get height() {
		const px = this.el.offsetHeight;
		if(px) {
			return Component.pxToRem(px);
		}

		const styleHeight = this.el.style.height;
		if(styleHeight.substring(styleHeight.length - 3) == "rem") {
			return parseFloat(styleHeight) * 10;
		} else if(styleHeight.substring(styleHeight.length - 2) == "px") {
			return Component.pxToRem(parseFloat(styleHeight));
		}
		return 0;
	}

	/**
	 * Convert pixels to rem units
	 *
	 * See also the width property
	 * @param px
	 */
	public static pxToRem(px:number) :number {
		return (px / REM_UNIT_SIZE) * 10;
	}

	/**
	 * Convert rem units to pixels
	 *
	 * See also the width property
	 *
	 * @param rem
	 */
	public static remToPx(rem:number) :number {
		return (rem * REM_UNIT_SIZE) / 10;
	}

	/**
	 * Element ID
	 */
	set id(id: string) {
		this.el.id = id;
	}

	get id() {
		return this.el.id;
	}


	/**
	 * Focus the component
	 *
	 * @param o
	 */
	public focus(o?: FocusOptions) {
		// setTimeout needed for chrome :(
		// setTimeout(() => {
			this.el.focus(o);
			this.fire("focus", this, o);
		// });
	}


	public isFocusable() {
		return this.el && !this.hidden && (this.el.tagName == "BUTTON" ||
			this.el.tagName == "INPUT" ||
			this.el.tagName == "A" ||
			this.el.tagName == "AREA" ||
			this.el.tabIndex > -1);
	}

	/**
	 * Get the component that's next to this one
	 */
	public nextSibling() {

		if (!this.parent) {
			return undefined;
		}
		const index = this.parent.items.indexOf(this);

		if (index == -1) {
			return undefined;
		}

		return this.parent.items.get(index + 1);
	}

	/**
	 * Get the component that's previous to this one
	 */
	public previousSibling() {

		if (!this.parent) {
			return undefined;
		}
		const index = this.parent.items.indexOf(this);

		if (index < 1) {
			return undefined;
		}

		return this.parent.items.get(index - 1);
	}

	/**
	 * Find ancestor
	 *
	 * The method traverses the Component's ancestors (heading toward the document root) until it finds
	 * one where the given function returns true.
	 *
	 * @param fn When the function returns true the item will be returned. Otherwise it will move up to the next parent.
	 */
	public findAncestor(fn: (cmp: Component) => void | boolean): Component | undefined {
		let p = this.parent;
		while (p != undefined) {
			if (fn(p)) {
				return p;
			} else {
				p = p.parent;
			}
		}

		return undefined;
	}

	/**
	 * Find parent by instance type of the parent
	 *
	 * @example
	 * ```
	 * const form = textField.findAncestorByType(Form);
	 * ```
	 * @param cls
	 */
	public findAncestorByType<T extends ClassTypeOf<Component>>(cls: T): InstanceType<T> | undefined {
		const p = this.findAncestor(cmp => cmp instanceof cls);
		if (p) {
			return p as InstanceType<T>;
		} else {
			return undefined;
		}
	}


	/**
	 * The child components of this component
	 */
	get items() {
		if (!this._items) {
			this._items = new Collection<Component>();
			this.initItems();
		}
		return this._items;
	}

	protected renderItems() {
		if (this._items) {
			this._items.forEach((item) => {
				this.renderItem(item);
			});
		}
	}

	protected get itemContainerEl() {
		return this.el;
	}

	/**
	 * Can be overridden to wrap the component
	 *
	 * @param item
	 * @protected
	 */
	protected renderItem(item: Component) {

		//@ts-ignore Support extjs components in GOUI
		if(item.supr) {
			item.render(this.itemContainerEl, undefined);
			//@ts-ignore Support extjs components in GOUI
			if(item.doLayout) {
				//@ts-ignore Support extjs components in GOUI
				item.doLayout();
			}
		} else {
			item.render(this.itemContainerEl, item.getInsertBefore());
		}
	}

	/**
	 * Find the item by element ID, itemId property, Component instance or custom function
	 */
	public findItemIndex(predicate: FindComponentPredicate): number {
		let fn = this.createFindPredicateFunction(predicate);
		return this.items.findIndex(fn);
	}

	/**
	 * Find the item by element ID, itemId property, Component instance or custom function.
	 *
	 * If you want to search the component tree hierarchy use {@link findChild()}
	 *
	 */
	public findItem(predicate: FindComponentPredicate): Component | undefined {
		let fn = this.createFindPredicateFunction(predicate);
		return this.items.find(fn);
	}

	/**
	 * Cascade down the component hierarchy
	 *
	 * @param fn When the function returns false then the cascading will be stopped. The current Component will be finished!
	 */
	public cascade(fn: (comp: Component) => boolean | void) {
		if (fn(this) === false) {
			return this;
		}
		if (this.items) {
			for (let cmp of this.items) {
				cmp.cascade && cmp.cascade(fn);
			}
		}

		return this;
	}

	private createFindPredicateFunction(predicate: FindComponentPredicate): (comp: Component) => boolean | void {
		if (predicate instanceof Function) {
			return predicate;
		} else {
			return (item: Component) => {
				return item === predicate || item.itemId === predicate || item.id === predicate;
			}
		}
	}

	/**
	 * Find a child at any level by element ID, itemId property, Component instance or custom function.
	 *
	 * It cascades down the component hierarchy. See also {@link findChildByType}
	 *
	 */
	public findChild(predicate: FindComponentPredicate): Component | undefined {
		let fn = this.createFindPredicateFunction(predicate);

		let child;
		this.cascade((item: any) => {
			if (fn(item)) {
				child = item;
				return false;
			}
		});

		return child;
	}

	/**
	 * Find children at any level by element ID, itemId property, Component instance or custom function.
	 *
	 * It cascades down the component hierarchy. See also {@link findChildByType}
	 *
	 */
	public findChildren(predicate: FindComponentPredicate): Component[] {
		let fn = this.createFindPredicateFunction(predicate);

		const children:Component[] = [];
		this.cascade((item: any) => {
			if (fn(item)) {
				children.push(item);
			}
		});

		return children;
	}

	/**
	 * Find child by instance type of the parent
	 *
	 * @example
	 * ```
	 * const form = textField.findAncestorByType(Form);
	 * ```
	 * @param cls
	 */
	public findChildByType<T extends Component>(cls: ClassTypeOf<T>): T | undefined {
		const p = this.findChild(cmp => cmp instanceof cls);
		if (p) {
			return p as T;
		} else {
			return undefined;
		}
	}

	/**
	 * Find children by instance type of the parent
	 *
	 * @example
	 * ```
	 * const form = textField.findAncestorByType(Form);
	 * ```
	 * @param cls
	 */
	public findChildrenByType<T extends Component>(cls: ClassTypeOf<T>): T[] {
		return this.findChildren(Component => Component instanceof cls) as T[];
	}

	/**
	 * Set attributes of the DOM element
	 *
	 * @param attr
	 */
	set attr(attr:Record<string, string>) {
		for(let name in attr) {
			this.el.setAttribute(name, attr[name]);
		}
	}


	/**
	 * Mask the component to disable user interaction
	 * It creates an absolute positioned Mask
	 * component. This component should have a non-static position style for this to work.
	 */
	public mask<T extends Promise<any>>(promise:T|undefined = undefined, delay: number = 300) {

		if(promise) {
			promise.finally(() => {
				this.unmask()
			})
		}

		if(this.maskTimeout || (this._mask && this._mask.hidden == false)) {
			return promise;
		}

		this.maskTimeout = setTimeout(() => {
			if (!this._mask) {
				this._mask = mask({spinner: true});
				this.items.add(this._mask);
			}
			this.el.classList.add("masked");
			this._mask.show();
			this.maskTimeout = undefined;
		}, delay);

		return promise;
	}

	/**
	 * Unmask the body
	 */
	public unmask() {
		if(this.maskTimeout) {
			clearTimeout(this.maskTimeout);
			this.maskTimeout = undefined;
		}
		if (this._mask) {
			this._mask.hide();
		}
		this.el.classList.remove("masked");
	}

	private static _uniqueID = 0;

	public static uniqueID() {
		return "goui-" + (++Component._uniqueID)
	}


	/**
	 * Print this component. Everything else will be left out.
	 */
	public print() {

		// this.el.classList.add("goui-print");
		// window.print();
		//
		// window.addEventListener("afterprint" , () => {
		// 	// document.title = oldTitle;
		// 	// this.el.classList.remove("goui-print");
		// }, {once: true});


		let paper = document.getElementById('paper');
		if(!paper) {
			paper = document.createElement("div");
			paper.id = "paper";
			document.body.appendChild(paper);
		}

		const style = window.getComputedStyle(this.el);
		paper.style.cssText = style.cssText;

		const size = this.el.getBoundingClientRect();
		paper.style.width = size.width + "px";

		paper.innerHTML = this.el.innerHTML;

		const oldTitle = document.title;
		if(this.title) {
			//replace chars not valid for filenames
			document.title = this.title.replace(':', '.').replace(/[/\\?%*|"<>]+/g, '-');;
		}

		if(!browser.isFirefox()){
			Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
				browser.isSafari() ? document.execCommand('print') : window.print();
			});
		} else {
			// this is not needed in firefox and somehow it also fails to resolve the promises above.
			window.print();
		}

		window.addEventListener("afterprint" , () => {
			if(oldTitle) {
				document.title = oldTitle;
			}

			if(paper) {
				paper.innerHTML = "";
			}
		}, {once: true});

	}
}


/**
 * Mask element
 *
 * Shows a mask over the entire (position:relative) element it's in.
 *
 * Used in {@link Body.mask()}
 */
export class Mask extends Component {

	protected baseCls = "goui-mask";

	/**
	 * Show loading spinner
	 */
	set spinner(spinner: boolean) {
		if (spinner) {
			this.html = '<div class="spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
		}
	}
}

/**
 * Shorthand function to create a {@link Mask} component
 *
 * @param config
 */
export const mask = (config?: Config<Mask>) => createComponent(new Mask(), config);

/**
 * Shorthand function to create {@link Component}
 */
export const comp = (config?: Config<Component>, ...items: Component[]) => createComponent(new Component(config?.tagName), config, items);

export const span = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("span"), typeof config == 'string' ? {html: config} : config, items);
export const p = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("p"), typeof config == 'string' ? {html: config} : config, items);
export const small = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("small"), typeof config == 'string' ? {html: config} : config, items);
export const h1 = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("h1"), typeof config == 'string' ? {html: config} : config, items);
export const h2 = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("h2"), typeof config == 'string' ? {html: config} : config, items);
export const h3 = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("h3"), typeof config == 'string' ? {html: config} : config, items);
export const h4 = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("h4"), typeof config == 'string' ? {html: config} : config, items);

export const code = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("code"), typeof config == 'string' ? {html: config} : config, items);
export const section = (config?: Config<Component> | string, ...items: Component[]) => createComponent(new Component("section"), typeof config == 'string' ? {html: config} : config, items);
export const hr = (config?: Config<Component>) => createComponent(new Component("hr"), config);
export const br = (config?: Config<Component>) => createComponent(new Component("br"), config);
export const img = (config: Config<Component> & {src:string, alt?:string}) => {
	const img = createComponent(new Component("img"), config);
	img.attr = {
		src: config.src,
		alt: config.alt ?? ""
	}
	return img;
}

export const a = (config: Config<Component> & {href?:string, target?: string}, ...items: Component[]) => {
	const a = createComponent(new Component("a"), config, items);
	a.attr = {
		href: config.href ?? "",
		target: config.target ?? ""
	}
	return a;
}

export const progress = (config?: Config<Component>) => createComponent(new Component("progress"), config);

export type BaseConfig = {
	listeners?:ObservableListener<any>
}
export const createComponent = <T extends Observable, C extends BaseConfig>(comp: T, config?: C, items?: Component[]): T => {

	if (config) {
		assignComponentConfig(comp, config)
	}
	if (items && items.length) {
		(comp as any).items.add(...items);
	}
	return comp;
}


export function assignComponentConfig<T extends Observable, C extends BaseConfig>(comp: T, config: C) {
	if (config.listeners) {
		assignComponentListeners(comp, config.listeners);
		delete config.listeners;
	}
	Object.assign(comp as any, config);
}

export function assignComponentListeners<T extends Observable>(comp:T, listeners: ObservableListener<any>) {

	for (let key in listeners) {
		const eventName = key as keyof ObservableEventMap<any>;
		if (typeof listeners[eventName] == 'function') {
			comp.on(eventName, listeners[eventName] as never);
		} else {
			const o = listeners[eventName];
			const fn = o.fn as never;
			delete o.fn;
			comp.on(eventName, fn, o);
		}
	}
}