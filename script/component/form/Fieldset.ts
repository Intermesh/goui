/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component, createComponent} from "../Component.js";
import {Form} from "./Form.js";
import {Config} from "../Observable.js";

/**
 * Field set component
 *
 * @see Form
 */
export class Fieldset extends Component {
	private legendEl?: HTMLHeadingElement;

	constructor() {
		super("fieldset");

		this.cls = "flow";
	}

	protected baseCls = "goui-fieldset";

	/**
	 * The fieldset legend
	 * @param legend
	 */
	public set legend(legend:string|undefined) {
		if(legend) {
			if (!this.legendEl) {
				this.legendEl = document.createElement("h3"); // no legend tag as it's behaving wierd
				this.legendEl.classList.add("legend");
			}
			this.legendEl.innerHTML = legend ?? "";

			if(this.rendered) {
				this.el.insertBefore(this.legendEl, this.el.firstChild);
			}
		} else {
			this.legendEl?.remove();
			this.legendEl = undefined
		}
	}

	public get legend() {
		return this.legendEl?.innerHTML;
	}



	internalRender() {
		const el = super.internalRender();

		if(this.legendEl) {
			el.insertBefore(this.legendEl, el.firstChild);
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
export const fieldset = (config?: Config<Fieldset>, ...items: Component[]) => createComponent(new Fieldset(), config, items);