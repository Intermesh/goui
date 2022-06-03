import {Entity} from "../api/EntityStore.js";

export interface User extends Entity {
	username?: string,
	displayName?: string,
	profile?: any,
	email?: string,
	dateFormat?:string,
	timeFormat?:string,
	timezone?:string,
	avatarId?:string,
	mail_reminders?: boolean
}