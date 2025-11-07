import {Observable, ObservableEventMap} from "./Observable.js";
import {comp, Component} from "./Component.js";
import {root} from "./Root.js";

type SortableDragEvent = DragEvent & {
	target: HTMLElement,

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
	setDragComponent: (comp:Component) => void
};

export interface SortableEventMap extends ObservableEventMap {

	/**
	 * Fires when the items are sorted.
	 */
	sort: {
		/** The original index of the moved item. */
		fromIndex: number,
		/** The new index of the moved item. */
		toIndex: number,
		/** Whether the item was dropped on the toIndex or moved to this index. */
		droppedOn: boolean,
		/** The component the element was dragged from, if "group" is used to drop to other components. */
		source: Component,
		/** Arbitrary data set to dragData in the dragstart event. */
		dragDataSet: Record<string, any>
	},

	/**
	 * Fires when the items are dragged over this sortable.
	 *
	 * Return false to disallow dropping.
	 *
	 */
	dropallowed: {
		/** The original index of the moved item. */
		fromIndex: number,
		/** The new index of the moved item. */
		toIndex: number,
		/** Whether the item was dropped on the toIndex or moved to this index. */
		droppedOn: boolean,
		/** The component the element was dragged from, if "group" is used to drop to other components. */
		source: Component,
		/** Arbitrary data set to dragData in the dragstart event. */
		dragDataSet: Record<string, any>
	},

	/**
	 * Fires when dragging starts.
	 *
	 * You can set a component to show instead of a copy of the drag source:
	 * `ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.selected.length + " selected rows"}))`
	 */
	dragstart: {
		/** The sortable drag event object. */
		ev: SortableDragEvent,
		/** The data associated with the drag operation. */
		dragData: DragData
	},

	/**
	 * Fires when dragging ends.
	 */
	dragend: {
		/** The native drag event object. */
		ev: DragEvent,
		/** The data associated with the drag operation. */
		dragData: DragData
	}
}



type DROP_POSITION = "before" | "after" | "on";


type DragData = {
	dragSrc:HTMLElement|undefined
	pos:DROP_POSITION
	overEl: HTMLElement|undefined,
	fromIndex: number,
	toIndex: number,
	group: string,
	sourceonent: Component
	dataSet: Record<string, any>
}

const dragData: DragData = {
	dragSrc: undefined,
	pos: "before",
  overEl: undefined,
	fromIndex: -1,
	toIndex: -1,
	group:"",
	sourceonent: root,
	dataSet: {}
}

/**
 * Enables sorting of child elements inside a container
 *
 * This class is used by lists, tables and trees but can also be used in custom components
 *
 * @link https://goui.io/#draganddrop Examples
 */
export class Sortable<Type extends Component> extends Observable<SortableEventMap> {

	/**
	 * Only allow drag and drop to Sortable's from the same group
	 */
	public group:string | undefined;

	/**
	 * Allow dropping on child nodes
	 */
	public dropOn = false;

	/**
	 * Allow sorting
	 */
	public dropBetween = true;

	/**
	 * Set to true when items are stacked horizontally
	 */
	public horizontal = false;

	/**
	 * Move the DOM nodes. Often GOUI components have underlying data stores that need to be updated. The components update
	 * the UI already when the data in their store changes.
	 */
	public updateDom = false;

	private _gap: number|undefined;

	private static _dropPin: Component | undefined;

	private static getDropPin() {

		if(Sortable._dropPin == undefined) {
			Sortable._dropPin = comp({
				cls: "drop-pin",
				hidden: true
			})

			root.items.add(Sortable._dropPin);
		}

		return Sortable._dropPin;
	}

	private static _dragImg: Component | undefined;

	private static getDragImg() {

		if(Sortable._dragImg == undefined) {
			Sortable._dragImg = comp({
				cls: "drag-img"
			})

			root.items.add(Sortable._dragImg);
		}
		return Sortable._dragImg;
	}

