import {Component, ComponentEventMap, Config, createComponent} from "./Component.js";
import {Store, StoreRecord} from "../data/Store.js";
import {t} from "../Translate.js";
import {E} from "../util/Element.js";
import {rowselect, RowSelect, RowSelectConfig} from "./table/RowSelect.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";


type RowRenderer = (record: any, row: HTMLElement, me: List, storeIndex: number) => string | Component[] | void
/**
 * @inheritDoc
 */
export interface ListEventMap<Type extends Observable> extends ComponentEventMap<Type> {
	/**
	 * Fires when the user scrolled to the bottom
	 *
	 * @param list
	 */
	scrolleddown: <Sender extends Type> (list: Sender) => void
	/**
	 * Fires when the user sorts the list
	 *
	 * @param list
	 * @param dataIndex
	 */
	sort: <Sender extends Type> (list: Sender, dataIndex: string) => void

	/**
	 * Fires when a row is clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowmousedown: <Sender extends Type> (list: Sender, storeIndex: number, ev: MouseEvent) => void

	/**
	 * Fires when a row is double clicked
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	rowdblclick: <Sender extends Type> (list: Sender, storeIndex: number, ev: MouseEvent) => void

	/**
	 * Fires when records are rendered into rows.
	 *
	 * @param list
	 * @param records
	 */
	renderrows: <Sender extends Type> (list: Sender, records: StoreRecord[]) => void;

	/**
	 * Fires when a row is clicked or navigated with arrows
	 *
	 * @param list
	 * @param storeIndex
	 * @param ev
	 */
	navigate: <Sender extends Type> (list: Sender, storeIndex: number, record: StoreRecord) => void

}

export interface List {
	on<K extends keyof ListEventMap<this>>(eventName: K, listener: Partial<ListEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof ListEventMap<this>>(eventName: K, ...args: Parameters<ListEventMap<this>[K]>): boolean

	set listeners(listeners: ObservableListener<ListEventMap<this>>)
}

export class List<StoreType extends Store = Store> extends Component {
	/**
	 * Shown when the list is empty.
	 */
	public emptyStateHtml = `<div class="goui-empty-state"><i class="icon">article</i><p>${t("Nothing to show")}</p></div>`

	protected loadOnScroll: boolean = false;

	private emptyStateEl?: HTMLDivElement;

	private rowSelect?: RowSelect;

	protected bodyEl?: HTMLElement

	protected itemTag: keyof HTMLElementTagNameMap = 'li'

	/**
	 * Row selection object
	 * @param rowSelectionConfig
	 */
	set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig> ) {
		if (typeof rowSelectionConfig != "boolean") {
			(rowSelectionConfig as RowSelectConfig).list = this;
			this.rowSelect = rowselect(rowSelectionConfig as RowSelectConfig);
		} else {
			this.rowSelect = rowselect({list: this});
		}
	}

	constructor(readonly store: StoreType, readonly renderer: RowRenderer) {
		super();
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

	protected internalRender() {
		const el = super.internalRender();

		this.initNavigateEvent();

		this.store.on("load", (store, records, append) => {
			const isEmpty = (!append && records.length == 0);

			this.bodyEl!.hidden = isEmpty;
			this.emptyStateEl!.hidden = !isEmpty;
		});

		el.on("mousedown", (e) => {
			this.onMouseDown(e);
		}).on("dblclick", (e) => {
			this.onDblClick(e);
		});

		this.renderEmptyState();
		this.renderBody();
		return el;
	}

	private initNavigateEvent() {
		this.on('rowmousedown', (list, storeIndex, ev) => {
			if (!ev.shiftKey && !ev.ctrlKey) {
				const record = this.store.get(storeIndex);

				this.fire("navigate", this, storeIndex, record);
			}
		});

		if (this.rowSelection) {

			this.el.addEventListener('keydown', (ev) => {

				if (!ev.shiftKey && !ev.ctrlKey && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) {

					const selected = this.rowSelect!.selected;
					if (selected.length) {
						const storeIndex = selected[0],
								record = this.store.get(storeIndex);
						this.fire("navigate", this, storeIndex, record);
					}
				}
			});

		}
	}

	protected renderEmptyState() {
		this.emptyStateEl = E('div').attr('hidden', this.store.count() > 0);
		this.emptyStateEl.innerHTML = this.emptyStateHtml;
		this.el.appendChild(this.emptyStateEl);
	}

	protected clearRows() {
		if(this.bodyEl) {
			this.bodyEl.innerHTML = "";
		}
	}

	protected renderBody() {
		this.bodyEl = this.bodyEl || E('ul');
		this.bodyEl.hidden = this.store.count() == 0;

		this.renderRows(this.store.items);

		this.el.append(this.bodyEl);

		if (this.loadOnScroll) {
			this.el.on('scroll', () => {
				this.onScroll();
			}, {passive: true});
		}

		// Use unshift = true so that this listener executes first so that other load listners execute when the list is
		// rendered and can select rows.
		this.store.on("load", (store, records, append) => {
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

		if (this.rowSelect) {
			this.rowSelect.on('rowselect', (rowSelect, storeIndex) => {
				const tr = (<HTMLElement>this.bodyEl!.querySelector("[data-store-index='" + storeIndex + "']"));

				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.add('selected');
				tr.focus();
			});

			this.rowSelect.on('rowdeselect', (rowSelect, storeIndex) => {
				const tr = this.bodyEl!.querySelector("[data-store-index='" + storeIndex + "']") as HTMLElement;
				if (!tr) {
					console.error("No row found for selected index: " + storeIndex + ". Maybe it's not rendered yet?");
					return;
				}
				tr.classList.remove('selected');
			});
		}
	}

	protected renderRows(records: StoreRecord[]) {

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

	protected renderGroup(record: StoreRecord): HTMLElement {
		return this.bodyEl!; // no group support yet @see Table
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

	private onMouseDown(e: MouseEvent & {target: HTMLElement}) {
		const index = this.findRowByEvent(e);

		if (index !== -1) {
			this.fire('rowmousedown', this, index, e);
		}
	}

	private onDblClick(e: MouseEvent & {target: HTMLElement}) {
		const index = this.findRowByEvent(e);

		if (index !== -1) {
			this.fire('rowdblclick', this, index, e);
		}
	}

	private findRowByEvent(e: MouseEvent & {target: HTMLElement}) {
		const row = e.target.closest("[data-store-index]") as HTMLElement;
		return row ? parseInt(row.dataset.storeIndex!) : -1;
	}
}

type ListConfig = Omit<Config<List>, "rowSelection"> & {
	/**
	 * Store that provides the data
	 */
	store: Store,

	/**
	 * The list item render function
	 */
	renderer: RowRenderer
}

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const list = (config: ListConfig) => createComponent(new List(config.store, config.renderer), config);