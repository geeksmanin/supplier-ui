export interface QROptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates an offline PNG data-URL QR code from any string (IRN JWT, Ack URL, text).
 * Compatible with html2canvas and jsPDF without CORS or network latency.
 */
export async function generateQrCodeDataUrl(
  rawText: string,
  options?: QROptions
): Promise<string> {
  if (!rawText || !rawText.trim()) return '';

  try {
    const pkg = 'qrcode';
    const qrModule = await import(/* @vite-ignore */ pkg);
    const QRCode = (qrModule as any).default || qrModule;
    return await QRCode.toDataURL(rawText.trim(), {
      width: options?.width || 360,
      margin: options?.margin !== undefined ? options.margin : 1,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.darkColor || '#0f172a',
        light: options?.lightColor || '#ffffff',
      },
    });
  } catch (err) {
    console.error('[TemplateEngine] QR Code Generation failed:', err);
    return '';
  }
}

export interface UpiPaymentOptions {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  docNo?: string;
  currency?: string;
}

/**
 * Constructs a standard NPCI compliant UPI deep-link URL.
 */
export function buildUpiPaymentUrl(options: UpiPaymentOptions): string {
  const { payeeVpa, payeeName, amount, docNo, currency = 'INR' } = options;
  const numAmount = Math.max(0, Number(amount) || 0);
  const am = numAmount.toFixed(2);
  const tn = docNo ? `Order ${docNo}` : 'Invoice Payment';

  return `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${am}&tn=${encodeURIComponent(tn)}&cu=${currency}`;
}

/**
 * Convenience helper to generate a UPI QR code data-URL
 */
export async function generateUpiQrCodeDataUrl(
  options: UpiPaymentOptions,
  qrOptions?: QROptions
): Promise<string> {
  const upiUrl = buildUpiPaymentUrl(options);
  return generateQrCodeDataUrl(upiUrl, qrOptions);
}
