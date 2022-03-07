import {Observable} from "./Observable.js";
import {Component, ComponentConfig} from "./Component.js";

type renderFunc = (dd: HTMLElement) => void;

export type DLRecord = [string,string|renderFunc,...(string|renderFunc)[]][];
/**
 * @inheritDoc
 */
export interface DescriptionListConfig<T extends Observable> extends ComponentConfig<T> {


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

	public setRecords(records:DLRecord) {
		this.records = records;
		this.renderList();
	}

	private renderList() {
		const el = this.getEl();
		this.records?.forEach((record) => {

			const dt = document.createElement("dt");
			dt.innerText = <string> record.shift();
			el.appendChild(dt);

			record.forEach((r) => {
				const dd = document.createElement("dd");

				if(typeof r == 'function')
					r(dd);
				else
				{
					dd.innerText =  r + "";
				}
				el.appendChild(dd);
			});
		});
	}
}
