import {expect} from "chai";
import {DateTime} from "../../../ts/lib/util/DateTime.js";


describe('Date class', () => {
	describe("Test getTimeZone()", () => {

		const browser = new DateTime("2021-10-21T16:00:00+00:00");

		it('should show the system timezone', function () {
			expect(browser.timezone).to.equal(Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase());
		});

	});

	describe("Test toTimeZone()", () => {

		const browser = new DateTime("2021-10-21T16:00:00+00:00");

		it('Should convert timezones', function () {
			const utc = browser.toUTC();
			const riga = browser.toTimezone("europe/riga");
			expect(riga.getHours()).to.equal(utc.getHours() + 3);

			expect(riga.toUTC().getHours()).to.equal(utc.getHours());
		});

	});

	describe("Test createFromFormat()", () => {

		it("Should create date from Dutch format", () => {
			let s = "";
			const c = DateTime.createFromFormat("2021-10-21 21:09", "Y-m-d H:i", "america/new_york");
			if(c){
				s= c.format("c");
			}
			expect(s).to.equal("2021-10-21T21:09:00-04:00");
		});

		it("Should create date from American format", () => {
			let s = "";
			const c = DateTime.createFromFormat("10/21/2021 9:09am", "m/d/Y g:ia", "europe/amsterdam");
			if(c){
				s= c.format("c");
			}
			expect(s).to.equal("2021-10-21T21:09:00+02:00");
		});

		it("Should create date from ISO format", () => {
			let s = "";
			const c = DateTime.createFromFormat("2021-10-21T21:09:00+02:00", "c", "europe/amsterdam");
			if(c){
				s= c.format("c");
			}
			expect(s).to.equal("2021-10-21T21:09:00+02:00");
		});

	});

});