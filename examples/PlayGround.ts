import { tbar } from "@goui/component/Toolbar.js";
import { btn } from "@goui/component/Button.js";
import {Menu, menu} from "@goui/component/menu/Menu.js";
import { router } from "@goui/Router.js";
import { root } from "@goui/component/Root.js";
import { checkbox } from "@goui/component/form/CheckboxField.js";
import { Notifier } from "@goui/Notifier.js";
import { colormenu } from "@goui/component/menu/ColorMenu.js";
import { PlaygroundTablePanel } from "./PlayGroundTablePanel.js";
import { PlayGroundWindow } from "./PlaygroundWindow.js";
import {comp, Component} from "@goui/component/Component.js";
import {colorpicker} from "@goui/component/picker/ColorPicker.js";


export class PlayGround extends Component {

	constructor() {
		super();

		this.cls = "vbox light-bg";
		this.id = "playground";

		this.items.add(
			tbar({
				style: {
					backgroundColor: "#0277bd",
					color: "white"
				}
			},
				btn({
					text: "Menu",
					menu: menu({},
						btn({
							text: "Window",
							handler: () => {
								router.goto("playground/window");
							}
						}),

						btn({
							text: "Alerts",
							menu: menu({},
								btn({
									text: "Success",
									handler: () => {
										Notifier.success("That went super!")
									}
								}),

								btn({
									text: "Error",
									handler: () => {
										Notifier.error("That went wrong!")
									}
								}),

								btn({
									text: "Warning",
									handler: () => {
										Notifier.warning("Look out!")
									}
								}),

								btn({
									text: "Notice",
									handler: () => {
										Notifier.notice("Heads up.")
									}
								})
							)
						}),

						btn({
							text: "Mask 3s",
							handler: () => {
								root.mask();
								setTimeout(() => {
									root.unmask();
								}, 1000);
							}
						}),
						comp({
							tagName: "hr"
						}),

						btn({
							text: "Test",
							menu: menu({},
								btn({
									html: "Test 1.1"
								}),

								btn({
									text: "Test 2.2",
									menu: menu({},
										btn({
											html: "Test 2.2.1"
										}),
										btn({
											html: "Test 2.2.2"
										})
									)
								}),
								btn({
									text: "Test 2.3"
								})
							)
						}),

						checkbox({
							label: "Checkbox menu item 1",
							name: "checkbox1",
							value: true
						}),

						checkbox({
							label: "Checkbox menu item 2",
							name: "checkbox2",
							value: true
						}),

						btn({
							text: "And a button",

						})
					)
				}),

				btn({
					text: "Color",
					menu: menu({}, colorpicker({
						listeners: {
							select:(colorPicker, color) => {
								const menu = (colorPicker.parent as Menu);
								menu.parentButton!.el.style.color = "#" + color;
								menu.hide();
							}
						}
					}))
				}),

				"->",

				btn({
					icon: "menu",
					menu: menu({
						expandLeft: true,
					},
						btn({
							text: "Item 1"
						}),
						btn({
							text: "Item 2"
						}),
						btn({
							text: "Item 3",
							menu: menu({},
								btn({
									text: "Item 3.1"
								}),
								btn({
									text: "Item 3.2"
								})
							)
						})
					)
				})
			),

			new PlaygroundTablePanel()
		)
	}

	public showWindow() {
		const win = new PlayGroundWindow();
		win.show();
		win.on('close', () => {
			router.setPath("playground");
		})
	}
}
