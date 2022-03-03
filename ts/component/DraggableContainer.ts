import {Draggable, DraggableConfig, DraggableEventMap} from "./Draggable.js";
import {Container, ContainerEventMap} from "./Container.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "./Observable.js";
import {ComponentConfig} from "./Component.js";

/**
 * @inheritDoc
 */
export interface DraggableContainerEventMap<T extends Observable> extends ContainerEventMap<T>, DraggableEventMap<T> {
}

/**
 * @inheritDoc
 */
export interface DraggableContainerConfig<T extends Observable> extends ComponentConfig<T>, DraggableConfig<T> {
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<DraggableContainerEventMap<T>>
}

export interface DraggableContainer {
	on<K extends keyof DraggableContainerEventMap<DraggableContainer>>(eventName: K, listener: DraggableContainerEventMap<DraggableContainer>[K], options?: ObservableListenerOpts): void;
	fire<K extends keyof DraggableContainerEventMap<DraggableContainer>>(eventName: K, ...args: Parameters<NonNullable<DraggableContainerEventMap<DraggableContainer>[K]>>): boolean
}

export class DraggableContainer extends Draggable(Container) {
	public static create<T extends typeof Observable>(this: T, config?: DraggableContainerConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}
}