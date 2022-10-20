
import { comp, Component } from "@goui/component/Component.js";
import { router } from "@goui/Router.js";
import { cards } from "@goui/component/CardContainer.js";
import { root } from "@goui/component/Root.js";
import { client } from "@goui/jmap/Client.js";
import {translate, Translate} from "@goui/Translate.js";
import { btn } from "@goui/component/Button.js";
import { playgroundTableOverride } from "./PlaygroundTableOverride.js";
import { PlayGround } from "./PlayGround.js";

// Create main card panel for displaying SPA pages
const main = cards();

// log missing translations for developer
router.on("change", () => {
	console.warn(`Missing translations`, translate.missing);
});

/**
 * Check if playground is present in main cardcontainer and add if necessary
 * 
 * @returns 
 */
const loadPlayground = () => {
	let playGround = main.findChild("playground") as PlayGround;
	if (!playGround) {
		playGround = new PlayGround();
		main.items.add(playGround);
	}
	playGround.show();

	return playGround;
}

//Example for overriding another component Playground table
playgroundTableOverride();

// Setup router
// Translate.load("nl").then(() => {
router
	.add(/^playground$/, loadPlayground)

	.add(/playground\/window/, async () => {
		const playGround = loadPlayground();
		playGround.showWindow();
	})

	.add(() => {

		// default page

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

						comp({ cls: "pad" },
							comp({ tagName: "h1", text: "Heading 1" }),
							comp({ tagName: "h2", text: "Heading 2" })
						),

						comp({ cls: "pad" },
							comp({ tagName: "h3", text: "Heading 3" }),
							comp({ tagName: "h4", text: "Heading 4" })
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

		// add main card layout after first route so we can render everything at once
		root.items.add(main);
	})


// });
