/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {comp, Component, createComponent} from "./Component.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {btn} from "./Button.js";
import {DraggableComponent, DraggableComponentEventMap} from "./DraggableComponent.js";
import {Config, ObservableListenerOpts} from "./Observable.js";
import {root} from "./Root.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {form} from "./form/Form.js";
import {fieldset} from "./form/Fieldset.js";
import {textfield} from "./form/TextField.js";
import {t} from "../Translate.js";
import {DateTime} from "../util";


/**
 * @inheritDoc
 */
export interface WindowEventMap<Type> extends DraggableComponentEventMap<Type> {
	/**
	 * Fires when the window is closed
	 *
	 * @param window
	 */
	close: (window: Type) => void

	/**
	 * Fires when the window is maximized
	 *
	 * @param window
	 */
	maximize: (window: Type) => void

	/**
	 * Fires when the window is restored after being maximized
	 *
	 * @param window
	 */
	unmaximize: (window: Type) => void
}

export interface Window {
	on<K extends keyof WindowEventMap<this>>(eventName: K, listener: Partial<WindowEventMap<this>>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof WindowEventMap<this>>(eventName: K, ...args: Parameters<WindowEventMap<any>[K]>): boolean
}

/**
 * Window component
 *
 * @example
 *
 * ```
 * const win = Window.create({
 * 	title: "Hello World",
 * 	items: [Component.create({tagName: "h1", cls: "pad", html: "Just saying hi!"})]
 * });
 *
 * win.open();
 * ```
 */
export class Window extends DraggableComponent {

	constructor() {
		super();
		this.resizable = true;
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
	public modal = false


	private titleCmp!: Component;
	private header!: Toolbar;
	private modalOverlay: Component | undefined;
	private resizeObserver?: ResizeObserver;

	/**
	 * Return focus to element focussed before opening it when closing the window
	 * @private
	 */
	private focussedBeforeOpen?: Element;

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


	protected applyTitle() {
		// don't set title on el
	}

	protected getDragHandle() {
		return this.getHeader().el;
	}

	public getHeader() {
		if (!this.header) {
			this.header = tbar({
					cls: "header"
				},

				this.titleCmp = comp({
					tagName: "h3",
					html: this.title
				}),

				'->'
			);

			if (this.maximizable) {
				this.header.items.add(this.initMaximizeTool());
			}


			if (this.collapsible) {
				this.header.items.add(btn({
					cls: "collapse-btn",
					icon: "", // set empty so 'collapsed class can set it class can set it
					handler: () => {
						this.collapsed = !this.collapsed;
					}
				}));
			}

			if (this.closable) {
				this.header.items.add(btn({
					icon: "close",
					handler: () => {
						this.close();
					}
				}));
			}
		}

		this.header.parent = this;

		return this.header;
	}

	public set collapsed(collapsed) {
		this.el.classList.toggle("collapsed", collapsed);
	}

	public get collapsed() {
		return this.el.classList.contains("collapsed");
	}

	protected internalRender() {

		// header does not belong to the items and is rendered first.
		const header = this.getHeader();
		header.render();

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
				this.close();
			}
		});

		if (this.resizable) {
			this.observerResize();
		}

		if (this.modal) {
			el.classList.add("modal");
		}

