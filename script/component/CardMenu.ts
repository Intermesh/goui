import {Component, Config} from "./Component.js";
import {CardContainer} from "./CardContainer.js";
import {btn} from "./Button.js";


/**
 * Menu for cards to create a tab panel
 *
 * @example
 *
 * this.personal = Personal.create();
 *
 * this.cardContainer = CardContainer.create({
 * 	cls: "cards",
 * 	items: [
 * 		this.personal
 * 	]
 * });
 *
 * this.cardMenu = CardMenu.create({
 * 	cardContainer: this.cardContainer,
 * 	items: [
 *
 * 		// Dynamically load module and add it to card container when this button is clicked
 * 		CardMenuAsyncItem.create({
 * 			text: "Contracts",
 * 			import: "Contracts"
 * 		}),
 *
 * 		// Dynamically load module and add it to card container when this button is clicked
 * 		CardMenuAsyncItem.create({
 * 			text: "Invoices",
 * 			import: "Invoices"
 * 		})
 * 	]
 * });
 *
 */

export class CardMenu extends Component {

	/**
	 * The card container this menu is for.
	 * 
	 * If not given it will be looked up in the parent of the menu.
	 */
	public cardContainer?: CardContainer
	protected baseCls = "cardmenu";

	focus(o?: FocusOptions) {
		const first = this.cardContainer?.items.first();
		if(first) {
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

			this.cardContainer!.on("cardchange", (cardContainer, index) => {

				const activeItem = index != undefined ? cardContainer.items.get(index)! : undefined;

				this.items.forEach((item, menuIndex) => {

					if (activeItem && (item.itemId == activeItem.itemId || item.itemId == activeItem.id)) {
						item.el.classList.add("active");
					} else {
						item.el.classList.remove("active");
					}
				});
			});

			this.createMenu();
		});
	}

	private createMenu() {

		this.cardContainer!.items.forEach((item, index) => {

			if(!item.itemId) {
				item.itemId = 'card-' + index;
			}

			this.items.insert(index,
				btn({
					itemId: item.itemId,
					cls: index == this.cardContainer!.getActiveItem() ? "active" : "",
					text: item.title,
					handler: () => {
						this.cardContainer!.activeItem = item;
					}
				})
			);

			item.title = "";

		});
	}
}



/**
 * Shorthand function to create {@see CardMenu}
 *
 * @param config
 * @param items
 */
export const cardmenu = (config?:Config<CardMenu>, ...items:Component[]) => {
	const c = new CardMenu();
	if(config) {
		Object.assign(c, config);
	}
	if(items.length) {
		c.items.add(...items);
	}
	return c;
}
