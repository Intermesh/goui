import {comp, Component, ComponentConfig, Mask} from "./Component.js";
import {tbar, Toolbar} from "./Toolbar.js";
import {btn, Button} from "./Button.js";
import {DraggableComponent, DraggableComponentEventMap} from "./DraggableComponent.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {root} from "./Root.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {form, Form} from "./form/Form.js";
import {fieldset, Fieldset} from "./form/Fieldset.js";
import {textfield, TextField} from "./form/TextField.js";
import {t} from "../Translate.js";

/**
 * @inheritDoc
 */
export interface WindowConfig<T extends Observable> extends ComponentConfig<T> {

	/**
	 * Make the window modal so the user can only interact with this window.
	 */
	modal?: boolean,
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<WindowEventMap<T>>

	/**
	 * Maximize the window
	 */
	maximized?: boolean

	/**
	 * Enable tool to maximize window
	 */
	maximizable?: boolean

	/**
	 * Enable tool to close window
	 */
	closable?: boolean
}

/**
 * @inheritDoc
 */
export interface WindowEventMap<T extends Observable> extends DraggableComponentEventMap<T> {
	/**
	 * Fires when the window is closed
	 *
	 * @param window
	 */
	close?: (window: T) => void

	/**
	 * Fires when the window is maximized
	 *
	 * @param window
	 */
	maximize?: (window: T) => void

	/**
	 * Fires when the window is restored after being maximized
	 *
	 * @param window
	 */
	unmaximize?: (window: T) => void
}

export interface Window {
	on<K extends keyof WindowEventMap<Window>>(eventName: K, listener: WindowEventMap<Window>[K], options?: ObservableListenerOpts): void;

	fire<K extends keyof WindowEventMap<Window>>(eventName: K, ...args: Parameters<NonNullable<WindowEventMap<Window>[K]>>): boolean
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
	protected baseCls = "window"

	private titleCmp!: Component;
	private header!: Toolbar;

	protected resizable = true

	protected maximized = false

	protected maximizable = false

	protected closable = true

	protected modal = false
	private modalOverlay: Component | undefined;
	private resizeObserver?: ResizeObserver;

	/**
	 * Return focus to element focussed before opening it when closing the window
	 * @private
	 */
	private focussedBeforeOpen?: Element;

	protected init() {
		super.init();

		this.header = Toolbar.create({
			cls: "header",
			items: [
				this.titleCmp = Component.create({
					tagName: "h3",
					html: this.title
				}),
				Component.create({
					flex: 1
				})
			]
		});

		if(this.maximizable) {
			this.header.getItems().add(this.initMaximizeTool());
		}

		if(this.closable) {
			this.header.getItems().add(Button.create({
				icon: "close",
				handler: () => {
					this.close();
				}
			}));
		}

		this.on("drop", () => {
			this.saveState();
		});

	}

	private initMaximizeTool() {
		const btn = Button.create({
			icon: "maximize",
			title: t("Maximize"),
			handler: () => {
				this.isMaximized() ? this.unmaximize() : this.maximize();
			}
		});


		this.on('maximize', () => {
			btn.setIcon("minimize");
			btn.setTitle(t("Restore"));
		});

		this.on('unmaximize', () => {
			btn.setIcon("maximize");
			btn.setTitle(t("Maximize"));
		});

		return btn;

	}


	public getHeader() {
		return this.header;
	}

	protected applyTitle() {
		// don't set title on el
	}

	protected getDragHandle() {
		return this.header.getEl();
	}

