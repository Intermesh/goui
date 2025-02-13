import {MaterialIcon} from "../MaterialIcon";

export type TreeRecord = {
	/**
	 * Unique ID of the node
	 */
	id?: string,

	/**
	 * Text of the node
	 */
	text: string

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