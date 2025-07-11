/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "./Component.js";
import {CardContainer} from "./CardContainer.js";
import {btn} from "./Button.js";
import {Config} from "./Observable.js";


/**
 * Menu for cards to create a tab panel
 */

export class CardMenu extends Component {

	/**
	 * The card container this menu is for.
	 *
	 * If not given it will be looked up in the parent of the menu.
	 */
	public cardContainer?: CardContainer
	protected baseCls = "goui-cardmenu";

	focus(o?: FocusOptions) {
		const first = this.cardContainer?.items.first();
		if (first) {
			first.focus(o);
		} else {
			super.focus(o);
		}
	}

	public constructor() {
		super("menu");

		this.on("beforerender", () => {
			if (!this.cardContainer) {
				this.cardContainer = this.parent!.findChildByType(CardContainer)!;
			}

			this.cardContainer!.on("cardchange", () => {
				this.updateActiveTab();
			});

			this.createMenu();

			this.cardContainer.items.on("remove", ({index}) => {
				const cardMenuItem = this.findItem('card-' + index);
				if(cardMenuItem) {
					cardMenuItem.remove();
				}
			});

			this.cardContainer.items.on("add", () => {
				this.createMenu();
			})

			this.cardContainer!.on("beforerender", () => {
				this.updateActiveTab();
			});

		});
	}

	private updateActiveTab() {
		const activeItem = this.cardContainer!.items.get(this.cardContainer!.activeItem)!;

		this.items.forEach((item, menuIndex) => {

			if (activeItem && (item.itemId == activeItem.itemId || item.itemId == activeItem.id)) {
				item.el.classList.add("active");
			} else {
				item.el.classList.remove("active");
			}
		});
	}

	private createMenu() {

		this.cardContainer!.items.forEach((item, index) => {

			if (!item.itemId) {
				item.itemId = 'card-' + index;
			}

			if (this.findItem(item.itemId)) {
				return;
			}

			const b = btn({
				disabled: item.disabled,
				type: "button",
				itemId: item.itemId,
				cls: index == this.cardContainer!.activeItem ? "active" : "",
				text: item.title,
				handler: () => {
					this.cardContainer!.activeItem = item;
				}
			})

			item.on('disable', () => {
				b.disabled = true;
			})

			item.on('enable', () => {
				b.disabled = false;
			})

			this.items.insert(index,
				b
			);

			item.title = "";

		});
	}
}


/**
 * Shorthand function to create {@link CardMenu}
 *
 * @param config
 * @param items
 */
export const cardmenu = (config?: Config<CardMenu>, ...items: Component[]) => createComponent(new CardMenu(), config, items);
