import {Component, ComponentState, Config, createComponent, FindComponentPredicate} from "./Component.js";
import {DraggableComponent, DraggableComponentEventMap} from "./DraggableComponent.js";
import {ObservableListener, ObservableListenerOpts} from "./Observable.js";

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
	 * The minimum size it will set
	 */
	public minSize = 50;

	/**
	 *
	 * @param resizeComponentPredicate 	The component to resize in height or width.
	 *    Can be a component ID, itemId property, Component instance or custom function
	 *
	 */
	constructor(private resizeComponentPredicate: FindComponentPredicate) {
		super("hr");

		this.on("added", () => {
			// find component to resize if it's an id string
			if (!(resizeComponentPredicate instanceof Component)) {
				this._resizeComponent = this.parent!.findChild(this.resizeComponentPredicate)!;

				if(!this._resizeComponent) {
					throw "Could not find component to resize!";
				}
			} else
			{
				this._resizeComponent = resizeComponentPredicate;
			}

			if(this._state) {
				if (this._state.width)
					this._resizeComponent.width = this._state.width;

				if (this._state.height)
					this._resizeComponent.height = this._state.height;
			}
		});
	}

	private _state?: ComponentState;

	protected restoreState(state: ComponentState) {
		// we don't know the component to resize yet so store the state until
		// this component is added to a parent.
		this._state = state;
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

			// if invert is undefined then auto detect based on the component order
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

				this._resizeComponent!.width =
					Math.max(this.minSize, dragData.data.startWidth + offset);
			} else {
				let offset = dragData.y - dragData.startY;

				if (this.invert) {
					offset *= -1;
				}

				this._resizeComponent!.height =
					Math.max(this.minSize, dragData.data.startHeight + offset);
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
