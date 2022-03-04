import {CardContainer} from "../../dist/component/CardContainer.js";
import {Component} from "../../dist/component/Component.js";
import {router} from "../../dist/Router.js";
import {client} from "../../dist/api/Client.js";
import {Translate} from "../../dist/Translate.js";

// Setup Group-Office connection
client.uri = "http://host.docker.internal:6780/api/";

/**
 * Card loader that dynamically loads a module for the card
 *
 * @param cls
 * @param id
 * @param mod
 */
function loadCard(cls: string, id: string, mod = `./${cls}.js` ) : Promise<Component>{
	let index = cards.findItemIndex(id);
	if (index == -1) {

		return import(mod).then((mods:any) => {
			index = cards.addItem(mods[cls].create({
				id: id
			}));
			cards.setActiveItem(index);
		}).then(() => {
			return cards.getItemAt(cards.getActiveItem()!)!;
		})
	} else {
		cards.setActiveItem(index);
		return Promise.resolve(cards.getItemAt(cards.getActiveItem()!)!);
	}
}


// Create main card panel for displaying SPA pages
const cards = CardContainer.create();

// Add components to body
// body.addItem(Header.create());
// body.addItem(cards);
//render to div
cards.render(document.getElementById("goui")!);

router.on("change", () => {
	console.warn(`Missing translations`, Translate.missing);
});

// Setup router
// Translate.load("nl").then(() => {
	router
		.add(/playground/, () => {
			return loadCard("PlayGround", "playground");
		})

		.add(() => {

			let index = cards.findItemIndex("notfound");
			if(index == -1) {
				index = cards.addItem(Component.create({
					cls: "go-pad",
					html: `<h1>Default page</h1><p><a href="#playground">Visit play ground</a></p>`,
					id: "notfound"
				}));
			}
			cards.setActiveItem(index);
		})

		.start();


// });
