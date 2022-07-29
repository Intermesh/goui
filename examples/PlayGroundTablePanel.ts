

import { btn } from "@goui/component/Button.js";
import { Component } from "@goui/component/Component.js";
import { tbar } from "@goui/component/Toolbar.js";
import { PlaygroundTable } from "./PlaygroundTable.js";



export class PlaygroundTablePanel extends Component {

    constructor() {
        super();

        this.items.add(
            tbar({},
                "->",
                btn({
                    icon: "add",
                    cls: "primary",
                    text: "Add"
                 }),
            
            ),
            Object.assign(new PlaygroundTable(), {})

        )
    }
}