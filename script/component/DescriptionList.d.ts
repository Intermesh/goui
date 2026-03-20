/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component } from "./Component.js";
import { Config } from "./Observable.js";
type renderFunc = (dd: Component) => void;
export type DLRecord = [string, string | renderFunc, ...(string | renderFunc)[]][];
export declare class DescriptionList extends Component {
    constructor();
    protected baseCls: string;
    private _records?;
    protected internalRender(): HTMLElement;
    /**
     * Set the records to display
     *
     * @example
     * ```
     * const records: DLRecord = [
     * 			['Number', record.number],
     * 			['Description', record.description],
     * 			['Created At', Format.date(record.createdAt)]
     * 		];
     * dl.setRecords(records);
     * ```
     * @param records
     */
    set records(records: DLRecord);
    get records(): DLRecord;
    private renderList;
}
/**
 * Shorthand function to create {@link DescriptionList}
 *
 * @param config
 * @param items
 */
export declare const dl: (config?: Config<DescriptionList>, ...items: Component[]) => DescriptionList;
export {};
