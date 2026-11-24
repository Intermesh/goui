import {expect} from "chai";
import {describe} from "mocha";
import {btn, comp, list, root, store} from "../../../script";

describe("List class", () => {
	describe("emptyState", () => {

		it("Shows the empty state component instead of the HTML", function () {
			const s = store();
			const l = list({
				store: s,
				renderer: r => [comp({text: r.name})],
				emptyState: comp({cls: "my-empty"}, btn({text: "Add"}))
			});

			root.items.add(l);

			const empty = l.el.querySelector(".my-empty")!;
			expect(empty).to.not.equal(null);
			expect(empty.parentElement!.hidden).to.equal(false);
			expect(l.el.querySelector(".goui-empty-state")).to.equal(null);

			l.remove();
		});

		it("Hides the empty state when records are loaded", function () {
			const s = store();
			const l = list({
				store: s,
				renderer: r => [comp({text: r.name})],
				emptyState: comp({cls: "my-empty"})
			});

			root.items.add(l);
			s.loadData([{name: "A"}], false);

			expect(l.el.querySelector(".my-empty")!.parentElement!.hidden).to.equal(true);

			l.remove();
		});

		it("Removes the empty state with the list", function () {
			const emptyState = comp({cls: "my-empty"});
			const l = list({
				store: store(),
				renderer: r => [comp({text: r.name})],
				emptyState
			});

			root.items.add(l);
			l.remove();

			expect(emptyState.removed).to.equal(true);
		});

		it("Shows the HTML without an empty state component", function () {
			const l = list({
				store: store(),
				renderer: r => [comp({text: r.name})]
			});

			root.items.add(l);

			expect(l.el.querySelector(".goui-empty-state")).to.not.equal(null);

			l.remove();
		});
	});
});
