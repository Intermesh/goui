import {expect} from "chai";
import {DateTime} from "../../../script/util/DateTime.js";
import {DateInterval} from "../../../script/util/DateInterval";


describe('DateInterval class', () => {


	describe("Test createFromFormat()", () => {

		it("Should create date from Dutch format", () => {
			let s = "";
			const c = DateInterval.createFromFormat("99:15", "H:I");
			if(c){
				s= c.toIso8601();
			}
			expect(s).to.equal("PT99H15M");
		});


	});


	describe("Test diff()", () => {

		it("Should create date from Dutch format", () => {

			const start = DateTime.createFromFormat("2023-01-01 10:15", "Y-m-d H:i")!;

			const end = DateTime.createFromFormat("2023-02-15 16:30", "Y-m-d H:i")!;

			const diff = start.diff(end);


			const s = diff.toIso8601();

			expect(s).to.equal("P1M14DT6H15M");


			const days = diff.format("a");

			expect(days).to.equal("45");
		});


	});

});