	/**
	 * Find the index of the item in the list of sortables
	 *
	 * @param sortableItem
	 * @private
	 */
	private findIndex(sortableItem:HTMLElement) {
		return this.findSortables().indexOf(sortableItem);
		// let index = 0, curr: Element | null = sortableItem;
		//
		// while((curr = curr.previousElementSibling)) {
		// 	if(curr.matches(this.sortableChildSelector)) {
		// 		index++;
		// 	}
		// }
		//
		// return index;
	}

	/**
	 * Constructor
	 *
	 * @param component The container component where the sortables are inside
	 * @param sortableChildSelector CSS selector to find the sortables. For example a css class ".sortable-item".
	 */
	constructor(readonly component:Type, private sortableChildSelector:string) {
		super();

		component.el.on("dragstart", (e)=> {

			if(!this.group) {
				this.group = "sortable-" + Component.uniqueID();
			}

			// does this item belong to us? Not sure if this is efficient. Perhaps two sortables on the same el is madness.
			if(this.findSortables().indexOf(e.target) === -1) {
				return;
			}

			// had to add this class because otherwise dragleave fires immediately on child nodes: https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
			root.el.cls("+dragging");

			dragData.group = this.group;
			dragData.dragSrc = e.target;
			dragData.sourceonent = this.component;

			dragData.fromIndex = this.findIndex(e.target);

			e.dataTransfer!.setData('text/plain', 'goui');
			e.dataTransfer!.effectAllowed = "copyMove";
			e.target.classList.add("drag-src");

			const ev : SortableDragEvent =
				Object.assign(e, {setDragComponent: function(this:DragEvent,comp:Component)  {
					Sortable.getDragImg().items.replace(comp);
					this.dataTransfer!.setDragImage(comp.el, 0, 0)
				}
				});

			this.fire("dragstart", {ev, dragData});

		})

		component.el.on("drop", (e)=> {
			e.preventDefault();
			this.endDrag(e);
		})

		component.el.on("dragend", (e)=> {
			e.preventDefault();
			this.endDrag(e);
		})

		component.el.on("dragover", (e) => {

			if(dragData.group != this.group) {
				return;
			}

			if(!this.dropOn && !this.dropBetween) {
				return;
			}

			dragData.overEl = e.target.closest(this.sortableChildSelector) as HTMLElement;

			if(!this.dropAllowed()) {
				return;
			}

			const dropPin = Sortable.getDropPin();

			if(dragData.overEl) {

				const rect = dragData.overEl.getBoundingClientRect();
				dragData.pos = this.getDragPos(rect, e);

				switch(dragData.pos) {
					case "before":
						e.preventDefault();
						e.stopPropagation();
						e.dataTransfer!.dropEffect = "move";
						dropPin.hidden = false;

						if(this.horizontal) {
							dropPin.el.style.top = rect.y + "px"; // (rect.y - this.gap(dragData.overEl)) + "px";
							dropPin.el.style.left = (rect.x - this.gap(dragData.overEl)) + "px";
							dropPin.el.style.height = rect.height + "px";
						} else {
							dropPin.el.style.top = (rect.y - this.gap(dragData.overEl)) + "px";
							dropPin.el.style.left = rect.x + "px";
							dropPin.el.style.width = rect.width + "px";
						}
						break;

					case "on":
						if(!this.dropOn) {
							return;
						}
						e.dataTransfer!.dropEffect = "copy";
						dropPin.hidden = true;

						e.preventDefault();
						e.stopPropagation();

						break;

					case "after":
						e.preventDefault();
						e.stopPropagation();
						e.dataTransfer!.dropEffect = "move";
						dropPin.hidden = false;

						if(this.horizontal) {
							dropPin.el.style.top = rect.y + "px";
							dropPin.el.style.left = (rect.x + rect.width + this.gap(dragData.overEl)) + "px";
							dropPin.el.style.height = rect.height + "px";
							dropPin.el.style.width = "";
						} else {
							dropPin.el.style.top = (rect.y + rect.height + this.gap(dragData.overEl)) + "px";
							dropPin.el.style.left = rect.x + "px";
							dropPin.el.style.width = rect.width + "px";
							dropPin.el.style.height = "";
						}

						break;
				}
			} else {

				dragData.pos = "before";
				dragData.toIndex = 0;

				e.preventDefault();
				e.stopPropagation();

				dropPin.hidden = true;
				e.dataTransfer!.dropEffect = "copy";
			}

		})
	}

