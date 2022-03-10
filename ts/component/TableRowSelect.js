import { Observable } from "./Observable.js";
import { Key } from "../util/Key.js";
import { ArrayUtil } from "../util/ArrayUtil.js";
/**
 * Table row selection model
 */
export class TableRowSelect extends Observable {
    constructor() {
        super(...arguments);
        this._selected = [];
        this.lastIndex = 0;
        this.multiSelect = true;
        this.hasKeyUpListener = false;
    }
    static create(config) {
        return super.create(config);
    }
    init() {
        super.init();
        this.table.on('render', () => {
            const tableEl = this.table.getEl();
            tableEl.classList.add('rowSelect');
            tableEl.setAttribute("tabindex", "-1");
            tableEl.addEventListener("keydown", (e) => {
                this.onKeyDown(e);
            });
            this.table.on('rowclick', (table, index, e) => {
                this.onRowClick(table, index, e);
            });
        });
    }
    getSelected() {
        return [...this._selected];
    }
    onRowClick(table, index, e) {
        let selection = this.getSelected();
        if (e.shiftKey && this.multiSelect) {
            const start = Math.min(index, this.lastIndex);
            const end = Math.max(index, this.lastIndex);
            for (let i = start; i <= end; i++) {
                if (selection.indexOf(i) === -1)
                    selection.push(i);
            }
        }
        else if ((e.ctrlKey || e.metaKey) && this.multiSelect) {
            const currentIndex = selection.indexOf(index);
            if (currentIndex > -1) {
                selection.splice(currentIndex, 1);
            }
            else {
                selection.push(index);
            }
        }
        else {
            selection = [index];
        }
        this.setSelected(selection);
        this.lastIndex = index;
    }
    setSelected(newSelection, silent = false) {
        const old = this._selected;
        this._selected = newSelection;
        const deselect = ArrayUtil.diff(old, newSelection);
        const select = ArrayUtil.diff(newSelection, old);
        // console.log(this._selected,old, select, deselect);
        deselect.forEach(i => {
            this.fire('rowdeselect', this, i);
        });
        select.forEach((i, index) => {
            this.fire('rowselect', this, i);
        });
        const change = (select.length > 0 || deselect.length > 0);
        if (!silent && change) {
            this.fire('selectionchange', this);
        }
        return change;
    }
    onKeyDown(e) {
        if (e.key == Key.Shift) {
            this.shiftStartIndex = this.lastIndex;
        }
        if (e.key != Key.ArrowDown && e.key != Key.ArrowUp) {
            return;
        }
        e.preventDefault();
        let index = 0, change = false;
        if (e.key == Key.ArrowDown) {
            if (this.lastIndex == this.table.getStore().getRecords().length - 1) {
                return;
            }
            index = this.lastIndex + 1;
        }
        else if (e.key == Key.ArrowUp) {
            if (this.lastIndex == 0) {
                return;
            }
            index = this.lastIndex - 1;
        }
        if (e.shiftKey && this.multiSelect) {
            const selected = this.getSelected();
            if ((e.key == Key.ArrowDown && index > this.shiftStartIndex) || (e.key == Key.ArrowUp && index < this.shiftStartIndex)) {
                if (selected.indexOf(index) == -1) {
                    selected.push(index);
                }
            }
            else {
                const removeIndex = selected.indexOf(this.lastIndex);
                if (removeIndex > -1) {
                    selected.splice(removeIndex, 1);
                }
            }
            change = this.setSelected(selected, true);
        }
        else {
            change = this.setSelected([index], true);
        }
        if (change && !this.hasKeyUpListener) {
            this.hasKeyUpListener = true;
            this.table.getEl().addEventListener('keyup', () => {
                this.fire('selectionchange', this);
                this.hasKeyUpListener = false;
            }, { once: true });
        }
        this.lastIndex = index;
    }
}
//# sourceMappingURL=TableRowSelect.js.map