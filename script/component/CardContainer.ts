/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "./Component.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";
import {ButtonEventMap} from "./Button";


export interface CardContainerEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires before adding an item. Return false to abort.
	 *
	 * @param container
	 * @param item
	 * @param index
	 */
	cardchange: (container: Type, index: number | undefined, oldIndex: number | undefined) => false | void

}

export interface CardContainer extends Component {
	on<K extends keyof CardContainerEventMap<this>, L extends Listener>(eventName: K, listener: Partial<CardContainerEventMap<this>>[K], options?: ObservableListenerOpts): L
	un<K extends keyof CardContainerEventMap<this>>(eventName: K, listener: Partial<CardContainerEventMap<this>>[K]): boolean
	fire<K extends keyof CardContainerEventMap<this>>(eventName: K, ...args: Parameters<CardContainerEventMap<any>[K]>): boolean;
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

	private _activeItem?: number;

	protected baseCls = "cards";

	constructor() {
		super();

		this.items.on("beforeadd", (card, item) => {
			item.hide();
			item.on('show', comp => {
				const index = this.findItemIndex(comp);
				this.activeItem = index;
			});

			item.el.classList.add('card-container-item');
		});
	}

	protected internalRender() {
		this.setCardVisibilities();

		const el = super.internalRender();

		return el;
	}

	protected renderItems() {
		if (this.items) {
			this.items.forEach((item) => {
				// if items are hidden then defer rendering until item is shown
				if (item.hidden) {
					item.on("show", (item) => {
						this.renderItem(item);
					}, {once: true})
				} else {
					this.renderItem(item);
				}
			});
		}
	}

	private setCardVisibilities() {

		this.items.forEach((item, index) => {
			if (index == this.activeItem) {
				// if (this.rendered && !item.rendered) {
				// 	super.renderItem(item);
				// }
				item.show();

			} else {
				item.hide();
			}
		});
	}

	/**
	 * The active card index. Defaults to 0 if not given.
	 */
	set activeItem(ref: number | Component) {

		let index;
		if (ref instanceof Component) {
			index = this.findItemIndex(ref);
		} else {
			index = ref;
		}

		const old = this._activeItem;
		this._activeItem = index;
		if (old !== index) {
			this.fire("cardchange", this, index, old);
		}


		this.setCardVisibilities();
	}

	/**
	 * The active card index. Defaults to 0 if not given.
	 */
	get activeItem(): number {
		if (this._activeItem == undefined && this.items.count()) {
			this._activeItem = 0;
		}
		return this._activeItem!;
	}


	focus(o?: FocusOptions) {

		if (this.activeItem) {
			const activeItem = this.items.get(this.activeItem);
			if (activeItem) {
				activeItem.focus(o);
				return;
			}
		}

		super.focus(o);
	}

}

/**
 * Shorthand function to create {@see CardContainer}
 *
 * @param config
 * @param items
 */
export const cards = (config?: Config<CardContainer, CardContainerEventMap<CardContainer>>, ...items: Component[]) => createComponent(new CardContainer(), config, items);