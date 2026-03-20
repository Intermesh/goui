import { Table, TableColumn } from "../table";
import { TreeRecord } from "./TreeRecord";
import { Config } from "../Observable";
export declare class TreeColumn extends TableColumn {
    defaultIcon?: string;
    renderer: (columnValue: any, record: TreeRecord, td: HTMLTableCellElement, tree: Table, storeIndex: number, column: TableColumn) => import("..").Component<import("..").ComponentEventMap>;
}
export declare const treecolumn: (config: Config<TreeColumn, "id">) => TreeColumn;
