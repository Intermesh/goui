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
	private currentGhost:HTMLElement|undefined;
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

			this.currentGhost = this.createGhost(e.target);
			this.dragSrc = e.target;

			e.dataTransfer!.setData('text/plain', 'goui');
			e.dataTransfer!.effectAllowed = "move";

			setTimeout(() => {
				e.target.classList.add("drag-src");
			})

			this.fromIndex = this.findSortables().indexOf(e.target);
		})

		container.on("drop", (e)=> {

			// e.preventDefault();
			//
			// this.toIndex = Array.from(this.container.childNodes).indexOf(this.currentGhost!);
			//
			// if(this.toIndex > this.fromIndex!) {
			// 	// original el is still there so take it off
			// 	this.toIndex--;
			// }
			//
			// this.currentGhost!.remove();
			// this.currentGhost = undefined;
			//
			// this.dragSrc!.classList.remove("drag-src");
			//
			// this.fire("sort", this.fromIndex!, this.toIndex);
		})

		container.on("dragover", (e) => {
			e.preventDefault()
			const overEl = e.target.closest(this.sortableChildSelector) as HTMLElement;

			if(overEl) {
				const rect = overEl.getBoundingClientRect();
				const after = e.y > rect.y + (rect.height / 2);

				if(after) {
					container.insertBefore(this.currentGhost!, overEl.nextSibling);
				} else {
					container.insertBefore(this.currentGhost!, overEl);
				}
			}
		})
	}

	private findSortables() {
		return Array.from(this.container.querySelectorAll(this.sortableChildSelector));
	}

	private createGhost (el:HTMLElement){
		const ghost = document.createElement("div");
		ghost.classList.add("drag-ghost")
		ghost.style.height = el.offsetHeight + "px";
		ghost.style.width = el.offsetWidth + "px";

		return ghost;
	};
}