/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */ import {t} from "../Translate";
import {btn, Button, ButtonEventMap} from "./Button";
import {tbar, tbarItems, Toolbar} from "./Toolbar";
import {Config, Listener, ObservableListenerOpts} from "./Observable";
import {assignComponentConfig, comp, Component, createComponent} from "./Component";
import {SearchButtonEventMap} from "./SearchButton";


export interface OverlayToolbarButtonEventMap<Type> extends ButtonEventMap<Type> {

	open: (btn: Type) => void

	close: (btn: Type) => void
}

export interface OverlayToolbarButton extends Button {
	on<K extends keyof OverlayToolbarButtonEventMap<this>, L extends Listener>(eventName: K, listener: Partial<OverlayToolbarButtonEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof OverlayToolbarButtonEventMap<this>>(eventName: K, listener: Partial<OverlayToolbarButtonEventMap<this>>[K]): boolean
	fire<K extends keyof OverlayToolbarButtonEventMap<this>>(eventName: K, ...args: Parameters<OverlayToolbarButtonEventMap<Component>[K]>): boolean
}

export class OverlayToolbarButton extends Button {

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
		document.body.removeEventListener("mousedown", this.closeOnClick);
		this.overlayTbar!.hide();
		this.mainTbar!.show();
		this.focus();
		this.fire("close", this);
	}

	private closeOnClick:any;

	protected getOverlayTBar() {

		if (!this.overlayTbar) {

			this.closeOnClick = (e:MouseEvent) => {
				if(!this.overlayTbar!.el.contains(e.target as any)) {
					this.close();
				}
			}

			this.overlayTbar = tbar({
					cls: "overlay",
					hidden: true,
					listeners: {
						show: () => {
							document.body.addEventListener("mousedown", this.closeOnClick, {once: true})
							this.fire("open", this);
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
 */
export const overlaytoolbarbutton = (config?: Config<OverlayToolbarButton, ButtonEventMap<OverlayToolbarButton>>, ...items: (Component | "->" | "-")[]) => {
	const c = new OverlayToolbarButton();
	if (config) {
		assignComponentConfig(c, config);
	}

	c.items.add(...tbarItems(items));
	return c;
}