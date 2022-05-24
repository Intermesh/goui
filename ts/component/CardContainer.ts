import {Component, ComponentConfig, ComponentEventMap} from "./Component.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {CardMenu} from "./CardMenu.js";

export interface CardContainerEventMap<T extends Observable> extends ComponentEventMap<T> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	cardchange?: (container: CardContainer, index: number | undefined, oldIndex: number | undefined) => false | void

}

export interface CardContainer {
	on<K extends keyof CardContainerEventMap<CardContainer>>(eventName: K, listener: CardContainerEventMap<CardContainer>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof CardContainerEventMap<CardContainer>>(eventName: K, ...args: Parameters<NonNullable<CardContainerEventMap<CardContainer>[K]>>): boolean;
}

export interface CardContainerConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * Active card item
	 */
	activeItem?: number,
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<CardContainerEventMap<T>>
}




/**
 * Card container
 *
 * Holds multiple components but only shows one.
 *
 *
 * @example
 * ```
 * const cards = CardContainer.create({
 * 	tagName: "main",
 * 	items: [
 * 		Component.create({
 * 			cls: "pad",
 * 			html: "<h1>Tab 1</h1><p>Tab 1 content</p>",
 * 			id: "tab1"
 * 		}),
 * 		Component.create({
 * 			cls: "pad",
 * 			html: "<h1>Tab 2</h1><p>Tab2 content</p>",
 * 			id: "tab2"
 * 		})
 * 	]
 * });
 * ```
 *
 */
export class CardContainer extends Component {

	protected activeItem?: number;

	protected baseCls = "cards"

	public static create<T extends typeof Observable>(this: T, config?: CardContainerConfig<InstanceType<T>>) {
		return (<InstanceType<T>>super.create(<any> config));
	}

	protected init() {
		super.init();

		if(this.activeItem == undefined && this.getItems().count()) {
			this.activeItem = 0;
		}
	}

	protected internalRender() {
		const el = super.internalRender();

		this.setCardVisibilities();

		this.on("beforeadditem", (card, item) => {
			item.hide();
		})

		return el;
	}

	protected renderItem(item: Component, refItem?: Component) {

		super.renderItem(item, refItem);

		item.on('show', comp => {
			const index = this.findItemIndex(comp);
			this.setActiveItem(index);
		});
	}

	private setCardVisibilities() {

		this.getItems().forEach((item, index) => {
			if (index == this.activeItem) {
				if (this.isRendered() && !item.isRendered()) {
					super.renderItem(item);
				}
				if(item.isHidden()) {
					item.show();
				}
			} else {
				if(!item.isHidden()) {
					item.hide();
				}
			}
		});
	}

	/**
	 * Change the active card item
	 *
	 */
	setActiveItem(ref: number|Component) {

		let index;
		if(ref instanceof Component) {
			index = this.findItemIndex(ref);
		} else
		{
			index = ref;
		}

		if (this.activeItem != index) {
			this.fire("cardchange", this, index, this.activeItem);
		}
		this.activeItem = index;

		this.setCardVisibilities();
	}

	/**
	 * Get the active card item
	 *
	 * @return Active item
	 */
	getActiveItem() {
		return this.activeItem;
	}

	focus(o?: FocusOptions) {
		if(this.activeItem != undefined) {
			const activeItem = this.getItemAt(this.activeItem);
			if (activeItem) {
				activeItem.focus(o);
				return;
			}
		}

		super.focus(o);

	}

	public async loadCard (cls:string, module:string = `../../${cls}.js`) {

		const cardMenu = this.parent as CardMenu;
		let item = cardMenu.cardContainer.findItem(cls);
		if(!item) {

			const mods = await import(module);
			item = mods[cls].create({
				itemId: cls
			}) as Component;

			cardMenu.cardContainer.addItem(item);
		}
		item.show();

		return item;
	}

}