import {PlayGround} from "./PlayGround.js";
import * as Goui from "../script/Goui.js"
import {Button, Component} from "../script/Generators.js";


// Setup Group-Office connection
Goui.client.uri = "http://host.docker.internal:6780/api/";

/**
 * Card loader that dynamically loads a module for the card
 *
 * @param cls
 * @param id
 * @param mod
 */
function loadCard(cls: string, id: string, mod = `./${cls}.js` ) : Promise<Goui.Component>{
	let index = cards.findItemIndex(id);
	if (index == -1) {

		return import(mod).then((mods:any) => {
			mods[cls].setId(id);
			index = cards.getItems().add(mods[cls]);
			cards.setActiveItem(index);
		}).then(() => {
			return cards.getItems().get(cards.getActiveItem()!)!;
		})
	} else {
		cards.setActiveItem(index);
		return Promise.resolve(cards.getItems().get(cards.getActiveItem()!)!);
	}
}


// Create main card panel for displaying SPA pages
const cards = Goui.CardContainer.create({
	cls: "fit"
});

Goui.root.getItems().add(cards);

Goui.router.on("change", () => {
	console.warn(`Missing translations`, Goui.Translate.missing);
});

// Setup router
// Translate.load("nl").then(() => {
Goui.router
		.add(/^playground$/, () => {
			return loadCard("PlayGround", "playground");
		})

		.add(/playground\/window/, async () => {
			const playground = await loadCard("PlayGround", "playground");
			const mods = await import("./PlayGround.js");
			mods.showWindow();
		})


.add(() => {

			let index = cards.findItemIndex("notfound");
			if(index == -1) {
				cards.getItems()
					.add(
						Component ({
							cls: "pad",
							id: "notfound"
						},
							Component({
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

							Component({cls: "pad"},
								Component({tagName: "h1", text: "Heading 1"}),
								Component({tagName: "h2", text: "Heading 2"})
							),

							Component({cls: "pad"},
								Component({tagName: "h3", text: "Heading 3"}),
								Component({tagName: "h4", text: "Heading 4"})
							),

							Button({
								text: "Text"
							})

						),


					);

				index = cards.getItems().count() - 1;
			}
			cards.setActiveItem(index);
		})

		.start();


// });
