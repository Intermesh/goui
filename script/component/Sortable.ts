import {Listener, Observable, ObservableEventMap, ObservableListenerOpts} from "./Observable.js";

export interface SortableEventMap<Type> extends ObservableEventMap<Type> {

	/**
	 * Fires when the items are sorted
	 *
	 * @param fromIndex
	 * @param toIndex
	 */
	sort: (fromIndex:number, toIndex:number) => void
}

export interface Sortable {
	on<K extends keyof SortableEventMap<this>, L extends Listener>(eventName: K, listener: Partial<SortableEventMap<this>>[K], options?: ObservableListenerOpts): L;
	un<K extends keyof SortableEventMap<this>>(eventName: K, listener: Partial<SortableEventMap<this>>[K]): boolean
	fire<K extends keyof SortableEventMap<this>>(eventName: K, ...args: Parameters<SortableEventMap<any>[K]>): boolean
}

/**
 * Enables sorting of child elements inside a container
 */
export class Sortable extends Observable {

	private fromIndex:number | undefined;
	private toIndex:number | undefined;
	private dragSrc:HTMLElement|undefined;

	/**
	 * Constructor
	 *
	 * @param container The container where the sortables are inside
	 * @param sortableChildSelector CSS selector to find the sortables. For example a css class ".sortable-item".
	 */
	constructor(private container:HTMLElement, private sortableChildSelector:string) {
		super();

		container.on("dragstart", (e)=> {
			this.dragSrc = e.target;

			e.dataTransfer!.setData('text/plain', 'goui');
			e.dataTransfer!.effectAllowed = "move";
			e.target.classList.add("drag-src");
			this.fromIndex = this.findSortables().indexOf(e.target);
		})

		container.on("drop", (e)=> {
			e.preventDefault();
			this.endDrag();
		})

		container.on("dragend", (e)=> {
			e.preventDefault();
			this.endDrag();
		})

		container.on("dragover", (e) => {
			e.preventDefault()
			const overEl = e.target.closest(this.sortableChildSelector) as HTMLElement;

			if(overEl) {
				const rect = overEl.getBoundingClientRect();
				const after = e.y > rect.y + (rect.height / 2);

				if(after) {
					container.insertBefore(this.dragSrc!, overEl.nextSibling);
				} else {
					container.insertBefore(this.dragSrc!, overEl);
				}
			}
		})
	}
	private endDrag() {
		this.toIndex = this.findSortables().indexOf(this.dragSrc!);
		this.dragSrc!.classList.remove("drag-src");
		this.dragSrc = undefined;

		this.fire("sort", this.fromIndex!, this.toIndex);
	}

	private findSortables() {
		return Array.from(this.container.querySelectorAll(this.sortableChildSelector));
	}
}