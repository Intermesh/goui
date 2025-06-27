import {expect} from "chai";
import {describe} from "mocha";
import {comp, root, textfield} from "../../../../script";


describe('TextField class', () => {
	describe("Create", () => {

		it('Alters textfield value with events', function () {
			const c = textfield({
				name: "test",
				value: "startval"
			});

			root.items.add(c);

			expect(c.value).to.equal("startval");

			c.on("beforegetvalue", (ev) => {
				ev.value += "-get-append"
			})

			c.on("beforesetvalue", (ev) => {
				ev.value += "-set-append"
			})

			expect(c.value).to.equal("startval-get-append");

			c.value = "foo";

			expect(c.value).to.equal("foo-set-append-get-append");

		});

	});


});