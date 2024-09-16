/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {Field, FieldEventMap} from "./Field.js";
import {createComponent} from "../Component.js";
import {Config} from "../Observable.js";

/**
 * TextField component
 *
 * @see Form
 */
export class HiddenField extends Field {

	protected baseCls = '';

	constructor() {
		super();

		this.hidden = true;
	}
}

/**
 * Shorthand function to create {@see HiddenField}
 *
 * @param config
 */
export const hiddenfield = (config?: Config<HiddenField, FieldEventMap<HiddenField>>) => createComponent(new HiddenField(), config);
