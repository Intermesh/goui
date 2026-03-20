/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import { Component, ComponentEventMap } from "./Component.js";
import { Store, StoreComponent, StoreEventMap, storeRecordType } from "../data";
import { RowSelect, RowSelectConfig } from "./table";
import { Config } from "./Observable.js";
export type RowRenderer = (record: any, row: HTMLElement, list: any, storeIndex: number) => string | Component[] | void;
export type GroupByRenderer = (groupBy: any, record: any, list: List) => string | Promise<string> | Component | Promise<Component>;
export type listStoreType<ListType> = ListType extends List<infer StoreType> ? StoreType : never;
/**
 * @inheritDoc
 */
export interface ListEventMap extends ComponentEventMap {
    /**
     * Fires when the user scrolled to the bottom.
     */
    scrolleddown: {};
    /**
     * Fires when the user sorts the list by a property.
     */
    sort: {
        /** The property being sorted by. */
        property: string;
    };
    /**
     * Fires when a row is mousedowned.
     */
    rowmousedown: {
        /** The index in the store. */
        storeIndex: number;
        /** The row element. */
        row: HTMLElement;
        /** The mouse event. */
        ev: MouseEvent;
    };
    /**
     * Fires when a row is clicked.
     */
    rowclick: {
        /** The index in the store. */
        storeIndex: number;
        /** The row element. */
        row: HTMLElement;
        /** The mouse or keyboard event. */
        ev: MouseEvent | KeyboardEvent;
    };
    /**
     * Fires when a row is double clicked.
     */
    rowdblclick: {
        /** The index in the store. */
        storeIndex: number;
        /** The row element. */
        row: HTMLElement;
        /** The mouse event. */
        ev: MouseEvent;
    };
    /**
     * Fires when the delete key is pressed.
     *
     * @example
     * ```
     * delete: async (list) => {
     *   const ids = list.rowSelection!.selected.map(index => list.store.get(index)!.id);
     *   await jmapds("Foo").confirmDestroy(ids);
     * }
     * ```
     */
    delete: {};
    /**
     * Fires when a row is right clicked.
     */
    rowcontextmenu: {
        /** The index in the store. */
        storeIndex: number;
        /** The row element. */
        row: HTMLElement;
        /** The mouse event. */
        ev: MouseEvent;
    };
    /**
     * Fires when records are rendered into rows.
     */
    renderrows: {
        /** The records rendered into rows. */
        records: any[];
    };
    /**
     * Fires when a row is clicked or navigated with arrows.
     */
    navigate: {
        /** The index in the store. */
        storeIndex: number;
        /** The store record */
        record: any;
    };
    /**
     * Fires when something was dropped.
     *
     * @remarks
     * - `dragDataSet.selectedRowIndexes`: The row indexes when a multiselect is dragged.
     *   If the record dragged is not part of the selection then it will contain the single dragged record.
     */
    drop: {
        /** The index where it's dropped in this list. */
        toIndex: number;
        /** The index in the source component of the item being dragged. */
        fromIndex: number;
        /** True if dropped on a node and not between. */
        droppedOn: boolean;
        /** The component where the item is dragged from. */
        source: Component;
        /** Arbitrary drag data components may set. */
        dragDataSet: Record<string, any>;
    };
    /**
     * Fires when the items are dragged over this list.
     *
     * Return false to disallow dropping.
     *
     * @remarks
     * - `dragDataSet.selectedRowIndexes`: The row indexes when a multiselect is dragged.
     *   If the record dragged is not part of the selection then it will contain the single dragged record.
     */
    dropallowed: {
        /** The index where it's dropped in this list. */
        toIndex: number;
        /** The index in the source component of the item being dragged. */
        fromIndex: number;
        /** True if dropped on a node and not between. */
        droppedOn: boolean;
        /** The component where the item is dragged from. */
        source: Component;
        /** Arbitrary drag data components may set. */
        dragDataSet: Record<string, any>;
    };
}
/**
 * List component
 *
 * Create a list with a custom item renderer. Also capable of selecting rows.
 *
 * @link https://goui.io/#list Examples
 */
export declare class List<StoreType extends Store = Store, EventMapType extends ListEventMap = ListEventMap> extends Component<EventMapType> implements StoreComponent<StoreType> {
    readonly store: StoreType;
    readonly renderer: RowRenderer;
    /**
     * Shown when the list is empty.
     */
    emptyStateHtml: string;
    protected emptyStateTag: keyof HTMLElementTagNameMap;
    private emptyEl?;
    private rowSelect?;
    /**
     * Allow items to be dragged
     */
    draggable: boolean;
    /**
     * Allow to drop between items
     */
    dropBetween: boolean;
    /**
     * Allow to drop on items
     */
    dropOn: boolean;
    /**
     * Group for sortable when drag and drop is used
     */
    sortableGroup: string | undefined;
    /**
     * When enabled, it will register it's container as scrolling element to the {@link Store}.
     * @see Store.addScrollLoader();
     */
    scrollLoad: boolean;
    /**
     * Group the table by this property.
     */
    groupBy?: string;
    /**
     * Makes the groups collapsible
     */
    groupByCollapsible: boolean;
    /**
     * Group renderer function
     */
    groupByRenderer: GroupByRenderer;
    protected itemTag: keyof HTMLElementTagNameMap;
    protected lastGroup: string;
    /**
     * Row selection object
     * @param rowSelectionConfig
     */
    set rowSelectionConfig(rowSelectionConfig: boolean | Partial<RowSelectConfig>);
    protected baseCls: string;
    constructor(store: StoreType, renderer: RowRenderer, tagName?: keyof HTMLElementTagNameMap);
    get rowSelection(): RowSelect<StoreType, storeRecordType<StoreType>> | undefined;
    protected internalRender(): HTMLElement;
    protected initSortable(): void;
    /**
     * Fires the delete event. Doesn't actually do anything else but this way you can implement the same logic for
     * pressing the delete key or clicking the delete button.
     */
    delete(): void;
    protected onKeyDown(e: KeyboardEvent): void;
    protected initStore(): void;
    onStoreLoadException(ev: StoreEventMap['loadexception']): void;
    onBeforeStoreLoad(ev: StoreEventMap['beforeload']): void;
    onStoreLoad(): void;
    onRecordRemove(ev: StoreEventMap<any>['remove']): void;
    onRecordAdd(ev: any): void;
    protected getRowElements(): HTMLElement[];
    private initNavigateEvent;
    protected renderEmptyState(): void;
    protected renderBody(): void;
    focusRow(index: number): boolean;
    getFocussedRow(): {
        rowEl: HTMLElement;
        index: number;
    } | undefined;
    protected rerender(): void;
    protected groupEl: HTMLElement | undefined;
    protected renderRows(records: any[]): void;
    protected isNewGroup(record: any): boolean;
    protected renderGroup(record: any): HTMLElement;
    private wrapGroupByCollapsible;
    protected groupSelector: string;
    private toggleGroup;
    protected renderGroupToEl(record: any, groupDisplayEl: HTMLElement): void;
    protected renderRow(record: any, storeIndex: number): HTMLElement;
    private onMouseEvent;
    private findRowByEvent;
}
export type ListConfig<EventMapType extends ListEventMap, StoreType extends Store> = Omit<Config<List<StoreType, EventMapType>, "store" | "renderer">, "rowSelection">;
/**
 * Shorthand function to create {@link List}
 *
 * @link https://goui.io/#list Examples
 *
 * @param config
 */
export declare const list: <StoreType extends Store>(config: ListConfig<ListEventMap, StoreType>) => List<StoreType, ListEventMap>;
