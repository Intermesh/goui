import { Table, TableColumn } from "./../table";
import { Config } from "./../Observable.js";
import { ListEventMap } from "../List";
import { TreeStore } from "./TreeStore";
import { TreeRecord } from "./TreeRecord";
/**
 * @inheritDoc
 */
export interface TreeEventMap extends ListEventMap {
    /**
     * Fires before a node expands
     *
     * You can cancel the expand by returning false.
     *
     * Could be useful to populate the tree.
     *
     * @param tree The  tree
     * @param record The record of the expanding node
     * @param storeIndex The index of the record in the store
     */
    beforeexpand: {
        record: TreeRecord;
        storeIndex: number;
    };
    /**
     * Fires when a node expands
     *
     * @param tree The  tree
     * @param record The record of the expanding node
     * @param storeIndex The index of the record in the store
     */
    expand: {
        record: TreeRecord;
        storeIndex: number;
    };
    /**
     * Fires when a node collapses
     *
     * @param tree The main tree
     * @param record The record of the collapsing node
     * @param storeIndex The index of the record in the store
     */
    beforecollapse: {
        record: TreeRecord;
        storeIndex: number;
    };
    /**
     * Fires when a node collapses
     *
     * @param tree The main tree
     * @param record The record of the collapsing node
     * @param storeIndex The index of the record in the store
     */
    collapse: {
        record: TreeRecord;
        storeIndex: number;
    };
    /**
     * Fires when a node collapses
     *
     * @param tree The main tree
     * @param record The record of the collapsing node
     * @param storeIndex The index of the record in the store
     */
    checkchange: {
        record: TreeRecord;
        storeIndex: number;
        checked: boolean;
    };
}
export type NodeProvider = (record: TreeRecord | undefined, store: TreeStore) => TreeRecord[] | Promise<TreeRecord[]>;
/**
 * Tree component
 *
 * @link https://goui.io/#tree Examples
 */
export declare class Tree<EventMap extends TreeEventMap = TreeEventMap> extends Table<TreeStore, EventMap> {
    protected nodeProvider: NodeProvider;
    constructor(nodeProvider: NodeProvider, columns?: TableColumn[]);
    protected renderRow(record: any, storeIndex: number): HTMLElement;
    /**
     * Expand a tree node
     *
     * @param record
     */
    expand(record: any): Promise<void>;
    /**
     * Collapse a tree node
     *
     * @param record
     */
    collapse(record: any): void;
    private internalExpand;
    private internalCollapse;
    /**
     * Expands a node after 1s when dragging something over it
     *
     * @param row
     * @param record
     * @param storeIndex
     * @private
     */
    private setupExpandOnDragOver;
}
/**
 * Generator function for a {@link Tree} component
 *
 * @param config
 */
export declare const tree: (config: Config<Tree> & {
    nodeProvider: NodeProvider;
}) => Tree<TreeEventMap>;
