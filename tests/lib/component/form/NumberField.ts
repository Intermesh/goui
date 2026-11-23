import {expect} from "chai";
import {describe} from "mocha";
import {numberfield, root} from "../../../../script";

describe('NumberField class', () => {

	it('Formats the value with the separators and decimals', () => {
		const f = numberfield({decimalSeparator: ",", thousandsSeparator: ".", decimals: 2, value: 1234.5});
		root.items.add(f);

		expect(f.input.value).to.equal("1.234,50");
		expect(f.value).to.equal(1234.5);
	});

	it('Parses typed numbers with the separators', () => {
		const f = numberfield({decimalSeparator: ",", thousandsSeparator: ".", decimals: 2});
		root.items.add(f);

		f.input.value = "1.234,567";
		expect(f.value).to.equal(1234.57);
	});

	it('Rounds to the number of decimals', () => {
		const f = numberfield({decimals: 0, decimalSeparator: ".", thousandsSeparator: ","});
		root.items.add(f);

		f.input.value = "2.6";
		expect(f.value).to.equal(3);
	});

	it('Applies the multiplier', () => {
		// bytes shown as MB, like the quota fields of maildomains
		const f = numberfield({multiplier: 1 / (1024 * 1024), decimals: 0, decimalSeparator: ".", thousandsSeparator: ",", value: 5 * 1024 * 1024});
		root.items.add(f);

		expect(f.input.value).to.equal("5");

		f.input.value = "10";
		expect(f.value).to.equal(10 * 1024 * 1024);
	});

	it('Is undefined when empty and keeps 0', () => {
		const f = numberfield({decimalSeparator: ".", thousandsSeparator: ","});
		root.items.add(f);

		expect(f.value).to.be.undefined;

		f.value = 0;
		expect(f.input.value).to.not.equal("");
		expect(f.value).to.equal(0);
		expect(f.isEmpty()).to.be.false;
	});

	it('Validates min and max', () => {
		const f = numberfield({min: 1, max: 10, decimalSeparator: ".", thousandsSeparator: ","});
		root.items.add(f);

		f.value = 5;
		expect(f.isValid()).to.be.true;

		f.value = 11;
		expect(f.isValid()).to.be.false;

		f.value = 0;
		expect(f.isValid()).to.be.false;
	});
});
