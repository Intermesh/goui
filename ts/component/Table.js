import { Component } from "./Component.js";
import { TableRowSelect } from "./TableRowSelect.js";
import { Observable } from "./Observable.js";
import { Format } from "../util/Format.js";
import { ObjectUtil } from "../util/ObjectUtil.js";
import { Menu } from "./menu/Menu.js";
import { CheckboxField } from "./form/CheckboxField.js";
import { Alert } from "../Alert.js";
import { DraggableComponent } from "./DraggableComponent.js";
export class TableColumn extends Observable {
    constructor() {
        super(...arguments);
        this.resizable = false;
        this.sortable = false;
        this.align = "left";
        this.hidden = false;
    }
    static create(config) {
        return super.create(config);
    }
}
export class DateTimeColumn extends TableColumn {
    constructor() {
        super(...arguments);
        this.renderer = (date) => {
            return Format.dateTime(date);
        };
        //argh!? https://stackoverflow.com/questions/43121661/typescript-type-inference-issue-with-string-literal
        this.align = "right";
        this.width = 192;
    }
}
export class DateColumn extends TableColumn {
    constructor() {
        super(...arguments);
        this.renderer = (date) => {
            return Format.date(date);
        };
        //argh!? https://stackoverflow.com/questions/43121661/typescript-type-inference-issue-with-string-literal
        this.align = "right";
        this.width = 128;
    }
}
export class CheckboxColumn extends TableColumn {
    constructor() {
        super(...arguments);
        this.width = 40;
        this.renderer = (val) => {
            return CheckboxField.create({
                value: val
            });
        };
    }
}
/**
 * Table component
 *
 * @example
 * ```
 * const records:StoreRecord[] = [];
 *
 * 	for(let i = 1; i <= 100; i++) {
 * 		records.push({number: i, description: "Test " + i, createdAt: (new DateTime()).format("c")});
 * 	}
 *
 * 	const table = Table.create({
 * 		store: Store.create({
 * 			records: records,
 * 		  sort: [{property: "number", isAscending: true}]
 * 		}),
 * 		cls: "fit",
 * 		columns: [
 * 			{
 * 				header: "Index",
 * 				property: "id",
 * 				renderer: (value, record, td, table) => {
 * 					return table.getStore().findRecordIndex(r => record.number == r.number).toString();
 * 				},
 * 				resizable: true,
 * 				width: 60,
 * 				sortable: false
 * 			},
 * 			{
 * 				header: "Number",
 * 				property: "number",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 200
 * 			},
 * 			{
 * 				header: "Description",
 * 				property: "description",
 * 				sortable: true,
 * 				resizable: true,
 * 				width: 300
 * 			},
 * 			DateColumn.create({
 * 				header: "Created At",
 * 				property: "createdAt",
 * 				sortable: true
 * 			})
 * 			]
 * 	});
 *  ```
 */
