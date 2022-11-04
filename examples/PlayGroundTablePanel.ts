import {btn} from "@goui/component/Button.js";
import {Component} from "@goui/component/Component.js";
import {tbar} from "@goui/component/Toolbar.js";
import {PlaygroundTable} from "./PlaygroundTable.js";
import {textfield} from "@goui/component/form/TextField.js";
import {t} from "@goui/Translate.js";
import {router} from "@goui/Router.js";
import {searchbtn, SearchButton} from "@goui/component/SearchButton.js";
import {ArrayUtil} from "@goui/util/ArrayUtil.js";
import {ObjectUtil} from "@goui/util/ObjectUtil.js";


export class PlaygroundTablePanel extends Component {

	constructor() {
		super();

		const table = new PlaygroundTable();


		const records = ObjectUtil.clone(table.store.getArray());

		this.items.add(

			tbar({},
				"->",
				searchbtn({
					listeners: {
						input:(searchBtn, text) => {

							//clone the array for filtering
							const filtered = records.filter((r) => {
								// console.warn(r.description, text, r.description.indexOf(text))
								return !text || r.description.toLowerCase().indexOf(text.toLowerCase()) === 0;
							});

							//simple local filter on the store
							table.store.loadData(filtered, false)
						}
					}
				}),

				btn({
					icon: "add",
					cls: "primary",
					text: "Add",
					handler: () => {
						router.goto("playground/window");
					}
				}),
			),
			table,
		)
	}
}