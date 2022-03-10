import { Observable } from "./Observable.js";
import { State } from "../State.js";
// export declare namespace Component {
// 	function create<T extends typeof Observable>(this: T, config?: ComponentConfig<InstanceType<T>>): InstanceType<T>;
// }
/**
 * Component
 *
 * A component in it's simplest form.
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
    constructor() {
        super(...arguments);
        this.tagName = "div";
        /**
         * A base class not configurable. cls can be used to add extra classes leaving this class alone
         *
         * @protected
         */
        this.baseCls = "";
        this.resizable = false;
        this.rendered = false;
        /**
         * Keep boolean state so creating el is not needed to determine visibility
         * @private
         */
        this.hidden = false;
        this.disabled = false;
        this.id = "";
        /**
         * Component item ID that can be used to lookup the Component inside a Component with Component.findItem() and
         * Component.findItemIndex();
         */
        this.itemId = "";
        this._isRemoving = false;
        this.items = [];
    }
    static create(config) {
        return super.create(config);
    }
    /**
     * @inheritDoc
     */
    init() {
        if (this.stateId) {
            this.restoreState(this.getState());
        }
        this.initItems();
        super.init();
    }
    initItems() {
        this.items.forEach(i => {
            this.setupItem(i);
        });
    }
    getState() {
        return State.get().getItem(this.stateId);
    }
    /**
     * Restore state of the component in this function. It's called before render in init().
     *
     * @see saveState();
     * @param state
     *
     * @protected
     */
    restoreState(state) {
    }
    /**
     * Call save start when something relevant to the state changes.
     * Implement buildState() to save relevant state properties and restore it in restoreState()
     *
     * stateId must be set on components to be stateful
     *
     * @protected
     */
    saveState() {
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
    buildState() {
        return {};
    }
    /**
     * Get the DOM element
     */
    getEl() {
        if (!this.el) {
            throw new Error("Render first");
        }
        return this.el;
    }
    applyTitle() {
        this.el.title = this.title;
    }
    /**
     * Set the title
     *
     * @param title
     */
    setTitle(title) {
        this.title = title;
        if (this.rendered) {
            this.applyTitle();
        }
    }
    /**
     * Get the title of the compnent
     */
    getTitle() {
        return this.title;
    }
    /**
     * Check if the component has been rendered and added to the DOM tree
     */
    isRendered() {
        return this.rendered;
    }
    /**
     * Creates the DOM element of this component
     *
     * @protected
     */
    internalRender() {
        this.el = document.createElement(this.tagName);
        if (this.baseCls) {
            this.el.className += this.baseCls;
        }
        if (this.cls) {
            this.el.className += this.baseCls ? " " + this.cls : this.cls;
        }
        this.applyHidden();
        if (this.disabled) {
            this.applyDisabled();
        }
        if (this.html) {
            this.applyHtml();
        }
        if (this.text) {
            this.applyText();
        }
        if (this.id) {
            this.applyId();
        }
        if (this.style) {
            Object.assign(this.el.style, this.style);
        }
        if (this.width) {
            this.el.style.width = this.width + "px";
        }
        if (this.height) {
            this.el.style.height = this.height + "px";
        }
        if (this.resizable) {
            this.el.classList.add("resizable");
        }
        if (this.flex) {
            this.el.style.flex = this.flex + "";
        }
        if (this.title) {
            this.applyTitle();
        }
        this.renderItems();
        return this.el;
    }
    /**
     * Renders the component
     *
     * @param Component Node
     * @param refChild Node
     */
    render(Component, refChild) {
        if (this.rendered) {
            throw new Error("Already rendered");
        }
        if (!this.initCalled) {
            throw new Error("Please don't construct a component with 'new Component' but use Component.create();");
        }
        this.fire("beforerender", this);
        this.internalRender();
        this.fire("beforedom", this);
        if (!refChild) {
            Component.appendChild(this.getEl());
        }
        else {
            Component.insertBefore(this.getEl(), refChild);
        }
        this.rendered = true;
        this.fire("render", this);
        return this.getEl();
    }
    /**
     * Used by Component to prevent infinite remove loop
     */
    isRemoving() {
        return this._isRemoving;
    }
    /**
     * Remove component from the component tree
     */
    remove() {
        if (!this.fire("beforeremove", this)) {
            return false;
        }
        this.internalRemove();
        this.fire("remove", this);
        return true;
    }
    internalRemove() {
        this._isRemoving = true;
        this.removeAll();
        // remove this item from the Component
        if (this.parent) {
            this.parent.removeItem(this);
        }
        //remove it from the DOM
        if (this.el) {
            this.el.remove();
        }
        this._isRemoving = false;
    }
    applyHidden() {
        this.el.hidden = this.hidden;
    }
    /**
     * Set visibility state
     *
     * @param hidden
     */
    setHidden(hidden) {
        if (hidden) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    /**
     * Hide this component
     *
     * This sets the "hidden" attribute on the DOM element which set's CSS display:none.
     * You can change this to fade with css class "fade-in" and "fade-out"
     */
    hide() {
        // noinspection PointlessBooleanExpressionJS
        if (this.fire("beforehide", this) === false) {
            return false;
        }
        this.internalHide();
        this.fire("hide", this);
        return true;
    }
    internalHide() {
        this.hidden = true;
        if (this.rendered) {
            this.applyHidden();
        }
    }
    /**
     * Show the compenent
     */
    show() {
        // noinspection PointlessBooleanExpressionJS
        if (this.fire("beforeshow", this) === false) {
            return false;
        }
        this.internalShow();
        this.fire("show", this);
        return true;
    }
    internalShow() {
        this.hidden = false;
        if (this.rendered) {
            this.applyHidden();
        }
    }
    /**
     * Check if this component is hidden
     */
    isHidden() {
        return this.el ? this.el.hidden : this.hidden;
    }
    applyDisabled() {
        if (!this.disabled) {
            this.el.removeAttribute("disabled");
        }
        else {
            this.el.setAttribute("disabled", "");
        }
    }
    /**
     * Set disabled state
     *
     * Set's the "disabled" attribute on the DOM element
     */
    setDisabled(disabled) {
        this.disabled = disabled;
        if (this.rendered) {
            this.applyDisabled();
        }
    }
    /**
     * Check if the component is disabled
     */
    isDisabled() {
        return this.el ? this.el.hasAttribute('disabled') : this.disabled;
    }
    applyHtml() {
        this.el.innerHTML = this.html;
    }
    /**
     * Set the HTML contents
     *
     * @param html
     */
    setHtml(html) {
        this.html = html;
        if (this.rendered) {
            this.applyHtml();
        }
    }
    /**
     * Get the HTML contents
     */
    getText() {
        return this.el ? this.el.innerText : this.text;
    }
    applyText() {
        this.el.innerText = this.text;
    }
    /**
     * Set the HTML contents
     *
     * @param text
     */
    setText(text) {
        this.text = text;
        if (this.rendered) {
            this.applyText();
        }
    }
    /**
     * Get the HTML contents
     */
    getHtml() {
        return this.el ? this.el.innerHTML : this.html;
    }
    /**
     * Set the width in pixels
     *
     * @param width
     */
    setWidth(width) {
        this.width = width;
        if (this.rendered) {
            this.el.style.width = width + "px";
        }
    }
    /**
     * Get width in pixels
     */
    getWidth() {
        return this.el ? this.el.offsetWidth : this.width;
    }
    /**
     * Set height in pixels
     *
     * @param height
     */
    setHeight(height) {
        this.height = height;
        if (this.rendered) {
            this.el.style.height = height + "px";
        }
    }
    /**
     * Get height in pixels
     */
    getHeight() {
        return this.el ? this.el.offsetHeight : this.height;
    }
    applyId() {
        this.el.id = this.id;
    }
    /**
     * Set id of the DOM element
     *
     * @param id
     */
    setId(id) {
        this.id = id;
        if (this.rendered) {
            this.applyId();
        }
    }
    /**
     * Get DOM element ID
     */
    getId() {
        return this.el ? this.el.id : this.id;
    }
    /**
     * Get the style object
     */
    getStyle() {
        if (!this.el) {
            if (!this.style) {
                this.style = {};
            }
            return this.style;
        }
        return this.el.style;
    }
    /**
     * Focus the component
     *
     * @param o
     */
    focus(o) {
        // setTimeout needed for chrome :(
        setTimeout(() => {
            if (!this.el) {
                return;
            }
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
    findAncestor(fn) {
        let p = this.parent;
        while (p != undefined) {
            if (fn(p)) {
                return p;
            }
            else {
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
     * const form = textField.findAncestorByInstanceType(Form);
     * ```
     * @param cls
     */
    findAncestorByInstanceType(cls) {
        const p = this.findAncestor(Component => Component instanceof cls);
        if (p) {
            return p;
        }
        else {
            return undefined;
        }
    }
    setupItem(item) {
        item.parent = this;
    }
    /**
     * Replace all items
     *
     * @param items
     */
    setItems(items) {
        this.removeAll();
        items.forEach((item) => {
            this.addItem(item);
        });
    }
    /**
     * Get all items
     */
    getItems() {
        return this.items;
    }
    renderItems() {
        this.items.forEach((item) => {
            this.renderItem(item);
        });
    }
    /**
     * Renders a Component item
     * @param item
     * @param refItem
     * @protected
     */
    renderItem(item, refItem) {
        item.render(this.getEl(), refItem && refItem.isRendered() ? refItem.getEl() : undefined);
    }
    /**
     * Add item to Component
     *
     * @param item
     * @return Index of item
     */
    addItem(item) {
        return this.insertItem(item, this.items.length);
    }
    /**
     * Insert item in Component
     *
     * @param item
     * @param index Index in the Component. if negative then it's added from the end.
     * @return Index of item
     */
    insertItem(item, index = 0) {
        if (!this.fire("beforeadditem", this, item, index)) {
            return -1;
        }
        this.internalInsertItem(item, index);
        this.fire("additem", this, item, index);
        return index;
    }
    internalInsertItem(item, index = 0) {
        this.setupItem(item);
        if (index < 0) {
            index = this.items.length + index;
        }
        const refItem = this.getItemAt(index);
        this.items.splice(index, 0, item);
        if (this.isRendered()) {
            //	refItem && refItem.isRendered() ? this.getEl().insertBefore(item.render(), refItem.getEl()) : this.getEl().appendChild(item.render())
            this.renderItem(item, refItem);
        }
    }
    /**
     * Get item at given index
     *
     * @param index If negative then it's the index from the end of the items
     */
    getItemAt(index) {
        if (index < 0) {
            index = this.items.length + index;
        }
        if (!this.items[index]) {
            // throw new Error(`Index "${index}" not found in Component`);
            return undefined;
        }
        return this.items[index];
    }
    /**
     * Remove an item
     *
     * @param ref Item index or Component
     */
    removeItem(ref) {
        const item = ref instanceof Component ? ref : this.getItemAt(ref);
        const index = ref instanceof Component ? this.items.indexOf(ref) : ref;
        if (!item) {
            return false;
        }
        if (!this.fire("beforeremoveitem", this, item, index)) {
            return false;
        }
        if (!item.isRemoving()) {
            item.remove();
        }
        this.items.splice(index, 1);
        this.fire("removeitem", this, item, index);
        return true;
    }
    /**
     * Removes all items
     */
    removeAll() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
    }
    /**
     * Find the item by element ID
     *
     * @param id
     */
    findItemIndex(id) {
        return this.items.findIndex((item) => {
            return item === id || item.itemId === id || item.getId() === id;
        });
    }
    /**
     * Get item by DOM id or the itemId of the component
     *
     * @param id
     */
    findItem(id) {
        return this.items.find((item) => {
            return item === id || item.itemId === id || item.getId() === id;
        });
    }
    /**
     * Cascade down the component hierarchy
     *
     * @param fn When the function returns false then the cascading will be stopped. The current Component will be finished!
     */
    cascade(fn) {
        if (fn(this) === false) {
            return this;
        }
        for (let cmp of this.items) {
            cmp.cascade(fn);
        }
        return this;
    }
    /**
     * Find a child by function
     *
     * It cascades down the component hierarchy.
     *
     * @param fn
     */
    findChild(fn) {
        let child;
        this.cascade((item) => {
            if (fn(item)) {
                child = item;
                return false;
            }
        });
        return child;
    }
}
//# sourceMappingURL=Component.js.map