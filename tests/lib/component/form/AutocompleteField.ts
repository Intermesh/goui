import {expect} from "chai";
import {describe} from "mocha";
import {autocomplete, list, root, store} from "../../../../script";

const createField = (freeInput: boolean) => {
	const f = autocomplete({
		name: "city",
		freeInput,
		list: list({
			store: store(),
			renderer: (record: any) => [record.name]
		})
	});

	// Don't open the suggestions menu after typing. Its alignment needs layout that jsdom doesn't have.
	(f as any).onInput = () => {};

	return f;
};

/**
 * Simulates typing in the input
 */
const type = (input: HTMLInputElement, text: string) => {
	input.value = text;
	input.dispatchEvent(new Event("input"));
}

describe('AutocompleteField class', () => {

	it('Is modified when free text is typed in an empty field', () => {
		const f = createField(true);
		root.items.add(f);
		f.trackReset();

		expect(f.value).to.be.undefined;
		expect(f.isModified()).to.be.false;

		type(f.input, "Den Bosch");

		expect(f.value).to.equal("Den Bosch");
		expect(f.isModified()).to.be.true;
	});

	it('Does not take typed text as value without freeInput', () => {
		const f = createField(false);
		root.items.add(f);
		f.trackReset();

		type(f.input, "Den Bosch");

		expect(f.value).to.be.undefined;
		expect(f.isModified()).to.be.false;
	});

	it('Keeps the value it was set to', () => {
		const f = createField(false);
		root.items.add(f);

		f.value = "42";
		expect(f.value).to.equal("42");
	});

	it('Shows the text of the last set value', async () => {
		const f = createField(false);
		root.items.add(f);

		let calls = 0;
		f.valueToTextField = async (field, value) => {
			// the first call resolves last
			await new Promise(resolve => setTimeout(resolve, calls++ == 0 ? 20 : 0));
			return "Text " + value;
		};

		f.value = "1";
		f.value = "2";

		await new Promise(resolve => setTimeout(resolve, 40));

		expect(f.input.value).to.equal("Text 2");
		expect(f.value).to.equal("2");
	});
});
