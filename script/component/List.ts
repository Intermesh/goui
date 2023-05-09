/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */

import {Component, ComponentEventMap, createComponent} from "./Component.js";
import {Store, StoreRecord, storeRecordType} from "../data/Store.js";
import {t} from "../Translate.js";
import {E} from "../util/Element.js";
import {rowselect, RowSelect, RowSelectConfig} from "./table/RowSelect.js";
import {Config, ObservableListener, ObservableListenerOpts} from "./Observable.js";

export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;


/**
 * @inheritDoc
 */
export interface ListEventMap<Type> extends ComponentEventMap<Type> {
	/**
	 * Fires when the user scrolled to the bottom
	 *
	 * @param list
	 */
	scrolleddown:  (list: Type) => void
	/**
	 * Fires when the user sorts the list
	 *
	 * @param list
	 * @param dataIndex
	 */
	sort:  (list: Type, dataIndex: string) => void

	/**
	 * Fires when a row is mousedowned
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowmousedown:  (list: Type, storeIndex: number, row:HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when a row is clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowclick:  (list: Type, storeIndex: number, row:HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when a row is double clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowdblclick:  (list: Type, storeIndex: number, row:HTMLElement, ev: MouseEvent) => void

	/**
	 * Fires when records are rendered into rows.
	 *
	 * @param list
	 * @param records
	 */
	renderrows:  (list: Type, records: any[]) => void;

	/**
	 * Fires when a row is clicked or navigated with arrows
	 *
	 * @param list
	 * @param storeIndex
	 * @param record
	 */
	navigate:  (list: Type, storeIndex: number) => void

}

