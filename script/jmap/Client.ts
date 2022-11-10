import {EntityStore} from "./EntityStore.js";
import {Observable, ObservableEventMap} from "../component/Observable.js";
import {Format} from "../util/Format.js";
import {Timezone} from "../util/DateTime.js";
import {cookies} from "../util/Cookies.js";

export interface LoginData {
	action?: "login"
	username?: string
	password?: string
	loginToken?: string
	authenticators?: {
		googleauthenticator?: {
			code: string
		} | undefined
	}
}

type User = Record<string, any>;

export interface RegisterData {
	action: "register",
	user: User
}

export interface ForgottenData {
	action: "forgotten",
	email: String
}

interface ClientEventMap<Type extends Observable>  extends ObservableEventMap<Type> {
	authenticated?: <Sender extends Type>(client: Sender, session: any) => void
	logout?: <Sender extends Type>(client: Sender) => void
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

export class Client<UserType extends User = User> extends Observable {
	private _lastCallId = 0;
	private _requests: [method: string, params: any, callid: string][] = [];
	private _requestData: any = {};
	private _session: any;
	private timeout?: number;

	private debugParam = "?XDEBUG_SESSION=1"

	private user: UserType | undefined;

	public uri = "";

	set accessToken(value: string|undefined) {

		if(value) {
			cookies.set("accessToken", value);
		} else
		{
			this._session = undefined;
			sessionStorage.removeItem("jmapSession");

			cookies.unset("accessToken");
		}
	}

	get accessToken() {
		return cookies.get("accessToken");
	}

	set session(session:any) {
		sessionStorage.setItem("jmapSession", JSON.stringify(session));

		this.fire("authenticated", this, session);

		this._session = session;

		if(session.accessToken) {
			this.accessToken = session.accessToken;
		}
	}

	get session() {
		if(this._session) {
			return Promise.resolve(this._session);
		}
		let session = sessionStorage.getItem("jmapSession");
		if(session && (session = JSON.parse(session))) {
			this._session = session;
			return Promise.resolve(this._session);
		}

		return this.request().then(response => {

			return  response.json();

		}).then(session => {
			this.session = session;

			return this._session;
		});
	}

	get lastCallId() {
		return "call-" + this._lastCallId;
	}

	public isLoggedIn(): Promise<User | false> {
		if (!this.accessToken) {
			return Promise.resolve(false);
		} else if (this.user) {
			return Promise.resolve(this.user);
		} else {
			return this.getUser().then(user => user || false);
		}
	}

	private async request(data?: Object) {

		const response = await fetch(this.uri + "jmap.php" + this.debugParam, {
			method: data ? "POST" : "GET",
			mode: "cors",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.accessToken
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (response.status != 200) {
			throw response.statusText;
		}
		return response;

	}

	public async logout() {
		await fetch(this.uri + "auth.php" + this.debugParam, {
			method: "DELETE",
			mode: "cors",
			headers: {
				'Authorization': 'Bearer ' + this.accessToken
			}
		});

		this.accessToken = "";
		this.fire("logout", this);
	}

	private static blobCache: Record<string, Promise<any>> = {};

	public getBlobURL(blobId: string) {
		let fetchOptions = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + client.accessToken
			}
		};

		if (!Client.blobCache[blobId]) {
			let type: undefined | string;
			Client.blobCache[blobId] = fetch(client.downloadUrl(blobId), fetchOptions)
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

		return fetch(this.uri + "auth.php" + this.debugParam, {
			method: "POST",
			mode: "cors",
			headers: {
				'Content-Type': 'application/json'
			},
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
					this.accessToken = "";
					return undefined;
				}

				this.user = await this.store('User').single(session.userId, [
						'id', 'username', 'displayName', 'email', 'avatarId', 'dateFormat', 'timeFormat', 'timezone', 'thousandsSeparator', 'decimalSeparator', 'currency']
					) as UserType;

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
					this.accessToken = "";
					return undefined;
				}
			} catch(reason) {
				this.user = undefined;
				this.accessToken = "";
				return Promise.reject(reason);
			}
		}

		return this.user;
	}

	private stores: Record<string, EntityStore> = {};

	/**
	 * Get entity store
	 *
	 * @param name
	 */
	public store(name: string) {
		if (!this.stores[name]) {
			this.stores[name] = new EntityStore(name, this);
		}
		return this.stores[name]
	}

	public downloadUrl(blobId: string) {
		return this.uri + "download.php?blob=" + encodeURIComponent(blobId);
	}

	public pageUrl(path: string) {
		return `${this.uri}page.php/${path}`;
	}

	/**
	 * Upload a file to the API
	 *
	 * @todo Progress. Not possible ATM with fetch() so we probably need XMLHttpRequest()
	 * @param file
	 */
	public upload(file: File): Promise<UploadResponse> {

		return fetch(this.uri + "upload.php" + this.debugParam, { // Your POST endpoint
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + this.accessToken,
				'X-File-Name': "UTF-8''" + encodeURIComponent(file.name),
				'Content-Type': file.type,
				'X-File-LastModified': Math.round(file['lastModified'] / 1000).toString()
			},
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
	 * @param method
	 * @param params
	 */
	public jmap(method: string, params: Object = {}): Promise<any> {
		const callId = "call-" + (++this._lastCallId), promise: Promise<Object> = new Promise((resolve, reject) => {

			this._requestData[callId] = {
				reject: reject,
				resolve: resolve,
				params: params,
				method: method
			}
		})

		this._requests.push([method, params, callId]);
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = window.setTimeout(() => {
			this.timeout = undefined;

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
		});

		return promise;
	}
}

export const client = new Client();
