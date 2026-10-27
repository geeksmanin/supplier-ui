import { useState, useEffect } from 'react';
import { resolveMediaUrl, toRelativeMediaUrl, ResolveMediaOptions, getActiveTenant } from './media';

export const MEDIA_CACHE_NAME = 'geeksman-media-cache-v1';
export const LEGACY_MEDIA_CACHE_NAME = 'samwad-media-cache-v1';
const IDB_NAME = 'GeeksmanMediaCacheDB';
const LEGACY_IDB_NAME = 'SamwadMediaCacheDB';
const IDB_VERSION = 1;
const IDB_STORE = 'media_items';
const MAX_MEMORY_ITEMS = 1000;
const MAX_CACHE_BYTES = 500 * 1024 * 1024; // 500MB LRU storage budget

// In-memory cache mapping cleanKey -> blobUrl for instant (0ms) access
const memoryBlobUrlMap = new Map<string, string>();
const memoryKeyOrder: string[] = [];

// Deduplication map for simultaneous in-flight downloads
const inFlightPromises = new Map<string, Promise<string>>();

/**
 * getMediaCacheKey extracts a normalized, deterministic key for any upload ID or URL.
 * Strips hostname, query strings, and standard prefixes so that different representations
 * of the exact same asset resolve to the identical cache record.
 */
export function getMediaCacheKey(uploadIdOrUrl: string): string {
  if (!uploadIdOrUrl) return '';
  const trimmed = uploadIdOrUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const relative = toRelativeMediaUrl(trimmed);
  return relative.split('?')[0];
}

/**
 * Helper to record a blob URL into memory with LRU eviction
 */
function saveToMemoryMap(key: string, blobUrl: string): void {
  if (memoryBlobUrlMap.has(key)) {
    return;
  }

  if (memoryKeyOrder.length >= MAX_MEMORY_ITEMS) {
    const oldestKey = memoryKeyOrder.shift();
    if (oldestKey) {
      const oldBlob = memoryBlobUrlMap.get(oldestKey);
      if (oldBlob && oldBlob.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(oldBlob);
        } catch {}
      }
      memoryBlobUrlMap.delete(oldestKey);
    }
  }

  memoryBlobUrlMap.set(key, blobUrl);
  memoryKeyOrder.push(key);
}

/**
 * getMemoryCachedUrl synchronously returns the in-memory object URL if already cached,
 * or null if not yet resolved.
 */
export function getMemoryCachedUrl(uploadIdOrUrl: string): string | null {
  if (!uploadIdOrUrl) return null;
  const key = getMediaCacheKey(uploadIdOrUrl);
  return memoryBlobUrlMap.get(key) || null;
}

// IndexedDB Helper Promise
let idbPromise: Promise<IDBDatabase> | null = null;

function openMediaIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        const store = db.createObjectStore(IDB_STORE, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      idbPromise = null;
      reject(req.error);
    };
  });

  return idbPromise;
}

