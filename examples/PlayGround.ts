import {PlaygroundTable} from "./PlaygroundTable.js";
import * as Goui from "../script/Goui.js"
import {Button, CheckboxField, Component, Menu, Toolbar, ColorMenu} from "../script/Generators.js";

export const PlayGround = Component ({cls : "vbox"},

			Toolbar({
				style: {
					backgroundColor: "#0277bd",
					color: "white"
				}
			},
				Button({
					text: "Menu",
					menu: Menu({},
						Button({
							text: "Window",
							handler: () => {
								Goui.router.goto("playground/window");
							}
						}),

						Button({
							text: "Alerts",
							menu: Menu({},
								Button({
									text: "Success",
									handler: () => {
										Goui.Notifier.success("That went super!")
									}
								}),

								Button({
									text: "Error",
									handler: () => {
										Goui.Notifier.error("That went wrong!")
									}
								}),

								Button({
									text: "Warning",
									handler: () => {
										Goui.Notifier.warning("Look out!")
									}
								}),

								Button({
									text: "Notice",
									handler: () => {
										Goui.Notifier.notice("Heads up.")
									}
								})
							)
						}),

						Button({
							text: "Mask 3s",
							handler: () => {
								Goui.root.mask();
								setTimeout(() => {
									Goui.root.unmask();
								}, 1000);
							}
						}),
						Component({
							tagName: "hr"
						}),

						Button({
							text: "Login",
							menu: Menu({},
								Button({
									html: "Show",
									handler: async () => {
										const mods = await import("../script/api/Login.js");
										const login = mods.Login.create();
										login.open();
									}
								}),

								Button({
									text: "Test 2.2",
									menu: Menu({},
										Button({
											html: "Test 2.2.1"
										}),
										Button({
											html: "Test 2.2.2"
										})
									)
								}),
								Button({
									text: "Test 2.3"
								})
							)
						}),

						CheckboxField({
							label: "Checkbox menu item 1",
							name: "checkbox1",
							value: true
						}),

						CheckboxField({
							label: "Checkbox menu item 2",
							name: "checkbox2",
							value: true
						}),

						Button({
							text: "And a button",

						})
						)
				}),

				Button({
					text: "Color",
					menu: ColorMenu()
				}),

				Component({
					flex: 1
				}),

				Button({
					icon: "menu",
					menu: Menu({
						expandLeft: true,
					},
						Button({
							text: "Item 1"
						}),
						Button({
							text: "Item 2"
						}),
						Button({
							text: "Item 3",
							menu: Menu({},
								Button({
									text: "Item 3.1"
								}),
								Button({
									text: "Item 3.2"
								})
							)
						})
					)
				})
			),

			PlaygroundTable.create({
				cls: "fit"
			})
);

export const showWindow = () =>
{
	import("./PlaygroundWindow.js").then(mods => {
		const win = mods.PlaygroundWindow.create();

		win.show();
		win.on('close', () => {
			Goui.router.setPath("playground");
		})
	})
}


