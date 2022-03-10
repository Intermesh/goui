import {Observable} from "./Observable.js";
import {Component, ComponentConfig} from "./Component.js";

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
	public static create<T extends typeof Observable>(this: T, config?: DescriptionListConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}
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
		this.removeAll();
		this.records?.forEach((record) => {

			this.addItem(Component.create({
				tagName:"dt",
				text: <string> record.shift()
			}));


			record.forEach((r) => {

				const dd = Component.create({
					tagName:"dd"
				});

				if(typeof r == 'function')
					r(dd);
				else
				{
					dd.setText(r + "");
				}
				this.addItem(dd);
			});
		});
	}
}
