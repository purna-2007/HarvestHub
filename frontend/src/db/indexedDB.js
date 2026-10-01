
const DB_NAME = "HarvestHubDB";
const DB_VERSION = 1;

const STORES = {
  workers: "workers",
  jobs: "jobs",
  pendingActions: "pendingActions"
};

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: "id"
          });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
};

export const saveItem = async (storeName, item) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getItem = async (storeName, id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async (storeName) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (storeName, id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(storeName, "readwrite")
      .objectStore(storeName)
      .delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const saveWorker = (worker) =>
  saveItem(STORES.workers, worker);

export const getWorker = (id) =>
  getItem(STORES.workers, id);

export const saveCachedJobs = async (jobs) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.jobs, "readwrite");
    const store = transaction.objectStore(STORES.jobs);

    store.clear();

    jobs.forEach((job) => {
      if (job.id !== undefined && job.id !== null) {
        store.put(job);
      }
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getCachedJobs = () =>
  getAllItems(STORES.jobs);

export const queueAction = (action) =>
  saveItem(STORES.pendingActions, {
    ...action,
    id: action.id || crypto.randomUUID(),
    createdAt: new Date().toISOString()
  });

export const getPendingActions = () =>
  getAllItems(STORES.pendingActions);

export const removePendingAction = (id) =>
  deleteItem(STORES.pendingActions, id);

export const DB_STORES = STORES;