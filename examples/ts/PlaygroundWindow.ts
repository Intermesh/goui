import {Window} from "../../dist/component/Window.js";
import {DateColumn, Table} from "../../dist/component/Table.js";
import {Store, StoreRecord} from "../../dist/data/Store.js";
import {Form} from "../../dist/component/form/Form.js";
import {Fieldset} from "../../dist/component/form/Fieldset.js";
import {TextField} from "../../dist/component/form/TextField.js";
import {HtmlField} from "../../dist/component/form/HtmlField.js";
import {ContainerField} from "../../dist/component/form/ContainerField.js";
import {CardContainer} from "../../dist/component/CardContainer.js";
import {CardMenu} from "../../dist/component/CardMenu.js";
import {Toolbar} from "../../dist/component/Toolbar.js";
import {Button} from "../../dist/component/Button.js";
import {Component} from "../../dist/component/Component.js";
import {DateField} from "../../dist/component/form/DateField.js";
import {CheckboxField} from "../../dist/component/form/CheckboxField.js";
import {Menu} from "../../dist/component/menu/Menu.js";
import {DateTime} from "../../dist/util/DateTime.js";

export class PlaygroundWindow extends Window {
	stateId = "playground-window"
	modal = false
	title = "Window test"
	width = 800
	height = 600
	maximizable = true

	focus(o?: FocusOptions) {
		//focus card panel, card panel will focus active item
		this.getItems().get(1)!.focus(o);
	}


	protected init() {
		super.init();

		this.getHeader().getItems().insert(PlaygroundWindow.createHeaderMenu(), -2);

		const records:StoreRecord[] = [];

		for(let i = 1; i <= 20; i++) {
			records.push({
				number: i,
				description: "Test " + i,
				createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		const table = Table.create({
			title: "Table",
			store: Store.create({
				records: records,
				sort: [{property: "number", isAscending: true}]
			}),
			cls: "fit",
			columns: [
				{
					header: "Number",
					property: "number",
					sortable: true,
					resizable: true,
					width: 200
				},
				{
					header: "Description",
					property: "description",
					sortable: true,
					resizable: true,
					width: 300
				},
				DateColumn.create({
					header: "Created At",
					property: "createdAt",
					sortable: true
				})
				]
		});

		const form = Form.create({
			title: "Form",
			cls: "scroll fit",
			handler: () => {

				console.log(form.getValues());

				const sub = <ContainerField>form.findField("sub");
				const test1 = <TextField>sub.findField("test1");
				test1.setInvalid("Hey something went wrong!");
			},
			items: [
				Fieldset.create({
					items: [
						TextField.create({
							label: "Required field",
							// placeholder: "Here's the placeholder",
							name: "test",
							required: true,
							hint: "Please fill in something awesome"
						}),
						DateField.create({
							label: "Date",
							name: "date"

						}),
						HtmlField.create({
							label: "Html",
							hint: "Attach files by dropping or pasting them",
							// cls: "frame-hint"
						}),
						ContainerField.create({
							name: "sub",
							items: [
								TextField.create({
									label: "A freaking long stupid label",
									name: "test1",
								}),
								TextField.create({
									label: "Test 2",
									name: "test2",
								}),
							]
						}),
						CheckboxField.create({
							label: "A checkbox label comes after",
							name: "checkbox"
						})
					]
				})
			]
		})

		const cards = CardContainer.create({
			flex: 1,
			items: [form, table]
		})

		this.getItems().replace([

			CardMenu.create({
				cardContainer: cards
			}),

			cards,

			Toolbar.create({
				cls: "bottom",
				items: [
					Button.create({
						html: "Close",
						handler: () => {
							this.close();
						}
					}),

					Component.create({
						flex: 1
					}),
					Button.create({
						cls: "primary",
						html: "Save",
						handler: () => {
							form.submit();
						}
					})


				]
			})
		]);

	}

	private static createHeaderMenu() {
		const items = [];
		for(let i = 0; i < 10; i++) {
			items.push(Button.create({
				html: "Button " + i
			}))
		}
		return Button.create({
			text: "Menu",
			menu: Menu.create({
				expandLeft: true,
				items: items
			})
		});
	}

}