/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "./Component.js";
import {Config, Listener, ObservableListenerOpts} from "./Observable.js";


export interface CardContainerEventMap extends ComponentEventMap {
	/**
	 * Fires before adding an item. Return false to abort.
	 */
	cardchange: {
		/**
		 * The new zero based active index of the cardcontainer
		 */
		index: number | undefined,

		/**
		 * The old zero based active index of the cardcontainer
		 */
		oldIndex: number | undefined
	}

}
/**
 * Card container
 *
 * Holds multiple components but only shows one.
 */
export class CardContainer extends Component<CardContainerEventMap> {

	private _activeItem?: number;

	protected baseCls = "cards";

	constructor() {
		super();

		this.items.on("beforeadd", ({item}) => {
			item.hide();
			item.on('show', ({target}) => {
				const index = this.findItemIndex(target);
				this.activeItem = index;
			});

			item.el.classList.add('card-container-item');
		});
	}

	protected internalRender() {
		this.setCardVisibilities();

		return super.internalRender();
	}

	protected renderItems() {
		if (this.items) {
			this.items.forEach((item) => {
				// if items are hidden then defer rendering until item is shown
				if (item.hidden) {
					item.on("show", ({target}) => {
						this.renderItem(target);
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

		const oldIndex = this._activeItem;
		this._activeItem = index;

		this.setCardVisibilities();
		if (oldIndex !== index) {
			this.fire("cardchange", {index, oldIndex});
		}
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
 * Shorthand function to create {@link CardContainer}
 *
 * @param config
 * @param items
 */
export const cards = (config?: Config<CardContainer>, ...items: Component[]) => createComponent(new CardContainer(), config, items);