/**
 * IndexedDB Key-Value Store for Form Defaults & Configurations Persistence
 */

const DB_NAME = 'GeeksmanErpFormDefaults';
const DB_VERSION = 1;
const STORE_NAME = 'form_defaults';

function openDefaultsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save form default configurations to IndexedDB
 */
export async function saveStoredFormDefaults<T = any>(formKey: string, data: T): Promise<void> {
  try {
    const db = await openDefaultsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ data, updatedAt: new Date().toISOString() }, formKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save form defaults:', err);
  }
}

/**
 * Retrieve cached form default configurations from IndexedDB
 */
export async function getStoredFormDefaults<T = any>(formKey: string): Promise<{ data: T; updatedAt: string } | null> {
  try {
    const db = await openDefaultsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(formKey);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to read form defaults:', err);
    return null;
  }
}

/**
 * Clear cached form defaults for a specific form_key or all form keys
 */
export async function clearStoredFormDefaults(formKey?: string): Promise<void> {
  try {
    const db = await openDefaultsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = formKey ? store.delete(formKey) : store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear form defaults:', err);
  }
}
