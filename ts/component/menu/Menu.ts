import {Component} from "../Component.js";
import {Container, ContainerConfig} from "../Container.js";
import {root} from "../Root.js";
import {Button} from "../Button.js";
import {Observable} from "../Observable.js";

export interface MenuConfig<T extends Observable> extends ContainerConfig<T> {
	/**
	 * Expand menu's to the right
	 */
	expandLeft?: boolean

	removeOnClose?:boolean
}

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
export class Menu extends Container {

	protected baseCls = "go-menu fade-out";
	protected tagName = "ul" as keyof HTMLElementTagNameMap;
	protected expandLeft = false;
	public removeOnClose = true;

	public parentButton: Button|undefined;

	public static create<T extends typeof Observable>(this: T, config?: MenuConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	internalRender() {
		const el = super.internalRender()

		if (this.expandLeft) {
			el.classList.add("expand-left");
		}

		return el;
	}

	public isLeftExpanding() {
		return this.expandLeft;
	}

	/**
	 * Find the first menu in the tree of submenu's
	 */
	public findTopMenu():Menu {
		if(!this.parentButton || !(this.parentButton.parent instanceof Menu)) {
			return this;
		} else
		{
			return this.parentButton.parent.findTopMenu();
		}
	}

	protected renderItem(item: Component, refItem?: Component) {
		if(!refItem) {
			this.getEl().appendChild(this.wrapLI(item));
		} else {
			this.getEl().insertBefore(this.wrapLI(item), refItem.getEl());
		}
	}

	private wrapLI(item: Component) {
		const li = document.createElement("li");

		if(item instanceof Button) {
			item.on("click", () => {
				this.findTopMenu().close();
			});
		}

		item.render(li);

		return li;
	}

	/**
	 * Show menu at coordinates on the page
	 *
	 * @param coords
	 */
	showAt(coords:{ x: number, y: number } | MouseEvent) {
		this.getStyle().left = coords.x + "px";
		this.getStyle().top = coords.y + "px";

		if(!this.parent) {
			root.addItem(this);
		}

		this.show();

		//hide menu when clicked elsewhere
		root.getEl().addEventListener("mousedown", () => {
				this.close();
		}, {once:true});

		// stop clicks on menu from hiding menu
		this.getEl().addEventListener("mousedown", (ev) => {
			ev.stopPropagation();
		});
	}

	close()  {
		return this.removeOnClose ? this.remove() : this.hide();
	}


}