export interface List<StoreType extends Store = Store> {
	on<K extends keyof ListEventMap<this>>(eventName: K, listener: Partial<ListEventMap<this>>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof ListEventMap<this>>(eventName: K, ...args: Parameters<ListEventMap<any>[K]>): boolean
}

export class List<StoreType extends Store = Store> extends Component {
	/**
	 * Shown when the list is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("Nothing to show")}</p></div>`

	protected loadOnScroll: boolean = false;

	private emptyStateEl?: HTMLElement;

	private rowSelect?: RowSelect;


	protected itemTag: keyof HTMLElementTagNameMap = 'li'

	/**
	 * Row selection object
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig> ) {
		if (typeof rowSelectionConfig != "boolean") {
			(rowSelectionConfig as RowSelectConfig).list = this as never;
			this.rowSelect = rowselect(rowSelectionConfig as RowSelectConfig);
		} else {
			this.rowSelect = rowselect({list: this  as never});
		}
	}

	constructor(readonly store: StoreType, readonly renderer: RowRenderer, tagName:keyof HTMLElementTagNameMap = "ul") {
		super(tagName);
		this.tabIndex = 0;

		store.on("beforeload", () => {
			this.mask();
		})
		store.on("load", () => {
			this.unmask();
		})
	}

	get rowSelection() : RowSelect | undefined {
		return this.rowSelect;
	}

	get el(): HTMLElement {
		return super.el;
	}

	protected internalRender() {
		const el = super.internalRender();

		this.initNavigateEvent();

		el.on("mousedown", (e) => {
			this.onMouseEvent(e, "rowmousedown");
		}).on("dblclick", (e) => {
			this.onMouseEvent(e, "rowdblclick");
		}).on("click", (e) => {
			this.onMouseEvent(e, "rowclick");
		});

		this.renderEmptyState();
		this.renderBody();
		this.initStore();
		return el;
	}

	private initStore() {
		if (this.loadOnScroll) {
			this.el.on('scroll', () => {
				this.onScroll();
			}, {passive: true});
		}

		// Use unshift = true so that this listener executes first so that other load listeners execute when the list is
		// rendered and can select rows.
		this.store.on("load", (store, records, append) => {
			const isEmpty = (!append && records.length == 0);

			//this.el.hidden = isEmpty;
			this.emptyStateEl!.hidden = !isEmpty;

			if (!append) {
				this.clearRows();
			}
			this.renderRows(records);

			if (this.loadOnScroll) {
				setTimeout(() => {
					this.onScroll();
				});
			}

		}, {unshift: true});
	}

	private initNavigateEvent() {
		this.on('rowmousedown', (list, storeIndex, row,  ev) => {
			if (!ev.shiftKey && !ev.ctrlKey) {
				this.fire("navigate", this, storeIndex);
			}
		});

		if (this.rowSelection) {

			this.el.addEventListener('keydown', (ev) => {

				if (!ev.shiftKey && !ev.ctrlKey && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) {

					const selected = this.rowSelect!.selected;
					if (selected.length) {
						const storeIndex = selected[0]
						this.fire("navigate", this, storeIndex);
					}
				}
			});

		}
	}

	protected renderEmptyState() {
		this.emptyStateEl = E('li');
		this.emptyStateEl.hidden = this.store.count() > 0;
		this.emptyStateEl.innerHTML = this.emptyStateHtml;
		this.el.appendChild(this.emptyStateEl);
	}

	protected clearRows() {
		this.el.innerHTML = "";
	}

	protected renderBody() {

		this.renderRows(this.store.items);

		if (this.rowSelect) {
			this.rowSelect.on('rowselect', (rowSelect, storeIndex) => {
				const tr = (<HTMLElement>this.el!.querySelector("[data-store-index='" + storeIndex + "']"));

				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.add('selected');
				tr.focus();
			});

			this.rowSelect.on('rowdeselect', (rowSelect, storeIndex) => {
				const tr = this.el!.querySelector("[data-store-index='" + storeIndex + "']") as HTMLElement;
				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.remove('selected');
			});
		}
	}

	protected renderRows(records: any[]) {

		records.forEach((record, index) => {
			const container = this.renderGroup(record),
					row = this.renderRow(record, index);
			if(this.rowSelection && this.rowSelection.selected.indexOf(index) > -1) {
				row.cls("+selected");
			}
			container.append(row);
		});

		this.fire("renderrows", this, records);
	}

	protected renderGroup(record: any): HTMLElement {
		return this.el;
	}

	protected renderRow(record: any, storeIndex: number): HTMLElement {

		const row = E(this.itemTag)
			.cls('+data')
			.attr('tabindex','0');
		row.dataset.storeIndex = storeIndex + "";
		const r = this.renderer(record, row, this, storeIndex);
		if (typeof r === "string") {
			row.innerHTML = r;
		} else if (Array.isArray(r)) {
			r.forEach(c => c.render(row));
		} // else NO-OP renderder will be responsible for appending html to the row @see Table
		return row;
	}

	private onScroll() {
		const el = this.el;
		const pixelsLeft = el.scrollHeight - el.scrollTop - el.offsetHeight;

		if (pixelsLeft < 100) {
			if (!this.store.loading && this.store.hasNext()) {
				this.store.loadNext(true).finally(() => {
					this.fire("scrolleddown", this);
				});
			}
		}
	}

	private onMouseEvent(e: MouseEvent & {target: HTMLElement}, type: any) {
		const row = this.findRowByEvent(e),
			index = row ? parseInt(row.dataset.storeIndex!) : -1;

		if (index !== -1) {
			this.fire(type, this, index, row, e);
		}
	}


	private findRowByEvent(e: MouseEvent & {target: HTMLElement}) {
		return  e.target.closest("[data-store-index]") as HTMLElement;

	}
}


export type ListConfig<StoreType extends Store> = Omit<Config<List<StoreType>, ListEventMap<List<StoreType>>, "store" | "renderer">, "rowSelection">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const list = <StoreType extends Store>(config: ListConfig<StoreType>) : List<StoreType> => createComponent(new List(config.store, config.renderer), config);