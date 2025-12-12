/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, createComponent} from "./Component.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {btn} from "./Button.js";
import {DragData, draggable, DraggableComponent, DraggableComponentEventMap} from "./DraggableComponent.js";
import {Config} from "./Observable.js";
import {root} from "./Root.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {form} from "./form/Form.js";
import {fieldset} from "./form/Fieldset.js";
import {textfield} from "./form/TextField.js";
import {t} from "../Translate.js";
import {DateTime} from "../util/index.js";


/**
 * @inheritDoc
 */
export interface WindowEventMap extends DraggableComponentEventMap {
	/**
	 * Fires when the window is closed
	 */
	close: {
		/**
		 * Indicates whether an action or event is performed or initiated by a user.
		 * This boolean variable is typically set to `true` if the user is responsible for the action,
		 * otherwise it is set to `false`.
		 */
		byUser: boolean
	}

	/**
	 * Fires before closing window
	 * return false to cancel close
	 */
	beforeclose: {
		/**
		 * Indicates whether an action or event is performed or initiated by a user.
		 * This boolean variable is typically set to `true` if the user is responsible for the action,
		 * otherwise it is set to `false`.
		 */
		byUser: boolean
	}

	/**
	 * Fires when the window is maximized
	 */
	maximize: {}

	/**
	 * Fires when the window is restored after being maximized
	 */
	unmaximize: {}
}

/**
 * Represents a configurable and interactive window component. The `Window` class extends `DraggableComponent` and
 * provides functionalities such as maximizing, resizing, collapsing, and modal behavior.
 *
 * @template EventMap Type used for the event map for this class.
 *
 * @link https://goui.io/#window Example
 */
export class Window<EventMap extends WindowEventMap = WindowEventMap> extends DraggableComponent<EventMap> {

	constructor() {
		super();
		this.width = 400;
		this.hidden = true;
	}

	protected baseCls = "goui-window"

	/**
	 * Maximize the window
	 */
	public maximized = false

	/**
	 * Enable tool to maximize window
	 */
	public maximizable = false

	/**
	 * Enable resizing on window edges and corners
	 */
	public resizable = false;

	/**
	 * Enable tool to close window
	 */
	public closable = true

	/**
	 * Enable tool to collapse window
	 */
	public collapsible = false

	/**
	 * Make the window modal so the user can only interact with this window.
	 */
	public modal = false;

	/**
	 * Render a header with title and controls
	 */
	public header = true;

	private titleCmp!: Component;
	private headerCmp!: Toolbar;
	private modalOverlay: Component | undefined;

	/**
	 * Return focus to element focussed before opening it when closing the window
	 * @private
	 */
	private focussedBeforeOpen?: Element;

	private _itemContainerEl?: HTMLElement;

	protected get itemContainerEl() {
		if(!this._itemContainerEl) {
			this._itemContainerEl = document.createElement("div");
			this._itemContainerEl.classList.add("item-container");
			this.el.appendChild(this._itemContainerEl);
		}
		return this._itemContainerEl;
	}

	// /**
	//  * Focus first item if possible.
	//  * @param o
	//  */
	// public focus(o?: FocusOptions) {
	//
	// 	const first = this.items.first();
	// 	if(first) {
	// 		return first.focus(o);
	// 	} else {
	// 		return super.focus(o);
	// 	}
	// }

	private initMaximizeTool() {
		const maximizeBtn = btn({
			icon: "fullscreen",
			title: t("Maximize"),
			handler: () => {
				this.isMaximized() ? this.unmaximize() : this.maximize();
			}
		});


		this.on('maximize', () => {
			maximizeBtn.icon = "fullscreen_exit";
			maximizeBtn.title = t("Restore");
		});

		this.on('unmaximize', () => {
			maximizeBtn.icon = "fullscreen";
			maximizeBtn.title = t("Maximize");
		});

		return maximizeBtn;

	}

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

	protected getDragHandle() {
		return this.getHeader().el;
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
			header.items.add(btn({
				cls: "collapse-btn",
				icon: "", // set empty so 'collapsed class can set it class can set it
				handler: () => {
					this.collapsed = !this.collapsed;
				}
			}));
		}