		return el;
	}

	private observerResize() {

		const saveState = FunctionUtil.buffer(200, () => {
			this.saveState();
		});

		// observer callback always fires inititally and we don't want to save state on init. ONly on resize.
		// See: https://github.com/WICG/resize-observer/issues/8
		let init = false;

		this.resizeObserver = new ResizeObserver(entries => {

			if (init) {
				saveState();
			} else {
				init = true;
			}
		});

		this.resizeObserver.observe(this.el!);

	}

	protected buildState() {
		if (this.isMaximized()) {
			const s = this.getState();
			s.maximized = true;
			return s;
		} else {
			return {
				width: this.el.offsetWidth,
				height: this.el.offsetHeight,
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
		if(!hidden) {
			this.focussedBeforeOpen = document.activeElement || undefined;

			let ret;

			if (!this.rendered) {

				root.items.add(this);

				if (this.modal) {
					this.modalOverlay = comp({
						cls: "goui-window-modal-overlay goui-goui-fade-in goui-goui-fade-out",
						hidden: true
					});

					this.modalOverlay.el.style.zIndex = (parseInt(getComputedStyle(this.el).zIndex)).toString()

					root.items.insert(-1, this.modalOverlay);

					this.disableBodyScroll();

					this.modalOverlay.el.addEventListener("click", (ev) => {
						this.focus();
					});

					this.modalOverlay.show();
				}

				// has to be shown before center() otherwise it can't calculate it's width and height
				super.internalSetHidden(hidden);

				if (!this.hasState()) {
					this.shrinkToFit();
					this.center();
				} else {
					this.constrainTo(window);
				}
			} else {
				super.internalSetHidden(hidden);
			}

			this.focus();
		} else {
			super.internalSetHidden(hidden);
		}
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
	 * @inheritDoc
	 */
	public remove() {

		if (this.focussedBeforeOpen instanceof HTMLElement) {
			this.focussedBeforeOpen.focus();
		}

		if (this.resizeObserver) {
			//otherwise it will fire when removing this element.
			this.resizeObserver.disconnect();
		}

		if (this.modalOverlay) {
			this.enableBodyScroll();
			this.modalOverlay.remove();
		}
		this.header.remove();

		return super.remove();
	}

	/**
	 * Close the window by removing it
	 */
	public close() {
		this.fire("close", this);
		this.remove();
	}

	/**
	 * Center the window in the screen
	 */
	public center() {
		this.el.style.top = (((window.innerHeight - this.height) / 2)) + "px";
		this.el.style.left = (((window.innerWidth - this.width) / 2)) + "px";

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

		this.fire("maximize", this);

		return this;
	}

	/**
	 * Make the window smaller than the viewport
	 */
	public unmaximize() {
		this.el.classList.remove('maximized');

		this.fire("unmaximize", this);

		return this;
	}


	public static error(msg:string) {
		return Window.alert(msg, t("Error") + " - " + (new DateTime).format("Y-m-d H:i:s"));
	}

	/**
	 * Show modal alert window
	 *
	 */
	public static alert(text: any, title: string = t("Alert")): Promise<void> {

		if (text.message) {
			console.error(text);
			text = text.message;
		}
		return new Promise((resolve, reject) => {
			win({
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
					cls: "scroll pad",
					html: text
				})
			).show();
		});
	}


	/**
	 * Prompt the user for a text input value.
	 *
	 * Returns a promise with the input or undefined if the user cancelled
	 *
	 */
	public static prompt(text: string, inputLabel: string, defaultValue = "", title: string = t("Please enter")): Promise<string | undefined> {

		return new Promise((resolve, reject) => {

			let cancelled = true;

			const w = win({
					modal: true,
					title: title,
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

						handler: (form) => {
							resolve(form.getValues()['input']);
							cancelled = false;
							w.close();
						}
					},

					fieldset({},
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
	 * Ask the user for confirmation
	 */
	public static confirm(text: string, title: string = t("Please confirm")): Promise<boolean> {

		return new Promise((resolve, reject) => {

			const yesBtn = btn({
					text: t("Yes"),
					cls: "filled primary",
					handler: () => {
						resolve(true);
						w.close();
					}
				}),
				w = win({
						modal: true,
						title: title,
						closable: false,
						listeners: {
							focus: () => {
								yesBtn.focus();
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
							text: t("No"),
							handler: () => {
								resolve(false);
								w.close();
							}
						}),

						yesBtn
					)
				);

			w.show();
		});
	}

}

/**
 * Shorthand function to create {@see Window}
 *
 * @param config
 * @param items
 */
export const win = (config?: Config<Window, WindowEventMap<Window>>, ...items: Component[]) => createComponent(new Window(), config, items);