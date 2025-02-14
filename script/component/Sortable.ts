import {Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "./Observable.js";
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

export interface SortableEventMap<Type> extends ObservableEventMap<Type> {

	/**
	 * Fires when the items are sorted
	 *
	 * @param dropComp The component the element was dropped on
	 * @param fromIndex Move from index
	 * @param toIndex To index
	 * @param droppedOn Dropped on the toIndex or moved to this index
	 * @param fromComp The component the element was dragged from if "group" is used to drop to other components
	 * @param dragDataSet Arbitrary data set to dragData in dragstart event
	 */
	sort: (dropComp:Type, toIndex:number, fromIndex:number, droppedOn: boolean, fromComp:Component, dragDataSet:Record<string, any>) => void,

	/**
	 * Fires when the items are dragged over this sortable.
	 *
	 * Return false to disallow dropping
	 *
	 * @param dropComp The component the element was dropped on
	 * @param fromIndex Move from index
	 * @param toIndex To index
	 * @param droppedOn Dropped on the toIndex or moved to this index
	 * @param fromComp The component the element was dragged from if "group" is used to drop to other components
	 */
	dropallowed: (dropComp:Type, toIndex:number, fromIndex:number, droppedOn: boolean, fromComp:Component, dragDataSet:Record<string, any>) => void,

	/**
	 * Fires when dragging starts.
	 *
	 * You can set a component to show instead of a copy of the drag source:
	 *
	 * ev.setDragComponent(comp({cls: "card pad", html: this.rowSelect.selected.length + " selected rows"}))
	 *
	 * @param sortable
	 * @param ev
	 */
	dragstart: (sortable:Sortable<any>, ev:SortableDragEvent, dragData:DragData) => void

	dragend: (sortable:Sortable<any>, ev:DragEvent, dragData:DragData) => void
}

export interface Sortable<Type extends Component> {
	on<K extends keyof SortableEventMap<Type>, L extends Listener>(eventName: K, listener: Partial<SortableEventMap<Type>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof SortableEventMap<Type>>(eventName: K, listener: Partial<SortableEventMap<Type>>[K]): boolean
	fire<K extends keyof SortableEventMap<Type>>(eventName: K, ...args: Parameters<SortableEventMap<any>[K]>): boolean
}
type DROP_POSITION = "before" | "after" | "on";


type DragData = {
	dragSrc:HTMLElement|undefined
	pos:DROP_POSITION
	overEl: HTMLElement|undefined,
	fromIndex: number,
	toIndex: number,
	group: string,
	fromComponent: Component
	toComponent: Component
	dataSet: Record<string, any>
}

const dragData: DragData = {
	dragSrc: undefined,
	pos: "before",
  overEl: undefined,
	fromIndex: -1,
	toIndex: -1,
	group:"",
	fromComponent: root,
	toComponent: root,
	dataSet: {}
}


/**
 * Enables sorting of child elements inside a container
 */
export class Sortable<Type extends Component> extends Observable {

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
		let index = 0, curr: Element | null = sortableItem;

		while((curr = curr.previousElementSibling)) {
			if(curr.matches(this.sortableChildSelector)) {
				index++;
			}
		}

		return index;
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
			e.stopPropagation();

			// had to add this class because otherwise dragleave fires immediately on child nodes: https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
			root.el.cls("+dragging");

			dragData.group = this.group;
			dragData.dragSrc = e.target;
			dragData.fromComponent = this.component;
			dragData.toComponent = this.component;

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

			this.fire("dragstart", this, ev, dragData);

		})

		component.el.on("drop", (e)=> {
			e.preventDefault();
			e.stopPropagation();
			this.endDrag(e);
		})

		component.el.on("dragend", (e)=> {
			e.preventDefault();
			e.stopPropagation();
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

			dragData.toComponent = component;

			if(dragData.overEl) {

				const rect = dragData.overEl.getBoundingClientRect();
				// console.log(dragData.overEl, rect);
				if(this.dropBetween) {
					const betweenZone = this.dropOn ? 10 : rect.height / 2;
					dragData.pos = "before";
					if(e.y > rect.y + betweenZone)
					{
						dragData.pos = "on";
					}

					if(e.y > rect.y + rect.height - betweenZone) {
						dragData.pos = "after";
					}
				} else {
					dragData.pos = "on";
				}

				switch(dragData.pos) {
					case "before":
						e.preventDefault();
						e.stopPropagation();
						e.dataTransfer!.dropEffect = "move";
						dropPin.hidden = false;
						dropPin.el.style.top = (rect.y - this.gap(dragData.overEl)) + "px";
						dropPin.el.style.left = rect.x + "px";
						dropPin.el.style.width = rect.width + "px";
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
						dropPin.el.style.top = (rect.y + rect.height + this.gap(dragData.overEl)) + "px";
						dropPin.el.style.left = rect.x + "px";
						dropPin.el.style.width = rect.width + "px";

						break;
				}
			} else {
				dropPin.hidden = true;
				e.dataTransfer!.dropEffect = "copy";
			}

		})
	}

	private dropAllowed() {

		if(dragData.overEl) {

			if (dragData.dragSrc!.contains(dragData.overEl)) {
				return false;
			}

			dragData.toIndex = this.findIndex(dragData.overEl);
			if (dragData.pos == "after") {
				dragData.toIndex++;
			}
		} else {
			dragData.toIndex = 0;
		}

		return this.fire("dropallowed", dragData.toComponent, dragData.toIndex, dragData.fromIndex, dragData.pos == "on", dragData.fromComponent, dragData.dataSet);

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

		const item2 = item.nextElementSibling ?? item.previousElementSibling;
		if(item2 === null) {
			return 0;
		}

		const r1 = item.getBoundingClientRect(), r2 = item2.getBoundingClientRect();

		this._gap = (Math.max(r2.y, r1.y) - Math.min(r1.y, r2.y) - r1.height) / 2;

		return this._gap;
	}

	private endDrag(e:DragEvent) {

		if(!dragData.dragSrc) {

			this.fire("dragend", this, e, dragData);
			return;
		}

		dragData.dragSrc!.classList.remove("drag-src");

		root.el.cls("-dragging");

		if((!this.dropOn && !this.dropBetween) || dragData.group != this.group || !this.dropAllowed()) {
			dragData.dragSrc = undefined;
			this.fire("dragend", this, e, dragData);
			return;
		}

		Sortable.getDropPin().hidden = true;

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


		this.fire("sort", dragData.toComponent, dragData.toIndex, dragData.fromIndex, dragData.pos == "on", dragData.fromComponent, dragData.dataSet);
		this.fire("dragend", this, e, dragData);
	}

	private findSortables() {
		return Array.from(this.component.el.querySelectorAll(this.sortableChildSelector));
	}
}