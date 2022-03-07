import {Container, ContainerConfig} from "./Container.js";
import {CardContainer} from "./CardContainer.js";
import {Button} from "./Button.js";
import {Observable} from "./Observable.js";
import {router} from "../Router.js";

export interface CardMenuConfig<T extends Observable> extends ContainerConfig<T> {
	cardContainer: CardContainer
}

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

export class CardMenu extends Container {

	tagName = "menu" as keyof HTMLElementTagNameMap
	cardContainer!: CardContainer
	baseCls = "cardmenu"

	public static create<T extends typeof Observable>(this: T, config?: CardMenuConfig<InstanceType<T>>) {
		return (<InstanceType<T>>super.create(<any> config));
	}


	protected init() {

		this.cardContainer.on("cardchange", (cardContainer, index) => {

			const activeItem = index != undefined ? cardContainer.getItemAt(index)! : undefined;

			this.items.forEach((item) => {

				if (activeItem && item.itemId == activeItem.itemId) {
					item.getEl().classList.add("active");
				} else {
					item.getEl().classList.remove("active");
				}
			});
		});

		this.createMenu();

		super.init();
	}

	private createMenu() {

		this.cardContainer.getItems().forEach((item, index) => {

			if(!item.itemId) {
				item.itemId = 'card-' + index;
			}

			this.insertItem(
				Button.create({
					itemId: item.itemId,
					cls: index == this.cardContainer.getActiveItem() ? "active" : "",
					text: item.getTitle(),
					handler: () => {
						this.cardContainer.setActiveItem(item);
					}
				}), index
			);

			item.setTitle("");


		});
	}
}