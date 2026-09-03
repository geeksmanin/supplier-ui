/**
 * IndexedDB Key-Value Store for System & Warehouse Settings Persistence on Boot
 */
import { apiClient } from '../api/client';

const SETTINGS_DB_NAME = 'GeeksmanErpSettings';
const SETTINGS_DB_VERSION = 1;
const SETTINGS_STORE_NAME = 'system_settings';

function openSettingsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = window.indexedDB.open(SETTINGS_DB_NAME, SETTINGS_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save settings to IndexedDB
 */
export async function saveStoredSettings<T = any>(settingKey: string, data: T): Promise<void> {
  try {
    const db = await openSettingsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE_NAME);
      const req = store.put({ data, updatedAt: new Date().toISOString() }, settingKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save settings:', err);
  }
}

/**
 * Retrieve cached settings from IndexedDB
 */
export async function getStoredSettings<T = any>(settingKey: string): Promise<T | null> {
  try {
    const db = await openSettingsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE_NAME);
      const req = store.get(settingKey);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as T);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to read settings:', err);
    return null;
  }
}

/**
 * Fetch and sync Warehouse Settings on boot with IndexedDB cache fallback
 */
export async function fetchAndCacheWarehouseSettings(): Promise<any> {
  try {
    const res = await apiClient.get('/api/v1/inventory/settings');
    const settings = res.data?.data || {};
    await saveStoredSettings('warehouse_settings', settings);
    return settings;
  } catch (err) {
    console.warn('[WarehouseSettings] Failed to fetch live settings, using IndexedDB fallback:', err);
    const cached = await getStoredSettings('warehouse_settings');
    return cached || { inbound_workflow_mode: 'SIMPLE' };
  }
}
