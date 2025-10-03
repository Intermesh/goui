/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {t} from "../Translate";
import {tbar, tbarItems, Toolbar} from "./Toolbar";
import {Config} from "./Observable";
import {assignComponentConfig, comp, Component} from "./Component";
import {btn, Button, ButtonEventMap} from "./Button";


/**
 * @inheritDoc
 */
export interface OverlayToolbarButtonEventMap extends ButtonEventMap {

	/**
	 * Fires when the overlay toolbar opens
	 */
	open: {}

	/**
	 * Fires when the overlay toolbar closes
	 */
	close: {}
}

/**
 * Represents a button component that toggles between a main toolbar and an overlay toolbar.
 * Primarily used within a toolbar structure to handle button interactions that display additional controls in an overlay.
 *
 * For example the search button or a multi select toolbar that activates when selecting multiple items
 *
 * @template EventMap - The event map type for the button.
 * @extends Button
 */
export class OverlayToolbarButton<EventMap extends OverlayToolbarButtonEventMap = OverlayToolbarButtonEventMap> extends Button<EventMap> {

	private overlayTbar?: Toolbar;
	private mainTbar?: Toolbar;

	constructor() {
		super();

		this.tbarItemContainer = comp({flex: 1});
	}

	public handler = (button: Button, ev?: MouseEvent) => {

		this.mainTbar = button.findAncestorByType(Toolbar);
		if(!this.mainTbar) {
			throw "Search button must be inside a Toolbar";
		}
		this.getOverlayTBar().show();
	}
	private tbarItemContainer: Component;

	public close() {
		// document.body.removeEventListener("mousedown", this.closeOnClick);
		this.overlayTbar!.hide();
		this.mainTbar!.show();
		this.focus();
		this.fire("close", {});
	}

	private closeOnClick:any;

	protected getOverlayTBar() {

		if (!this.overlayTbar) {

			// this.closeOnClick = (e:MouseEvent) => {
			// 	if(!this.overlayTbar!.el.contains(e.target as any)) {
			// 		this.close();
			// 	}
			// }

			this.overlayTbar = tbar({
					cls: "overlay",
					hidden: true,
					listeners: {
						show: () => {
							// document.body.addEventListener("mousedown", this.closeOnClick)
							this.fire("open", {});
						}
					}
				},

				btn({
					icon: "chevron_left",
					title: t("Back"),
					handler: () => {
						this.close();
					}
				}),
				this.tbarItemContainer
			);

			this.overlayTbar.el.addEventListener("keydown", (e) => {
				if(e.key == "Escape") {
					e.preventDefault();
					e.stopPropagation();
					this.close();
				}
			})

			this.mainTbar!.items.add(this.overlayTbar);
		}

		return this.overlayTbar;
	}

	protected get itemContainerEl(): HTMLElement {
		return this.tbarItemContainer.el;
	}
}

/**
 * Shorthand function to create {@link OverlayToolbarButton}
 *
 * @link searchbtn
 */
export const overlaytoolbarbutton = (config?: Config<OverlayToolbarButton>, ...items: (Component | "->" | "-")[]) => {
	const c = new OverlayToolbarButton();
	if (config) {
		assignComponentConfig(c, config);
	}

	c.items.add(...tbarItems(items));
	return c;
}