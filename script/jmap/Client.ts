/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */

import {JmapDataSource} from "./JmapDataSource.js";
import {Observable, ObservableEventMap} from "../component/Observable.js";
import {Format} from "../util/Format.js";
import {Timezone} from "../util/DateTime.js";
import {DefaultEntity} from "../data/index.js";
import {FunctionUtil} from "../util/index.js";
import {jmapds} from "../jmap/JmapDataSource.js";
import {Notifier} from "../Notifier.js";
import {fetchEventSource} from "@microsoft/fetch-event-source";


export interface LoginData {
	action?: "login"
	username?: string
	password?: string
	loginToken?: string
	authenticators?: {
		otpauthenticator?: {
			code: string
		} | undefined
	}
}

type User = DefaultEntity;

export interface RegisterData {
	action: "register",
	user: Partial<User>
}

export interface ForgottenData {
	action: "forgotten",
	email: String
}

interface ClientEventMap<Type extends Observable>  extends ObservableEventMap<Type> {
	authenticated: <Sender extends Type>(client: Sender, session: any) => void
	logout: <Sender extends Type>(client: Sender) => void
}

export interface Client {
	on<K extends keyof ClientEventMap<Client>>(eventName: K, listener: ClientEventMap<Client>[K]): void
	fire<K extends keyof ClientEventMap<Client>>(eventName: K, ...args: Parameters<NonNullable<ClientEventMap<Client>[K]>>): boolean
}


type UploadResponse = {
	id: string,
	size: number,
	type: string,
	name: string,
	file: File,
	subfolder: string | undefined
}

/**
 * Result reference
 *
 * @link https://jmap.io/spec-core.html#references-to-previous-method-results
 */
export interface ResultReference  {
	/**
	 * The method call id (see Section 3.1.1) of a previous method call in the current request.
	 */
	resultOf: string,
	/**
	 * The required name of a response to that method call.
	 */
	name: string,
	/**
	 * A pointer into the arguments of the response selected via the name and resultOf properties. This is a JSON
	 * Pointer [@!RFC6901], except it also allows the use of * to map through an array (see the description below).
	 *
	 */
	path: string
}

export class Client<UserType extends User = User> extends Observable {
	private _lastCallCounter = 0;

	private _lastCallId?:string;
	private _requests: [method: string, params: any, callid: string][] = [];
	private _requestData: any = {};
	private _session: any;
	private timeout?: number;

	private debugParam = "XDEBUG_SESSION=1"

	private user: UserType | undefined;

	public uri = "";

	private CSRFToken = "";

	/**
	 * Either a cookie + CSRFToken are used when the API is on the same site. If it's not then an access token can be used
	 *
	 * @private
	 */
	private accessToken = "";
	private delayedJmap: (...args: any[]) => void;

	constructor() {
		super();

		this.delayedJmap = FunctionUtil.buffer(0, () => {
			this.doJmap();
		})
	}

	set session(session:any) {

		// Remove some extjs stuff that's not required
		delete session.debug;
		delete session.accounts;
		delete session.state;

		if(session.accessToken) {
			this.accessToken = session.accessToken;
			sessionStorage.setItem("accessToken", this.accessToken);
			// don't put this in the session to prevent token theft
			delete session.accessToken;
		}

		this._session = session;

		if(session.CSRFToken) {
			this.CSRFToken = session.CSRFToken;
		}

		this.fire("authenticated", this, session);
	}

	get session() {
		if(this._session) {
			return Promise.resolve(this._session);
		}

		if(!this.accessToken) {
			this.accessToken = sessionStorage.getItem("accessToken") || "";
		}

		return this.request().then(response => {

			return  response.json();

		}).then(session => {
			this.session = session;

			return this._session;
		});
	}

	/**
	 * The ID of the last JMAP method call
	 */
	get lastCallId() {
		return this._lastCallId;
	}

	public async isLoggedIn(): Promise<User | false> {
		if (this.user) {
			return this.user;
		} else {
			try {
				const user = await this.getUser();
				return user || false;
			} catch(e) {
				return false;
			}
		}
	}

