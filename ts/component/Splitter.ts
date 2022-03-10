import {Component, ComponentConfig, ComponentState} from "./Component.js";
import {Observable} from "./Observable.js";
import {DraggableComponent} from "./DraggableComponent.js";

/**
 * @inheritDoc
 */
export interface SplitterConfig<T extends Observable> extends ComponentConfig<T> {
	resizeComponent: Component,
	resizeWidth: boolean
}

/**
 * Splitter
 *
 * Used to resize panels
 */
export class Splitter extends DraggableComponent {
	tagName = "hr" as keyof HTMLElementTagNameMap

	resizeComponent!:Component;

	/**
	 * resize the widths when this hr is styled as a vertical splitter
	 */
	resizeWidth = true;

	minWidth = 50;

	minHeight = 50;

	protected restoreState(state: ComponentState) {
		if(state.width)
			this.resizeComponent.setWidth(state.width);

		if(state.height)
			this.resizeComponent.setHeight(state.height);
	}

	protected buildState() {
		return this.resizeWidth ? {width: this.resizeComponent.getEl().offsetWidth} : {height: this.resizeComponent.getEl().offsetHeight};
	}

	public static create<T extends typeof Observable>(this: T, config?: SplitterConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any>config);
	}

	protected init() {

		this.on("dragstart", (comp, dragData, e) => {
			// console.log(dragData);
			if(this.resizeWidth) {
				dragData.data.startWidth = this.resizeComponent.getEl().offsetWidth;
			} else {
				dragData.data.startHeight = this.resizeComponent.getEl().offsetHeight;
			}
		});

		this.on("drag",  (dc,dragData,ev) => {
			if(this.resizeWidth) {
				this.resizeComponent.getEl().style.width = Math.max(this.minWidth, dragData.data.startWidth + dragData.x - dragData.startX) + "px";
			} else
			{
				this.resizeComponent.getEl().style.height = Math.max(this.minHeight, dragData.data.startHeight + dragData.y - dragData.startY) + "px";
			}
		});

		this.on("drop", () => {
			this.saveState();
		});

		super.init();
	}
}
