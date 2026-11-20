import {comp, Component, createComponent, i} from "./Component.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {btn} from "./Button.js";
import {Config} from "./Observable.js";
import {MaterialIcon} from "./MaterialIcon.js";

/**
 * Panel with a header that shows a title and an optional icon
 *
 * The header isn't one of the {@link items}. It is rendered in front of them, and the items are rendered in a separate
 * "item-container" element below it.
 *
 * When the panel is {@link collapsible}, which is the default, a click on the header collapses or expands it. A collapsed
 * panel only shows its header.
 *
 * @example
 *
 * ```typescript
 * panel({
 *   title: "Settings",
 *   icon: "settings",
 *   collapsed: true
 * },
 *   checkbox({label: "Enabled", name: "enabled"})
 * );
 * ```
 */
export class Panel extends Component {
	constructor() {
		super();

		this.baseCls = "panel";
	}

	private titleCmp!: Component;
	private headerCmp!: Toolbar;

	private _title!:string

	/**
	 * Title shown in the header
	 */
	set title(title: string) {
		if(this.titleCmp) {
			this.titleCmp.text = title;
		}
		this._title = title;
	}

	get title() {
		return this._title;
	}

	private iconCmp?: Component;
	private _icon?: MaterialIcon;

	/**
	 * Icon shown in front of the title in the header
	 *
	 * Set it to undefined to remove the icon.
	 */
	set icon(icon: MaterialIcon | undefined) {
		this._icon = icon;

		if(!this.headerCmp) {
			return; // createHeader() adds it
		}

		if(!icon) {
			this.iconCmp?.remove();
			this.iconCmp = undefined;
		} else if(this.iconCmp) {
			this.iconCmp.text = icon;
		} else {
			this.iconCmp = i(icon);
			this.headerCmp.items.insert(0, this.iconCmp);
		}
	}

	get icon() {
		return this._icon;
	}

	/**
	 * Let the user collapse and expand the panel by clicking the header. Adds a button with an arrow to the header.
	 *
	 * Set it before the panel renders. Changing it afterwards has no effect.
	 */
	public collapsible = true;

	/**
	 * Hide everything but the header
	 *
	 * This also works when the panel isn't {@link collapsible}, but then the user can't expand it.
	 */
	public set collapsed(collapsed) {
		this.el.classList.toggle("collapsed", collapsed);
	}

	public get collapsed() {
		return this.el.classList.contains("collapsed");
	}

	/**
	 * Get the header toolbar
	 *
	 * Add components to it to show them in the header, for example buttons. Items added after the "->" spacer are aligned
	 * to the right.
	 */
	public getHeader() {
		if (!this.headerCmp) {
			this.headerCmp = this.createHeader();
		}

		this.headerCmp.parent = this;

		return this.headerCmp;
	}

	/**
	 * Create the header toolbar with the icon, the title and, when {@link collapsible}, the collapse button
	 *
	 * Override it to build a different header.
	 */
	protected createHeader() {
		if(this._icon) {
			this.iconCmp = i(this._icon);
		}

		const header = tbar({
				cls: "header"
			},

			...(this.iconCmp ? [this.iconCmp] : []),

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

	/**
	 * Element below the header that holds the items
	 */
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
