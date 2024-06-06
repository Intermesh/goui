/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Component} from "./Component.js";


/**
 * Root container to add the top level components to the body.
 *
 * Use the export variable body below
 */
class Root extends Component {

	protected internalRender() {
		this.renderItems();
		return this.el;
	}

	private _rootEl?: HTMLElement;

	get el() {
		if (!this._rootEl) {

			let rootEl = document.getElementById("goui");
			if(!rootEl) {
				rootEl = document.createElement("div");
				rootEl.id = "goui";

				document.body.append(rootEl);
			}


			this._rootEl = rootEl;
		}

		return this._rootEl;
	}

	get rendered() {
		return true;
	}

	constructor() {
		super();
		this.items.on("beforeadd", () => {

			// const link = document.createElement('link');
			// link.setAttribute('rel', 'stylesheet');
			// link.type = 'text/css';
			// link.href = '/assets/account/vendor/goui/style/goui.css';
			// document.head.appendChild(link);

			this.el.classList.add("goui");
			this.el.classList.add("root");

			this.initColorScheme();

		}, {
			once: true
		})
	}

	private initColorScheme() {

		if(!this.el.classList.contains("system")) {
			return;
		}

		const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

		this.el.classList.toggle("dark", dark)
		this.el.classList.toggle("light", !dark)

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			this.el.classList.toggle("dark", event.matches)
			this.el.classList.toggle("light", !event.matches)
		});
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
 * root.items.add(cmp({html: "Hello world!"});
 * ```
 */
export const root = new Root();