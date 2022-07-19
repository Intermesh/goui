import {Component, Config, createComponent} from "../Component.js";
import {root} from "../Root.js";
import {Button} from "../Button.js";


/**
 * Menu class
 *
 * @example
 * ```typescript
 * Button.create({
 *    html: "Menu",
 *    menu: Menu.create({
 *        expandLeft: true,
 *        items: [
 *            Button.create({
 *                text: "Test 1"
 *            }),
 *            Component.create({
 *                tagName: "hr"
 *            }),
 *
 *            CheckboxField.create({
 * 							label: "Checkbox menu item 1",
 * 							name: "checkbox1",
 * 							value: true,
 * 							hideLabel: true
 * 						}),
 *
 * 						CheckboxField.create({
 * 							label: "Checkbox menu item 2",
 * 							name: "checkbox2",
 * 							value: true,
 * 							hideLabel: true
 * 						}),
 *
 * 				    Component.create({
 *                tagName: "hr"
 *            }),
 *
 *            Button.create({
 *                text: "Test 2",
 *                menu: Menu.create({
 *
 *                    items: [
 *                        Button.create({
 *                            html: "Test 2.1"
 *                        }),
 *                        Button.create({
 *                            html: "Test 2.2",
 *                            menu: Menu.create({
 *
 *                                items: [
 *                                    Button.create({
 *                                        html: "Test 2.2.1"
 *                                    }),
 *                                    Button.create({
 *                                        html: "Test 2.2.2"
 *                                    }),
 *                                ]
 *                            })
 *                        }),
 *                        Button.create({
 *                            html: "Test 2.3"
 *                        }),
 *                    ]
 *                })
 *            }),
 *
 *
 *        ]
 *    })
 * })
 * ```
 */
export class Menu extends Component {

	constructor() {
		super("menu");
	}

	protected baseCls = "dropdown fade-out";

	/**
	 * Remove menu when closed
	 */
	public removeOnClose = true;

	/**
	 * The button this menu belongs to
	 */
	public parentButton: Button | undefined;

	/**
	 * Is true when any menu is visible
	 */
	public static openedMenu?: Menu;

	protected internalRender() {
		const el = super.internalRender()

		if (this.expandLeft) {
			el.classList.add("expand-left");
		}

		return el;
	}

	set expandLeft(expandLeft: boolean) {
		this.el.classList.add("expand-left");
	}

	get expandLeft() {
		return this.el.classList.contains("expand-left");
	}

	protected renderItem(item: Component, refItem?: Component) {
		if (!refItem) {
			this.el.appendChild(this.wrapLI(item));
		} else {
			this.el.insertBefore(this.wrapLI(item), refItem.el);
		}
	}

	private wrapLI(item: Component) {
		const li = document.createElement("li");

		item.render(li);

		return li;
	}

	/**
	 * Show menu at coordinates on the page
	 *
	 * @param coords
	 */
	showAt(coords: { x: number, y: number } | MouseEvent) {
		this.el.style.left = coords.x + "px";
		this.el.style.top = coords.y + "px";

		if (!this.parent) {
			root.items.add(this);
		}

		this.show();
		Menu.openedMenu = this;

		//hide menu when clicked elsewhere
		window.addEventListener("mousedown", (ev) => {
			this.close();
		}, {once: true});

		// stop clicks on menu from hiding menu
		this.el.addEventListener("mousedown", (ev) => {
			ev.stopPropagation();
		});
	}

	public close() {
		if (Menu.openedMenu == this) {
			Menu.openedMenu = undefined;
		}
		return this.removeOnClose ? this.remove() : this.hide();
	}

}

/**
 * Shorthand function to create {@see Menu}
 *
 * @param config
 * @param items
 */
export const menu = (config?: Config<Menu>, ...items: Component[]) => createComponent(new Menu(), config, items);
