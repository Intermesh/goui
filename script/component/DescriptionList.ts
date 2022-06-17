import {Observable} from "./Observable.js";
import {comp, Component, ComponentConfig} from "./Component.js";

type renderFunc = (dd: Component) => void;

export type DLRecord = [string,string|renderFunc,...(string|renderFunc)[]][];
/**
 * @inheritDoc
 */
export interface DescriptionListConfig<T extends Observable> extends ComponentConfig<T> {


	/**
	 * The records to display
	 *
	 * @example
	 * ```
	 * 	const records: DLRecord = [
	 * 			['Number', record.number],
	 * 			['Description', record.description],
	 * 			['Created At', Format.date(record.createdAt)]
	 * 		];
	 *```
	 */
	records?: DLRecord

}

export class DescriptionList extends Component {

	protected tagName = "dl" as keyof HTMLElementTagNameMap

	protected records?: DLRecord;

	protected internalRender(): HTMLElement {
		const el =  super.internalRender();

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
	public setRecords(records:DLRecord) {
		this.records = records;
		this.renderList();
	}

	private renderList() {
		this.getItems().clear();
		this.records?.forEach((record) => {

			this.getItems().add(comp({
				tagName:"dt",
				text: <string> record.shift()
			}));


			record.forEach((r) => {

				const dd = comp({
					tagName:"dd"
				});

				if(typeof r == 'function')
					r(dd);
				else
				{
					dd.setText(r + "");
				}
				this.getItems().add(dd);
			});
		});
	}
}

/**
 * Shorthand function to create {@see DescriptionList}
 *
 * @param config
 * @param items
 */
export const dl = (config?:DescriptionListConfig<DescriptionList>, ...items:Component[]) => DescriptionList.create(config, items);
