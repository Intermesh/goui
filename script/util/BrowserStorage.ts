/**
 * Connection
 *
 * Creates an indexed DB connection
 */
class Connection {
	private conn?: IDBDatabase;

	
	constructor(private dbName = "goui") {
	}
	
	public enabled = true;

	private version?:number;

	public upgrading = false;

	/**
	 * Workaround safari / webkit bug:
	 *
	 *  https://bugs.webkit.org/show_bug.cgi?id=226547
	 * @return {*|Promise}
	 */
	private idbReady():Promise<Connection>{
		const isSafari = /Safari\//.test(navigator.userAgent) &&
			!/Chrom(e|ium)\//.test(navigator.userAgent);
		// No point putting other browsers through this mess.
		if(!isSafari || !window.indexedDB.databases){
			return Promise.resolve(this);
		}
		let intervalId:any;
		return new Promise((resolve) => {

			const tryIdb = () => {
				window.indexedDB.databases().finally(() => resolve(this))
			};

			intervalId = setInterval(tryIdb, 100);
			tryIdb();
		}).finally(() => clearInterval(intervalId)) as Promise<Connection>
	}

	public upgradeReady() {
		let intervalId:any;
		return new Promise((resolve) => {
			const checkUpgrading = () => {
				console.log("Check upgrade");
				if(!this.upgrading) {
					resolve(this);
				}
			}
			intervalId = setInterval(checkUpgrading, 100);
			checkUpgrading();
		}).finally(() => clearInterval(intervalId));
	}
	public async connect (): Promise<IDBDatabase> {

		if(this.upgrading) {
			await this.upgradeReady();
		}

		if(!this.conn) {
			this.conn = await this.idbReady().then(() => {

				return new Promise((resolve, reject) => {
					const	openreq = window.indexedDB.open(this.dbName);
					openreq.onerror = () => {
						this.enabled = false;
						console.warn("Disabling browser storage in indexedDB because browser doesn't support it.")
						reject(openreq.error);

					};
					openreq.onsuccess = () => {
						this.version = openreq.result.version;

						openreq.result.onversionchange = (e) => {
							console.warn("Version change");
							this.conn = undefined;
							openreq.result.close();
						}
						resolve(openreq.result);
					}

					openreq.onblocked = function() {
						console.log("IndexedDB upgrade blocked");
						reject("blocked");
					}
				});
			});

		}

		return this.conn;

	}

	public async upgrade() : Promise<IDBVersionChangeEvent> {

		this.upgrading = true;
		this.disconnect();

		return new Promise((resolve, reject) => {
			// this connect() call, will call onUpgradeResolve to resolve this problem
			let version = this.version! + 1;

			const	openreq = window.indexedDB.open(this.dbName, version);
			openreq.onerror = () => {
				this.enabled = false;
				console.warn("Disabling browser storage in indexedDB because browser doesn't support it.")
				reject(openreq.error);

			}
			openreq.onsuccess = () => {
				this.version = openreq.result.version;
				openreq.result.onversionchange = (e) => {
					console.warn("Version change");
					this.conn = undefined;
					openreq.result.close();
				}
				this.conn = openreq.result;
			}

			openreq.onblocked = (e) => {
				console.warn("IndexedDB upgrade blocked.");
			}

			openreq.onupgradeneeded = (e) => {
				resolve(e);
			};
		});
	}

	public disconnect() {
		if(this.conn) {
			this.conn.close();
			this.conn = undefined;
		}
	}

	public async deleteDatabase() {
		if(!this.enabled) {
			return Promise.resolve(null);
		}
		
		return new Promise((resolve, reject) => {
			const openreq = indexedDB.deleteDatabase(this.dbName);
			openreq.onerror = () =>  reject(openreq.error);
			openreq.onsuccess = () =>  resolve(openreq.result);
		});
	}
}

const conn = new Connection();

/**
 * Browser Store
 *
 * Wrapper around an indexeddb objectstore
 */
export class BrowserStore {

	constructor(public storeName:string){

	}

	private async getStore(mode:IDBTransactionMode) {
		// console.log("getStore " + this.storeName);
		let db = await conn.connect();

		if(!db.objectStoreNames.contains(this.storeName)) {
			db = await this.createStore();
		}

		return db.transaction(this.storeName, mode)
			.objectStore(this.storeName);
	}

	private async createStore() : Promise<IDBDatabase> {
		if(conn.upgrading) {
			// it might be created concurrenty
			await conn.upgradeReady();

			let db = await conn.connect();

			if(db.objectStoreNames.contains(this.storeName)) {
				return db;
			}
		}

		return new Promise(async (resolve, reject) => {
			// Somehow TS doens't know about the target :(
			const e = await conn.upgrade(),
				db = (e.target as any).result as IDBDatabase,
				t= (e.target as any).transaction as IDBTransaction;

			console.log("got upgrade connection " + this.storeName);
			db.createObjectStore(this.storeName);

			t.oncomplete = () => {
				conn.upgrading = false;
				console.log("upgrading finish");
				resolve(db);
			}

			t.onerror = (e) => {
				conn.upgrading = false;
				reject(e)
			}
		});
	}

	private requestPromise<ReturnType>(req: IDBRequest) : Promise<ReturnType> {
		return new Promise((resolve, reject) => {

			req.onerror = (e) => {
				reject(e);
			}
			req.onsuccess = (e) => {
				resolve(req.result);
			}
		});
	}

  public async getItem (key:IDBValidKey) : Promise<any> {
	  // console.log("getItem " + this.storeName);
		if(!conn.enabled) {
			return Promise.resolve(null);
		}

		const store = await this.getStore("readonly"),
			req = store.get(key + "");

		return this.requestPromise<any>(req);

	}

	public async setItem(key:IDBValidKey, value:any) {
		// console.log("setItem " + this.storeName);
		if(!conn.enabled) {
			return Promise.resolve(key);
		}

		const store = await this.getStore("readwrite"),
			req = store.put(value, key + "");

		return this.requestPromise<void>(req).then(() => key + "");
	}

	public async removeItem(key:IDBValidKey) {
		if(!conn.enabled) {
			return Promise.resolve(key);
		}

		const store = await this.getStore("readwrite"),
			req = store.delete(key);

		return this.requestPromise<void>(req).then(() => key);
	}

	public async clear() {
		if(!conn.enabled) {
			return Promise.resolve(null);
		}

		const store = await this.getStore("readwrite"),
			req = store.clear();

		return this.requestPromise<void>(req);
	}
	// public async keys () {
	// 	if (!conn.enabled) {
	// 		return Promise.resolve([]);
	// 	}
	// 	const keys: IDBValidKey[] = [];
	//
	// 	const store = await this.getStore("readonly");
	//
	// 	return new Promise((resolve, reject) => {
	// 		// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
	// 		// And openKeyCursor isn't supported by Safari.
	// 		(store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
	// 			if (!this.result) {
	// 				resolve(keys);
	// 				return;
	// 			}
	// 			keys.push(this.result.key);
	// 			this.result.continue();
	// 		};
	// 	});
	// }
}
