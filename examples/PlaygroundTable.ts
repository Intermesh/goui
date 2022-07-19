import {store, StoreRecord} from "@goui/data/Store.js";
import {Table} from "@goui/component/table/Table.js";
import {column, datecolumn} from "@goui/component/table/TableColumns.js";
import {DateTime} from "@goui/util/DateTime.js";

export class PlaygroundTable extends Table {

	constructor() {
		const records: StoreRecord[] = [];

		for (let i = 1; i <= 20; i++) {
			records.push({
				number: i,
				description: "Test " + i,
				createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		super(
			store({
				items: records,
				sort: [{property: "number", isAscending: true}]
			}),

			[
				column({
					header: "Number",
					property: "number",
					sortable: true,
					resizable: true,
					width: 200
				}),

				column({
					header: "Description",
					property: "description",
					sortable: true,
					resizable: true,
					width: 300
				}),

				datecolumn({
					header: "Created At",
					property: "createdAt",
					sortable: true
				})
			]
		);

		this.title = "Table";
		this.itemId = "table";
		this.cls = "fit";

		this.rowSelectionConfig = true;

		// this.on("navigate",(table, rowIndex, record) => {
		// 	Window.alert("Selected", "You navigated to " + record.number + ". Press 'Escape' to close me and navigate the grid with the arrow keys.");
		// });

	}
}