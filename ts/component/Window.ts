import {Component, ComponentConfig} from "./Component.js";
import {Toolbar} from "./Toolbar.js";
import {Mask} from "./Mask.js";
import {Button} from "./Button.js";
import {DraggableComponent, DraggableComponentEventMap} from "./DraggableComponent.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {root} from "./Root.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {Form} from "./form/Form.js";
import {Fieldset} from "./form/Fieldset.js";
import {TextField} from "./form/TextField.js";
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
	private mask: Mask | undefined;

	public static create<T extends typeof Observable>(this: T, config?: WindowConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

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

		//Observe resize
		if(this.resizable) {
			const saveState = FunctionUtil.buffer(200, () => {
				this.saveState();
			});
			const ro = new ResizeObserver(entries => {
				//it fires on close too with size 0. Don't save that.
				if (entries[0].borderBoxSize[0].blockSize > 0) {
					saveState();
				}
			})
			ro.observe(this.el!);
		}

		return el;
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

		if(s.top) {
			this.setTop(s.top);

			if (s.left) {
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
		if(!this.isRendered()) {

			root.getItems().add(this);

			if (this.modal) {
					this.mask = Mask.create({
					spinner: false,
					cls: "fade-in fade-out",
					style: {zIndex: (parseInt(getComputedStyle(this.getEl()).zIndex) - 1).toString()},
					hidden: true
				});

				root.getItems().add(this.mask);

				this.mask.show();
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
		if (this.mask) {
			this.mask.remove();
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
		this.setTop((window.innerHeight - this.getHeight()) / 2);
		this.setLeft((window.innerWidth - this.getWidth()) / 2);

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
					Form.create({

						handler: (form) => {
							resolve(form.getValues()['input']);
							cancelled = false;
							win.close();
						},

						items: [
							Fieldset.create({
								items: [
									Component.create({
										tagName: "p",
										html: text
									}),
									TextField.create({
										label: inputLabel,
										name: "input",
										required: true
									})
								]
							}),
							Toolbar.create({
								items: [
									Component.create({
										flex: 1
									}),
									Button.create({
										type: "submit",
										text: "Ok"
									})
								]
							})
						]
					})
				]
			});

			win.show();
		});
	}

}
