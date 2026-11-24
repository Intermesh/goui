import {expect} from "chai";
import {describe} from "mocha";
import {comp, containerfield, form, root, textfield} from "../../../../script";

describe('Form class', () => {

	describe("value", () => {
		it('Collects the values of nested fields and container fields', () => {
			const f = form({},
				comp({},
					textfield({name: "name"})
				),
				containerfield({name: "address"},
					textfield({name: "street"}),
					textfield({name: "city"})
				)
			);
			root.items.add(f);

			f.value = {name: "Piet", address: {street: "Main street", city: "Den Bosch"}};

			expect(f.value).to.deep.equal({name: "Piet", address: {street: "Main street", city: "Den Bosch"}});
		});

		it('Keeps unknown values by default', () => {
			const f = form({}, textfield({name: "name"}));
			root.items.add(f);

			f.value = {id: 1, name: "Piet"};
			expect(f.value).to.deep.equal({id: 1, name: "Piet"});
		});

		it('Drops unknown values when keepUnknownValues is false', () => {
			const f = form({keepUnknownValues: false}, textfield({name: "name"}));
			root.items.add(f);

			f.value = {id: 1, name: "Piet"};
			expect(f.value).to.deep.equal({name: "Piet"});
		});

		it('Leaves out disabled fields', () => {
			const f = form({}, textfield({name: "name"}), textfield({name: "secret", disabled: true}));
			root.items.add(f);

			f.value = {name: "Piet", secret: "x"};
			expect(f.value).to.deep.equal({name: "Piet"});
		});

		it('Merges container fields with the same name', () => {
			const f = form({},
				containerfield({name: "address", keepUnknownValues: false}, textfield({name: "street"})),
				containerfield({name: "address", keepUnknownValues: false}, textfield({name: "city"}))
			);
			root.items.add(f);

			f.value = {address: {street: "Main street", city: "Den Bosch"}};
			expect(f.value).to.deep.equal({address: {street: "Main street", city: "Den Bosch"}});
		});

		it('Does not let changes to a returned value leak into the form', () => {
			const f = form({}, textfield({name: "name"}));
			root.items.add(f);

			f.value = {name: "Piet", tags: ["a"]};
			const v = f.value;
			v.tags.push("b");

			expect(f.value.tags).to.deep.equal(["a"]);
		});
	});

	describe("isolateFormFields", () => {
		it('Leaves out the fields of an isolated component', () => {
			const f = form({},
				textfield({name: "name"}),
				comp({isolateFormFields: true},
					textfield({name: "columnSearch"})
				)
			);
			root.items.add(f);

			expect(f.findFields().map(field => field.name)).to.deep.equal(["name"]);

			f.findField("columnSearch")!.value = "foo";

			expect(f.value).to.not.have.property("columnSearch");
			expect(f.isModified()).to.be.false;
		});
	});

	describe("modified", () => {
		it('Tracks modifications since the value was set', () => {
			const f = form({}, textfield({name: "name"}), textfield({name: "email"}));
			root.items.add(f);

			f.value = {name: "Piet", email: "piet@example.com"};
			f.trackReset();
			expect(f.isModified()).to.be.false;
			expect(f.modified).to.deep.equal({});

			f.findField("email")!.value = "p@example.com";

			expect(f.isModified()).to.be.true;
			expect(f.modified).to.deep.equal({email: "p@example.com"});
			expect(f.getOldValue()).to.deep.equal({name: "Piet", email: "piet@example.com"});
		});

		it('Reset restores the tracked values', () => {
			const f = form({}, textfield({name: "name"}));
			root.items.add(f);

			f.value = {name: "Piet"};
			f.trackReset();
			f.findField("name")!.value = "Jan";

			f.reset();

			expect(f.value).to.deep.equal({name: "Piet"});
			expect(f.isModified()).to.be.false;
		});

		it('Clear restores the default values', () => {
			const f = form({}, textfield({name: "name", value: "default"}));
			root.items.add(f);

			f.value = {name: "Piet"};
			f.clear();

			expect(f.value.name).to.equal("default");
			expect(f.isModified()).to.be.false;
		});
	});

	describe("patch", () => {
		it('Sets only the given fields', () => {
			const f = form({}, textfield({name: "name"}), textfield({name: "email"}));
			root.items.add(f);

			f.value = {name: "Piet", email: "piet@example.com"};
			f.patch({email: "p@example.com"});

			expect(f.value).to.deep.equal({name: "Piet", email: "p@example.com"});
		});

		it('Throws on an unknown field', () => {
			const f = form({}, textfield({name: "name"}));
			root.items.add(f);

			expect(() => f.patch({foo: "bar"})).to.throw();
		});
	});

	describe("validation", () => {
		it('Is invalid when a required field is empty', () => {
			const f = form({}, textfield({name: "name", required: true}));
			root.items.add(f);

			expect(f.isValid()).to.be.false;

			f.findField("name")!.value = "Piet";
			expect(f.isValid()).to.be.true;
		});

		it('Does not submit when invalid', async () => {
			let handled = false;
			const f = form({
				handler: () => {
					handled = true;
				}
			}, textfield({name: "name", required: true}));
			root.items.add(f);

			expect(await f.submit()).to.be.false;
			expect(handled).to.be.false;

			f.findField("name")!.value = "Piet";
			expect(await f.submit()).to.be.true;
			expect(handled).to.be.true;
		});
	});
});
