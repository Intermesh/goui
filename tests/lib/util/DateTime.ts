import {expect} from "chai";
import {DateTime} from "../../../script/index.js";
import { describe } from "mocha";

describe('Date class', () => {

	// 2026-11-17T23:07:24+00:00


	describe("Test date parse()", () => {

		const apiDate = "2026-11-17T23:07:24+00:00";

		const dt = new DateTime(apiDate).toTimezone("europe/london");

		it('dates should match', function () {
			expect(dt.format("c")).to.equal(apiDate);
		});

	});

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

		it("2 feb is not 2 mar", () => { // this test could fail on th 30th or 31st
			let s = "";
			const c = DateTime.createFromFormat("20240202", "Ymd");
			if(c){
				s= c.format("Ymd");
			}
			expect(s).to.equal("20240202");
		});

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