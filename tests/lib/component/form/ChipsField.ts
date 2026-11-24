import {expect} from "chai";
import {describe} from "mocha";
import {chips, root} from "../../../../script";

describe('ChipsField class', () => {

	it('Keeps the order of a value set before rendering', () => {
		const f = chips({name: "tags", value: ["a", "b", "c"]});

		expect(f.value).to.deep.equal(["a", "b", "c"]);

		root.items.add(f);

		expect(f.value).to.deep.equal(["a", "b", "c"]);
	});

	it('Renders a chip for every value', () => {
		const f = chips({name: "tags"});
		root.items.add(f);

		f.value = ["x", "y"];
		expect(f.value).to.deep.equal(["x", "y"]);
		// the chips plus the editor
		expect(f.items.count()).to.equal(3);

		f.value = [];
		expect(f.value).to.deep.equal([]);
		expect(f.isEmpty()).to.be.true;
	});

	it('Is not modified when set to the same array', () => {
		const f = chips({name: "tags", value: ["a", "b"]});
		root.items.add(f);
		f.trackReset();

		f.value = ["a", "b"];
		expect(f.isModified()).to.be.false;

		f.value = ["b", "a"];
		expect(f.isModified()).to.be.true;
	});
});
