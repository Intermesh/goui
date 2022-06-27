// noinspection JSUnusedGlobalSymbols

import {Config, Observable, ObservableEventMap, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {State} from "../State.js";
import {Collection} from "../util/Collection.js";

export type FindComponentPredicate = string | Component | ((comp: Component) => boolean | void);

export type ComponentConstructor<T extends Component> = new (...args: any[]) => T;


interface Type<T> {
	new(): T
}


export interface ComponentEventMap<Sender> extends ObservableEventMap<Sender> {
	/**
	 * Fires when the component renders and is added to the DOM
	 *
	 * @see Component.render()
	 * @param comp
	 */
	render: <T extends Sender>(sender: T) => void

	/**
	 * Fires after rendering but before adding the element to the dom
	 *
	 * @see Component.render()
	 * @param comp
	 */
	beforedom: <T extends Sender>(sender: T) => void

	/**
	 * Fires just before rendering
	 *
	 * @see Component.render()
	 * @param comp
	 */
	beforerender:<T extends Sender> (sender: T) => void

	/**
	 * Fires before the element is removed. You can cancel the remove by returning false
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	beforeremove: <T extends Sender>(sender: T) => false | void

	/**
	 * Fires after the component has been removed
	 *
	 * @see Component.remove()
	 * @param comp
	 */
	remove:<T extends Sender> (sender: T) => void

	/**
	 * Fires before show. You can cancel the show by returning false
	 *
	 * @see Component.show()
	 * @param comp
	 */
	beforeshow: <T extends Sender>(sender: T) => false | void

	/**
	 * Fires after showing the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	show: <T extends Sender>(sender: T) => void

	/**
	 * Fires before hide. You can cancel the hide by returning false
	 *
	 * @see Component.hide()
	 * @param comp
	 */
	beforehide: <T extends Sender>(sender: T) => false | void

	/**
	 * Fires after hiding the component
	 *
	 * @see Component.show()
	 * @param comp
	 */
	hide:<T extends Sender> (sender: T) => void,

	/**
	 * Fires on focus
	 *
	 * @param comp
	 * @param o
	 */
	focus:<T extends Sender> (sender: T, o?: FocusOptions) => void

	/**
	 * Fires when this component is added to a parent
	 *
	 * @param me
	 * @param index the index in the parents' items
	 */
	added: <T extends Sender> (sender: T, index: number) => void
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

	private _tagName?: keyof HTMLElementTagNameMap;

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
			this.setupItem(item);

			item.fire("added", item, index);

			const refItem = index < collection.count() - 1 ? this.items.get(index - 1) : undefined;

			if (this.rendered) {
				this.renderItem(item, refItem);
			}

		});

		this.items.on("remove", (collection, item, index) => {
			item.parent = undefined;
			item.remove();
		});

		this.items.forEach(comp => {
			this.setupItem(comp);
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
	 * Element's tagname. Defaults to "div"
	 */
	set tagName(tagName: keyof HTMLElementTagNameMap) {
		this._tagName = tagName;
	}

	get tagName() {
		return this._tagName || "div";
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
	 * - fade-in: The component will fade in when show() is used.
	 * - fade-out: The component will fade out when hide is used.
	 *
	 */
	set cls(cls: string) {
		this.el.className += " " + cls;
	}

	/**
	 * Renders the component and it's children
	 */
	protected internalRender() {
		if (this.baseCls) {
			this.el.className += " " + this.baseCls;
		}
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
			this.el.classList.add("resizable");
		} else {
			this.el.classList.remove("resizable");
		}
	}

	get resizable() {
		return this.el.classList.contains("resizable");
	}

	/**
	 * Renders the component
	 *
	 * @param Component Node
	 * @param refChild Node
	 */
	public render(parentEl: Node, refChild?: Node | null) {

		if (this._rendered) {
			throw new Error("Already rendered");
		}

		this.fire("beforerender", this);

		this.internalRender();

		this.fire("beforedom", this);
		if (!refChild) {
			parentEl.appendChild(this.el);
		} else {
			parentEl.insertBefore(this.el, refChild);
		}

		this._rendered = true;

		this.fire("render", this);

		return this.el;
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
	 * You can change this to fade with css class "fade-in" and "fade-out"
	 */
	public hide() {
		this.hidden = true;

		return this.hidden == true;
	}

	/**
	 * Show the component
	 */
	public show() {
		this.hidden = false;

		return this.hidden == false;
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
		return this.el.offsetWidth;
	}

	/**
	 * height in pixels
	 */
	set height(height: number) {
		this.el.style.height = height + "px";
	}

	get height() {
		return this.el.offsetHeight;
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

	private setupItem(item: Component) {
		item.parent = this;
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

	/**
	 * Renders a Component item
	 * @param item
	 * @param refItem
	 * @protected
	 */
	protected renderItem(item: Component, refItem?: Component) {
		item.render(this.el, refItem && refItem.rendered ? refItem.el : undefined);
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
		} else {
			this._mask.show();
		}
	}

	/**
	 * Unmask the body
	 */
	public unmask() {
		if (this._mask) {
			this._mask.hide();
		}
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

	protected baseCls = "mask";

	/**
	 * Show loading spinner
	 */
	set spinner(spinner: boolean) {
		if (spinner) {
			this.html = '<div class="spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
		}
	}
}

export const mask = (config?: Config<Mask>) => Mask.create(config);

/**
 * Shorthand function to create {@see Component}
 */
export const comp = (config?: Config<Component>, ...items: Component[]) => Component.create(config, ...items);


// function create<T extends typeof Observable>(cls: T, config:Config<InstanceType<T>>) : InstanceType<T> {
// 	const i = new cls as InstanceType<T>;
// 	Object.assign(i, config);
// 	return i;
// };

// create(Component, {
// 	flex: 1,
// 	disabled: false,
// 	listeners: {
// 		added: (sender, number) => {

// 		}
// 	}
// });


// const c = new Component()
// c.listeners = {
// 	beforerender: sender => {

// 	},
// 	added(me, index) {

// 	},
// }
// c.on("added", (sender, index) => {

// })

