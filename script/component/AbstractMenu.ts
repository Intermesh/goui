import {Component, ComponentEventMap} from "./Component";
import {Button} from "./Button";
import {Menu} from "./menu";


export abstract class AbstractMenu<EventMap extends ComponentEventMap = ComponentEventMap> extends Component<EventMap> {
	/**
	 * Used by keyboard nav
	 * 
	 * @protected
	 */
	protected orientation = "horizontal";

	constructor() {
		super("menu");
		this.setupKeyboardNav();
	}

	/**
	 * Is set to the menu currently open. There can only be one dropdown open at the same time
	 */
	public openedMenu?:Menu;

	private focusedItemIndex = -1;

	/**
	 * Automatically focus the first element.
	 *
	 * This does not actually focus it but makes it appear selected. Used in the HtmlFieldMentionPLugin
	 *
	 * @param v
	 */
	public set autoFocusFirst(v:boolean) {
		if(v) {
			this.el.classList.add("highlight-first");
			this.on("show", () => {
				this.focusedItemIndex = 1;
			});
		}
	}

	public get autoFocusFirst() {
		return this.el.classList.contains("highligh-first");
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	private findToolbar(): AbstractMenu | undefined {

		let parent = this.parent;

		if (!parent || !(parent instanceof AbstractMenu)) {
			return undefined;
		}

		if (parent.orientation == "horizontal") {
			return parent;
		} else {
			return parent.findToolbar();
		}

	}

	private setupKeyboardNav() {

		this.items.on("add", ({item, index}) => {

			item.el.addEventListener("click", () => {
				this.focusedItemIndex = index;
			})

		})


		this.on("hide", () => {
			this.focusedItemIndex = -1;
		})

		this.el.addEventListener('keydown', (ev) => {


			switch ((ev as KeyboardEvent).key) {
				case 'ArrowRight':
					if (this.orientation == "vertical") {
						if (!this.focusChild()) {
							const tb = this.findToolbar();
							if (tb) {
								tb.focusNext();
							}
						}
					} else {
						this.focusNext();
					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;
				case 'ArrowDown':
					if (this.orientation == "vertical") {
						this.focusNext();
					} else {
						this.focusChild();

					}
					//ev.stopPropagation();
					ev.preventDefault();
					break;

				case 'ArrowLeft':
					if (this.orientation == "vertical") {

						if (!this.focusParent()) {
							const tb = this.findToolbar();
							if (tb) {
								tb.focusNext(-1);
							}
						}
					} else {
						this.focusNext(-1);

					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;

				case 'ArrowUp':
					if (this.orientation == "vertical") {
						this.focusNext(-1);
					} else {
						this.focusParent();

					}
					// ev.stopPropagation();
					ev.preventDefault();
					break;
			}
		});
	}

	public focusNext(inc = 1): boolean {

		console.log(this.focusedItemIndex);
		const nextIndex = this.focusedItemIndex + inc;

		this.focusedItemIndex = Math.min(Math.max(nextIndex, 0), this.items.count() - 1);

		if (nextIndex != this.focusedItemIndex) {
			return false;
		}

		const cmp = this.items.get(this.focusedItemIndex)!;
		if (!cmp.isFocusable()) {
			return this.focusNext(inc);
		} else {
			cmp.focus();
			if (this.orientation == 'horizontal') {
				cmp.el.click();
			}
			return true;
		}
	}

	private focusChild() {
		const child = this.items.get(this.focusedItemIndex) as Button;
		if (!child || !child.menu) {
			return false;
		}

		child.menu.focusNext();
		return true;
	}

	private focusParent() {
		const child = this.items.get(this.focusedItemIndex) as Button;
		if (!child) {
			return false;
		}

		if(child.parent) {
			child.parent.focus();
		}

		return true;
	}

	public focus(o?: FocusOptions) {
		console.log(this.focusedItemIndex);
		if (this.focusedItemIndex > -1) {
			this.items.get(this.focusedItemIndex)!.focus();
		} else {
			const i = this.items.get(0);

			if(i) {
				this.focusedItemIndex = 0;
				i.focus(o);
			}
		}
	}
}