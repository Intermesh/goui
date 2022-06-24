import {expect} from "chai";
import {Component} from "../../../script/component/Component.js";
import {root} from "../../../script/component/Root.js";

describe('Component class', () => {
	describe("Create", () => {

		it('Create a component', function () {
			const comp = Component.create();

			root.items.add(comp);

			expect(root.el.children.length).to.equal(1);

		});

	});

	describe("Listener", () => {

		it('Fires an event once', function () {
			const comp = Component.create();

			root.items.add(comp);

			let fired = false;
			comp.on("show", () => {
				fired = true;
			}, {once: true});

			comp.show();

			expect(fired).to.equal(true);

			fired = false;
			comp.show();
			expect(fired).to.equal(false);

		});

	});
});