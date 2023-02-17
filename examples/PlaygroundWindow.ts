
import { PlaygroundTable } from "./PlaygroundTable.js";
import { cardmenu } from "@goui/component/CardMenu.js";
import { cards } from "@goui/component/CardContainer.js";
import { select } from "@goui/component/form/SelectField.js";
import { datefield } from "@goui/component/form/DateField.js";
import { ContainerField, containerfield } from "@goui/component/form/ContainerField.js";
import { autocomplete } from "@goui/component/form/AutocompleteField.js";
import { form, Form } from "@goui/component/form/Form.js";
import { fieldset } from "@goui/component/form/Fieldset.js";
import { TextField, textfield } from "@goui/component/form/TextField.js";
import { column } from "@goui/component/table/TableColumns.js";
import { tbar } from "@goui/component/Toolbar.js";
import { store, StoreRecord } from "@goui/data/Store.js";
import { menu } from "@goui/component/menu/Menu.js";
import { DateTime } from "@goui/util/DateTime.js";
import { Field } from "@goui/component/form/Field.js";
import { checkbox } from "@goui/component/form/CheckboxField.js";
import { htmlfield } from "@goui/component/form/HtmlField.js";
import { Window } from "@goui/component/Window.js";
import { btn } from "@goui/component/Button.js";
import { table } from "@goui/component/table/Table.js";
import {colorfield} from "@goui/component/form/ColorField.js";

export class PlayGroundWindow extends Window {

	constructor() {
		super();

		this.stateId = "playground-window";
		this.modal = false;
		this.title = "Window test";
		this.width = 800;
		this.height = 600;
		this.maximizable = true;


		// Create some records to use for the autocomplete store below
		const autocompleteRecords: StoreRecord[] = [];

		for (let i = 1; i <= 20; i++) {
			autocompleteRecords.push({
				id: i,
				description: "Test " + i,
				createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		this.items.add(

			cardmenu(),

			cards({ flex: 1 },
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

						colorfield({
							label: "Color",
							name: "color"
						}),

						select({
							label: "Select",
							name: "select",
							options: [
								{
									value: "1",
									name: "Option 1"
								},
								{
									value: "2",
									name: "Option 2"
								}
							]
						}),

						autocomplete({
							hint: "Type 'test' to autocomplete",
							required: true,
							label: "Autocomplete",
							name: "autocomplete",
							value: "id", // if omited the whole record will be the value.
							buttons: [
								btn({
									icon: "clear",
									type: "button",
									handler: (btn) => {
										(btn.parent!.parent! as Field).value = undefined;
									}
								})
							],
							listeners: {

								autocomplete: (field, text) => {

									//clone the array for filtering
									const filtered = autocompleteRecords.filter((r) => {
										// console.warn(r.description, text, r.description.indexOf(text))
										return !text || r.description.toLowerCase().indexOf(text.toLowerCase()) === 0;
									});

									//simple local filter on the store
									field.table.store.loadData(filtered, false)
								}
							},
							table: table({
								headers: false,
								store: store({
									sort: [{
										property: "description",
										isAscending: true
									}]
								}),

								columns: [
									column({
										id: "description",
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
								label: "Read Only",
								name: "readonly",
								readOnly: true,
								value: "This is read only"
							}),

							textfield({
								label: "Disabled",
								name: "disabled",
								disabled: true,
								value: "Disabled field"
							})
						),

						checkbox({
							label: "A checkbox label comes after",
							name: "checkbox"
						}),

						checkbox({
							label: "Checkbox type switch",
							name: "checkbox",
							type: "switch"
						})
					)
				),

				new PlaygroundTable()
			),

			tbar({ cls: "bottom" },

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

		this.getHeader().items.insert(
			-2,

			btn({
				text: "Menu",
				menu: menu({ expandLeft: true },
					btn({
						text: "Mask window",
						handler: () => {
							this.mask();
							setTimeout(() => {
								this.unmask();
							}, 1000);
						}
					}),

					btn({
						text: "Mask form",
						handler: () => {
							const form = this.findChild("form")!;
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
							const table = this.findChild("table")!;
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
	}
}
