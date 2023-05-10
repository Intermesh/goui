import {List, RowRenderer} from "./List";
import {Store} from "../data";
import {ComponentEventMap, createComponent} from "./Component";
import {E} from "../util";
import {Config} from "./Observable";


export const TreeRowRenderer:RowRenderer = (record, row, me, storeIndex) => {

    const node = E("div").cls("node"),
        caret = E("span").cls("caret"),
        icon = E("i").cls("icon"),
        label = E("label");

    icon.innerText = record.icon || "folder";
    label.innerText = record[me.labelProperty];

    if(record.children && record.children.length == 0) {
        row.cls("+no-children");
    }

    node.append(caret, icon, label);

    row.append(node);
}

type extractRecordType<Type> = Type extends Store<infer RecordType> ? RecordType : never

export type TreeStoreBuilder<StoreType extends Store = Store> = (record?:extractRecordType<StoreType>) => StoreType;

export class Tree<StoreType extends Store> extends List {

    public labelProperty = "name";

    constructor(public storeBuilder:TreeStoreBuilder<StoreType>, readonly renderer: RowRenderer = TreeRowRenderer, parentRecord?:any) {

        const store = storeBuilder(parentRecord);

        super(store, renderer);

        this.baseCls = "goui goui-tree";

        this.on("rowclick", (list, storeIndex, row,  ev) => {
            void this.expand(row);
        });

        this.emptyStateHtml = "";
    }

    private async expand(row:HTMLElement) {

        if(row.has(".expanded")) {
            return;
        }

        row.cls("+expanded");

        const record = this.store.get(parseInt(row.dataset.storeIndex!))
        if(!record) {
            return;
        }

        const sub = new Tree<StoreType>(this.storeBuilder, this.renderer, record);
        sub.labelProperty = this.labelProperty;
        sub.render(row);

    }

    private collapse(row:HTMLElement) {
        row.cls("-expanded");
    }

    protected renderRow(record: any, storeIndex: number): HTMLElement {
        let row =  super.renderRow(record, storeIndex);
        
        row.getElementsByClassName("caret")[0].on("click", (e) => {

            row.has(".expanded") ? this.collapse(row) : this.expand(row);
            e.preventDefault();
            e.stopPropagation();
        });

        return row;
    }
}


type TreeConfig<StoreType extends Store = Store> = Omit<Config<Tree<StoreType>, ComponentEventMap<Tree<StoreType>>, "storeBuilder">, "rowSelection" | "store">

/**
 * Shorthand function to create {@see Table}
 *
 * @param config
 */
export const tree = <StoreType extends Store = Store>(config: TreeConfig<StoreType>) => createComponent(new Tree<StoreType>(config.storeBuilder), config);