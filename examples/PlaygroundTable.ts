import {column, datecolumn, DateColumn, table, Table} from "../script/component/Table.js";
import {Store, store, StoreRecord} from "../script/data/Store.js";
import {DateTime} from "../script/util/DateTime.js";
import {Window} from "../script/component/Window.js";

export class PlaygroundTable extends Table {

	constructor() {
		const records:StoreRecord[] = [];

		for(let i = 1; i <= 20; i++) {
			records.push({
				number: i,
				description: "Test " + i,
				createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		super(store({
			records: records,
			sort: [{property: "number", isAscending: true}]
		}));

		this.title = "Table";
		this.itemId = "table";
		this.cls = "fit";

		this.rowSelection = true;

		// this.on("navigate",(table, rowIndex, record) => {
		// 	Window.alert("Selected", "You navigated to " + record.number + ". Press 'Escape' to close me and navigate the grid with the arrow keys.");
		// });

		this.columns = [

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
		];
	}
}