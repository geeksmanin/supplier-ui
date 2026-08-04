import { apiClient } from '../api/client';

export interface OfficialGstCaptchaResponse {
  captchaBase64: string;
}

export interface OfficialGstTaxpayerDetails {
  gstin: string;
  legalName?: string;
  tradeName?: string;
  status?: string;
  taxpayerType?: string;
  constitutionOfBusiness?: string;
  registrationDate?: string;
  stateJurisdiction?: string;
  centerJurisdiction?: string;
  principalAddress?: string;
  aadhaarVerifiedFlag?: string;
  aadhaarVerificationDate?: string;
  natureOfBusinessActivities?: string[];
  einvoiceStatus?: string;
  isFieldVisitConducted?: string;
  raw?: any;
}

/**
 * Helper to map official Government GST Portal API response fields to OfficialGstTaxpayerDetails interface
 */
export function mapOfficialGstResponse(json: any, fallbackGstin: string): OfficialGstTaxpayerDetails {
  const pradr = json.pradr || json.principal_address || {};
  const principalAddressStr = typeof pradr === 'string' ? pradr : (pradr.adr || pradr.address || '');

  return {
    gstin: json.gstin || fallbackGstin,
    legalName: json.lgnm || json.legalName || json.legal_name || json.tradeNam || json.tradeName,
    tradeName: json.tradeNam || json.tradeName || json.trade_name || json.lgnm || json.legalName,
    status: json.sts || json.status || json.gst_status,
    taxpayerType: json.dty || json.taxpayerType || json.tax_payer_type,
    constitutionOfBusiness: json.ctb || json.constitutionOfBusiness || json.constitution_of_business,
    registrationDate: json.rgdt || json.registrationDate || json.registration_date,
    stateJurisdiction: json.stj || json.stateJurisdiction || json.state_jurisdiction,
    centerJurisdiction: json.ctj || json.centerJurisdiction || json.center_jurisdiction,
    principalAddress: principalAddressStr,
    aadhaarVerifiedFlag: json.adhrVFlag || json.aadhaarVerifiedFlag,
    aadhaarVerificationDate: json.adhrVdt || json.aadhaarVerificationDate,
    natureOfBusinessActivities: Array.isArray(json.nba) ? json.nba : (json.natureOfBusinessActivities || []),
    einvoiceStatus: json.einvoiceStatus || json.e_invoice_status,
    isFieldVisitConducted: json.isFieldVisitConducted || json.is_field_visit_conducted,
    raw: json
  };
}

/**
 * Step 1 & 2: Fetch Captcha image from backend proxy endpoint or direct GST portal.
 * Converts raw image blob to base64 string.
 */
export async function fetchOfficialGstCaptcha(): Promise<{ captchaBase64: string; cookies?: string }> {
  try {
    const proxyRes = await apiClient.get('/contacts/gst/captcha');
    const data = proxyRes.data?.data || proxyRes.data;
    const captchaBase64 = data.captchaBase64;
    const cookies = data.cookies;
    if (captchaBase64) {
      try {
        const decodedHead = window.atob(captchaBase64.substring(0, 100));
        if (decodedHead.toLowerCase().includes('html') || decodedHead.toLowerCase().includes('rejected')) {
          throw new Error('Official GST Portal Firewall (WAF) rejected automated session. Please try again or search directly.');
        }
      } catch (decodeErr: any) {
        if (decodeErr.message?.includes('Firewall')) throw decodeErr;
      }
      return { captchaBase64, cookies };
    }
  } catch (proxyErr: any) {
    console.warn('Backend GST captcha proxy error:', proxyErr);
    if (proxyErr.message?.includes('Firewall')) {
      throw proxyErr;
    }
  }

  // Direct fetch fallback
  const captchaUrl = 'https://services.gst.gov.in/services/captcha';
  const res = await fetch(captchaUrl, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Could not load Captcha from GST Portal. Please try again.`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64 = bufferToBase64(arrayBuffer);
  return { captchaBase64: base64 };
}

/**
 * Step 3: Submit GSTIN and Captcha to backend proxy or official taxpayerDetails API
 */
export async function fetchOfficialGstTaxpayerDetails(
  gstin: string,
  captchaText: string,
  cookies?: string
): Promise<OfficialGstTaxpayerDetails> {
  try {
    const proxyRes = await apiClient.post('/contacts/gst/taxpayer-details', {
      gstin: gstin.toUpperCase(),
      captcha: captchaText.trim(),
      cookies
    });
    const json = proxyRes.data?.data || proxyRes.data;
    if (json) {
      if (json.errorCode || json.error) {
        throw new Error(json.message || json.error || 'Invalid Captcha or GSTIN not found');
      }
      return mapOfficialGstResponse(json, gstin);
    }
  } catch (proxyErr: any) {
    console.warn('Backend GST taxpayer proxy error:', proxyErr);
    throw proxyErr;
  }

  const detailsUrl = 'https://services.gst.gov.in/services/api/search/taxpayerDetails';
  const response = await fetch(detailsUrl, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({
      gstin: gstin.toUpperCase(),
      captcha: captchaText.trim()
    })
  });

  if (!response.ok) {
    throw new Error(`Official GST API request failed (HTTP ${response.status})`);
  }

  const json = await response.json();
  if (json.errorCode || json.error) {
    throw new Error(json.message || json.error || 'Invalid Captcha or GSTIN not found');
  }

  return mapOfficialGstResponse(json, gstin);
}

/**
 * Quick Basic GST Lookup (BulkPe API fallback - no Captcha required)
 */
export async function fetchQuickGstDetails(gstin: string): Promise<any> {
  const response = await fetch('https://api.bulkpe.in/api/checkGST', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    body: JSON.stringify({ gstIn: gstin.toUpperCase() })
  });

  if (!response.ok) {
    throw new Error(`Quick GST lookup failed with status ${response.status}`);
  }

  return await response.json();
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
