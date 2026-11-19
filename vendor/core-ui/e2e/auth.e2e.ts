import type { Browser, BrowserContext, Page } from '@playwright/test';

export type UIAppTarget =
  | 'erp-ui'
  | 'erp-staff-ui'
  | 'erp-customer-ui'
  | 'samwad-ui'
  | 'supplier-ui'
  | 'pos-ui';

export type ActorRole = 'admin' | 'staff' | 'restricted_staff' | 'customer' | 'supplier';

export interface UIAppProfile {
  app: UIAppTarget;
  defaultPort: number;
  landingHash: string;
}

export const UI_APP_PROFILES: Record<UIAppTarget, UIAppProfile> = {
  'erp-ui': { app: 'erp-ui', defaultPort: 3000, landingHash: '/#/dashboard' },
  'erp-customer-ui': { app: 'erp-customer-ui', defaultPort: 3001, landingHash: '/#/home' },
  'erp-staff-ui': { app: 'erp-staff-ui', defaultPort: 3002, landingHash: '/#/home' },
  'supplier-ui': { app: 'supplier-ui', defaultPort: 3002, landingHash: '/#/home' },
  'samwad-ui': { app: 'samwad-ui', defaultPort: 3004, landingHash: '/#/' },
  'pos-ui': { app: 'pos-ui', defaultPort: 3008, landingHash: '/#/' },
};

export interface TestActor {
  role: ActorRole;
  tenantCode: string;
  email: string;
  password: string;
  token: string;
  userId: string;
  displayName: string;
  organisationId?: string;
}

export interface ResolveAdminOptions {
  tenantCode?: string;
  email?: string;
  password?: string;
  forceFreshTenant?: boolean;
}

export interface ProvisionStaffOptions {
  email?: string;
  password?: string;
  displayName?: string;
  restricted?: boolean;
  permissions?: string[];
}

export interface ProvisionPortalOptions {
  email?: string;
  password?: string;
  displayName?: string;
  organisationName?: string;
}

export interface SeedAuthOptions {
  backendURL: string;
  app?: UIAppTarget;
  branchCode?: string;
}

export function resolveBackendURL(explicit?: string): string {
  const raw = explicit || process.env.E2E_API_URL || process.env.API_BASE_URL || 'http://127.0.0.1:8089/api/v1';
  return raw.replace(/\/+$/, '');
}

async function apiJSON(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
  token?: string,
  extraHeaders?: Record<string, string>
): Promise<{ status: number; ok: boolean; json: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  return { status: res.status, ok: res.ok, json: parsed };
}

