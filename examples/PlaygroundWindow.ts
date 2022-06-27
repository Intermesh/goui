import {win, Window} from "../script/component/Window.js";
import {form, Form} from "../script/component/form/Form.js";
import {fieldset} from "../script/component/form/Fieldset.js";
import {textfield, TextField} from "../script/component/form/TextField.js";
import {htmlfield} from "../script/component/form/HtmlField.js";
import {containerfield, ContainerField} from "../script/component/form/ContainerField.js";
import {cards} from "../script/component/CardContainer.js";
import {cardmenu} from "../script/component/CardMenu.js";
import {tbar} from "../script/component/Toolbar.js";
import {btn} from "../script/component/Button.js";
import {datefield} from "../script/component/form/DateField.js";
import {checkbox} from "../script/component/form/CheckboxField.js";
import {PlaygroundTable} from "./PlaygroundTable.js";
import {menu} from "../script/component/menu/Menu.js";

export const playgroundWin = () => {
	const playgroundWin = win({
			stateId: "playground-window",
			modal: false,
			title: "Window test",
			width: 800,
			height: 600,
			maximizable: true,
			listeners: {
				focus: (win) => {
					win.findChild("requiredField")!.focus();
				}
			}
		},

		cardmenu(),
		cards({flex: 1},
			form({
					itemId: "form",
					title: "Form",
					cls: "scroll fit",
					handler: (form) => {

						console.log(form.getValues());

						const sub = form.findField("sub") as ContainerField;
						const test1 = sub.findField("test1") as TextField;

						test1.setInvalid("Hey something went wrong!");
					}
				},

				fieldset({},

					textfield({
						itemId: "requiredField",
						label: "Required field",
						// placeholder: "Here's the placeholder",
						name: "test",
						required: true,
						hint: "Please fill in something awesome"
					}),

					datefield({
						label: "Date",
						name: "date"

					}),

					htmlfield({
						label: "Html",
						hint: "Attach files by dropping or pasting them",
						// cls: "frame-hint"
					}),

					containerfield({
							name: "sub"
						},
						textfield({
							label: "A freaking long stupid label",
							name: "test1",
						}),

						textfield({
							label: "Test 2",
							name: "test2",
						})
					),

					checkbox({
						label: "A checkbox label comes after",
						name: "checkbox"
					})
				)
			),

			new PlaygroundTable()
		),

		tbar({cls: "bottom"},

			btn({
				html: "Close",
				handler: (button) => {
					button.findAncestorByType(Window)!.close();
				}
			}),

			"->",

			btn({
				cls: "primary",
				html: "Save",
				handler: (button, ev) => {
					//button is not inside form so we have to do it programmatically
					button.findAncestorByType(Window)!.findChildByType(Form)!.submit();
				}
			}))
	);

	playgroundWin.getHeader().items.insert(
		-2,

		btn({
			text: "Menu",
			menu: menu({expandLeft: true},
				btn({
					text: "Mask window",
					handler: () => {
						playgroundWin.mask();
						setTimeout(() => {
							playgroundWin.unmask();
						}, 1000);
					}
				}),

				btn({
					text: "Mask form",
					handler: () => {
						const form = playgroundWin.findChild("form")!;
						form.show();

						form.mask();
						setTimeout(() => {
							form.unmask();
						}, 1000);
					}
				}),

				btn({
					text: "Mask table",
					handler: () => {
						const table = playgroundWin.findChild("table")!;
						table.show();

						table.mask();
						setTimeout(() => {
							table.unmask();
						}, 1000);
					}
				})
			)
		})
	);

	return playgroundWin;
};
