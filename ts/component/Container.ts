import {Component, ComponentConfig, ComponentEventMap} from "./Component.js";
import {Field, FieldInterface} from "./form/Field.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";

/**
 * @inheritDoc
 */
export interface ContainerConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * The child items of the container
	 */
	items?: Component[]
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ContainerEventMap<T>>
}

export interface ContainerEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeadditem?: (container: T, item: Component, index: number) => false | void
	additem?: (container: T, item: Component, index: number) => void
	/**
	 * Fires before removing an item. Return false to abort.
	 * @param container
	 * @param item
	 * @param index
	 */
	beforeremoveitem?: (container: T, item: Component, index: number) => false | void
	removeitem?: (container: T, item: Component, index: number) => | void
}

export interface Container {
	on<K extends keyof ContainerEventMap<Container>>(eventName: K, listener: ContainerEventMap<Container>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof ContainerEventMap<Container>>(eventName: K, ...args: Parameters<NonNullable<ContainerEventMap<Container>[K]>>): boolean
}

/**
 * Container
 *
 * A component with child components
 *
 * const comp = Container.create({
 * 	items: [
 * 		Component.create({
 * 			cls: "pad",
 * 			html: "<h1>Item 1</h1><p>Item 1 content</p>",
 * 		}),
 * 		Component.create({
 * 			cls: "pad",
 * 			html: "<h1>Item 2</h1><p>Tab2 content</p>",
 * 		})
 * 	]
 * });
 * ```
 * @param config The config object with properties to apply to the object
 */
export class Container extends Component {

	public static create<T extends typeof Observable>(this: T, config?: ContainerConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected items: Component[] = [];

	/**
	 * @inheritDoc
	 */
	protected init() {
		this.items.forEach(i => {
			this.setupItem(i);
		});

		super.init();
	}

	private setupItem(item:Component) {
		item.parent = this;
	}

	/**
	 * Replace all items
	 *
	 * @param items
	 */
	public setItems(items: Component[]) {

		this.removeAll();

		items.forEach((item) => {
			this.addItem(item);
		});
	}

	/**
	 * Get all items
 	 */
	public getItems() {
		return this.items;
	}

	protected internalRender() {

		const el = super.internalRender();

		this.renderItems();

		return el;
	}

	protected renderItems() {
		this.items.forEach((item) => {
			this.renderItem(item);
		});
	}

	/**
	 * Renders a container item
	 * @param item
	 * @protected
	 */
	protected renderItem(item: Component, refItem?: Component) {
		item.render(this.getEl(), refItem && refItem.isRendered() ? refItem.getEl() : undefined);
	}

	/**
	 * Add item to container
	 *
	 * @param item
	 * @return Index of item
	 */
	addItem(item: Component) {
		return this.insertItem(item, this.items.length);
	}

	/**
	 * Insert item in container
	 *
	 * @param item
	 * @param index Index in the container. if negative then it's added from the end.
	 * @return Index of item
	 */
	insertItem(item: Component, index = 0): number {

		if (!this.fire("beforeadditem", this, item, index)) {
			return -1;
		}

		this.internalInsertItem(item, index)

		this.fire("additem", this, item, index);

		return index;
	}

	protected internalInsertItem(item: Component, index = 0) {
		this.setupItem(item);

		if(index < 0) {
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
	public getItemAt(index: number) {

		if(index < 0) {
			index = this.items.length + index;
		}

		if (!this.items[index]) {
			// throw new Error(`Index "${index}" not found in container`);
			return undefined;
		}

		return this.items[index];
	}

	/**
	 * Remove an item
	 *
	 * @param ref Item index or Component
	 */
	public removeItem(ref: number|Component){

		const item = ref instanceof Component ? ref : this.getItemAt(ref);
		const index = ref instanceof Component ? this.items.indexOf(ref) : ref;

		if (!item) {
			return false;
		}
		if (!this.fire("beforeremoveitem", this, item, index)) {
			return false;
		}

		if(!item.isRemoving()) {
			item.remove();
		}

		this.items.splice(index, 1);

		this.fire("removeitem", this, item, index);

		return true;
	}

	/**
	 * Removes all items
	 */
	public removeAll() {
		for (let i = this.items.length - 1; i >= 0; i--) {
			this.removeItem(i);
		}
	}

	/**
	 * Find the item by element ID
	 *
	 * @param id
	 */
	public findItemIndex(id: string|Component): number {
		return this.items.findIndex((item) => {
			const f = (<Field>item);
			return f === id || f.itemId === id || f.getId() === id;
		});
	}

	/**
	 * Get item by DOM id or the itemId of the component
	 *
	 * @param id
	 */
	public findItem(id: string) {
		return this.items.find((item) => {
			const f = (<Field>item);
			return f.itemId === id || f.getId() === id;
		});
	}

	/**
	 * Cascade down the component hierarchy
	 *
	 * @param fn When the function returns false then the cascading will be stopped. The current container will be finished!
	 */
	cascade(fn: (comp: Component) => boolean | void) {
		if (fn(this) === false) {
			return this;
		}
		for (let cmp of this.items) {
			if (cmp instanceof Container) {
				cmp.cascade(fn);
			} else {
				fn(cmp);
			}
		}

		return this;
	}

	/**
	 * Find a child by function
	 *
	 * It cascades down the component hierarchy.
	 *
	 * @param nameOrItemId
	 */
	findChild(fn: (comp: Component) => boolean | void): Component | undefined {

		let child;
		this.cascade((item: any) => {
			if(fn(item)) {
				return false;
			}
		});

		return child;
	}


	protected internalRemove() {
		this.removeAll();
		return super.internalRemove();
	}
}