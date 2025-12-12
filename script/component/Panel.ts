import {comp, Component, createComponent} from "./Component.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {btn} from "./Button.js";
import {Config} from "./Observable.js";

export class Panel extends Component {
	constructor() {
		super();

		this.baseCls = "panel";
	}

	private titleCmp!: Component;
	private headerCmp!: Toolbar;

	private _title!:string
	set title(title: string) {
		if(this.titleCmp) {
			this.titleCmp.text = title;
		}
		this._title = title;
	}

	get title() {
		return this._title;
	}

	public collapsible = true;

	public set collapsed(collapsed) {
		this.el.classList.toggle("collapsed", collapsed);
	}

	public get collapsed() {
		return this.el.classList.contains("collapsed");
	}

	public getHeader() {
		if (!this.headerCmp) {
			this.headerCmp = this.createHeader();
		}

		this.headerCmp.parent = this;

		return this.headerCmp;
	}

	protected createHeader() {
		const header = tbar({
				cls: "header"
			},

			this.titleCmp = comp({
				tagName: "h3",
				text: this.title ?? ""
			}),

			'->'
		);

		if (this.collapsible) {
			header.el.addEventListener("click", () => {
				this.collapsed = !this.collapsed;
			})
			header.items.add(
				btn({
					cls: "collapse-btn",
					icon: "", // set empty so 'collapsed class can set it class can set it
					handler: () => {
						//this.collapsed = !this.collapsed;
					}
				})
			);
		}


		return header;
	}

	protected internalRender() {
		// header does not belong to the items and is rendered first.
		const header = this.getHeader();
		header.render(this.el);

		return super.internalRender();
	}

	private _itemContainerEl?: HTMLElement;

	protected get itemContainerEl() {
		if(!this._itemContainerEl) {
			this._itemContainerEl = document.createElement("div");
			this._itemContainerEl.classList.add("item-container");
			this.el.appendChild(this._itemContainerEl);
		}
		return this._itemContainerEl;
	}

}


/**
 * Shorthand function to create {@link Panel}
 *
 * @param config
 * @param items
 */
export const panel = (config?: Config<Panel>, ...items: Component[]) => createComponent(new Panel(), config, items);

