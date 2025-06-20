import {expect} from "chai";
import {DateTime} from "../../../script";
import {DateInterval} from "../../../script";
import { describe } from "mocha";


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

	describe("Test setFromSeconds()", () => {

		it("Should parse seconds", () => {
			const c = DateInterval.setFromSeconds((86400 * 159) + 3600 + 1800 + 30); //159 days + 1 hour + 30 min + 30sec
			expect(c.format("a, h:i:s")).to.equal("159, 1:30:30");
		});


	});

	describe("Test diff1()", () => {

		it("Should create diff", () => {

			const start = DateTime.createFromFormat("2023-01-01 10:15", "Y-m-d H:i")!;

			const end = DateTime.createFromFormat("2023-01-01 11:00", "Y-m-d H:i")!;

			const diff = start.diff(end);

			expect(diff.toIso8601()).to.equal("PT45M");
		})
	})

	describe("Test diff1()", () => {

		it("Should create negative diff", () => {

			const start = DateTime.createFromFormat("2023-03-20 10:15", "Y-m-d H:i")!;
			const end = DateTime.createFromFormat("2023-05-01 09:12", "Y-m-d H:i")!;
			const diff = end.diff(start);
			expect(diff.toIso8601()).to.equal("-P1M10DT22H57M");
		})
	})


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