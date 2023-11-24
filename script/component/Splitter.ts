/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import {Component, ComponentState, createComponent, FindComponentPredicate, REM_UNIT_SIZE} from "./Component.js";
import {DraggableComponent} from "./DraggableComponent.js";
import {Config} from "./Observable";


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

	/**
	 * The minimum size it will set. Note that you can also put a min-width or min-height on the element with css.
	 */
	public minSize = 50;

	/**
	 * The maximim size it will set. Note that you can also put a max-width or max-height on the element with css.
	 */
	public maxSize?: number;

	/**
	 *
	 * @param resizeComponentPredicate 	The component to resize in height or width.
	 *    Can be a component ID, itemId property, Component instance or custom function
	 *
	 */
	constructor(private resizeComponentPredicate: FindComponentPredicate) {
		super("hr");

		this.on("beforerender", () => {
			// find component to resize if it's an id string
			if (!(resizeComponentPredicate instanceof Component)) {
				this._resizeComponent = this.parent!.findChild(this.resizeComponentPredicate)!;

				if (!this._resizeComponent) {
					console.warn(this.resizeComponentPredicate);
					throw "Could not find component to resize!";
				}
			} else {
				this._resizeComponent = resizeComponentPredicate;
			}

			if (this._state) {
				this.restoreState(this._state);
			}
		});
	}

	private _state?: ComponentState;

	protected restoreState(state: ComponentState) {
		// we don't know the component to resize yet so store the state until
		// this component is added to a parent.
		this._state = state;

		if (this._resizeComponent) {
			if (this._state) {
				if (this._state.width)
					this._resizeComponent.width = this._state.width;

				if (this._state.height)
					this._resizeComponent.height = this._state.height;
			}
		}
	}

	protected buildState() {
		return this.resizeWidth ? {width: this._resizeComponent!.el.offsetWidth} : {height: this._resizeComponent!.el.offsetHeight};
	}

	protected internalRender(): HTMLElement {
		const el = super.internalRender();

		this.on("dragstart", (comp, dragData, e) => {
			//resize width if this is a vertical splitter
			if (this.resizeWidth === undefined) {
				this.resizeWidth = this.el.offsetHeight > this.el.offsetWidth;
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

		this.on("drag", (dc, dragData, ev) => {
			if (this.resizeWidth) {
				let offset = dragData.x - dragData.startX;

				if (this.invert) {
					offset *= -1;
				}

				let width = Math.max(this.minSize, dragData.data.startWidth + offset);

				if (this.maxSize) {
					width = Math.min(this.maxSize, width);
				}
				this._resizeComponent!.width = width * 10 / REM_UNIT_SIZE ;

			} else {
				let offset = dragData.y - dragData.startY;

				if (this.invert) {
					offset *= -1;
				}

				let height = Math.max(this.minSize, dragData.data.startHeight + offset);
				if (this.maxSize) {
					height = Math.min(this.maxSize, height);
				}
				this._resizeComponent!.height = height * 10 / REM_UNIT_SIZE;

			}
		});

		this.on("drop", () => {
			this.saveState();
		});

		return el;
	}
}


type SplitterConfig = Config<Splitter> & {
	resizeComponentPredicate: FindComponentPredicate
}

/**
 * Shorthand function to create {@see Splitter}
 */
export const splitter = (config: SplitterConfig) => createComponent(new Splitter(config.resizeComponentPredicate), config);
