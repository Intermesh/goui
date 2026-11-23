import {expect} from "chai";
import {describe} from "mocha";
import {root, timefield} from "../../../../script";

/**
 * Access the inputs of the time field. They are private, but the user types in them.
 */
const inputs = (f: any) => {
	f.control; // creates the inputs
	return {
		hours: f.hoursInput as HTMLInputElement,
		minutes: f.minutesInput as HTMLInputElement,
		amPm: f.amPm as HTMLSelectElement
	};
}

describe('TimeField class', () => {

	describe("24 hour mode", () => {
		it('Shows a value in the inputs', () => {
			const f = timefield({twelveHour: false, value: "15:05"});
			root.items.add(f);

			const i = inputs(f);
			expect(i.hours.value).to.equal("15");
			expect(i.minutes.value).to.equal("05");
		});

		it('Reads the typed time', () => {
			const f = timefield({twelveHour: false});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "9";
			i.minutes.value = "30";
			expect(f.value).to.equal("09:30");
			expect(f.getValueAsDateTime()!.format("H:i")).to.equal("09:30");
		});

		it('Pads a single minute digit before it is blurred', () => {
		const f = timefield({twelveHour: false});
		root.items.add(f);

		const i = inputs(f);
		i.hours.value = "7";
		i.minutes.value = "5";
		expect(f.value).to.equal("07:05");
	});

	it('Gives back the value it was set to', () => {
		const f = timefield({twelveHour: false, value: "09:30"});
		root.items.add(f);

		expect(f.value).to.equal("09:30");
		f.trackReset();
		expect(f.isModified()).to.be.false;
	});

	it('Fills in 00 minutes when only the hours are typed', () => {
			const f = timefield({twelveHour: false});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "8";
			expect(f.value).to.equal("08:00");
		});

		it('Is empty without hours', () => {
			const f = timefield({twelveHour: false});
			root.items.add(f);

			expect(f.value).to.be.undefined;
			expect(f.isEmpty()).to.be.true;
		});

		it('Caps the hours at 23 and the minutes at 59 on blur', () => {
			const f = timefield({twelveHour: false});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "25";
			i.hours.dispatchEvent(new Event("blur"));
			i.minutes.value = "75";
			i.minutes.dispatchEvent(new Event("blur"));

			expect(i.hours.value).to.equal("23");
			expect(i.minutes.value).to.equal("59");
		});
	});

	describe("12 hour mode", () => {
		it('Shows midnight as 12 am and noon as 12 pm', () => {
			const f = timefield({twelveHour: true, value: "00:15"});
			root.items.add(f);

			const i = inputs(f);
			expect(i.hours.value).to.equal("12");
			expect(i.amPm.value).to.equal("am");

			f.value = "12:15";
			expect(i.hours.value).to.equal("12");
			expect(i.amPm.value).to.equal("pm");
		});

		it('Saves 12 am as midnight and 12 pm as noon', () => {
			const f = timefield({twelveHour: true});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "12";
			i.minutes.value = "00";

			i.amPm.value = "am";
			expect(f.value).to.equal("00:00");

			i.amPm.value = "pm";
			expect(f.value).to.equal("12:00");
		});

		it('Adds 12 hours in the afternoon', () => {
			const f = timefield({twelveHour: true});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "3";
			i.minutes.value = "45";
			i.amPm.value = "pm";
			expect(f.value).to.equal("15:45");
		});

		it('Caps the hours at 12 on blur', () => {
			const f = timefield({twelveHour: true});
			root.items.add(f);

			const i = inputs(f);
			i.hours.value = "13";
			i.hours.dispatchEvent(new Event("blur"));
			expect(i.hours.value).to.equal("12");
		});

		it('Gives back the value it was set to', () => {
			const f = timefield({twelveHour: true, value: "18:20"});
			root.items.add(f);

			expect(f.value).to.equal("18:20");
		});
	});
});
