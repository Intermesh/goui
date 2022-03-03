import {Container} from "./Container.js";
import {Mask} from "./Mask.js";

/**
 * Body container to add the top level components to the body.
 *
 * Use the export variable body below
 */
class Body extends Container {
	private _mask: Mask | undefined

	protected internalRender() {
		this.renderItems();
		return this.getEl();
	}

	protected init() {
		super.init();
		this.el = document.body;
		this.rendered = true;
	}

	/**
	 * Mask the entire body to disable user interaction
	 */
	mask() {
		if (!this._mask) {
			this._mask = Mask.create();
			this.addItem(this._mask);
		} else
		{
			this._mask.show();
		}
	}

	/**
	 * Unmask the body
	 */
	unmask() {
		if(this._mask) {
			this._mask.hide();
		}
	}
}

/**
 * The body component
 *
 * There's only one body so use this variable.
 *
 * To create a Single Page Application one typically would add a {@see CardContainer} to the body.
 *
 * @example
 * ```
 * body.addItem(Compoment.create({html: "Hello world!"});
 * ```
 */
export const body = Body.create();