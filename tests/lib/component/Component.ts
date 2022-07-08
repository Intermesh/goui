import {expect} from "chai";
import {comp, Component} from "../../../script/component/Component.js";
import {root} from "../../../script/component/Root.js";

describe('Component class', () => {
	describe("Create", () => {

		it('Create a component', function () {
			const c = comp();

			root.items.add(c);

			expect(root.el.children.length).to.equal(1);

		});

	});

	describe("Listener", () => {

		it('Fires an event once', function () {
			const c = comp({
				hidden: true
			});

			root.items.add(c);

			let fired = false;
			c.on("show", () => {
				fired = true;
			}, {once: true});

			c.show();

			expect(fired).to.equal(true);

			fired = false;
			c.show();
			expect(fired).to.equal(false);

		});

	});
});