import {Toolbar} from "./Toolbar.js";
import {Observable} from "./Observable.js";
import {ComponentConfig} from "./Component.js";
import {Store} from "../data/Store.js";
import {Button} from "./Button.js";
import {Component} from "./Component.js";

export interface PaginatorConfig<T extends Observable> extends ComponentConfig<T> {
	store: Store
}
export class Paginator extends Toolbar {
	private prev!: Button;
	private next!: Button;
	public static create<T extends typeof Observable>(this: T, config?: PaginatorConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected store!: Store;

	protected baseCls = "toolbar paginator";

	protected init() {
		super.init();

		this.items = [
			this.prev = Button.create({
				icon: "chevron_left",
				text: "Previous",
				disabled: true,
				handler: () => {
					this.store.loadPrevious();
				}
			}),
			Component.create({
				flex:1
			}),
			this.next = Button.create({
				icon: "chevron_right",
				text: "Next",
				disabled: true,
				handler: () => {
					this.store.loadNext();
				}
			})
		];

		this.store.on("load", () => {
			this.onStoreLoad();
		})
	}

	private onStoreLoad() {
		this.prev.setDisabled(!this.store.hasPrevious());
		this.next.setDisabled(!this.store.hasNext());
	}
}