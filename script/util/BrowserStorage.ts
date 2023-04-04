class Connection {
    conn?: IDBDatabase;
	private onUpgradeResolve?: (value: (PromiseLike<unknown> | unknown)) => void;
	private onUpgradeReject?: (reason?: any) => void;
	
	constructor(private dbName = "goui") {
	}
	
	public enabled = true;

	private version?:number;

	/**
	 * Workaround safari / webkit bug:
	 *
	 *  https://bugs.webkit.org/show_bug.cgi?id=226547
	 * @return {*|Promise}
	 */
	private idbReady(){
		const isSafari = /Safari\//.test(navigator.userAgent) &&
			!/Chrom(e|ium)\//.test(navigator.userAgent);
		// No point putting other browsers through this mess.
		if(!isSafari || !window.indexedDB.databases){
			return Promise.resolve();
		}
		let intervalId:any;
		return new Promise((resolve) => {
			const tryIdb = () => {
				window.indexedDB.databases().finally(() => resolve(true))
			};

			intervalId = setInterval(tryIdb, 100);
			tryIdb();
		}).finally(() => clearInterval(intervalId));
	}
	public async connect (): Promise<IDBDatabase> {
		
		if(!this.conn) {
			this.conn = await this.idbReady().then(() => {

				let version:number|undefined = undefined;
				if(this.onUpgradeResolve != undefined) {
					version = this.version! + 1;
				}

				return new Promise((resolve, reject) => {
					const	openreq = window.indexedDB.open(this.dbName, version);
					openreq.onerror = () => {
						this.enabled = false;
						console.warn("Disabling browser storage in indexedDB because browser doesn't support it.")
						reject(openreq.error);
						if(this.onUpgradeReject) {
							this.onUpgradeReject(openreq.error);
						}
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
						console.warn("IndexedDB upgrade blocked");

						reject("blocked");
					}

					openreq.onupgradeneeded = (e) => {
						const db = (e.target as any).result as IDBDatabase;

						if(this.onUpgradeResolve) {
							this.onUpgradeResolve(db);
						}
					};
				});
			});

		}

		return this.conn;

	}

	public upgrade() : Promise<IDBDatabase> {
		const p = new Promise((resolve, reject) => {
			this.onUpgradeResolve = resolve;
			this.onUpgradeReject = reject;
		});

		this.disconnect();

		void this.connect();

		return p as Promise<IDBDatabase>;
	}

	public disconnect() {
		this.conn?.close();
		this.conn = undefined;
	}

	public async deleteDatabase() {

		if(!this.enabled) {
			return Promise.resolve(null);
		}
		
		return new Promise((resolve, reject) => {
			const openreq = indexedDB.deleteDatabase(this.dbName);
			openreq.onerror = function() { reject(openreq.error);};
			openreq.onsuccess = function() { resolve(openreq.result); };
		});
	}
};

const conn = new Connection();


type CallBack = (store:IDBObjectStore) => IDBRequest;

export class BrowserStore {

	constructor(public storeName:string){

	}
  private createTransaction(db:IDBDatabase, mode:IDBTransactionMode, callback: CallBack) :Promise<IDBRequest> {

	  return new Promise( (resolve, reject) => {
		  const transaction = db.transaction(this.storeName, mode);
		  // this somehow didn't work occasionally in Safari ?!
		  // transaction.oncomplete = function() {
		  // 		resolve();
		  // }
		  transaction.onabort = transaction.onerror = () => {
			  reject(transaction.error);
		  }

		  const req = callback(transaction.objectStore(this.storeName));
		  req.onsuccess = () => {
			  resolve(req);
		  }
		  req.onerror = () => {
			  reject(req.error);
		  }

	  });
  }

	private async getStore(mode:IDBTransactionMode) {
		let db = await conn.connect();

		if(!db.objectStoreNames.contains(this.storeName)) {
			db = await this.createStore();
		}

		return db.transaction(this.storeName, mode)
			.objectStore(this.storeName);
	}

	private async createStore() {
		const db = await conn.upgrade();
		db.createObjectStore(this.storeName);
		conn.disconnect();

		return conn.connect();
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

  public async getItem (key:IDBValidKey) {

		if(!conn.enabled) {
			return Promise.resolve(null);
		}

		const store = await this.getStore("readonly"),
			req = store.get(key);

		return this.requestPromise<any>(req);

	}

	public async setItem(key:IDBValidKey, value:any) {
		if(!conn.enabled) {
			return Promise.resolve(key);
		}

		const store = await this.getStore("readwrite"),
			req = store.put(value, key);

		return this.requestPromise<void>(req).then(() => key);
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
	public async keys () {
		if (!conn.enabled) {
			return Promise.resolve([]);
		}
		const keys: IDBValidKey[] = [];

		const store = await this.getStore("readonly");



		return new Promise((resolve, reject) => {
			// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
			// And openKeyCursor isn't supported by Safari.
			(store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
				if (!this.result) {
					resolve(keys);
					return;
				}
				keys.push(this.result.key);
				this.result.continue();
			};
		});

	}
}