		if (this.maximizable) {
			header.items.add(this.initMaximizeTool());
		}

		if (this.closable) {
			header.items.add(btn({
				icon: "close",
				handler: () => {
					this.internalClose(true);
				}
			}));
		}
		return header;
	}

	public set collapsed(collapsed) {
		this.el.classList.toggle("collapsed", collapsed);
	}

	public get collapsed() {
		return this.el.classList.contains("collapsed");
	}

	protected internalRender() {

		// header does not belong to the items and is rendered first.
		if(this.header) {
			const header = this.getHeader();
			header.render(this.el);
		}

		const el = super.internalRender();

		this.on("drop", () => {
			this.saveState();
		});


		if (this.maximized) {
			this.maximize();
		}

		el.setAttribute('tabindex', "-1");

		//remove window on escape
		this.el!.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key == "Escape") {
				this.internalClose(true);
			}
		});

		if (this.resizable) {
			this.initResizable();
		}

		if (this.modal) {
			el.classList.add("modal");
		}

		return el;
	}

	private resizeWidth(dragData:DragData,  invert = false) {
		const offset = (dragData.x - dragData.startX) * (invert ? -1 : 1);

		this.width = dragData.data.startWidth + Window.pxToRem(offset);

		if(invert) {
			this.el.style.left = (dragData.data.startLeft - offset) + "px";
		}
	}

	private resizeHeight(dragData:DragData, invert = false) {
		const offset = (dragData.y - dragData.startY) * (invert ? -1 : 1);
		this.height = dragData.data.startHeight + Window.pxToRem(offset);
		if(invert) {
			this.el.style.top = (dragData.data.startTop - offset) + "px";
		}
	}

	private initResizable() {

		const drop =  FunctionUtil.buffer(200, () => {
				void this.saveState();
		}),
		dragstart = ({dragData}:{dragData:DragData}) => {
			dragData.data.startWidth = this.width;
			dragData.data.startHeight = this.height;
			dragData.data.startLeft = parseFloat(this.el.style.left);
			dragData.data.startTop = parseFloat(this.el.style.top);
		},
		dragHandles = {
			right: ({dragData}: { dragData: DragData }) => this.resizeWidth(dragData),
			left: ({dragData}: { dragData: DragData }) => this.resizeWidth(dragData, true),
			bottom: ( {dragData}: { dragData: DragData }) => this.resizeHeight(dragData),
			top: ({dragData}: { dragData: DragData }) => this.resizeHeight(dragData, true),
			bottomright: ( {dragData}: { dragData: DragData }) => {
				this.resizeWidth(dragData);
				this.resizeHeight(dragData);
			},
			bottomleft: ({dragData}: { dragData: DragData }) => {
				this.resizeWidth(dragData, true);
				this.resizeHeight(dragData);
			},
			topright: ({dragData}: { dragData: DragData }) => {
				this.resizeWidth(dragData);
				this.resizeHeight(dragData, true);
			},
			topleft: ( {dragData}: { dragData: DragData }) => {
				this.resizeWidth(dragData, true);
				this.resizeHeight(dragData, true);
			}
		};


		for(const name in dragHandles) {
			draggable({
				cls: "resizer " + name,
				setPosition: false,
				listeners: {
					dragstart,
					drag: dragHandles[name as keyof typeof dragHandles],drop}
			}).render(this.el);
		}
	}

	protected buildState() {
		if (this.isMaximized()) {
			const s = this.getState();
			s.maximized = true;
			return s;
		} else {
			return {
				width: this.width,
				height: this.height,
				left: this.el.offsetLeft,
				top: this.el.offsetTop
			};
		}
	}

	protected restoreState(s: Record<string, any>) {
		if (s.width)
			this.width = s.width;
		if (s.height)
			this.height = s.height;

		if (s.top != undefined) {
			this.el.style.top = s.top + "px";

			if (s.left != undefined) {
				this.el.style.left = s.left + "px";
			}
		} else {
			this.center();
		}

		if (s.maximized) {
			this.maximized = true;
		}
	}

	/**
	 * Open the window by rendering it into the DOM body element
	 * Use show()
	 * @deprecated
	 */
	public open() {
		return this.show();
	}

	protected internalSetHidden(hidden: boolean) {

		// has to be shown before center() otherwise it can't calculate it's width and height
		super.internalSetHidden(hidden);

		if(!hidden) {

			this.focussedBeforeOpen = document.activeElement || undefined;

			if (!this.rendered) {

				root.items.add(this);

				if (this.modal) {
					this.modalOverlay = this.createModalOverlay();
					this.disableBodyScroll();
					this.modalOverlay.show();
				}

				if (!this.hasState()) {
					this.shrinkToFit();
					this.center();
				}
				// debugger;
				this.constrainTo(window);
			}
			this.focus();
		}
	}

	/**
	 * Creates the modal overlay behind the window to prevent user interaction
	 *
	 * @protected
	 */
	protected createModalOverlay() {
		const modalOverlay = comp({
			cls: "goui-window-modal-overlay goui-goui-fade-in goui-goui-fade-out",
			hidden: true
		});

		modalOverlay.el.style.zIndex = (parseInt(getComputedStyle(this.el).zIndex)).toString()

		root.items.insert(-1, modalOverlay);

		modalOverlay.el.addEventListener("click", () => {
			this.focus();
		});

		return modalOverlay;
	}

	protected internalRemove() {
		if (this.focussedBeforeOpen instanceof HTMLElement) {
			this.focussedBeforeOpen.focus();
		}

		if (this.modalOverlay) {
			this.enableBodyScroll();
			this.modalOverlay.remove();
		}
		this.headerCmp.remove();

		super.internalRemove();
	}

	private shrinkToFit() {
		if (this.el.offsetHeight > window.innerHeight) {
			this.el.style.height = window.innerHeight * .9 + "px";
		}

		if (this.el.offsetWidth > window.innerWidth) {
			this.el.style.width = window.innerWidth * .9 + "px";
		}
	}

	private disableBodyScroll() {
		// When the modal is shown, we want a fixed body
		if (window.getComputedStyle(document.body).overflow != "hidden") {
			document.body.style.top = `-${window.scrollY}px`;
			document.body.style.position = 'fixed';
		}
	}

	private enableBodyScroll() {
		// When the modal is hidden...
		const scrollY = document.body.style.top, scrollTo = parseInt(scrollY || '0') * -1;

		document.body.style.position = '';
		document.body.style.top = '';
		document.documentElement.style.scrollBehavior = "auto";
		window.scrollTo({
			top: scrollTo,
			behavior: "auto"
		});
		document.documentElement.style.scrollBehavior = "";
	}
		/**
	 * Close the window by removing it
	 */
	public close() {
		this.internalClose();
	}

	protected internalClose(byUser = false) {
		if (this.fire("beforeclose", {byUser}) === false) {
			return;
		}
		this.remove();
		this.fire("close", {byUser});
	}

	/**
	 * Center the window in the screen
	 */
	public center() {
		this.el.style.top = (((window.innerHeight - this.el.offsetHeight) / 2)) + "px";
		this.el.style.left = (((window.innerWidth - this.el.offsetWidth) / 2)) + "px";

		return this;
	}

	/**
	 * Returns true if the window is maximized
	 */
	public isMaximized() {
		return this.el.classList.contains("maximized");
	}

	/**
	 * Grow window to the maximum of the viewport
	 */
	public maximize() {

		this.collapsed = false;
		this.el.classList.add('maximized');

		this.fire("maximize", {});

		return this;
	}

	/**
	 * Make the window smaller than the viewport
	 */
	public unmaximize() {
		this.el.classList.remove('maximized');

		this.fire("unmaximize", {});

		return this;
	}


	/**
	 * Display an error message
	 *
	 * @param msg - The error message to be displayed.
	 * @return Promise<void> - A promise that resolves when the alert window is closed
	 */
	public static error(msg:any) {

		console.error(msg);

		msg = this.prepareErrorMessage(msg);

		msg = `<i class="icon">error</i><div class="text">${msg}</div>`;

		return Window.alert(msg, t("Error") + " - " + (new DateTime).format("Y-m-d H:i:s"), "error");
	}


	public static prepareErrorMessage(msg:any):string {
		if(typeof msg != "string") {

			if(msg.type == "invalidProperties") {
				for(const propertyName in msg.validationErrors) {
					msg = (msg.validationErrors[propertyName].description);
					break;
				}
			} else {
				// Javascript errors have message and JMAP errors have description. JMAP Request level errors have a detail prop
				msg = msg.message ?? msg.description ?? msg.detail;
			}
		}

		if(typeof msg != "string") {
			msg = t("Sorry, an unknown error occurred")
		}

		return msg;
	}

	/**
	 * Show modal alert window
	 *
	 * @param text - The alert message or an object with a 'message' property
	 * @param [title="Alert"] - The title of the alert window
	 * @param cls Window CSS class to add
	 * @return Promise<void> - A promise that resolves when the alert window is closed
	 */
	public static alert(text: any, title: string = t("Alert"), cls?: string): Promise<void> {

		if (text && text.message) {
			console.error(text);
			text = text.message;
		}
		
		return new Promise((resolve) => {
			win({
				cls: cls,
				width: 600,
				modal: true,
				title: title,
				listeners: {
					close: () => {
						resolve();
					}
				}
			},
				comp({
					flex: 1,
					cls: "body scroll pad",
					html: text
				})
			).show();
		});
	}


	/**
	 * Prompt the user for a text input value.
	 *
	 * @param text - The message to display to the user.
	 * @param inputLabel - The label for the input field.
	 * @param [defaultValue=""] - The default value for the input field.
	 * @param [title="Please enter"] - The title for the prompt window.
	 * @returns {Promise<string | undefined>} - A promise that resolves with the input value or undefined if the user cancelled.
	 */
	public static prompt(text: string, inputLabel: string, defaultValue = "", title: string = t("Please enter")): Promise<string | undefined> {

		return new Promise((resolve) => {

			let cancelled = true;

			const w = win({
					modal: true,
					title: title,
					width: 600,
					listeners: {
						focus: () => {
							w.items.get(0)!.focus();
						},
						close: () => {
							if (cancelled) {
								resolve(undefined);
							}
						}
					}
				},

				form({
						flex: 1,
						cls: "vbox",
						handler: (form) => {
							resolve(form.value.input);
							cancelled = false;
							w.close();
						}
					},

					fieldset({
							flex: 1
						},
						comp({
							tagName: "p",
							html: text
						}),

						textfield({
							label: inputLabel,
							name: "input",
							required: true,
							value: defaultValue
						})
					),

					tbar({},
						comp({
							flex: 1
						}),

						btn({
							type: "submit",
							text: "Ok"
						})
					)
				)
			);

			w.show();
		});
	}

	/**
	 * Asks the user for confirmation.
	 * @param {string} text - The text to display in the confirmation dialog.
	 * @param {string} [title=t("Please confirm")] - The title of the confirmation dialog.
	 * @return {Promise<boolean>} - A promise that resolves to `true` if the user confirms, or `false` if the user cancels.
	 */
	public static confirm(text: string, title: string = t("Please confirm")): Promise<boolean> {

		return new Promise((resolve) => {

				const w = win({
						modal: true,
						title: title,
						closable: false,
						width: 600,
						listeners: {
							focus: ({target}) => {
								target.findChild("yes")!.focus();
							}
						}
					},

					comp({
						cls: "pad",
						html: text
					}),

					tbar({},
						'->',
						btn({
							itemId: "no",
							text: t("No"),
							handler: () => {
								resolve(false);
								w.close();
							}
						}),

						btn({
							itemId: "yes",
							text: t("Yes"),
							cls: "filled primary",
							handler: () => {
								resolve(true);
								w.close();
							}
						})
					)
				);

			w.show();
		});
	}

}

type WindowConfig = Omit<Config<Window>, "close" | "maximize" | "center" | "dragConstrainTo" | "constrainTo" | "calcConstrainBox">;


/**
 * Shorthand function to create {@link Window}
 *
 * @param config
 * @param items
 */
export const win = (config?: WindowConfig, ...items: Component[]) => createComponent(new Window(), config, items);