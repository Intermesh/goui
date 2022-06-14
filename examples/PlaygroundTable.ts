import {DateColumn, Table} from "../script/component/Table.js";
import {Store, StoreRecord} from "../script/data/Store.js";
import {Window} from "../script/component/Window.js";
import {DateTime} from "../script/util/DateTime.js";

export class PlaygroundTable extends Table {
	title = "Table"

	protected init() {

		const records:StoreRecord[] = [];

		for(let i = 1; i <= 20; i++) {
			records.push({
				number: i,
				description: "Test " + i,
				createdAt: (new DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		this.store = Store.create({
			records: records,
			sort: [{property: "number", isAscending: true}]
		})

		this.on("navigate",(table, rowIndex, record) => {
			Window.alert("Selected", "You navigated to " + record.number + ". Press 'Escape' to close me and navigate the grid with the arrow keys.");
		});

		this.setColumns([
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
		]);

		super.init();
	}
}