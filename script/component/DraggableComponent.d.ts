/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
import { Component, ComponentEventMap, Constraints } from "./Component.js";
import { Config } from "./Observable.js";
/**
 * Data available to draggable item listeners
 */
export interface DragData {
    /**
     * x when dragging started
     */
    startX: number;
    /**
     * y when dragging started
     */
    startY: number;
    /**
     * Current x
     */
    x: number;
    /**
     * Current y
     */
    y: number;
    /**
     * offsetLeft of dragged element when dragging started
     */
    startOffsetLeft: number;
    /**
     * offsetTop of dragged element when dragging started
     */
    startOffsetTop: number;
    /**
     * The left offset from the element offsetLeft where the user grabbed the element
     */
    grabOffsetLeft: number;
    /**
     * The top offset from the element offsetLeft where the user grabbed the element
     */
    grabOffsetTop: number;
    data: any;
}
export interface DraggableEvent {
    /**
     * Represents the data associated with a drag-and-drop operation.
     * Typically includes details about the item being dragged and its metadata.
     */
    dragData: DragData;
    /**
     * The original browser MouseEvent object
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvents
     */
    ev: MouseEvent;
}
/**
 * @inheritDoc
 */
export interface DraggableComponentEventMap extends ComponentEventMap {
    /**
     * Fires when the component is dropped
     */
    drop: DraggableEvent;
    /**
     * Fires constantly while the component is being dragged
     */
    drag: DraggableEvent;
    /**
     * Return false to prevent drag
     */
    dragstart: DraggableEvent;
}
/**
 * A draggable component
 *
 * @link Window
 */
export declare class DraggableComponent<EventMap extends DraggableComponentEventMap = DraggableComponentEventMap> extends Component<EventMap> {
    protected dragData?: DragData;
    private constrainBox?;
    private _dragConstrainTo;
    private _dragConstrainPad?;
    /**
     * Update left and top css properties when dragging
     */
    setPosition?: boolean;
    /**
     * Enable dragging
     */
    private _draggable;
    constructor(tagName?: keyof HTMLElementTagNameMap);
    /**
     * Enable or disable dragging
     */
    set draggable(draggable: boolean);
    private toggleDraggable;
    get draggable(): boolean;
    private onDragHandleClick;
    private onDragHandleMouseDown;
    /**
     * Returns the DOM element that can be grabbed to drag the component
     * @protected
     */
    protected getDragHandle(): HTMLElement;
    /**
     * Constrain dragging to this element
     * @param el
     * @param pad Supply paddings
     */
    dragConstrainTo(el: HTMLElement | Window, pad?: Partial<Constraints>): void;
    private onDragStart;
    private onDrag;
    private constrainCoords;
}
/**
 * Shorthand function to create {@link DraggableComponent}
 *
 * @link Window
 *
 * @param config
 * @param items
 */
export declare const draggable: (config?: Config<DraggableComponent>, ...items: Component[]) => DraggableComponent<DraggableComponentEventMap>;
