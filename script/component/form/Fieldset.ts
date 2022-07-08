import {Component, Config} from "../Component.js";
import {Form} from "./Form.js";

/**
 * Field set component
 *
 * @see Form
 */
export class Fieldset extends Component {

	constructor() {
		super("fieldset");
	}

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
export const fieldset = (config?: Config<Fieldset>, ...items: Component[]) => {
	const c = new Fieldset();
	if(config) {
		Object.assign(c, config);
	}
	if(items.length) {
		c.items.add(...items);
	}
	return c;
}