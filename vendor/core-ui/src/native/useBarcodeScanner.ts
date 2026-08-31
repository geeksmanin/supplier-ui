import { useState, useCallback } from 'react';
import { getCapacitor, isNativePlatform } from './usePushNotifications';

export interface BarcodeScanResult {
  hasContent: boolean;
  content: string;
  format?: string;
}

export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = useCallback(async (): Promise<BarcodeScanResult> => {
    if (!isNativePlatform()) {
      // Web / Desktop fallback: prompt manual barcode input
      const code = window.prompt('Enter or scan barcode:');
      if (code) {
        return { hasContent: true, content: code.trim(), format: 'MANUAL' };
      }
      return { hasContent: false, content: '' };
    }

    const cap = getCapacitor();
    const BarcodeScanner = cap?.Plugins?.BarcodeScanner;
    if (!BarcodeScanner) {
      console.warn('BarcodeScanner plugin not available');
      return { hasContent: false, content: '' };
    }

    try {
      setIsScanning(true);
      // 1. Check and request camera permission
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera !== 'granted') {
        const req = await BarcodeScanner.requestPermissions();
        if (req.camera !== 'granted') {
          alert('Camera permission is required to scan barcodes.');
          setIsScanning(false);
          return { hasContent: false, content: '' };
        }
      }

      // 2. Start MLKit native scan
      const result = await BarcodeScanner.scan();
      setIsScanning(false);

      if (result && result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];
        return {
          hasContent: true,
          content: barcode.displayValue || barcode.rawValue || '',
          format: barcode.format,
        };
      }
      return { hasContent: false, content: '' };
    } catch (err) {
      setIsScanning(false);
      console.warn('Barcode scan error:', err);
      return { hasContent: false, content: '' };
    }
  }, []);

  const stopScan = useCallback(async () => {
    if (!isNativePlatform()) {
      setIsScanning(false);
      return;
    }
    const cap = getCapacitor();
    try {
      await cap?.Plugins?.BarcodeScanner?.stopScan?.();
    } catch {
      // Ignore
    }
    setIsScanning(false);
  }, []);

  return {
    isScanning,
    startScan,
    stopScan,
    isNative: isNativePlatform(),
  };
};
