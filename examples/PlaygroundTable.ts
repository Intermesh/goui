import * as Goui from "../script/Goui.js"

export class PlaygroundTable extends Goui.Table {
	title = "Table"

	protected init() {

		const records:Goui.StoreRecord[] = [];

		for(let i = 1; i <= 20; i++) {
			records.push({
				number: i,
				description: "Test " + i,
				createdAt: (new Goui.DateTime()).addDays(Math.ceil(Math.random() * -365)).format("c")
			});
		}

		this.store = Goui.Store.create({
			records: records,
			sort: [{property: "number", isAscending: true}]
		})

		this.on("navigate",(table, rowIndex, record) => {
			Goui.Window.alert("Selected", "You navigated to " + record.number + ". Press 'Escape' to close me and navigate the grid with the arrow keys.");
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
			Goui.DateColumn.create({
				header: "Created At",
				property: "createdAt",
				sortable: true
			})
		]);

		super.init();
	}
}