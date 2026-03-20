import { Observable, ObservableEventMap } from "./Observable.js";
import { Component } from "./Component.js";
type SortableDragEvent = DragEvent & {
    target: HTMLElement;
    /**
     * Set drag component to show instead of a translucent clone of the draggable
     *
     * ```
     * ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.selected.length + " selected rows"}))
     * ```
     *
     * @link https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
     * @param comp
     */
    setDragComponent: (comp: Component) => void;
};
export interface SortableEventMap extends ObservableEventMap {
    /**
     * Fires when the items are sorted.
     */
    sort: {
        /** The original index of the moved item. */
        fromIndex: number;
        /** The new index of the moved item. */
        toIndex: number;
        /** Whether the item was dropped on the toIndex or moved to this index. */
        droppedOn: boolean;
        /** The component the element was dragged from, if "group" is used to drop to other components. */
        source: Component;
        /** Arbitrary data set to dragData in the dragstart event. */
        dragDataSet: Record<string, any>;
    };
    /**
     * Fires when the items are dragged over this sortable.
     *
     * Return false to disallow dropping.
     *
     */
    dropallowed: {
        /** The original index of the moved item. */
        fromIndex: number;
        /** The new index of the moved item. */
        toIndex: number;
        /** Whether the item was dropped on the toIndex or moved to this index. */
        droppedOn: boolean;
        /** The component the element was dragged from, if "group" is used to drop to other components. */
        source: Component;
        /** Arbitrary data set to dragData in the dragstart event. */
        dragDataSet: Record<string, any>;
    };
    /**
     * Fires when dragging starts.
     *
     * You can set a component to show instead of a copy of the drag source:
     * `ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.selected.length + " selected rows"}))`
     */
    dragstart: {
        /** The sortable drag event object. */
        ev: SortableDragEvent;
        /** The data associated with the drag operation. */
        dragData: DragData;
    };
    /**
     * Fires when dragging ends.
     */
    dragend: {
        /** The native drag event object. */
        ev: DragEvent;
        /** The data associated with the drag operation. */
        dragData: DragData;
    };
}
type DROP_POSITION = "before" | "after" | "on";
type DragData = {
    dragSrc: HTMLElement | undefined;
    pos: DROP_POSITION;
    overEl: HTMLElement | undefined;
    fromIndex: number;
    toIndex: number;
    group: string;
    sourceonent: Component;
    dataSet: Record<string, any>;
};
/**
 * Enables sorting of child elements inside a container
 *
 * This class is used by lists, tables and trees but can also be used in custom components
 *
 * @link https://goui.io/#draganddrop Examples
 */
export declare class Sortable<Type extends Component> extends Observable<SortableEventMap> {
    readonly component: Type;
    private sortableChildSelector;
    /**
     * Only allow drag and drop to Sortable's from the same group
     */
    group: string | undefined;
    /**
     * Allow dropping on child nodes
     */
    dropOn: boolean;
    /**
     * Allow sorting
     */
    dropBetween: boolean;
    /**
     * Set to true when items are stacked horizontally
     */
    horizontal: boolean;
    /**
     * Move the DOM nodes. Often GOUI components have underlying data stores that need to be updated. The components update
     * the UI already when the data in their store changes.
     */
    updateDom: boolean;
    private _gap;
    private static _dropPin;
    private static getDropPin;
    private static _dragImg;
    private static getDragImg;
    /**
     * Find the index of the item in the list of sortables
     *
     * @param sortableItem
     * @private
     */
    private findIndex;
    /**
     * Constructor
     *
     * @param component The container component where the sortables are inside
     * @param sortableChildSelector CSS selector to find the sortables. For example a css class ".sortable-item".
     */
    constructor(component: Type, sortableChildSelector: string);
    private getDragPos;
    private dropAllowed;
    /**
     * Calculates the gap between two rows to place the drop pin between them
     *
     * @private
     */
    private gap;
    private endDrag;
    private findSortables;
}
export {};
