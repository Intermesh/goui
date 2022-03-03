import {Component, ComponentConfig, ComponentEventMap} from "./Component.js";
import {Draggable, DraggableConfig, DraggableEventMap} from "./Draggable.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {DraggableContainerEventMap} from "./DraggableContainer.js";

/**
 * @inheritDoc
 */
export interface DraggableComponentEventMap<T extends Observable> extends ComponentEventMap<T>, DraggableEventMap<T> {

}
/**
 * @inheritDoc
 */
export interface DraggableComponentConfig<T extends Observable> extends ComponentConfig<T>, DraggableConfig<T> {
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<DraggableComponentEventMap<T>>
}

export interface DraggableComponent {
	on<K extends keyof DraggableComponentEventMap<DraggableComponent>>(eventName: K, listener: DraggableComponentEventMap<DraggableComponent>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof DraggableContainerEventMap<DraggableComponent>>(eventName: K, ...args: Parameters<NonNullable<DraggableContainerEventMap<DraggableComponent>[K]>>): boolean
}

export class DraggableComponent extends Draggable(Component) {
	public static create<T extends typeof Observable>(this: T, config?: DraggableComponentConfig<InstanceType<T>>) {
		return (<InstanceType<T>>super.create(<any> config));
	}
}