	private getDragPos(rect: DOMRect, e:DragEvent) {
		let pos: DROP_POSITION;
		if (this.dropBetween) {
			if(this.horizontal) {
				const betweenZone = this.dropOn ? 10 : rect.width / 2;
				pos = "before";
				if (e.x > rect.x + betweenZone) {
					pos = "on";
				}

				if (e.x > rect.x + rect.width - betweenZone) {
					pos = "after";
				}
			} else {
				const betweenZone = this.dropOn ? 10 : rect.height / 2;
				pos = "before";
				if (e.y > rect.y + betweenZone) {
					pos = "on";
				}

				if (e.y > rect.y + rect.height - betweenZone) {
					pos = "after";
				}
			}
		} else {
			pos = "on";
		}

		return pos;
	}

	private dropAllowed() {
		if(dragData.overEl) {
			dragData.toIndex = this.findIndex(dragData.overEl);
			if (dragData.pos == "after") {
				dragData.toIndex++;
			}
		} else {
			dragData.toIndex = 0;
		}

		return this.fire("dropallowed", {
			toIndex: dragData.toIndex,
			fromIndex: dragData.fromIndex,
			droppedOn: dragData.pos == "on",
			source: dragData.sourceonent,
			dragDataSet: dragData.dataSet
		});
	}

	/**
	 * Calculates the gap between two rows to place the drop pin between them
	 *
	 * @private
	 */
	private gap(item:HTMLElement) {

		if(this._gap !== undefined) {
			return this._gap;
		}

		let item2 = item.nextElementSibling, r1, r2;

		if(item2 == null) {
			item2 =  item.previousElementSibling;
			if(item2 === null) {
				return 0;
			}

			r1 = item2.getBoundingClientRect();
			r2 = item.getBoundingClientRect();

		} else {
			r1 = item.getBoundingClientRect();
			r2 = item2.getBoundingClientRect();
		}

		this._gap = this.horizontal
			? (r1.x + r1.width - r2.x) / 2
			: (r1.y + r1.height - r2.y) / 2


		return this._gap;
	}

	private endDrag(ev:DragEvent) {

		Sortable.getDropPin().hidden = true;

		if(dragData.group != this.group) {
			//not our item
			return;
		}

		if(!dragData.dragSrc) {
			this.fire("dragend", {ev, dragData});
			return;
		}

		dragData.dragSrc!.classList.remove("drag-src");

		root.el.cls("-dragging");

		if((!this.dropOn && !this.dropBetween) || !this.dropAllowed()) {
			dragData.dragSrc = undefined;
			this.fire("dragend", {ev, dragData});
			return;
		}

		if(dragData.overEl) {

			dragData.toIndex = this.findIndex(dragData.overEl);
			if (dragData.pos == "after") {
				dragData.toIndex++;
			}

			if(this.updateDom) {
				switch (dragData.pos) {
					case "before":
						dragData.overEl.parentNode!.insertBefore(dragData.dragSrc!, dragData.overEl);
						break;

					case "on":
						dragData.dragSrc!.parentNode!.removeChild(dragData.dragSrc!);
						break;

					case "after":
						dragData.overEl.parentNode!.insertBefore(dragData.dragSrc!, dragData.overEl.nextSibling);
						break;
				}
			}
		}

		dragData.dragSrc = undefined;

		this.fire("sort", {toIndex: dragData.toIndex, fromIndex: dragData.fromIndex, droppedOn: dragData.pos == "on", source: dragData.sourceonent, dragDataSet: dragData.dataSet});
		this.fire("dragend", {ev, dragData});
	}

	private findSortables() {
		return Array.from(this.component.el.querySelectorAll(this.sortableChildSelector));
	}
}