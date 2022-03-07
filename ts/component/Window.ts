import {Container, ContainerConfig} from "./Container.js";
import {Component} from "./Component.js";
import {Toolbar} from "./Toolbar.js";
import {Key} from "../util/Key.js";
import {Mask} from "./Mask.js";
import {Button} from "./Button.js";
import {DraggableContainer, DraggableContainerEventMap} from "./DraggableContainer.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {root} from "./Root.js";
import {FunctionUtil} from "../util/FunctionUtil.js";
import {Form} from "./form/Form.js";
import {Fieldset} from "./form/Fieldset.js";
import {TextField} from "./form/TextField.js";

/**
 * @inheritDoc
 */
export interface WindowConfig<T extends Observable> extends ContainerConfig<T> {

	/**
	 * Make the window modal so the user can only interact with this window.
	 */
	modal?: boolean,
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<WindowEventMap<T>>
}

/**
 * @inheritDoc
 */
export interface WindowEventMap<T extends Observable> extends DraggableContainerEventMap<T> {
	/**
	 * Fires when the window is closed
	 *
	 * @param window
	 */
	close?: (window: T) => void
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
 * 	items: [Component.create({tagName: "h1", cls: "go-pad", html: "Just saying hi!"})]
 * });
 *
 * win.open();
 * ```
 */
export class Window extends DraggableContainer {
	protected baseCls = "go-window"

	private titleCmp!: Component;
	private header!: Toolbar;

	protected resizable = true

	protected modal = false
	private mask: Mask | undefined;

	public static create<T extends typeof Observable>(this: T, config?: WindowConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected init() {
		super.init();

		this.header = Toolbar.create({
			cls: "go-header",
			items: [
				this.titleCmp = Component.create({
					tagName: "h3",
					html: this.title
				}),
				Component.create({
					flex: 1
				}),
				Button.create({
					// html: "&#x2715;",
					icon: "close",
					handler: () => {
						this.close();
					}
				})
			]
		})

	}

	getHeader() {
		return this.header;
	}

	applyTitle() {
		// don't set title on el
	}

	getDragHandle() {
		return this.header.getEl();
	}

	protected internalRender() {

		const el = super.internalRender();

		this.header.render(el, el.firstChild);

		el.setAttribute('tabindex', "-1");

		//remove window on escape
		this.el!.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key == Key.Escape) {
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

	protected buildState(): {} {
		return {width: this.el!.offsetWidth, height: this.el!.offsetHeight};
	}

	protected restoreState(s: Record<string, any>) {
		if (s.width)
			this.width = s.width;
		if (s.height)
			this.height = s.height;
	}

	/**
	 * Open the window by rendering it into the DOM body element
	 * Use show()
	 * @deprecated
	 */
	open() {
		return this.show();
	}

	public show() {
		if(!this.isRendered()) {

			root.addItem(this);

			if (this.modal) {
					this.mask = Mask.create({
					spinner: false,
					cls: "fade-in fade-out",
					style: {zIndex: (parseInt(getComputedStyle(this.getEl()).zIndex) - 1).toString()},
					hidden: true
				});

				root.addItem(this.mask);

				this.mask.show();
			}

			this.center();
			this.focus();
		}

		return super.show();
	}

	/**
	 * @inheritDoc
	 */
	remove() {
		if (this.mask) {
			this.mask.remove();
		}
		this.header.remove();
		return super.remove();
	}

	/**
	 * Close the window by removing it
	 */
	close() {
		this.fire("close", this);
		this.remove();
	}

	/**
	 * Center the window in the screen
	 */
	center() {
		this.getEl().style.top = (window.innerHeight - this.getEl().offsetHeight) / 2 + "px"
		this.getEl().style.left = (window.innerWidth - this.getEl().offsetWidth) / 2 + "px"

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
						win.getItemAt(0)!.focus();
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

			win.open();
		});
	}

}