function decodeJwtClaims(token: string): Record<string, any> {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

/**
 * Waits until the real Go backend is reachable and verifies its license status.
 * If the test server is unlicensed, triggers GET /clientlicense/check?auto_apply=true.
 */
export async function ensureBackendAndLicenseReady(
  backendURL: string,
  opts?: { timeoutMs?: number; tenantCode?: string; token?: string }
): Promise<{ licenseStatus: string }> {
  const base = resolveBackendURL(backendURL);
  const deadline = Date.now() + (opts?.timeoutMs ?? 30_000);

  let ready = false;
  while (Date.now() < deadline) {
    try {
      const probe = await fetch(`${base}/tenant/setup-status`);
      if (probe.status < 500) {
        ready = true;
        break;
      }
    } catch {
      // Backend still booting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) {
    throw new Error(`Real backend at ${base} did not become ready within timeout`);
  }

  const headers: Record<string, string> = {};
  if (opts?.tenantCode) {
    headers['X-Tenant-Code'] = opts.tenantCode;
  }
  const statusRes = await apiJSON(`${base}/clientlicense/status`, 'GET', undefined, opts?.token, headers);
  const currentStatus: string = statusRes.json?.data?.status || 'unknown';
  if (currentStatus === 'active') {
    return { licenseStatus: 'active' };
  }

  if (opts?.token) {
    const checkRes = await apiJSON(
      `${base}/clientlicense/check?auto_apply=true`,
      'GET',
      undefined,
      opts.token,
      headers
    );
    if (checkRes.ok && checkRes.json?.data?.activated) {
      return { licenseStatus: 'active' };
    }
  }
  return { licenseStatus: currentStatus };
}

/**
 * Ensures the platform tenant is initialized and returns a valid platform admin JWT.
 */
export async function ensurePlatformAdminToken(backendURL: string): Promise<string> {
  const base = resolveBackendURL(backendURL);
  await apiJSON(`${base}/tenant/setup`, 'POST', {
    code: 'platform',
    name: 'Geeksman Platform Org',
    phone: '+1234567890',
    email: 'admin@geeksman.co.in',
    workspace: 'platform',
    admin_email: 'admin@geeksman.co.in',
    admin_password: 'adminPassword123',
  });

  const candidates: Array<{ email: string; password: string }> = [
    ...(process.env.E2E_PLATFORM_EMAIL && process.env.E2E_PLATFORM_PASSWORD
      ? [{ email: process.env.E2E_PLATFORM_EMAIL, password: process.env.E2E_PLATFORM_PASSWORD }]
      : []),
    { email: 'admin@geeksman.co.in', password: 'admin@123' },
    { email: 'admin@geeksman.co.in', password: 'adminPassword123' },
    { email: 'admin@platform.com', password: 'adminPassword123' },
  ];

  for (const cred of candidates) {
    const login = await apiJSON(`${base}/tenant/users/login`, 'POST', {
      tenant_code: 'platform',
      email: cred.email,
      password: cred.password,
    });
    const token = login.json?.data?.access_token;
    if (login.ok && token) {
      return token;
    }
  }
  throw new Error(`Failed to authenticate platform admin against ${base}`);
}

/**
 * Resolves a real Admin TestActor against the live Go backend:
 * 1. Uses explicit options or env vars (E2E_TENANT_CODE, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD) when provided.
 * 2. Otherwise dynamically provisions a fresh isolated test tenant via POST /tenant and logs in.
 */
export async function resolveAdminActor(
  backendURL: string,
  opts?: ResolveAdminOptions
): Promise<TestActor> {
  const base = resolveBackendURL(backendURL);
  await ensureBackendAndLicenseReady(base);

  const envTenant = opts?.tenantCode || process.env.E2E_TENANT_CODE;
  const envEmail = opts?.email || process.env.E2E_ADMIN_EMAIL;
  const envPassword = opts?.password || process.env.E2E_ADMIN_PASSWORD;

  if (!opts?.forceFreshTenant && envTenant && envEmail && envPassword) {
    const login = await apiJSON(`${base}/tenant/users/login`, 'POST', {
      tenant_code: envTenant,
      email: envEmail,
      password: envPassword,
    });
    const token = login.json?.data?.access_token;
    if (login.ok && token) {
      await ensureBackendAndLicenseReady(base, { tenantCode: envTenant, token });
      const claims = decodeJwtClaims(token);
      return {
        role: 'admin',
        tenantCode: envTenant,
        email: envEmail,
        password: envPassword,
        token,
        userId: String(claims.user_id || claims.sub || ''),
        displayName: String(claims.user_name || 'Tenant Admin'),
      };
    }
  }

  const platToken = await ensurePlatformAdminToken(base);
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const tenantCode = opts?.tenantCode || `e2e_${stamp}`;
  const email = opts?.email || `admin_${stamp}@geeksman.test`;
  const password = opts?.password || 'E2eAdmin@123';

  const created = await apiJSON(
    `${base}/tenant`,
    'POST',
    {
      code: tenantCode,
      name: `E2E Workspace ${stamp}`,
      phone: '+919876543210',
      email,
      workspace: tenantCode,
      admin_email: email,
      admin_password: password,
      service: 'erp',
    },
    platToken
  );
  if (created.status !== 201 && created.status !== 200) {
    throw new Error(`Failed to provision E2E tenant (${created.status}): ${JSON.stringify(created.json)}`);
  }

  const login = await apiJSON(`${base}/tenant/users/login`, 'POST', {
    tenant_code: tenantCode,
    email,
    password,
  });
  const token = login.json?.data?.access_token;
  if (!login.ok || !token) {
    throw new Error(`Failed to login as newly provisioned tenant admin: ${JSON.stringify(login.json)}`);
  }

  await ensureBackendAndLicenseReady(base, { tenantCode, token });
  const claims = decodeJwtClaims(token);
  return {
    role: 'admin',
    tenantCode,
    email,
    password,
    token,
    userId: String(claims.user_id || claims.sub || ''),
    displayName: String(claims.user_name || 'Tenant Admin'),
  };
}

/**
 * Provisions a real Staff (or Restricted Staff with zero/minimal permissions for 403 RBAC tests)
 * inside the given admin's tenant via POST /tenant/roles + POST /tenant/users + login.
 */
export async function provisionStaffActor(
  backendURL: string,
  adminActor: TestActor,
  opts?: ProvisionStaffOptions
): Promise<TestActor> {
  const base = resolveBackendURL(backendURL);
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const isRestricted = Boolean(opts?.restricted);
  const roleName = isRestricted ? `E2E Restricted ${suffix}` : `E2E Staff ${suffix}`;
  let permissionsPayload: Array<{ permission_id: string; scope: string }> = [];
  if (!isRestricted) {
    const permsRes = await apiJSON(`${base}/tenant/permissions`, 'GET', undefined, adminActor.token);
    const pList = Array.isArray(permsRes.json?.data?.permissions) ? permsRes.json.data.permissions : [];
    const wanted = opts?.permissions;
    permissionsPayload = pList
      .filter((p: any) => {
        if (!p?.id) return false;
        if (!wanted || wanted.length === 0) return true;
        const name = String(p.name || p.key || p.code || p.id);
        return wanted.includes(name) || wanted.includes(String(p.id));
      })
      .slice(0, 25)
      .map((p: any) => ({ permission_id: String(p.id), scope: 'all' }));
  }

  const roleRes = await apiJSON(
    `${base}/tenant/roles`,
    'POST',
    {
      name: roleName,
      description: isRestricted ? 'Restricted role for 403 RBAC E2E tests' : 'Standard E2E staff role',
      permissions: permissionsPayload,
    },
    adminActor.token
  );
  const roleId = roleRes.json?.data?.id || roleRes.json?.data?.ID;
  if (!roleRes.ok || !roleId) {
    throw new Error(`Failed to create staff role (${roleRes.status}): ${JSON.stringify(roleRes.json)}`);
  }

  const email = opts?.email || `${isRestricted ? 'restricted' : 'staff'}_${suffix}@geeksman.test`;
  const password = opts?.password || 'E2eStaff@123';
  const displayName = opts?.displayName || (isRestricted ? 'E2E Restricted Staff' : 'E2E Staff Member');
  const phone = `+919${String(Math.floor(100000000 + Math.random() * 899999999))}`;

  const userRes = await apiJSON(
    `${base}/tenant/users`,
    'POST',
    {
      name: displayName,
      email,
      phone,
      password,
      role_ids: [String(roleId)],
      user_type: 'staff',
      is_all_subscriptions: true,
    },
    adminActor.token
  );
  if (!userRes.ok) {
    throw new Error(`Failed to create staff user (${userRes.status}): ${JSON.stringify(userRes.json)}`);
  }

  const login = await apiJSON(`${base}/tenant/users/login`, 'POST', {
    tenant_code: adminActor.tenantCode,
    email,
    password,
  });
  const token = login.json?.data?.access_token;
  if (!login.ok || !token) {
    throw new Error(`Failed to login as staff user (${login.status}): ${JSON.stringify(login.json)}`);
  }

  const claims = decodeJwtClaims(token);
  return {
    role: isRestricted ? 'restricted_staff' : 'staff',
    tenantCode: adminActor.tenantCode,
    email,
    password,
    token,
    userId: String(claims.user_id || claims.sub || ''),
    displayName,
  };
}

async function provisionPortalActor(
  backendURL: string,
  adminActor: TestActor,
  portalType: 'customer' | 'supplier',
  opts?: ProvisionPortalOptions
): Promise<TestActor> {
  const base = resolveBackendURL(backendURL);
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const orgName = opts?.organisationName || `E2E ${portalType.toUpperCase()} Org ${suffix}`;
  const email = opts?.email || `${portalType}_${suffix}@geeksman.test`;
  const password = opts?.password || 'E2ePortal@123';
  const displayName = opts?.displayName || `E2E ${portalType} User`;

  const orgRes = await apiJSON(
    `${base}/contacts/organisations`,
    'POST',
    {
      name: orgName,
      code: `${portalType.slice(0, 3).toUpperCase()}-${suffix.slice(-6)}`,
      organisation_type: portalType,
      email,
      phone: '+919876500001',
    },
    adminActor.token
  );
  const organisationId = orgRes.json?.data?.id || orgRes.json?.data?.ID || '';

  const portalRoleRes = await apiJSON(
    `${base}/tenant/roles`,
    'POST',
    {
      name: `E2E ${portalType} ${suffix}`,
      description: `E2E ${portalType} portal role`,
      permissions: [],
    },
    adminActor.token
  );
  const portalRoleId = portalRoleRes.json?.data?.id || portalRoleRes.json?.data?.ID;
  const phone = `+919${String(Math.floor(100000000 + Math.random() * 899999999))}`;
  const userRes = await apiJSON(
    `${base}/tenant/users`,
    'POST',
    {
      name: displayName,
      email,
      phone,
      password,
      user_type: portalType,
      role_ids: portalRoleId ? [String(portalRoleId)] : [],
      organisation_id: organisationId || undefined,
      is_all_subscriptions: true,
    },
    adminActor.token
  );
  if (!userRes.ok) {
    throw new Error(`Failed to create ${portalType} portal user (${userRes.status}): ${JSON.stringify(userRes.json)}`);
  }

  const login = await apiJSON(`${base}/tenant/users/login`, 'POST', {
    tenant_code: adminActor.tenantCode,
    email,
    password,
  });
  const token = login.json?.data?.access_token;
  if (!login.ok || !token) {
    throw new Error(`Failed to login as ${portalType} user (${login.status}): ${JSON.stringify(login.json)}`);
  }

  const claims = decodeJwtClaims(token);
  return {
    role: portalType,
    tenantCode: adminActor.tenantCode,
    email,
    password,
    token,
    userId: String(claims.user_id || claims.sub || ''),
    displayName,
    organisationId: organisationId ? String(organisationId) : undefined,
  };
}

export async function provisionCustomerActor(
  backendURL: string,
  adminActor: TestActor,
  opts?: ProvisionPortalOptions
): Promise<TestActor> {
  return provisionPortalActor(backendURL, adminActor, 'customer', opts);
}

export async function provisionSupplierActor(
  backendURL: string,
  adminActor: TestActor,
  opts?: ProvisionPortalOptions
): Promise<TestActor> {
  return provisionPortalActor(backendURL, adminActor, 'supplier', opts);
}

/**
 * Seeds real JWT auth & runtime backend config into a Playwright BrowserContext
 * via context.addInitScript — zero fake REST API mocking.
 */
export async function seedAuthContext(
  context: BrowserContext,
  actor: TestActor,
  opts: SeedAuthOptions
): Promise<void> {
  const base = resolveBackendURL(opts.backendURL);
  await context.addInitScript(
    ({ apiBaseUrl, authActor, branchCode }) => {
      (window as any).runtimeConfig = {
        apiBaseUrl,
        commentsApiBaseUrl: `${apiBaseUrl}/comments`,
      };
      window.localStorage.setItem('token', authActor.token);
      window.localStorage.setItem('auth_token', authActor.token);
      window.localStorage.setItem('tenant_code', authActor.tenantCode);
      window.localStorage.setItem('workspace_code', authActor.tenantCode);
      window.localStorage.setItem('last_used_workspace', authActor.tenantCode);
      window.localStorage.setItem('user_id', authActor.userId);
      window.localStorage.setItem('erp_user_id', authActor.userId);
      window.localStorage.setItem('user_email', authActor.email);
      window.localStorage.setItem('user_name', authActor.displayName);
      window.localStorage.setItem('erp_username', authActor.displayName);
      window.localStorage.setItem('portal_override_backend_url', 'true');
      window.localStorage.setItem('portal_backend_url', apiBaseUrl);
      if (branchCode) {
        window.localStorage.setItem('active_branch', branchCode);
      }
    },
    { apiBaseUrl: base, authActor: actor, branchCode: opts.branchCode || '' }
  );
}

/**
 * Creates a reusable Playwright storageState.json file seeded with a real backend JWT.
 */
export async function createStorageState(
  browser: Browser,
  actor: TestActor,
  opts: SeedAuthOptions & { appOrigin: string; outPath: string }
): Promise<string> {
  const context = await browser.newContext();
  try {
    await seedAuthContext(context, actor, opts);
    const page: Page = await context.newPage();
    await page.goto(opts.appOrigin, { waitUntil: 'domcontentloaded' });
    await context.storageState({ path: opts.outPath });
    return opts.outPath;
  } finally {
    await context.close();
  }
}