async function getBlobFromIndexedDB(key: string): Promise<Blob | null> {
  try {
    const db = await openMediaIDB();
    return new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        const item = req.result;
        if (item?.blob) {
          // Touch lastAccessed for LRU
          try {
            item.lastAccessed = Date.now();
            store.put(item);
          } catch {}
          resolve(item.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Prune oldest records if estimated storage exceeds 500MB
 */
async function pruneLRUStorageIfNeeded(): Promise<void> {
  try {
    const db = await openMediaIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const countReq = store.count();
    countReq.onsuccess = () => {
      // If store has over 4000 items, prune the oldest 20%
      if (countReq.result > 4000) {
        const toDelete = Math.floor(countReq.result * 0.2);
        let deleted = 0;
        const index = store.index('lastAccessed');
        const cursorReq = index.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && deleted < toDelete) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch {}
}

async function saveBlobToIndexedDB(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openMediaIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put({
        key,
        blob,
        size: blob.size,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    // Trigger non-blocking LRU check
    pruneLRUStorageIfNeeded().catch(() => {});
  } catch {}
}

/**
 * saveBlobToMediaCache writes a blob directly into local L1 (memory), L3 (CacheStorage),
 * and L4 (IndexedDB) caches. Call this upon successful media upload to guarantee 0ms,
 * flicker-free immediate rendering everywhere in the app.
 */
export async function saveBlobToMediaCache(rawUrlOrId: string, blob: Blob): Promise<void> {
  if (!rawUrlOrId || !blob) return;
  const key = getMediaCacheKey(rawUrlOrId);
  if (!key) return;

  const blobUrl = URL.createObjectURL(blob);
  saveToMemoryMap(key, blobUrl);

  const fakeUrl = `https://samwad.media.local${key.startsWith('/') ? key : '/' + key}`;

  // 1. Save to Web CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(MEDIA_CACHE_NAME);
      await cache.put(
        fakeUrl,
        new Response(blob, {
          headers: {
            'Content-Type': blob.type || 'image/jpeg',
            'Content-Length': String(blob.size),
          },
        })
      );
    } catch (cacheErr) {
      console.warn('[mediaCache] CacheStorage write-through failed:', cacheErr);
    }
  }

  // 2. Save to persistent IndexedDB
  try {
    await saveBlobToIndexedDB(key, blob);
  } catch (idbErr) {
    console.warn('[mediaCache] IndexedDB write-through failed:', idbErr);
  }
}

/**
 * getCachedMediaUrl retrieves a local blob URL for the specified media asset.
 *
 * Check sequence:
 * 1. In-memory Map (0ms)
 * 2. In-flight Promise (deduplicated network/cache read)
 * 3. CacheStorage (`samwad-media-cache-v1`)
 * 4. IndexedDB (`SamwadMediaCacheDB`)
 * 5. Network fetch -> clone & persist to CacheStorage + IndexedDB -> return local blob URL
 *
 * If offline or fetch fails, falls back gracefully to standard resolveMediaUrl.
 */
export async function getCachedMediaUrl(
  rawUrl: string,
  options?: ResolveMediaOptions
): Promise<string> {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const key = getMediaCacheKey(trimmed);
  if (memoryBlobUrlMap.has(key)) {
    return memoryBlobUrlMap.get(key)!;
  }

  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key)!;
  }

  const task = (async (): Promise<string> => {
    try {
      const fakeUrl = `https://samwad.media.local${key.startsWith('/') ? key : '/' + key}`;

      // 1. Check Web CacheStorage
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(MEDIA_CACHE_NAME);
          let match = await cache.match(fakeUrl);
          if (!match && LEGACY_MEDIA_CACHE_NAME) {
            try {
              const legacyCache = await caches.open(LEGACY_MEDIA_CACHE_NAME);
              match = await legacyCache.match(fakeUrl);
            } catch {}
          }
          if (match) {
            const blob = await match.blob();
            if (blob && blob.size > 0) {
              const blobUrl = URL.createObjectURL(blob);
              saveToMemoryMap(key, blobUrl);
              return blobUrl;
            }
          }
        } catch (err) {
          console.warn('[mediaCache] CacheStorage lookup failed:', err);
        }
      }

      // 2. Check IndexedDB Fallback
      try {
        const idbBlob = await getBlobFromIndexedDB(key);
        if (idbBlob && idbBlob.size > 0) {
          const blobUrl = URL.createObjectURL(idbBlob);
          saveToMemoryMap(key, blobUrl);

          // Populate CacheStorage if available
          if (typeof window !== 'undefined' && 'caches' in window) {
            try {
              const cache = await caches.open(MEDIA_CACHE_NAME);
              await cache.put(
                fakeUrl,
                new Response(idbBlob, {
                  headers: { 'Content-Type': idbBlob.type || 'image/jpeg' },
                })
              );
            } catch {}
          }
          return blobUrl;
        }
      } catch (err) {
        console.warn('[mediaCache] IndexedDB lookup failed:', err);
      }

      // 3. Not in local caches — Fetch once from server
      const resolved = resolveMediaUrl(rawUrl, options);
      if (!resolved) return '';

      // Prepare request headers (include token if authenticated)
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('staff_token') ||
          localStorage.getItem('erp_user_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        // Include authentic tenant code so the media endpoint resolves correctly
        const tenantCode = (options?.tenant && options.tenant !== 'business')
          ? options.tenant
          : getActiveTenant();
        if (tenantCode && tenantCode !== 'business') {
          headers['X-Tenant-Code'] = tenantCode;
        }
        const branchCode = localStorage.getItem('active_branch');
        if (branchCode) {
          headers['X-Business-Code'] = branchCode;
        }
      }

      const response = await fetch(resolved, { headers });
      if (!response.ok) {
        return resolved;
      }


      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        return resolved;
      }

      const blobUrl = URL.createObjectURL(blob);
      saveToMemoryMap(key, blobUrl);

      // 4. Save to persistent CacheStorage
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(MEDIA_CACHE_NAME);
          await cache.put(
            fakeUrl,
            new Response(blob, {
              headers: {
                'Content-Type': blob.type || 'image/jpeg',
                'Content-Length': String(blob.size),
              },
            })
          );
        } catch (cacheSaveErr) {
          console.warn('[mediaCache] CacheStorage save failed:', cacheSaveErr);
        }
      }

      // 5. Save to persistent IndexedDB
      try {
        await saveBlobToIndexedDB(key, blob);
      } catch (idbSaveErr) {
        console.warn('[mediaCache] IndexedDB save failed:', idbSaveErr);
      }

      return blobUrl;
    } catch (err) {
      console.warn('[mediaCache] Network fetch failed, falling back to resolved URL:', err);
      return resolveMediaUrl(rawUrl, options);
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, task);
  return task;
}

