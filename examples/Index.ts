
import {PlaygroundTable} from "./PlaygroundTable.js";
import {PluginManager} from "@goui/component/PluginManager.js";
import {comp, Component} from "@goui/component/Component.js";
import {router} from "@goui/Router.js";
import {cards} from "@goui/component/CardContainer.js";
import {root} from "@goui/component/Root.js";
import {client} from "@goui/jmap/Client.js";
import {Translate} from "@goui/Translate.js";
import {btn} from "@goui/component/Button.js";

// Setup Group-Office connection
client.uri = "http://host.docker.internal:6780/api/";

/**
 * Card loader that dynamically loads a module for the card
 *
 * @param cls
 * @param id
 * @param mod
 */
function loadCard(cls: string, id: string, mod = `./${cls}.js`): Promise<Component> {
	let index = main.findItemIndex(id);
	if (index == -1) {

		return import(mod).then((mods: any) => {
			mods[cls].setId(id);
			index = main.items.add(mods[cls]);
			main.activeItem = index;
		}).then(() => {
			return main.items.get(main.activeItem!)!;
		})
	} else {
		main.activeItem = index;
		return Promise.resolve(main.items.get(main.activeItem!)!);
	}
}


// Create main card panel for displaying SPA pages
const main = cards();

router.on("change", () => {
	console.warn(`Missing translations`, Translate.missing);
});

const loadPlayground = async () => {
	const mods = await import("./PlayGround.js");
	if (!main.items.has(mods.PlayGround)) {
		main.items.add(mods.PlayGround);
	}
	mods.PlayGround.show();

	return mods;
}

//register a plugin for Playground table
PluginManager.register("PlaygroundTable", function (table: PlaygroundTable) {
	table.el.classList.add("cls-added-by-plugin");
});

// Setup router
// Translate.load("nl").then(() => {
router
	.add(/^playground$/, loadPlayground)

	.add(/playground\/window/, async () => {
		const mods = await loadPlayground();
		mods.showWindow();
	})

	.add(() => {

		let index = main.findItemIndex("notfound");
		if (index == -1) {
			main.items
				.add(
					comp({
							cls: "pad",
							id: "notfound"
						},
						comp({
							html: `
									<h1>Heading 1</h1>
									<h2>Heading 2</h2>
									<h3>Heading 3</h3>
									<h4>Heading 4</h4>
									<h5>Heading 5</h5>
									<h6>Heading 6</h6>
									<p>Paragraph</p>
									
									<p><a href="#playground">Visit play ground</a></p>
								`,
						}),

						comp({cls: "pad"},
							comp({tagName: "h1", text: "Heading 1"}),
							comp({tagName: "h2", text: "Heading 2"})
						),

						comp({cls: "pad"},
							comp({tagName: "h3", text: "Heading 3"}),
							comp({tagName: "h4", text: "Heading 4"})
						),

						btn({
							text: "Text"
						})
					),
				);

			index = main.items.count() - 1;
		}
		main.activeItem = index;
	})

	.start()
	.then(() => {
		root.items.add(main);
	})


// });
