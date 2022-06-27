import {EntityStore} from "./EntityStore.js";
import {User} from "../model/User.js";
import {Observable, ObservableEventMap} from "../component/Observable.js";
import {root} from "../component/Root.js";
import {Format} from "../util/Format.js";
import {Timezone} from "../util/DateTime.js";

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

export interface RegisterData {
	action: "register",
	user: User
}

interface ClientEventMap<T extends Observable> extends ObservableEventMap<T> {
	login?: () => void
	logout?: () => void
}

export interface Client {
	on<K extends keyof ClientEventMap<Client>>(eventName: K, listener: ClientEventMap<Client>[K]): void

	fire<K extends keyof ClientEventMap<Client>>(eventName: K, ...args: Parameters<NonNullable<ClientEventMap<Client>[K]>>): boolean
}


type UploadResponse = {
	blobId: string,
	size: number,
	type: string,
	name: string
}

export class Client extends Observable {
	private _lastCallId = 0;
	private _requests: [method: string, params: any, callid: string][] = [];
	private _requestData: any = {};
	private _session: any;
	private timeout?: number;

	private debugParam = "?XDEBUG_SESSION=1"

	public user: User | undefined;

	public uri = "";
	private requireLoginPromise?: Promise<any>;

	private static masked = false;

	private static mask() {
		this.masked = true;
		setTimeout(() => {
			if (this.masked) {
				root.mask();
			}
		}, 500);
	}

	private static unmask() {
		this.masked = false;
		root.unmask();
	}

	set session(value) {
		sessionStorage.jmapSession = JSON.stringify(value);
		this._session = value;
	}

	get session() {
		if (!this._session) {
			this._session = sessionStorage.jmapSession ? JSON.parse(sessionStorage.jmapSession) : {};
		}

		return this._session;
	}

	get lastCallId() {
		return "call-" + this._lastCallId;
	}

	public isLoggedIn(): Promise<User | false> {
		if (!("accessToken" in this.session)) {
			return Promise.resolve(false);
		} else if (this.user) {
			return Promise.resolve(this.user);
		} else {
			return this.getUser();
		}
	}

	private request(data: Object) {
		Client.mask();

		return fetch(this.uri + "jmap.php" + this.debugParam, {
			method: "POST",
			mode: "cors",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.session.accessToken
			},
			body: JSON.stringify(data)
		})
			.then((response) => {
				if (response.status != 200) {
					throw response.statusText;
				}
				return response;
			})
			.finally(() => {
				Client.unmask();
			})
	}

	public logout() {
		Client.mask();
		return fetch(this.uri + "auth.php" + this.debugParam, {
			method: "DELETE",
			mode: "cors",
			headers: {
				'Authorization': 'Bearer ' + this.session.accessToken
			},
		}).then(() => {
			this.session = {};
			this.fire("logout");
		}).finally(() => {
			Client.unmask();
		})

	}

	private static blobCache: Record<string, Promise<any>> = {};

	public getBlobURL(blobId: string) {
		let fetchOptions = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + client.session.accessToken
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

	public downloadBlobId(blobId: string, filename: string) {
		// Create a URL for the blob
		return this.getBlobURL(blobId).then((url) => {
			// Create an anchor element to "point" to it
			const anchor = document.createElement('a');
			anchor.href = url;

			anchor.download = filename;

			// Simulate a click on our anchor element
			anchor.click();

			// Discard the object data
			URL.revokeObjectURL(url);
		});

	}

	public requireLogin(): Promise<User> {

		if (!this.requireLoginPromise) {
			this.requireLoginPromise = new Promise<void>((resolve, reject) => {
				if ("accessToken" in this.session) {
					resolve();
				} else {
					import("./Login.js").then((mods) => {

						const login = new mods.Login();
						login.open();

						login.on('login', () => {
							this.fire("login");
							resolve();
						});

						login.on('cancel', () => {
							reject();
						})
					})
				}
			});
		}

		return this.requireLoginPromise.then(() => {
			return this.isLoggedIn().then(user => {
				if (!user) {
					this.session = {};
					return this.requireLogin();
				} else {
					return user;
				}
			}).catch(() => {
				this.session = {};
				return this.requireLogin();
			});
		})
	}

	public auth(data: LoginData | RegisterData) {
		Client.mask();
		return fetch(this.uri + "auth.php" + this.debugParam, {
			method: "POST",
			mode: "cors",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).finally(() => {
			Client.unmask();
		})

	}

	private _user: Promise<User> | undefined;

	/**
	 * Get the logged in user.
	 */
	public getUser() {
		if (!this._user) {
			this._user = this.store('User').single(this.session.userId, [
				'id', 'username', 'displayName', 'email', 'avatarId', 'dateFormat', 'timeFormat', 'timezone', 'thousandsSeparator', 'decimalSeparator', 'currency']).then((user) => {
				this.user = <User>user;
				Format.dateFormat = user.dateFormat;
				Format.timeFormat = user.timeFormat;
				Format.timezone = user.timezone as Timezone;
				Format.currency = user.currency;
				Format.thousandsSeparator = user.thousandsSeparator;
				Format.decimalSeparator = user.decimalSeparator;

				return user;
			}).catch((reason) => {
				this._user = undefined;
				return Promise.reject(reason);
			}) as Promise<User>;
		}

		return this._user;
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

	// This will upload the file after having read it
	public upload(file: File): Promise<UploadResponse> {
		return fetch(this.uri + "upload.php" + this.debugParam, { // Your POST endpoint
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + this.session.accessToken,
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
		})
			.then(
				response => response.json()
			);
	};


	/**
	 * Execute JMAP method
	 *
	 * @param method
	 * @param params
	 * @return Promise<Object>
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
						// if (response[0] == "error") {
						// 	console.error('server-side JMAP failure', response);
						// }

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