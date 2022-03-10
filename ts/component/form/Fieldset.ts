import {Component, ComponentConfig} from "../Component.js";
import {Observable} from "../Observable.js";

/**
 * @inheritDoc
 */
export interface FieldsetConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * Active card item
	 */
	legend?: string
}

/**
 * Field set component
 *
 * @see Form
 */
export class Fieldset extends Component {
	tagName = "fieldset" as keyof HTMLElementTagNameMap
	protected legend?: string;

	public static create<T extends typeof Observable>(this: T, config?: FieldsetConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	internalRender() {
		const el = super.internalRender();

		if (this.legend) {
			const l = document.createElement("h3"); // no legend tag as it's behaving wierd
			l.innerHTML = this.legend;
			l.classList.add("legend");

			el.insertBefore(l, el.firstChild);
		}

		return el;
	}
}