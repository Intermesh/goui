import {Component, ComponentConfig, ComponentState, FindComponentPredicate} from "./Component.js";
import {Observable} from "./Observable.js";
import {DraggableComponent} from "./DraggableComponent.js";

/**
 * @inheritDoc
 */
export interface SplitterConfig<T extends Observable> extends ComponentConfig<T> {
	/**
	 * The component to resize in height or width.
	 * Can be a component ID, itemId property, Component instance or custom function
	 */
	resizeComponent: FindComponentPredicate

	/**
	 * The minimum size it will set
	 */
	minSize?:number
}

/**
 * Splitter
 *
 * Used to resize panels
 */
export class Splitter extends DraggableComponent {
	tagName = "hr" as keyof HTMLElementTagNameMap

	protected resizeComponent!:Component;

	/**
	 * Resize the widths when this hr is styled as a vertical splitter, otherwise the height is set.
	 */
	private resizeWidth?:boolean;

	/**
	 * When the panel is on the left of a center panel that auto sizes. The x offset can be added to the width. But if
	 * the panel is on the right the x offset must be inverted.
	 * If not given the splitter will auto detect it's position relative to the component it resizes
	 */
	private invert?:boolean;

	public minSize = 50;


	protected restoreState(state: ComponentState) {

		this.on("added", (cmp) => {
			// find component to resize if it's an id string
			if(!(this.resizeComponent instanceof Component)) {
				this.resizeComponent = this.parent!.findChild(this.resizeComponent)!;
			}

			if (state.width)
				this.resizeComponent.setWidth(state.width);

			if (state.height)
				this.resizeComponent.setHeight(state.height);
		});
	}

	protected buildState() {
		return this.resizeWidth ? {width: this.resizeComponent.getEl().offsetWidth} : {height: this.resizeComponent.getEl().offsetHeight};
	}

	protected init() {

		this.on("dragstart", (comp, dragData, e) => {
			//resize width if this is a vertical splitter
			if(this.resizeWidth === undefined) {
				this.resizeWidth = this.getEl().offsetHeight > this.getEl().offsetWidth;
			}

			// if invert is undefined then auto detect based on the component order
			if(this.invert === undefined) {
				const splitterIndex = this.parent!.findItemIndex(this)!;
				const resizeCmpIndex = this.parent!.findItemIndex(this.resizeComponent)!;
				this.invert = splitterIndex < resizeCmpIndex;
			}

			if(this.resizeWidth) {
				dragData.data.startWidth = this.resizeComponent.getEl().offsetWidth;
			} else {
				dragData.data.startHeight = this.resizeComponent.getEl().offsetHeight;
			}
		});

		this.on("drag",  (dc,dragData,ev) => {
			if(this.resizeWidth) {
				let offset = dragData.x - dragData.startX;

				if(this.invert) {
					offset *= -1;
				}

				this.resizeComponent.getEl().style.width =
					Math.max(this.minSize, dragData.data.startWidth + offset) + "px";
			} else
			{
				let offset = dragData.y - dragData.startY;

				if(this.invert) {
					offset *= -1;
				}

				this.resizeComponent.getEl().style.height =
					Math.max(this.minSize, dragData.data.startHeight + offset) + "px";
			}
		});

		this.on("drop", () => {
			this.saveState();
		});

		super.init();
	}
}

/**
 * Shorthand function to create {@see Splitter}
 *
 * @param config
 * @param items
 */
export const splitter = (config?:SplitterConfig<Splitter>) => Splitter.create(config);
