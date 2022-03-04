import {Component} from "../../dist/component/Component.js";
import {Container} from "../../dist/component/Container.js";
import {Toolbar} from "../../dist/component/Toolbar.js";
import {Button} from "../../dist/component/Button.js";
import {Menu} from "../../dist/component/menu/Menu.js";
import {CheckboxField} from "../../dist/component/form/CheckboxField.js";
import {ColorMenu} from "../../dist/component/menu/ColorMenu.js";
import {Window} from "../../dist/component/Window.js";
import {router} from "../../dist/Router.js";

export class PlayGround extends Container {

	protected cls = "go-frame go-scroll"

	protected init() {

		router.add(/playground\/window/, () => {
			this.showWindow();
		});

		this.addItem(Toolbar.create({
			items: [
				Button.create({
					text: "Menu",
					menu: Menu.create({
						// expandLeft: true,
						items: [
							Button.create({

								text: "Window",
								handler: () => {
									router.goto("playground/window");

								}
							}),
							Button.create({
								text: "Teun",
								handler: () => {
									Window.create({
										title: "Hoi Teun",
										items: [Component.create({tagName:"h1", cls:"go-pad", html: "Jij moet naar bed!"})]
									}).show();
								}
							}),
							Component.create({
								tagName: "hr"
							}),

							Button.create({
								text: "Login",
								menu: Menu.create({

									items: [
										Button.create({
											html: "Show",
											handler: () => {
												import("../../dist/api/Login.js").then(mods => {
													const login = mods.Login.create();
													login.open();
												})
											}
										}),
										Button.create({
											text: "Test 2.2",
											menu: Menu.create({

												items: [
													Button.create({
														html: "Test 2.2.1"
													}),
													Button.create({
														html: "Test 2.2.2"
													}),
												]
											})
										}),
										Button.create({
											text: "Test 2.3"
										}),
									]
								})
							}),

							CheckboxField.create({
								label: "Checkbox menu item 1",
								name: "checkbox1",
								value: true
							}),

							CheckboxField.create({
								label: "Checkbox menu item 2",
								name: "checkbox2",
								value: true
							}),

							Button.create({

								text: "And a button",

							})


						]
					})
				}),

				Button.create({
					text: "Color",
					menu: ColorMenu.create()
				}),

				Component.create({
					flex: 1
				}),

				Button.create({
					text: "Expand on the left",
					menu: Menu.create({
						expandLeft: true,
						items: [
							Button.create({
								text: "Item 1"
							}),
							Button.create({
								text: "Item 2"
							}),
							Button.create({
								text: "Item 3",
								menu: Menu.create({
									items: [
										Button.create({
											text: "Item 3.1"
										}),
										Button.create({
											text: "Item 3.2"
										})
									]
								})
							})
						]
					})
				})

			]
		}))

		super.init();
	}

	showWindow() {

		import("./PlaygroundWindow.js").then(mods => {
			const win = mods.PlaygroundWindow.create();

			win.show();
			win.on('close', () => {
				router.setPath("playground");
			})
		})


	}
}