export class Table extends Component {
    constructor() {
        super(...arguments);
        this.emptyStateHtml = `<div class="empty-state"><i class="icon">article</i><p>Nothing to show</p></div>`;
        this.minCellWidth = 30;
        this.tagName = "div";
        this.baseCls = "table scroll";
        this.columns = [];
        this.rowSelection = true;
        this.fitComponent = true;
        this.loadOnScroll = false;
        // public setColumnwidth(col:TableColumn, width:number) {
        // 	col.width = width;
        // 	this.tableEl!.style.width = this.calcTableWidth() + "px";
        // 	col.headerEl!.style.width = width + "px"
        // }
        this.colsAreFixed = false;
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        super.init();
        if (this.rowSelection) {
            if (typeof this.rowSelection != "boolean") {
                this.rowSelection.table = this;
                this.rowSelect = TableRowSelect.create(this.rowSelection);
            }
            else {
                this.rowSelect = TableRowSelect.create({ table: this });
            }
        }
        this.normalizeColumns();
    }
    internalRemove() {
        if (this.columnMenu) {
            this.columnMenu.remove();
        }
        return super.internalRemove();
    }
    getRowSelection() {
        return this.rowSelect;
    }
    normalizeColumns() {
        for (let i = 0, l = this.columns.length; i < l; i++) {
            if (!(this.columns[i] instanceof TableColumn)) {
                this.columns[i] = TableColumn.create(this.columns[i]);
            }
        }
    }
    restoreState(state) {
        if (state.sort) {
            this.store.sort = state.sort;
        }
        if (state.columns) {
            for (let dataIndex in state.columns) {
                let col = this.findColumnByProperty(dataIndex);
                if (col) {
                    Object.assign(col, state.columns[dataIndex]);
                }
            }
        }
    }
    findColumnByProperty(property) {
        return this.columns.find((col) => {
            return col.property == property;
        });
    }
    buildState() {
        const cols = {};
        this.columns.forEach((c) => {
            cols[c.property] = {
                width: c.width,
                hidden: c.hidden
            };
        });
        return {
            sort: this.store.sort,
            columns: cols
        };
    }
    internalRender() {
        const el = super.internalRender();
        this.renderEmptyState();
        this.renderTable();
        return el;
    }
    renderEmptyState() {
        const el = this.getEl();
        this.emptyStateEl = document.createElement("div");
        this.emptyStateEl.innerHTML = this.emptyStateHtml;
        this.emptyStateEl.hidden = this.getStore().getRecords().length > 0;
        el.appendChild(this.emptyStateEl);
        this.getStore().on("load", (store, records, append) => {
            if (!append && records.length == 0) {
                this.tableEl.hidden = true;
                this.emptyStateEl.hidden = false;
            }
            else {
                this.tableEl.hidden = false;
                this.emptyStateEl.hidden = true;
            }
        });
    }
    renderTable() {
        const el = this.getEl();
        this.tableEl = document.createElement('table');
        this.tableEl.hidden = this.getStore().getRecords().length == 0;
        if (this.fitComponent) {
            this.tableEl.style.minWidth = "100%";
        }
        this.renderHeaders();
        this.renderRows(this.store.getRecords());
        el.appendChild(this.tableEl);
        if (this.loadOnScroll) {
            el.addEventListener("scroll", () => {
                this.onScroll();
            }, { passive: true });
        }
        el.addEventListener("click", (e) => {
            this.onClick(e);
        });
        el.addEventListener("dblclick", (e) => {
            this.onDblClick(e);
        });
        // Use unshift = true so that this listener executes first so that other load listners execute when the table is
        // rendered and can select rows.
        this.store.on("load", (store, records, append) => {
            if (!append) {
                this.tbody.innerHTML = "";
            }
            this.renderRows(records);
            if (this.loadOnScroll) {
                setTimeout(() => {
                    this.onScroll();
                });
            }
        }, { unshift: true });
        if (this.rowSelect) {
            this.rowSelect.on('rowselect', (tableRowSelect, rowIndex) => {
                const tr = this.tbody.childNodes[rowIndex];
                if (!tr) {
                    console.error("No row found for selected index: " + rowIndex + ". Maybe it's not rendered yet?");
                    return;
                }
                tr.classList.add('selected');
                tr.focus();
            });
            this.rowSelect.on('rowdeselect', (tableRowSelect, rowIndex) => {
                const tr = this.tbody.childNodes[rowIndex];
                if (!tr) {
                    console.error("No row found for selected index: " + rowIndex + ". Maybe it's not rendered yet?");
                    return;
                }
                tr.classList.remove('selected');
            });
        }
    }
    rerender() {
        const el = this.getEl();
        this.tbody = undefined;
        el.innerHTML = "";
        this.renderTable();
    }
    onClick(e) {
        const index = this.findRowByEvent(e);
        if (index == -1) {
            //clicked on header row
            return;
        }
        this.fire('rowclick', this, index, e);
    }
    onDblClick(e) {
        const index = this.findRowByEvent(e);
        if (index == -1) {
            //clicked on header row
            return;
        }
        this.fire('rowdblclick', this, index, e);
    }
    findRowByEvent(e) {
        const target = e.target;
        const tr = target.closest("tr");
        if (!tr) {
            //clicked outside table
            return -1;
        }
        return Array.from(this.tbody.children).indexOf(tr);
    }
    onScroll() {
        const el = this.getEl();
        const pixelsLeft = el.scrollHeight - el.scrollTop - el.offsetHeight;
        if (pixelsLeft < 100) {
            if (!this.store.isLoading() && this.store.hasNext()) {
                this.store.loadNext(true).finally(() => {
                    this.fire("scrolleddown", this);
                });
            }
        }
    }
    showColumnMenu(ev) {
        ev.preventDefault();
        if (!this.columnMenu) {
            this.columnMenu = Menu.create({
                removeOnClose: false
            });
            this.columns.forEach((c) => {
                this.columnMenu.addItem(CheckboxField.create({
                    label: c.header,
                    name: c.property,
                    value: !c.hidden,
                    listeners: {
                        change: (field) => {
                            c.hidden = !field.getValue();
                            this.saveState();
                            this.rerender();
                        }
                    }
                }));
            });
        }
        this.columnMenu.showAt(ev);
    }
    createColumnSplitter(h, header, colIndex) {
        if (h.resizable) {
            const splitter = DraggableComponent.create({
                tagName: "hr",
                setPosition: false
            });
            splitter.on("dragstart", (cmp, dragData) => {
                if (!this.colsAreFixed) {
                    this.fixColumnWidths();
                }
                dragData.data.startWidth = header.offsetWidth;
                splitter.dragConstrainTo(this.headersRow, { left: this.calcTableWidth(colIndex) + this.minCellWidth, right: -10000 });
            });
            splitter.on("drag", (cmp, dragData) => {
                const w = dragData.data.startWidth + dragData.x - dragData.startX;
                header.style.width = w + "px";
                h.width = w;
                this.tableEl.style.width = this.calcTableWidth() + "px";
            });
            splitter.on("drop", () => {
                this.saveState();
            });
            return splitter;
        }
        else {
            return Component.create({ tagName: "hr" });
        }
    }
    renderHeaders() {
        const thead = document.createElement('thead');
        this.headersRow = document.createElement("tr");
        this.headersRow.addEventListener('contextmenu', ev => {
            this.showColumnMenu(ev);
        });
        let index = -1;
        for (let h of this.columns) {
            index++;
            if (h.hidden) {
                continue;
            }
            const header = document.createElement("th");
            if (h.width) {
                header.style.width = h.width + "px";
            }
            if (h.align) {
                header.style.textAlign = h.align;
            }
            //column resize splitter
            header.innerHTML = h.header;
            h.headerEl = header;
            if (h.resizable) {
                const splitter = this.createColumnSplitter(h, header, index);
                splitter.render(header);
            }
            if (h.sortable) {
                header.addEventListener("click", () => {
                    this.onSort(h.property, header);
                });
                const sort = this.store.sort;
                if (sort.length) {
                    if (h.property == sort[0].property) {
                        header.classList.add("sorted");
                        header.classList.add(sort[0].isAscending ? "asc" : "desc");
                    }
                }
            }
            this.headersRow.appendChild(header);
        }
        thead.appendChild(this.headersRow);
        this.tableEl.appendChild(thead);
        return this.headersRow;
    }
    onSort(dataIndex, header) {
        this.fire("sort", this, dataIndex);
        const s = this.store.sort;
        let isAscending = true;
        if (s[0]) {
            if (s[0].property == dataIndex) {
                isAscending = !s[0].isAscending;
            }
        }
        this.headersRow.childNodes.forEach((node) => {
            let th = node;
            if (th == header) {
                th.classList.add("sorted");
                th.classList.remove(isAscending ? "desc" : "asc");
                th.classList.add(isAscending ? "asc" : "desc");
            }
            else {
                th.classList.remove("sorted");
                th.classList.remove("asc");
                th.classList.remove("desc");
            }
        });
        this.store.sort = [{
                property: dataIndex,
                isAscending: isAscending
            }];
        this.store.reload().catch((reason) => {
            Alert.error(reason);
        });
        this.saveState();
    }
    /**
     * When resizing columns we must calculate absolute pixel widths
     *
     * @private
     */
    fixColumnWidths() {
        this.columns.forEach(col => {
            if (!col.hidden) {
                col.width = col.headerEl.offsetWidth;
                col.headerEl.style.width = col.width + "px";
            }
        });
        this.tableEl.style.minWidth = "";
        this.tableEl.style.width = this.calcTableWidth() + "px";
    }
    /**
     * Returns the sum of column widths
     *
     * @param untilColumnIndex Calc width until this column
     */
    calcTableWidth(untilColumnIndex = -1) {
        return this.columns.reduce((previousValue, nextValue, currentIndex) => {
            if (nextValue.hidden || (untilColumnIndex > -1 && currentIndex >= untilColumnIndex)) {
                return previousValue;
            }
            return previousValue + nextValue.width;
        }, 0);
    }
    renderRows(records) {
        if (!this.tbody) {
            this.tbody = document.createElement('tbody');
            this.tableEl.appendChild(this.tbody);
        }
        const frag = document.createDocumentFragment();
        for (let record of records) {
            this.renderRow(record, frag);
        }
        this.tbody.appendChild(frag);
        this.fire("renderrows", this, records);
    }
    /**
     * Get the data store
     */
    getStore() {
        return this.store;
    }
    renderRow(record, tbody) {
        const row = document.createElement("tr");
        row.setAttribute("tabindex", "0");
        for (let c of this.columns) {
            if (c.hidden) {
                continue;
            }
            const td = document.createElement("td");
            if (c.align) {
                td.style.textAlign = c.align;
            }
            let value = ObjectUtil.path(record, c.property);
            if (c.renderer) {
                const r = c.renderer(value, record, td, this);
                if (typeof r === "string") {
                    td.innerHTML = r;
                }
                else if (r instanceof Component) {
                    r.render(td);
                }
                else {
                    r.then((s) => {
                        if (s instanceof Component) {
                            s.render(td);
                        }
                        else {
                            td.innerHTML = s;
                        }
                    });
                }
            }
            else {
                td.innerText = value ? value : "";
            }
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
}
//# sourceMappingURL=Table.js.map