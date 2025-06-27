import {expect} from "chai";
import {describe} from "mocha";
import {comp, root} from "../../../script";


describe('Component class', () => {
	describe("Create", () => {

		it('Create a component', function () {
			const c = comp();

			root.items.add(c);

			expect(root.el.children.length).to.equal(1);

		});

	});


	describe("Insert", () => {

		it('Insert a component', function () {
			const c = comp({},
				comp({id: "a"}),
				comp({id: "d"})
				);

			root.items.add(c);

			c.items.insert(1, comp({id: "b"}), comp({id: "c"}));

			expect(c.el.children[1].id).to.equal("b");

		});


		// it('Random show DOM order', function () {
		//
		// 	const a = comp({id: "a", hidden: true});
		// 	const b = comp({id: "b", hidden: true});
		// 	const c = comp({id: "c", hidden: true});
		// 	const d = comp({id: "d", hidden: true});
		//
		// 	const parent = comp({},
		// 		a,
		// 		b,
		// 		c,
		// 		d
		// 	);
		//
		// 	root.items.add(parent);
		//
		// 	expect(parent.el.children.length).to.equal(0);
		//
		// 	c.show();
		// 	b.show();
		// 	d.show();
		// 	a.show();
		//
		// 	expect(parent.el.children[0].id).to.equal("a");
		// 	expect(parent.el.children[1].id).to.equal("b");
		// 	expect(parent.el.children[2].id).to.equal("c");
		// 	expect(parent.el.children[3].id).to.equal("d");
		//
		// });

	});

});