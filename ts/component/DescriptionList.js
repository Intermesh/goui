import { Component } from "./Component.js";
export class DescriptionList extends Component {
    constructor() {
        super(...arguments);
        this.tagName = "dl";
    }
    static create(config) {
        return super.create(config);
    }
    internalRender() {
        const el = super.internalRender();
        this.renderList();
        return el;
    }
    /**
     * Set the records to display
     *
     * @example
     * ```
     * const records: DLRecord = [
     * 			['Number', record.number],
     * 			['Description', record.descriptipon],
     * 			['Created At', Format.date(record.createdAt)]
     * 		];
     * dl.setRecords(records);
     * ```
     * @param records
     */
    setRecords(records) {
        this.records = records;
        this.renderList();
    }
    renderList() {
        var _a;
        const el = this.getEl();
        (_a = this.records) === null || _a === void 0 ? void 0 : _a.forEach((record) => {
            const dt = document.createElement("dt");
            dt.innerText = record.shift();
            el.appendChild(dt);
            record.forEach((r) => {
                const dd = document.createElement("dd");
                if (typeof r == 'function')
                    r(dd);
                else {
                    dd.innerText = r + "";
                }
                el.appendChild(dd);
            });
        });
    }
}
//# sourceMappingURL=DescriptionList.js.map