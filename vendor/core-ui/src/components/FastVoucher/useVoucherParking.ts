import { useState, useEffect, useCallback } from 'react';
import { 
  VoucherLineItem, 
  VoucherSummary, 
  VoucherPartyOption 
} from './FastVoucherEntryLayout.types';

export interface ParkedBill {
  id: string;
  voucherType: string;
  label?: string;
  createdAt: string;
  party: VoucherPartyOption | null;
  voucherDate: string;
  items: VoucherLineItem[];
  summary: VoucherSummary;
  moreDetails?: any;
}

const DB_NAME = 'GeeksmanErpParkedBillsDB';
const DB_VERSION = 1;
const STORE_NAME = 'parked_bills';

function openParkedBillsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadParkedBillsFromDB(voucherType: string): Promise<ParkedBill[]> {
  try {
    const db = await openParkedBillsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: ParkedBill[] = req.result || [];
        // Filter by voucherType and sort newest first
        const filtered = all
          .filter((b) => b.voucherType === voucherType)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(filtered);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Failed to load parked bills from IndexedDB:', err);
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`parked_bills_${voucherType}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

async function saveParkedBillToDB(bill: ParkedBill): Promise<void> {
  try {
    const db = await openParkedBillsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(bill);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save parked bill to IndexedDB:', err);
  }
}

async function removeParkedBillFromDB(id: string): Promise<void> {
  try {
    const db = await openParkedBillsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to remove parked bill from IndexedDB:', err);
  }
}

export interface UseVoucherParkingOptions {
  voucherType: string;
  onRestoreBill?: (bill: ParkedBill) => void;
}

export interface UseVoucherParkingReturn {
  parkedBills: ParkedBill[];
  parkedCount: number;
  isLoading: boolean;
  parkCurrentBill: (data: {
    party: VoucherPartyOption | null;
    voucherDate: string;
    items: VoucherLineItem[];
    summary: VoucherSummary;
    moreDetails?: any;
    label?: string;
  }) => Promise<ParkedBill | null>;
  recallBill: (id: string) => Promise<ParkedBill | null>;
  deleteBill: (id: string) => Promise<void>;
  clearAllParked: () => Promise<void>;
  refreshParkedBills: () => Promise<void>;
}

export function useVoucherParking({
  voucherType,
  onRestoreBill,
}: UseVoucherParkingOptions): UseVoucherParkingReturn {
  const [parkedBills, setParkedBills] = useState<ParkedBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshParkedBills = useCallback(async () => {
    setIsLoading(true);
    const bills = await loadParkedBillsFromDB(voucherType);
    setParkedBills(bills);
    setIsLoading(false);
  }, [voucherType]);

  useEffect(() => {
    refreshParkedBills();
  }, [refreshParkedBills]);

  const parkCurrentBill = useCallback(
    async (data: {
      party: VoucherPartyOption | null;
      voucherDate: string;
      items: VoucherLineItem[];
      summary: VoucherSummary;
      moreDetails?: any;
      label?: string;
    }): Promise<ParkedBill | null> => {
      if (data.items.length === 0 && !data.party) {
        return null;
      }

      const newBill: ParkedBill = {
        id: `parked_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        voucherType,
        label: data.label || data.party?.label || `Held Cart (${data.items.length} items)`,
        createdAt: new Date().toISOString(),
        party: data.party,
        voucherDate: data.voucherDate,
        items: [...data.items],
        summary: { ...data.summary },
        moreDetails: data.moreDetails ? JSON.parse(JSON.stringify(data.moreDetails)) : undefined,
      };

      await saveParkedBillToDB(newBill);
      setParkedBills((prev) => [newBill, ...prev]);
      return newBill;
    },
    [voucherType]
  );

  const recallBill = useCallback(
    async (id: string): Promise<ParkedBill | null> => {
      const bill = parkedBills.find((b) => b.id === id);
      if (!bill) return null;

      await removeParkedBillFromDB(id);
      setParkedBills((prev) => prev.filter((b) => b.id !== id));
      onRestoreBill?.(bill);
      return bill;
    },
    [parkedBills, onRestoreBill]
  );

  const deleteBill = useCallback(async (id: string) => {
    await removeParkedBillFromDB(id);
    setParkedBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearAllParked = useCallback(async () => {
    for (const bill of parkedBills) {
      await removeParkedBillFromDB(bill.id);
    }
    setParkedBills([]);
  }, [parkedBills]);

  return {
    parkedBills,
    parkedCount: parkedBills.length,
    isLoading,
    parkCurrentBill,
    recallBill,
    deleteBill,
    clearAllParked,
    refreshParkedBills,
  };
}
