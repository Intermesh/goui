import {Button, ButtonConfig} from "./Button.js";
import {CardMenu} from "./CardMenu.js";
import {Component, ComponentConfig} from "./Component.js";
import {Observable} from "./Observable.js";
/**
 * @inheritDoc
 */
export interface CardMenuAsyncItemConfig<T extends Observable> extends ButtonConfig<T> {
	/**
	 * The module to be loaded
	 *
	 * if not given the import name will be used:
	 *
	 * `../../${import}.js`
	 */
	module?: string

	/**
	 * The class to be imported
	 *
	 * @eg. "Contracts"
	 */
	import: string
}

/**
 * Card menu item that loads modules on demand
 *
 * @example
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
 */
export class CardMenuAsyncItem extends Button {
	public static create<T extends typeof Observable>(this: T, config?: CardMenuAsyncItemConfig<InstanceType<T>>){
		return <InstanceType<T>> super.create(<any> config);
	}
	private static nextId = 0;
	protected module?: string;
	protected import!: string;
	handler = async () => {

		if(!this.itemId) {
			this.itemId = 'CardMenuAsyncItem-' + CardMenuAsyncItem.nextId++;
		}

		const cardMenu = <CardMenu>this.parent;
		let item = cardMenu.cardContainer.findItem(this.itemId);
		if(!item) {
			if(!this.module) {
				this.module = `../../${this.import}.js`;
			}
			const mods = await import(this.module);
			item = <Component> mods[this.import].create({
				itemId: this.itemId
			});
			cardMenu.cardContainer.addItem(item);
		}
		item.show();
	}
}