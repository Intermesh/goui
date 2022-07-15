import {PlaygroundTable} from "./PlaygroundTable.js";
import {btn, checkbox, colormenu, comp, menu, Notifier, root, router, tbar} from "../build/goui.js";


export const PlayGround = comp({cls: "vbox", id: "playground"},

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
					text: "Login",
					menu: menu({},
						btn({
							html: "Show",
							handler: async () => {
								const mods = await import("../script/api/Login.js");
								const login = new mods.Login();
								login.open();
							}
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
			menu: colormenu()
		}),

		comp({
			flex: 1
		}),

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

	new PlaygroundTable()
);

export const showWindow = () => {
	import("./PlaygroundWindow.js").then(mods => {
		const win = mods.playgroundWin();
		win.show();
		win.on('close', () => {
			router.setPath("playground");
		})
	})
}


