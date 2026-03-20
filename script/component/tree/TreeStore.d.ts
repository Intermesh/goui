import { Store } from "../../data/Store";
import { NodeProvider } from "../../component";
import { TreeRecord } from "./TreeRecord";
/**
 * A data store for {@see Tree} components
 *
 * @link https://goui.io/#tree Examples
 */
export declare class TreeStore extends Store<TreeRecord> {
    private nodeProvider;
    private expandedRecordCache;
    constructor(nodeProvider: NodeProvider, records?: TreeRecord[]);
    reload(): Promise<TreeRecord[]>;
    protected internalLoad(append: boolean): Promise<TreeRecord[]>;
    private populateChildren;
    protected onAdd(record: TreeRecord): void;
    expand(record: TreeRecord): Promise<void>;
    collapse(record: TreeRecord): void;
}
