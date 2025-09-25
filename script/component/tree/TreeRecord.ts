import {MaterialIcon} from "../MaterialIcon";

/**
 * Tree record type for {@link TreeStore} data stores
 *
 * @link https://goui.io/#tree Examples
 */
export type TreeRecord = {
	/**
	 * Unique ID of the node
	 */
	id?: string,

	[key:string]:any,
	/**
	 * Child nodes. If not present then it can be populated on the "expand" event.
	 */
	children?: TreeRecord[],

	expanded?: boolean

	level?: number,

	/**
	 * Icon to display
	 */
	icon?:MaterialIcon

	/**
	 * CSS class for the node
	 */
	cls?:string,

	/**
	 * If set a checkbox will render
	 */
	check?: boolean,

	/**
	 * Arbitrary node data
	 */
	dataSet?: any

	href?:string,

}