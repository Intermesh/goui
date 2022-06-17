import {Toolbar} from "./Toolbar.js";
import {Observable} from "./Observable.js";
import {comp, ComponentConfig} from "./Component.js";
import {Store} from "../data/Store.js";
import {btn, Button} from "./Button.js";
import {Component} from "./Component.js";

export interface PaginatorConfig<T extends Observable> extends ComponentConfig<T> {
	store: Store
}
export class Paginator extends Toolbar {
	private prev!: Button;
	private next!: Button;

	protected store!: Store;

	protected baseCls = "toolbar paginator";

	protected init() {
		super.init();

		this.getItems().add(
			this.prev = btn({
				icon: "chevron_left",
				text: "Previous",
				disabled: true,
				handler: () => {
					this.store.loadPrevious();
				}
			}),

			comp({
				flex:1
			}),

			this.next = btn({
				icon: "chevron_right",
				text: "Next",
				disabled: true,
				handler: () => {
					this.store.loadNext();
				}
			})
		);

		this.store.on("load", () => {
			this.onStoreLoad();
		})
	}

	private onStoreLoad() {
		this.prev.setDisabled(!this.store.hasPrevious());
		this.next.setDisabled(!this.store.hasNext());
	}
}

/**
 * Shorthand function to create {@see Paginator}
 *
 * @param config
 */
export const paginator = (config:PaginatorConfig<Paginator>) => Paginator.create(config);