import {Component} from "../script/component/Component.js";
import {Toolbar} from "../script/component/Toolbar.js";
import {Button} from "../script/component/Button.js";
import {Menu} from "../script/component/menu/Menu.js";
import {CheckboxField} from "../script/component/form/CheckboxField.js";
import {ColorMenu} from "../script/component/menu/ColorMenu.js";
import {Window} from "../script/component/Window.js";
import {router} from "../script/Router.js";
import {Notifier} from "../script/Notifier.js";
import {PlaygroundTable} from "./PlaygroundTable.js";
import {root} from "../script/component/Root.js";


export class PlayGround extends Component {

	protected cls = "vbox"

	protected init() {

		this.getItems().add(
			Toolbar.create({
			style: {
				backgroundColor: "#0277bd",
				color: "white"
			},
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
								text: "Alerts",
								menu: Menu.create({
									// expandLeft: true,
									items: [
										Button.create({
											text: "Success",
											handler: () => {
												Notifier.success("That went super!")
											}
										}),

										Button.create({
											text: "Error",
											handler: () => {
												Notifier.error("That went wrong!")
											}
										}),

										Button.create({
											text: "Warning",
											handler: () => {
												Notifier.warning("Look out!")
											}
										}),

										Button.create({
											text: "Notice",
											handler: () => {
												Notifier.notice("Heads up.")
											}
										})
									]
								})
							}),

							Button.create({
								text: "Mask 3s",
								handler: () => {
									root.mask();
									setTimeout(() => {
										root.unmask();
									}, 1000);
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
												import("../script/api/Login.js").then(mods => {
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
					icon: "menu",
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
		}));

		this.getItems().add(

					PlaygroundTable.create({
						cls: "fit"
					})

			);

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