	private async request(data?: Object) {

		const response = await fetch(this.uri + "jmap.php" + (this.debugParam ? '?'+this.debugParam : ''), {
			method: data ? "POST" : "GET",
			mode: "cors",
			credentials: "include", // for cookie auth
			headers: this.buildHeaders(),
			body: data ? JSON.stringify(data) : undefined
		});

		if (response.status != 200) {
			throw response.statusText;
		}
		return response;

	}

	public async logout() {
		await fetch(this.uri + "auth.php" + (this.debugParam ? '?'+this.debugParam : ''), {
			method: "DELETE",
			mode: "cors",
			credentials: "include",
			headers: this.buildHeaders()
		});

		this.CSRFToken = "";
		this.accessToken = "";
		sessionStorage.removeItem("accessToken");
		this.fire("logout", this);
	}

	private static blobCache: Record<string, Promise<any>> = {};

	public getBlobURL(blobId: string) {

		if (!Client.blobCache[blobId]) {
			let type: undefined | string;
			Client.blobCache[blobId] = fetch(client.downloadUrl(blobId), {
				method: 'GET',
				credentials: "include",
				headers: this.buildHeaders()
			})
				.then(r => {

					type = r.headers.get("Content-Type") || undefined

					return r.arrayBuffer()

				})
				.then(ab => URL.createObjectURL(new Blob([ab], {type: type})));
		}

		return Client.blobCache[blobId];
	}

	public async downloadBlobId(blobId: string, filename: string) {
		// Create a URL for the blob
		const url = await this.getBlobURL(blobId)
		// Create an anchor element to "point" to it
		const anchor = document.createElement('a');
		anchor.href = url;

		anchor.download = filename;

		// Simulate a click on our anchor element
		anchor.click();

		// Discard the object data
		URL.revokeObjectURL(url);
	}


	public auth(data: LoginData | RegisterData | ForgottenData) {

		return fetch(this.uri + "auth.php" + (this.debugParam ? '?'+this.debugParam : ''), {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: this.buildHeaders(),
			body: JSON.stringify(data)
		});
	}

	/**
	 * Get the logged-in user.
	 */
	public async getUser() {
		if (!this.user) {
			try {
				const session = await this.session;
				if(!session) {
					return undefined;
				}

				const ds = jmapds<UserType>("User");

				this.user = await ds.single(session.userId);

				if(this.user) {

					Format.dateFormat = this.user.dateFormat;
					Format.timeFormat = this.user.timeFormat;
					Format.timezone = this.user.timezone as Timezone;
					Format.currency = this.user.currency;
					Format.thousandsSeparator = this.user.thousandsSeparator;
					Format.decimalSeparator = this.user.decimalSeparator;

					return this.user;
				} else
				{
					return undefined;
				}
			} catch(reason) {
				this.user = undefined;
				return Promise.reject(reason);
			}
		}

		return this.user;
	}

	public downloadUrl(blobId: string) {
		return this.uri + "download.php?blob=" + encodeURIComponent(blobId);
	}

	public pageUrl(path: string) {
		return `${this.uri}page.php/${path}`;
	}

	private getDefaultHeaders() {

		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		if(this.accessToken) {
			headers.Authorization =  "Bearer " + this.accessToken;
		}

		if(this.CSRFToken)
		{
			headers['X-CSRF-Token'] = this.CSRFToken;
		}
		return headers;
	}

	private buildHeaders(headers:Record<string, string> = {}) {
		return Object.assign(this.getDefaultHeaders(), headers);
	}

	/**
	 * Upload a file to the API
	 *
	 * @todo Progress. Not possible ATM with fetch() so we probably need XMLHttpRequest()
	 * @param file
	 */
	public upload(file: File): Promise<UploadResponse> {

		return fetch(this.uri + "upload.php" + (this.debugParam ? '?'+this.debugParam : ''), { // Your POST endpoint
			method: 'POST',
			credentials: "include",
			headers: this.buildHeaders({
				'X-File-Name': "UTF-8''" + encodeURIComponent(file.name),
				'Content-Type': file.type,
				'X-File-LastModified': Math.round(file['lastModified'] / 1000).toString()
			}),
			body: file
		}).then((response) => {
			if (response.status > 201) {
				throw response.statusText;
			}

			return response;
		}).then(response => response.json())
			.then(response => Object.assign(response, {file: file}))
	}

