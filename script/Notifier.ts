/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2026 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import {btn, MaterialIcon, Observable, root} from "./component/index";

type NotificationCategory =
            // PURPOSE                   | BEHAVIOUR                                                   | PRESENTATION
'alarm'   | // critical, time-sensitive  | interruptive, persistent, requires action, may repeat       | high emphasis, title required, actions required
'error'   | // failure or problem        | persistent until dismissed, non-auto-dismiss, may aggregate | error styling, title required, actionable text
'system'  | // OS/app state change       | high priority, deduplicated, may persist                    | neutral/system styling, concise, settings/actions
'event'   | // scheduled/time-based item | triggered at time, may persist or reappear if ignored       | calendar/clock, title required, time/context + actions
'progress'| // ongoing task              | persistent, updates in place, disappears                    | progress indicator, task title, cancel/pause actions
'message' | // communication/awareness   | non-blocking, stacks, auto-dismiss, stored in history       | standard styling, optional title, optional actions
'status';   // informational outcome     | auto-dismiss, non-persistent, no action required            | minimal styling, short text, no/rare actions

type NotificationAction =
	'click' |
	'close' |
	'primary' |
	'secondary' |
	'progress' |
	'complete';

export interface INotification {
	readonly time?: Date // waiting in the store for this time to be shown
	readonly icon?: {name: MaterialIcon, color?: string, link?:string} // full path to png icon
	readonly title?: string // option title
	readonly text: string // body of notification. (no HTML)
	readonly category?: NotificationCategory // used for behavior / presentation, defaults to 'message'
	readonly stale?: Date // time when notification disappears without interaction
	readonly actions?: {[action:string]:{text:string, icon?:MaterialIcon, run:()=>void}} // optional actions to show
}
class NotifierClass extends Observable<{notify:{msg:INotification}}> {

	public notify(msg: INotification) {
		if(this.fire('notify', {msg}) !== false)
			this.toast(msg);
	}
	/** @deprecated */
	error(text: any, _?:any) {
		this.toast({text, category: "error"}).cls += " goui-error";
	}
	/** @deprecated */
	success(text: any, _?:any) {
		this.toast({text, category: "status"}).cls += " goui-success";
	}

	/** @deprecated */
	notice(text: any, _?:any) {
		this.toast({text, category: "status"}).cls += " goui-notice";
	}

	/**
	 * When no notification handler is implemented while using Goui this is the default
	 * The "notify" event should return false to prevent this
	 */
	private toast(msg: INotification) {
		const close = () => { alert?.remove() },
			alert = btn({tagName: "div",
				cls:"goui-alert " + msg.category,
				text: msg.text
			}).on('click', close);

		if (msg.category !== 'error')
			setTimeout(close, 3000);
		root.items.add(alert);
		return alert;
	}
}

/**
 * Notifier
 *
 * @example
 *
 * ```
 * Notifier.notify({text:"Oops!", category: "error"});
 * ```
 */
export const Notifier = new NotifierClass();