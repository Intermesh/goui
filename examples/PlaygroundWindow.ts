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
import {autocomplete} from "../script/component/form/AutocompleteField.js";
import {store, StoreRecord} from "../script/data/Store.js";
import {DateTime} from "../script/util/DateTime.js";
import {column, datecolumn, table} from "../script/component/Table.js";

export const playgroundWin = () => {

	const records:StoreRecord[] = [];

	for(let i = 1; i <= 20; i++) {
		records.push({
			description: "Test " + i,
			createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
		});
	}

	const autoCompleteStore = store({
		records: records,
		sort: [{property: "description", isAscending: true}]
	});



	const playgroundWin = win({
			stateId: "playground-window",
			modal: false,
			title: "Window test",
			width: 800,
			height: 600,
			maximizable: true
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

					autocomplete({
						label: "Autocomplete",
						name: "autocomplete",
						table: table({
							headers: false,
							store: autoCompleteStore,
							columns: [
								column({
									property: "description",
									sortable: true,
									resizable: true,
									width: 300
								})
							]
						})
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
