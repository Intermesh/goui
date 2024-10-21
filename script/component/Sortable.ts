import {Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "./Observable.js";
import {comp, Component} from "./Component.js";
import {root} from "./Root.js";
import HTML = Mocha.reporters.HTML;

export interface SortableEventMap<Type> extends ObservableEventMap<Type> {

	/**
	 * Fires when the items are sorted
	 *
	 * @param dropComp The component the element was dropped on
	 * @param fromIndex Move from index
	 * @param toIndex To index
	 * @param droppedOn Dropped on the toIndex or moved to this index
	 * @param dragComp The component the element was dragged from if "group" is used to drop to other components
	 */
	sort: (dropComp:Type, fromIndex:number, toIndex:number, droppedOn: boolean, dragComp:Component) => void
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
	group: string,
	component: Component
}

const dragData: DragData = {
	dragSrc: undefined,
	pos: "before",
  overEl: undefined,
	fromIndex: -1,
	group:"",
	component: root
}

const dropPin = comp({
	cls: "drop-pin",
	hidden: true
})

root.items.add(dropPin);
/**
 * Enables sorting of child elements inside a container
 */
export class Sortable<Type extends Component> extends Observable {

	private fromIndex:number | undefined;
	private static groupIndex = 0;

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
	private _gap: number|undefined;



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
				this.group = "sortable-" + Sortable.groupIndex++;
			}

			dragData.group = this.group;
			dragData.dragSrc = e.target;
			dragData.component = this.component;

			e.dataTransfer!.setData('text/plain', 'goui');
			e.dataTransfer!.effectAllowed = "copyMove";
			e.target.classList.add("drag-src");

			dragData.fromIndex = this.findSortables().indexOf(e.target);
		})

		component.el.on("drop", (e)=> {
			e.preventDefault();
			this.endDrag();
		})

		component.el.on("dragend", (e)=> {
			e.preventDefault();
			this.endDrag();
		})

		component.el.on("dragover", (e) => {

			if(dragData.group != this.group) {
				return;
			}
			e.preventDefault()
			dragData.overEl = e.target.closest(this.sortableChildSelector) as HTMLElement;

			if(dragData.overEl) {
				const rect = dragData.overEl.getBoundingClientRect();

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
						e.dataTransfer!.dropEffect = "move";
						dropPin.hidden = false;
						dropPin.el.style.top = (rect.y - this.gap()) + "px";
						dropPin.el.style.left = rect.x + "px";
						dropPin.el.style.width = rect.width + "px";
						break;

					case "on":
						e.dataTransfer!.dropEffect = "copy";
						dropPin.hidden = true;

						break;

					case "after":
						e.dataTransfer!.dropEffect = "move";
						dropPin.hidden = false;
						dropPin.el.style.top = (rect.y + rect.height + this.gap()) + "px";
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

	/**
	 * Calculates the gap between two rows to place the drop pin between them
	 *
	 * @private
	 */
	private gap() {

		if(this._gap !== undefined) {
			return this._gap;
		}
		const s = this.findSortables();

		if(s.length < 2) {
			this._gap = 0;
			return this._gap;
		}

		const r1 = s[0].getBoundingClientRect(), r2 = s[1].getBoundingClientRect();

		this._gap = (r2.y - r1.y - r1.height) / 2;

		return this._gap;
	}
	private endDrag() {

		if(!dragData.dragSrc || dragData.group != this.group){
			return;
		}

		dropPin.hidden = true;

		let toIndex = 0;

		if(dragData.overEl) {
			toIndex = this.findSortables().indexOf(dragData.overEl);

			switch (dragData.pos) {
				case "before":
					dragData.overEl.parentNode!.insertBefore(dragData.dragSrc!, dragData.overEl);
					break;

				case "on":
					dragData.dragSrc!.parentNode!.removeChild(dragData.dragSrc!);
					break;

				case "after":
					dragData.overEl.parentNode!.insertBefore(dragData.dragSrc!, dragData.overEl.nextSibling);
					toIndex++;
					break;
			}
		}

		dragData.dragSrc!.classList.remove("drag-src");
		dragData.dragSrc = undefined;

		this.fire("sort", this.component, dragData.fromIndex!, toIndex, dragData.pos == "on", dragData.component);
	}

	private findSortables() {
		return Array.from(this.component.el.querySelectorAll(this.sortableChildSelector));
	}
}