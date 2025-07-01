/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Component, ComponentState, createComponent} from "./Component.js";
import {DraggableComponent} from "./DraggableComponent.js";
import {Config} from "./Observable.js";

type ResizeComponent = Component | ((splitter:Splitter) => Component);
/**
 * Splitter
 *
 * Used to resize panels
 */
export class Splitter extends DraggableComponent {


	private _resizeComponent?: Component;

	/**
	 * Resize the widths when this hr is styled as a vertical splitter, otherwise the height is set.
	 */
	public resizeWidth?: boolean;

	/**
	 * When the panel is on the left of a center panel that auto sizes. The x offset can be added to the width. But if
	 * the panel is on the right the x offset must be inverted.
	 * If not given the splitter will auto detect it's position relative to the component it resizes
	 */
	public invert?: boolean;

	// /**
	//  * The minimum size it will set. Note that you can also put a min-width or min-height on the element with css.
	//  */
	// public minSize = 50;

	// /**
	//  * The maximum size it will set. Note that you can also put a max-width or max-height on the element with css.
	//  */
	// public maxSize?: number;

	/**
	 *
	 * @param resizeComponent 	The component to resize in height or width.
	 *    Can be a component ID, itemId property, Component instance or custom function
	 *
	 */
	constructor(resizeComponent: ResizeComponent) {
		super("hr");

		// determine resize component as early as possible. This is just before the parent component renders.
		// Then the sizes can be set before the resizeComponent renders itself.
		this.on("added", ({parent}) => {
			parent.on("beforerender", () => {
				this._resizeComponent = resizeComponent instanceof Component ? resizeComponent : resizeComponent(this);

				const state = this.getState();
				if (state) {
					this.applyStateToResizeComp(state);
				}
			});
		});
	}

	private applyStateToResizeComp(state: ComponentState) {
		if (this._resizeComponent) {
			if (state) {
				if (state.width)
					this._resizeComponent.width = state.width;

				if (state.height)
					this._resizeComponent.height = state.height;
			}
		}
	}

	protected buildState() {
		return this.resizeWidth ? {width: this._resizeComponent!.width} : {height: this._resizeComponent!.height};
	}

	/**
	 * If a splitter is between two containers. It will check the minWidth of the container next to the container
	 * we are resizing so it will not go bigger than allowed by the minWidth.
	 *
	 * @private
	 */
	private initAutoMaxHeight() {
		const prev = this.previousSibling(),
			next = this.nextSibling();

		if(!prev || !next) {
			return;
		}

		if(prev == this._resizeComponent && next.minHeight) {
			const r1 = prev.el.getBoundingClientRect(),
				r2 = next.el.getBoundingClientRect(),
				gap = r2.y - r1.height - r1.y;

			return r1.height + r2.height - gap - Component.remToPx(next.minHeight);
		}

		if(next == this._resizeComponent && prev.minHeight) {
			const r1 = prev.el.getBoundingClientRect(),
				r2 = next.el.getBoundingClientRect(),
				gap = r2.y - r1.height - r1.y;

			return r2.height + r1.height - gap - Component.remToPx( prev.minHeight);
		}
	}

	/**
	 * If a splitter is between two containers. It will check the minWidth of the container next to the container
	 * we are resizing so it will not go bigger than allowed by the minWidth.
	 *
	 * @private
	 */
	private initAutoMaxWidth() {
		const prev = this.previousSibling(),
			next = this.nextSibling();

		if(!prev || !next) {
			return;
		}

		if(prev == this._resizeComponent && next.minWidth) {
			const r1 = prev.el.getBoundingClientRect(),
				r2 = next.el.getBoundingClientRect(),
				gap = r2.x - r1.width - r1.x;

			return r1.width + r2.width - gap - Component.remToPx(next.minWidth);
		}

		if(next == this._resizeComponent && prev.minWidth) {
			const r1 = prev.el.getBoundingClientRect(),
				r2 = next.el.getBoundingClientRect(),
				gap = r2.x - r1.width - r1.x;

			return r2.width + r1.width - gap - Component.remToPx( prev.minWidth);
		}
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();

		let autoMax:number|undefined = undefined;

		this.on("dragstart", ({dragData}) => {
			//resize width if this is a vertical splitter
			if (this.resizeWidth === undefined) {
				this.resizeWidth = this.el.offsetHeight > this.el.offsetWidth;
			}

			if (this.resizeWidth) {
				autoMax = this.initAutoMaxWidth();
			} else {
				autoMax = this.initAutoMaxHeight();
			}

			// if invert is undefined then autodetect based on the component order
			if (this.invert === undefined) {
				const splitterIndex = this.parent!.findItemIndex(this)!;
				const resizeCmpIndex = this.parent!.findItemIndex(this._resizeComponent!)!;
				this.invert = splitterIndex < resizeCmpIndex;
			}

			if (this.resizeWidth) {
				dragData.data.startWidth = this._resizeComponent!.el.offsetWidth;
			} else {
				dragData.data.startHeight = this._resizeComponent!.el.offsetHeight;
			}
		});

		this.on("drag", ({dragData}) => {
			if (this.resizeWidth) {
				let offset = dragData.x - dragData.startX;

				if (this.invert) {
					offset *= -1;
				}

				let width = dragData.data.startWidth + offset;

				if (autoMax) {
					width = Math.min(autoMax, width);
				}
				this._resizeComponent!.width = Component.pxToRem(width);

			} else {
				let offset = dragData.y - dragData.startY;

				if (this.invert) {
					offset *= -1;
				}

				let height = dragData.data.startHeight + offset;
				if (autoMax) {
					height = Math.min(autoMax, height);
				}
				this._resizeComponent!.height = Component.pxToRem(height);

			}
		});

		this.on("drop", () => {
			this.saveState();
		});

		return el;
	}
}


type SplitterConfig = Config<Splitter> & {
	resizeComponent: ResizeComponent
}

/**
 * Shorthand function to create {@link Splitter}
 */
export const splitter = (config: SplitterConfig) => createComponent(new Splitter(config.resizeComponent), config);
