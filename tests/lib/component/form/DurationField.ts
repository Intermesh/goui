import {expect} from "chai";
import {describe} from "mocha";
import {durationfield, root} from "../../../../script";

const inputs = (f: any) => {
	f.control; // creates the inputs
	return {
		hours: f.hoursInput as HTMLInputElement,
		minutes: f.minutesInput as HTMLInputElement
	};
}

describe('DurationField class', () => {

	it('Shows a value in the inputs', () => {
		const f = durationfield({value: "2:05"});
		root.items.add(f);

		const i = inputs(f);
		expect(i.hours.value).to.equal("2");
		expect(i.minutes.value).to.equal("05");
		expect(f.value).to.equal("2:05");
	});

	it('Treats an empty input as 0 instead of NaN', () => {
		const f = durationfield();
		root.items.add(f);

		const i = inputs(f);
		i.hours.value = "3";
		i.minutes.value = "";
		expect(f.value).to.equal("3:00");

		i.hours.value = "";
		i.minutes.value = "20";
		expect(f.value).to.equal("0:20");
	});

	it('Outputs total minutes with the "j" format', () => {
		const f = durationfield({outputFormat: "j", value: 90});
		root.items.add(f);

		const i = inputs(f);
		expect(i.hours.value).to.equal("1");
		expect(i.minutes.value).to.equal("30");
		expect(f.value).to.equal(90);

		i.hours.value = "";
		i.minutes.value = "";
		expect(f.value).to.equal(0);
	});
});
