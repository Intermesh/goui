import {Component} from "./Component.js";


/**
 * Root container to add the top level components to the body.
 *
 * Use the export variable body below
 */
class Root extends Component {

	protected internalRender() {
		this.renderItems();
		return this.getEl();
	}

	protected init() {
		super.init();
		this.el = document.getElementById("goui") || document.body;
		this.rendered = true;

		this.getItems().on("beforeadd", () => {

			const link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.type = 'text/css';
			link.href = '/assets/account/vendor/goui/style/goui.css';
			document.head.appendChild(link);

				this.getEl().classList.add("goui");
		}, {
			once: true
		})
	}

	public setEl(el: HTMLElement) {
		this.el = el;
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
 * root.addItem(Compoment.create({html: "Hello world!"});
 * ```
 */
export const root = Root.create();