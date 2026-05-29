import {CheckboxField, FieldConfig} from "../form/index.js";
import {List} from "../List.js";
import {createComponent} from "../Component.js";
import {CheckboxColumn} from "./TableColumns.js";


/**
 * Checkbox that selects all or none of the rows in a list
 *
 * It also automatically updates the checkbox when the selection changes
 */
export class SelectAllCheckboxField extends CheckboxField {
	constructor(protected list:List) {
		super();

		this.on("change", ({newValue}) => {
			newValue ? this.list.rowSelection!.selectAll() : this.list.rowSelection!.clear();
		})

		this.list.rowSelection!.on("selectionchange", ({target}) => {
			this.value = target.getSelected().length == this.list.store.count();
		})
	}
}

type SelectAllCheckboxFieldConfig = Omit<FieldConfig<SelectAllCheckboxField>, "type" | "list"> & {
	list: List
}

/**
 * Create a checkbox that selects all or none of the rows in a list
 *
 * It also automatically updates the checkbox when the selection changes
 *
 * @see CheckboxColumn
 * @param config
 */
export const selectallcheckboxfield = (config: SelectAllCheckboxFieldConfig) => createComponent(new SelectAllCheckboxField(config.list), config);

