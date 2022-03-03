// export {Connection};
//
// class Connection {
//
// 	dbName = "groupoffice";
//
// 	enabled = true;
//
// 	conn = null;
//
// 	constructor(stores) {
// 		this.stores = stores;
// 	}
//
// 	/**
// 	 * Workaround safari / webkit bug:
// 	 *
// 	 *  https://bugs.webkit.org/show_bug.cgi?id=226547
// 	 * @return {*|Promise}
// 	 */
// 	idbReady() {
// 		const isSafari = /Safari\//.test(navigator.userAgent) &&
// 			!/Chrom(e|ium)\//.test(navigator.userAgent);
// 		// No point putting other browsers through this mess.
// 		if (!isSafari) {
// 			return Promise.resolve();
// 		}
// 		let intervalId;
// 		return new Promise((resolve) => {
// 			const tryIdb = () => {
// 				indexedDB.databases().finally(resolve)
// 			};
//
// 			intervalId = setInterval(tryIdb, 100);
// 			tryIdb();
// 		}).finally(() => clearInterval(intervalId));
// 	}
//
// 	connect(version) {
//
// 		if (!this.conn) {
// 			this.conn = this.idbReady().then(() => {
// 				return new Promise((resolve, reject) => {
// 					const openreq = version ? indexedDB.open(this.dbName, version) : indexedDB.open(this.dbName); //IE11 required the if/else
// 					openreq.onerror = function () {
// 						this.enabled = false;
// 						console.warn("Disabling browser storage in indexedDB because browser doesn't support it.")
// 						reject(openreq.error);
// 					};
// 					openreq.onsuccess = () => {
//
// 						if (this.isUpgradeNeeded(openreq.result)) {
// 							const newVersion = openreq.result.version + 1;
// 							console.warn("IndexedDB Upgrade needed. Bumping version to " + (newVersion));
// 							openreq.result.close();
// 							this.conn = null;
//
// 							this.connect(newVersion).then(() => {
// 								resolve(openreq.result);
// 							}).catch((error) => {
// 								console.error("Upgrade failed. Deleting database and disabling storage.");
// 								this.enabled = true;
// 								this.deleteDatabase();
// 								this.enabled = false;
// 								reject(error);
// 							});
// 						}
//
// 						openreq.result.onversionchange = (e) => {
// 							console.warn("Version change");
// 							openreq.result.close();
// 							this.conn = null;
// 						}
// 						resolve(openreq.result);
// 					}
//
// 					openreq.onblocked = () => {
// 						console.warn("IndexedDB upgrade blocked");
//
// 						reject("blocked");
// 					}
//
// 					openreq.onupgradeneeded = (e) => {
// 						const upgradeDb = e.target.result;
//
// 						this.stores.forEach((name) => {
// 							if (!upgradeDb.objectStoreNames.contains(name)) {
// 								upgradeDb.createObjectStore(name);
// 							}
// 						});
//
// 					};
// 				});
// 			});
//
// 		}
//
// 		return this.conn;
//
// 	}
//
// 	isUpgradeNeeded(db) {
// 		for (let store of this.stores) {
//
// 			if (!db.objectStoreNames.contains(store)) {
// 				return true;
// 			}
//
// 		}
//
// 		return false;
// 	}
//
// 	deleteDatabase() {
//
// 		if (!this.enabled) {
// 			return Promise.resolve(null);
// 		}
//
// 		return new Promise((resolve, reject) => {
// 			const openreq = indexedDB.deleteDatabase(this.dbName);
// 			openreq.onerror = function () {
// 				reject(openreq.error);
// 			};
// 			openreq.onsuccess = function () {
// 				resolve(openreq.result);
// 			};
// 		});
// 	}
// }