	/**
	 * Upload multiple files to the API
	 *
	 * @example
	 * ```
	 * btn({
	 * 	type: "button",
	 * 	text: t("Attach files"),
	 * 	icon: "attach_file",
	 * 	handler: async () => {
	 *
	 * 		const files = await browser.pickLocalFiles(true);
	 * 		this.mask();
	 * 		const blobs = await client.uploadMultiple(files);
	 * 		this.unmask();
	 * 	  console.warn(blobs);
	 *
	 * 	}
	 * })
	 * ```
	 * @param files
	 */
	public uploadMultiple(files: File[]) : Promise<UploadResponse[]> {
		const p = [];
		for(let f of files) {
			p.push(this.upload(f));
		}
		return Promise.all(p);
	}


	/**
	 * Execute JMAP method
	 *
	 * Multiple calls will be joined together in a single call on the next event loop
	 *
	 * @param method
	 * @param params
	 */
	public jmap(method: string, params: Object = {}, callId: string|undefined = undefined): Promise<any> {
		if(callId === undefined) {
			callId = "call-" + (++this._lastCallCounter)
		}
		this._lastCallId = callId;
		const promise: Promise<Object> = new Promise((resolve, reject) => {

			this._requestData[callId!] = {
				reject: reject,
				resolve: resolve,
				params: params,
				method: method
			}
		})

		this._requests.push([method, params, callId]);

		this.delayedJmap();

		return promise;
	}


	/**
	 * Performs the requests queued in the jmap() method
	 *
	 * @private
	 */
	private doJmap() {
		this.request(this._requests)
			.then((response) => {
				return response.json();
			})
			.then((responseData) => {

				responseData.forEach((response: [method: string, response: Object, callId: string]) => {

					const callId = response[2];

					if (!this._requestData[callId]) {
						//aborted
						console.debug("Aborted");
						return true;
					}

					const success = response[0] !== "error";

					if (success) {
						this._requestData[callId].resolve(response[1]);
					} else {
						this._requestData[callId].reject(response[1]);
					}

					delete this._requestData[callId];
				});
			});

		this._requests = [];
	}

	/**
	 * When SSE is disabled we'll poll the server for changes every 2 minutes.
	 * This also keeps the token alive. Which expires in 30M.
	 */
	public updateAllDataSources(entities:string[]) {
		entities.forEach(function(entity) {

			const ds = jmapds(entity);
			ds.getState().then((state) => {
				console.warn(state, entity);
				if (state)
					ds.updateFromServer();
			});
		});
	}


	public startPolling(entities:string[]) {
		this.updateAllDataSources(entities);
		setInterval(() => {
			this.updateAllDataSources(entities);
		}, 60000);
	}


	/**
	 * Initializes Server Sent Events via EventSource. This function is called in MainLayout.onAuthenticated()
	 *
	 * Note: disable this if you want to use xdebug because it will crash if you use SSE.
	 *
	 * @returns {Boolean}
	 */
	public async sse (entities:string[]) {
		try {

			const session = await this.session;

			if (!session.eventSourceUrl) {
				console.debug("Server Sent Events (EventSource) is disabled on the server.");
				this.startPolling(entities);
				return false;
			}

			console.debug("Starting SSE");

			const url = this.uri + 'sse.php?accessToken=' + this.accessToken + '&types=' +		entities.join(',') + (this.debugParam ? '&'+this.debugParam : '');

			let retry = 0;
			await fetchEventSource(url,{
				headers: {
					Authorization: "Bearer " + this.accessToken
				},
				onopen: async (response) => {

					if(retry > 0) {
						//SSE will restart but we might be out of date
						this.updateAllDataSources(entities);
					}
					retry++;

				},
				onmessage: (msg) => {

					const data = JSON.parse(msg.data);

					for (let entity in data) {
						let ds = jmapds(entity);

						ds.getState().then(state => {
							console.warn(entity, state, data[entity]);
							if (!state || state == data[entity]) {
								//don't fetch updates if there's no state yet because it never was used in that case.
								return;
							}

							ds.updateFromServer();
						})
					}
				},
				onerror: (err) => {
					console.error(err);

				},
				onclose() {
					// if the server closes the connection unexpectedly, retry:

				},

			})



		} catch (e) {
			console.error("Failed to start Server Sent Events. Perhaps the API URL in the system settings is invalid?", e);
		}
	}
}

export const client = new Client();
