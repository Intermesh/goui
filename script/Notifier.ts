/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2026 Intermesh BV
 * @author Michael de Hart <mdhart@intermesh.nl>
 */
import {comp, MaterialIcon, Observable, root} from "./component/index";

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
	'primary' |
	'secondary' |
	'progress' |
	'complete';

type NotificationVariant =
	'success' |
	'warning' |
	'info' |
	'error';

export interface INotification {
	/** Will not show before the time */
	readonly time?: Date
	/** full path to png icon */
	readonly icon?: {name: MaterialIcon, color?: string, link?:string}
	/** option title */
	readonly title?: string
	/** body of notification. (no HTML) */
	readonly text: string
	/** used for behavior / presentation, defaults to 'message' */
	readonly category?: NotificationCategory
	/** theme/color variant of the notification */
	readonly variant?: NotificationVariant
	/** time when notification disappears without interaction */
	readonly stale?: Date
	/** optional actions to show */
	readonly actions?: {[action:string]:{text:string, icon?:MaterialIcon, run:()=>void}}
	onClose?: ()=>void
	onClick?: ()=>void
	onProcessed?: (loaded:number,total:number)=>void
}
class NotifierClass extends Observable<{notify:{msg:INotification}}> {

	public notify(msg: INotification) {
		if(this.fire('notify', {msg}) !== false)
			this.toast(msg).cls += " notice";
	}
	/** @deprecated */
	error(text: any, _?:any) {
		this.toast({text, category: "status",variant:'error'});
	}
	/** @deprecated */
	success(text: any, _?:any) {
		this.toast({text, category: "status",variant:'success'});
	}

	/** @deprecated */
	notice(text: any, _?:any) {
		this.toast({text, category: "status",variant:'info'});
	}

	/**
	 * When no notify listener is attached or returning false toast is the default
	 * The "notify" event should return false to prevent this
	 */
	private toast(msg: INotification) {
		const close = () => { alert?.remove() };
		const alert = comp({cls:"goui-alert " + msg.variant},
			comp({tagName: "span", text: msg.text})
		)
		if (msg.variant !== 'error')
			setTimeout(close, 3000);
		root.items.add(alert);
		document.body.addEventListener("mousedown", close, {once: true});
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