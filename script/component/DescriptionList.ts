/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, createComponent} from "./Component.js";
import {Config} from "./Observable.js";

type renderFunc = (dd: Component) => void;

export type DLRecord = [string, string | renderFunc, ...(string | renderFunc)[]][];

export class DescriptionList extends Component {

	constructor() {
		super("dl");
	}

	protected baseCls = 'goui-dl';

	private _records?: DLRecord;

	protected internalRender(): HTMLElement {
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
	 * 			['Description', record.description],
	 * 			['Created At', Format.date(record.createdAt)]
	 * 		];
	 * dl.setRecords(records);
	 * ```
	 * @param records
	 */
	public set records(records: DLRecord) {
		this._records = records;
		this.renderList();
	}

	public get records() {
		return this._records || [];
	}

	private renderList() {
		this.items.clear();
		this.records.forEach((record) => {

			this.items.add(comp({
				tagName: "dt",
				text: <string>record.shift()
			}));

			record.forEach((r) => {
				const dd = comp({
					tagName: "dd"
				});

				if (typeof r == 'function')
					r(dd);
				else {
					dd.text = r + "";
				}
				this.items.add(dd);
			});
		});
	}
}

/**
 * Shorthand function to create {@link DescriptionList}
 *
 * @param config
 * @param items
 */
export const dl = (config?: Config<DescriptionList>, ...items: Component[]) => createComponent(new DescriptionList(), config, items);
