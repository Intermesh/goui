/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "../Component.js";
import {Form} from "./Form.js";
import {Config} from "../Observable.js";
import {FieldEventMap} from "./Field.js";

/**
 * Field set component
 *
 * @see Form
 */
export class Fieldset extends Component {

	constructor() {
		super("fieldset");

		this.cls = "flow";
	}

	protected baseCls = "goui-fieldset";

	/**
	 * The legend to display
	 */
	public legend?: string;


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


/**
 * Shorthand function to create fieldset
 *
 * @param config
 * @param items
 */
export const fieldset = (config?: Config<Fieldset, FieldEventMap<Fieldset>>, ...items: Component[]) => createComponent(new Fieldset(), config, items);