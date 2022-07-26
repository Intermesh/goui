// noinspection JSUnusedGlobalSymbols

import {Observable, ObservableEventMap, ObservableListener, ObservableListenerOpts,} from "./Observable.js";
import {State} from "../State.js";
import {Collection} from "../util/Collection.js";

export type FindComponentPredicate = string | Component | ((comp: Component) => boolean | void);

export type ComponentConstructor<T extends Component> = new (...args: any[]) => T;


interface Type<T> {
	new(...args: any[]): T
}


export interface ComponentEventMap<Type> extends ObservableEventMap<Type> {
	/**
	 * Fires when the component renders and is added to the DOM
	 *
	 * @see Component.render()
	 * @param comp
	 */
	render: <Sender extends Type>(sender: Sender) => void

	/**
	 * Fires just before rendering
	 *
	 * @see Component.render()
	 * @param comp
	 */
	beforerender: <Sender extends Type> (sender: Sender) => void

	/**
	 * Fires before the element is removed. You can cancel the remove by returning false
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	beforeremove: <Sender extends Type>(sender: Sender) => false | void

	/**
	 * Fires after the component has been removed
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	remove: <Sender extends Type> (sender: Sender) => void

	/**
	 * Fires before show. You can cancel the show by returning false
	 *
	 * @see Component.show()
	 * @param comp
	 */
	beforeshow: <Sender extends Type>(sender: Sender) => false | void

	/**
	 * Fires after showing the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	show: <Sender extends Type>(sender: Sender) => void

	/**
	 * Fires before hide. You can cancel the hide by returning false
	 *
	 * @see Component.hide()
	 * @param comp
	 */
	beforehide: <Sender extends Type>(sender: Sender) => false | void

	/**
	 * Fires after hiding the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	hide: <Sender extends Type> (sender: Sender) => void,

	/**
	 * Fires on focus
	 *
	 * @param comp
	 * @param o
	 */
	focus: <Sender extends Type> (sender: Sender, o?: FocusOptions) => void

	/**
	 * Fires when this component is added to a parent
	 *
	 * @param me
	 * @param index the index in the parents' items
	 */
	added: <Sender extends Type> (sender: Sender, index: number) => void
}

export interface Component {
	on<K extends keyof ComponentEventMap<this>>(eventName: K, listener: Partial<ComponentEventMap<this>>[K], options?: ObservableListenerOpts): void