	protected internalRender() {

		const el = super.internalRender();

		if(this.maximized) {
			this.maximize();
		}

		this.header.render(el, el.firstChild);

		el.setAttribute('tabindex', "-1");

		//remove window on escape
		this.el!.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key == "Escape") {
				this.close();
			}
		});

		if(this.resizable) {
			this.observerResize();
		}

		if(this.modal) {
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

			if(init) {
				saveState();
			} else
			{
				init = true;
			}
		});

		this.resizeObserver.observe(this.el!);

	}

	protected buildState()
	{
		if(this.isMaximized()) {
			const s = this.getState();
			s.maximized = true;
			return s;
		} else {
			return {
				width: this.el!.offsetWidth,
				height: this.el!.offsetHeight,
				left: this.getLeft(),
				top: this.getTop()
			};
		}
	}

	protected restoreState(s: Record<string, any>) {
		if (s.width)
			this.width = s.width;
		if (s.height)
			this.height = s.height;

		if(s.top != undefined) {
			this.setTop(s.top);

			if (s.left != undefined) {
				this.setLeft(s.left);
			}
		} else
		{
			this.center();
		}

		if(s.maximized) {
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

	public show() {

		this.focussedBeforeOpen = document.activeElement || undefined;

		if(!this.isRendered()) {

			root.getItems().add(this);

			if (this.modal) {
				this.modalOverlay = comp({
					cls: "window-modal-overlay fade-in fade-out",
					style: {zIndex: (parseInt(getComputedStyle(this.getEl()).zIndex)).toString()},
					hidden: true
				});

				root.getItems().insert(-1, this.modalOverlay);

				this.modalOverlay.getEl().addEventListener("click", (ev) => {
					this.focus();
				});

				this.modalOverlay.show();
			}

			if(!this.hasState()) {
				this.center();
			} else {
				this.constrainTo(window);
			}
			this.focus();
		}

		return super.show();
	}

	/**
	 * @inheritDoc
	 */
	public remove() {

		if(this.focussedBeforeOpen instanceof HTMLElement) {
			this.focussedBeforeOpen.focus();
		}

		if(this.resizeObserver) {
			//otherwise it will fire when removing this element.
			this.resizeObserver.disconnect();
		}

		if (this.modalOverlay) {
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
		this.setTop(((window.innerHeight - this.getHeight())  / 2));
		this.setLeft(((window.innerWidth - this.getWidth()) / 2));

		return this;
	}

	/**
	 * Returns true if the window is maximized
	 */
	public isMaximized() {
		return this.getEl().classList.contains("maximized");
	}

	/**
	 * Grow window to the maximum of the viewport
	 */
	public maximize() {
		this.getEl().classList.add('maximized');

		this.fire("maximize", this);

		return this;
	}

	/**
	 * Make the window smaller than the viewport
	 */
	public unmaximize() {
		this.getEl().classList.remove('maximized');

		this.fire("unmaximize", this);

		return this;
	}

	/**
	 * Show modal alert window
	 *
	 * @param title
	 * @param text
	 */
	public static alert(title:string, text: string): Promise<void> {
		return new Promise((resolve, reject) => {

			Window.create({
				modal: true,
				title: title,
				listeners: {
					close: () => {
						resolve();
					}
				},
				items:[
					Component.create({
						tagName: "p",
						html: text
					})
				]
			}).show();
		});
	}


	/**
	 * Prompt the user for a text input value
	 *
	 * @param title
	 * @param text
	 * @param inputLabel
	 */
	public static prompt(title:string, text: string, inputLabel:string): Promise<string> {

		return new Promise((resolve, reject) => {

			let cancelled = true;

			const win = Window.create({
				modal: true,
				title: title,
				listeners: {
					focus: () => {
						win.getItems().get(0)!.focus();
					},
					close: () => {
						if(cancelled) {
							reject("cancelled");
						}
					}
				},
				items: [
					form({

						handler: (form) => {
							resolve(form.getValues()['input']);
							cancelled = false;
							win.close();
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
								required: true
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
				]
			});

			win.show();
		});
	}

}

/**
 * Shorthand function to create window
 *
 * @param config
 * @param items
 */
export const win = (config?:WindowConfig<Window>, ...items:Component[]) => Window.create(config, items);


