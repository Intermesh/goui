// export {Store};
//
// class Store {
// 	constructor(conn, name) {
// 		this.conn = conn;
// 		this.name = name;
// 	}
//
// 	_withIDBStore(type, callback) {
//
// 		return this.conn.connect().then((db) => {
// 			return this.createTransaction(db, type, callback);
// 		});
// 	}
//
// 	createTransaction(db, type, callback) {
//
// 		return new Promise(function (resolve, reject) {
// 			const transaction = db.transaction(this.storeName, type);
// 			// this somehow didn't work occasionally in Safari ?!
// 			// transaction.oncomplete = function() {
// 			// 		resolve();
// 			// }
// 			transaction.onabort = transaction.onerror = function () {
// 				reject(transaction.error);
// 			}
//
// 			const req = callback(transaction.objectStore(this.storeName));
// 			req.onsuccess = function () {
// 				resolve(req);
// 			}
// 			req.onerror = function (e) {
// 				reject(req.error);
// 			}
//
// 		});
// 	}
//
// 	getItem = function (key) {
//
// 		if (!this.conn.enabled) {
// 			return Promise.resolve(null);
// 		}
//
// 		return this._withIDBStore('readonly', (store) => {
// 			const req = store.get(key);
// 			if (!req) {
// 				return Promise.reject("Failed to get item " + key + " from store " + this.name);
// 			}
// 			return req.result;
// 		});
// 	}
//
// 	setItem(key, value) {
// 		if (!this.conn.enabled) {
// 			return Promise.resolve(null);
// 		}
//
// 		return this._withIDBStore('readwrite', (store) => {
// 			return store.put(value, key);
// 		});
// 	}
//
// 	removeItem(key) {
// 		if (!this.conn.enabled) {
// 			return Promise.resolve(null);
// 		}
//
// 		return this._withIDBStore('readwrite', function (store) {
// 			return store.delete(key);
// 		});
// 	}
//
// 	clear() {
// 		if (!this.conn.enabled) {
// 			return Promise.resolve(null);
// 		}
//
// 		return this._withIDBStore('readwrite', function (store) {
// 			return store.clear();
// 		});
// 	}
//
// 	keys() {
// 		if (!this.conn.enabled) {
// 			return Promise.resolve([]);
// 		}
// 		const keys = [];
// 		return this._withIDBStore('readonly', function (store) {
// 			// This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
// 			// And openKeyCursor isn't supported by Safari.
// 			(store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
// 				if (!this.result)
// 					return;
// 				keys.push(this.result.key);
// 				this.result.continue();
// 			};
// 		}).then(function () {
// 			return keys;
// 		});
// 	}
// }