	fire<K extends keyof ComponentEventMap<this>>(eventName: K, ...args: Parameters<ComponentEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<ComponentEventMap<this>>)
}

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
	protected baseCls?: string;

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

	private _itemId: string = "";

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

	private _items?: Collection<Component>;

	private _mask: Mask | undefined;

	/**
	 * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
	 * Component.findItemIndex();
	 *
	 * if stateId is given it will also be used as itemId
	 */
	get itemId() {
		return this._itemId || this.stateId || "";
	}

	set itemId(itemId: string) {
		this._itemId = itemId;
	}

	private initItems() {

		this.items.on("add", (collection, item, index) => {

			item.parent = this;

			item.fire("added", item, index);

			if (this.rendered) {
				item.render();
			}

		});

		this.items.on("remove", (collection, item) => {
			item.parent = undefined;
			item.remove();
		});

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
		this.initClassName();
		this.el.className += " " + cls;
	}

	private initClassName() {
		if(this.el.classList.contains("goui")) {
			return;
		}
		this.el.classList.add("goui");
		if (this.baseCls) {
			this.el.className += " " + this.baseCls;
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
	 * Make it resizable
	 */
	set resizable(resizable: boolean) {
		if (resizable) {
			this.el.classList.add(".goui-resizable");
		} else {
			this.el.classList.remove(".goui-resizable");
		}
	}

	get resizable() {
		return this.el.classList.contains(".goui-resizable");
	}

	/**
	 * Render the component
	 *
	 * @param parentEl The element this componennt will render into
	 * @param insertBefore If given, the element will be inserted before this child
	 */
	public render(parentEl?: Node, insertBefore?: Node) {

		if(!this.parent) {
			throw new Error("No parent set for " + (typeof this));
		}

		if (this._rendered) {
			throw new Error("Already rendered");
		}

		this.fire("beforerender", this);

		// If parent is already rendered then we must determine the DOM index of this child item
		// if parent is rendering then we can simply add it
		if(!parentEl) {
			parentEl = this.parent.el;
			insertBefore = this.parent.rendered ? this.getInsertBefore() : undefined;
		}

		if (!insertBefore) {
			parentEl.appendChild(this.el);
		} else {
			parentEl.insertBefore(this.el, insertBefore);
		}

		this.internalRender();

		this._rendered = true;

		this.fire("render", this);

		return this.el;
	}

	private getInsertBefore() {
		const index = this.parent!.items.indexOf(this);

		let refItem: Node | undefined = undefined;
		//find nearest rendered item
		for (let i = index + 1, l = this.parent!.items.count(); i < l; i++) {
			if (this.parent!.items.get(i).rendered) {
				refItem = this.parent!.items.get(i).el;
				break;
			}
		}

		return refItem;
	}

	/**
	 * Remove component from the component tree
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

		// remove this item from the Component
		if (this.parent) {
			this.parent.items.remove(this);
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
		this.el.hidden = hidden;

		this.fire(eventName, this);
	}

	get hidden() {
		return this.el.hidden;
	}

	/**
	 * Hide this component
	 *
	 * This sets the "hidden" attribute on the DOM element which set's CSS display:none.
	 * You can change this to fade with css class "goui-fade-in" and "goui-fade-out"
	 */
	public hide() {
		this.hidden = true;

		return this.hidden;
	}

	/**
	 * Show the component
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
		} else {
			this.el.setAttribute("disabled", "");
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
	 * Width in pixels
	 */
	set width(width: number) {
		this.el.style.width = width + "px";
	}

	get width() {
		return this.el.offsetWidth || parseFloat(this.el.style.width);
	}

	/**
	 * Width in pixels
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
	 * height in pixels
	 */
	set height(height: number) {
		this.el.style.height = height + "px";
	}

	get height() {
		return this.el.offsetHeight || parseFloat(this.el.style.height);
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
		setTimeout(() => {
			this.el.focus(o);
			this.fire("focus", this, o);
		});
	}

	/**
	 * Find ancestor
	 *
	 * The method traverses the Component's ancestors (heading toward the document root) until it finds
	 * one where the given function returns true.
	 *
	 * @param fn When the function returns true the item will be returned. Otherwise it will move up to the next parent.
	 */
	public findAncestor(fn: (Component: Component) => void | boolean): Component | undefined {
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
	public findAncestorByType<T extends typeof Component>(cls: T): InstanceType<T> | undefined {
		const p = this.findAncestor(Component => Component instanceof cls);
		if (p) {
			return <InstanceType<T>>p;
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
				// if items are hidden then defer rendering until item is shown
				if(item.hidden) {
					item.on("show", (item) => {
						item.render();
					}, {once: true})
				} else {
					item.render();
				}
			});
		}
	}



	/**
	 * Find the item by element ID, itemId property, Component instance or custom function
	 */
	public findItemIndex(predicate: FindComponentPredicate): number {
		let fn = this.getFindPredicate(predicate);
		return this.items.findIndex(fn);
	}

	/**
	 * Find the item by element ID, itemId property, Component instance or custom function.
	 *
	 * If you want to search the component tree hierarchy use {@see findChild()}
	 *
	 */
	public findItem(predicate: FindComponentPredicate): Component | undefined {
		let fn = this.getFindPredicate(predicate);
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
				cmp.cascade(fn);
			}
		}

		return this;
	}

	private getFindPredicate(predicate: FindComponentPredicate): (comp: Component) => boolean | void {
		if (predicate instanceof Function) {
			return predicate;
		} else {
			return (item: Component) => {
				return item === predicate || item.itemId === predicate || item.id === predicate;
			}
		}
	}

	/**
	 * Find a child by element ID, itemId property, Component instance or custom function.
	 *
	 * It cascades down the component hierarchy.
	 *
	 */
	public findChild(predicate: FindComponentPredicate): Component | undefined {
		let fn = this.getFindPredicate(predicate);

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
	 * Find child by instance type of the parent
	 *
	 * @example
	 * ```
	 * const form = textField.findAncestorByType(Form);
	 * ```
	 * @param cls
	 */
	public findChildByType<T extends Component>(cls: Type<T>): T | undefined {
		const p = this.findChild(Component => Component instanceof cls);
		if (p) {
			return p as T;
		} else {
			return undefined;
		}
	}


	/**
	 * Mask the component to disable user interaction
	 * It creates an absolute positioned Mask
	 * component. This component should have a non-static position style for this to work.
	 */
	public mask() {
		if (!this._mask) {
			this._mask = mask({spinner: true});
			this.items.add(this._mask);
		}
		this.el.classList.add("masked");
		this._mask.show();
	}

	/**
	 * Unmask the body
	 */
	public unmask() {
		if (this._mask) {
			this._mask.hide();
		}
		this.el.classList.remove("masked");
	}
}


/**
 * Mask element
 *
 * Shows a mask over the entire (position:relative) element it's in.
 *
 * Used in {@see Body.mask()}
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
 * Generic Config option that allows all public properties as options
 */
export type Config<Cmp> = Partial<Pick<Cmp, { [K in keyof Cmp]: Cmp[K] extends Function ? never : K }[keyof Cmp]>>;

/**
 * Short hand function to create a {@see Mask} component
 *
 * @param config
 */
export const mask = (config?: Config<Mask>) => createComponent(new Mask(), config);

/**
 * Shorthand function to create {@see Component}
 */
export const comp = (config?: Config<Component>, ...items: Component[]) => createComponent(new Component(config?.tagName), config, items);	


export const createComponent = <T>(comp: T, config:any, items?:Component[]) : T => {

	if (config) {
		Object.assign(comp, config);
	}
	if (items && items.length) {
		(comp as any).items.add(...items);
	}
	return comp;
}