/**
 * preloadMediaUrl downloads and caches a single media item in the background.
 */
export async function preloadMediaUrl(
  rawUrl: string,
  options?: ResolveMediaOptions
): Promise<string> {
  return getCachedMediaUrl(rawUrl, options);
}

/**
 * preloadMediaBatch preloads an array of media URLs concurrently in the background
 * with a controlled concurrency limit to avoid saturating mobile network connections.
 */
export async function preloadMediaBatch(
  rawUrls: string[],
  options?: ResolveMediaOptions,
  concurrency: number = 4
): Promise<void> {
  const uniqueUrls = Array.from(new Set(rawUrls.filter(Boolean)));
  if (uniqueUrls.length === 0) return;

  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, async () => {
    while (index < uniqueUrls.length) {
      const current = uniqueUrls[index++];
      try {
        await getCachedMediaUrl(current, options);
      } catch {}
    }
  });

  await Promise.all(workers);
}

/**
 * useCachedMediaUrl is a reactive hook for components rendering images.
 *
 * - Returns synchronous in-memory blob URL immediately if already cached (zero flicker).
 * - Otherwise provides resolved HTTP URL while initiating background local caching.
 * - When caching finishes, updates state to local blob URL.
 */
export function useCachedMediaUrl(
  rawUrl?: string,
  options?: ResolveMediaOptions
): string {
  const trimmed = (rawUrl || '').trim();
  const isInline = trimmed.startsWith('data:') || trimmed.startsWith('blob:');
  const key = isInline || !trimmed ? '' : getMediaCacheKey(trimmed);
  const resolved = isInline || !trimmed ? trimmed : resolveMediaUrl(trimmed, options);
  const initialMemory = key ? memoryBlobUrlMap.get(key) || null : null;

  const [url, setUrl] = useState<string>(initialMemory || resolved);

  useEffect(() => {
    if (!trimmed || isInline) {
      setUrl(trimmed);
      return;
    }

    let isMounted = true;
    const mem = key ? memoryBlobUrlMap.get(key) : null;
    if (mem) {
      setUrl(mem);
      return;
    }

    setUrl(initialMemory || resolved);

    getCachedMediaUrl(trimmed, options)
      .then((cached) => {
        if (isMounted && cached) {
          setUrl(cached);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUrl(resolved);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [trimmed, key, resolved, isInline]);

  if (!trimmed) return '';
  if (isInline) return trimmed;
  return url || resolved;
}

export const useCachedMedia = useCachedMediaUrl;

/**
 * clearMediaCache wipes all in-memory, CacheStorage, and IndexedDB cached media.
 */
export async function clearMediaCache(): Promise<void> {
  // Revoke in-memory blob URLs
  for (const blobUrl of memoryBlobUrlMap.values()) {
    if (blobUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }
  }
  memoryBlobUrlMap.clear();
  memoryKeyOrder.length = 0;

  // Clear CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete(MEDIA_CACHE_NAME);
    } catch {}
  }

  // Clear IndexedDB
  try {
    const db = await openMediaIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}
}
