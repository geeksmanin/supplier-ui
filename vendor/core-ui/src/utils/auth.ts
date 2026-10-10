export interface CurrentUser {
  userId: string;
  userEmail: string;
  userName: string;
  tenantCode: string;
}

/**
 * Retrieves the current authenticated user context from localStorage or decodes it from the JWT token.
 * Automatically backfills localStorage keys if missing.
 */
export function getCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') {
    return {
      userId: '',
      userEmail: '',
      userName: '',
      tenantCode: '',
    };
  }

  let userId = localStorage.getItem('user_id') || localStorage.getItem('erp_user_id') || '';
  let userEmail = localStorage.getItem('user_email') || '';
  let userName = localStorage.getItem('user_name') || localStorage.getItem('erp_username') || '';
  let tenantCode = localStorage.getItem('tenant_code') || localStorage.getItem('workspace_code') || '';
  if (tenantCode === 'business') {
    tenantCode = '';
  }

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length > 1) {
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));

        if (!userId && (decoded.user_id || decoded.id || decoded.sub)) {
          userId = decoded.user_id || decoded.id || decoded.sub;
          localStorage.setItem('user_id', userId);
        }
        if (!userEmail && (decoded.user_email || decoded.email)) {
          userEmail = decoded.user_email || decoded.email;
          localStorage.setItem('user_email', userEmail);
        }
        if (!userName && (decoded.user_alias || decoded.name || decoded.username)) {
          userName = decoded.user_alias || decoded.name || decoded.username;
          localStorage.setItem('user_name', userName);
        }
        const tokenTenant = decoded.tenant_alias || decoded.tenant_code || decoded.tenant || decoded.workspace_code || decoded.workspace;
        if (tokenTenant && tokenTenant !== 'business') {
          tenantCode = tokenTenant;
          localStorage.setItem('tenant_code', tenantCode);
          localStorage.setItem('workspace_code', tenantCode);
        } else if (!tenantCode && (decoded.tenant_alias || decoded.tenant_code)) {
          tenantCode = decoded.tenant_alias || decoded.tenant_code;
          if (tenantCode !== 'business') {
            localStorage.setItem('tenant_code', tenantCode);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse JWT payload in getCurrentUser:', err);
    }
  }

  if (tenantCode === 'business') {
    tenantCode = '';
  }

  return {
    userId: userId || 'usr-self',
    userEmail: userEmail || 'user@example.com',
    userName: userName || (userEmail ? userEmail.split('@')[0] : 'Staff Member'),
    tenantCode: tenantCode || '',
  };
}

/**
 * Saves current user properties to localStorage.
 */
export function setCurrentUser(user: Partial<CurrentUser>): void {
  if (typeof window === 'undefined') return;
  if (user.userId) {
    localStorage.setItem('user_id', user.userId);
    localStorage.setItem('erp_user_id', user.userId);
  }
  if (user.userEmail) {
    localStorage.setItem('user_email', user.userEmail);
  }
  if (user.userName) {
    localStorage.setItem('user_name', user.userName);
    localStorage.setItem('erp_username', user.userName);
  }
  if (user.tenantCode && user.tenantCode !== 'business') {
    localStorage.setItem('tenant_code', user.tenantCode);
    localStorage.setItem('workspace_code', user.tenantCode);
  }
}

/**
 * Clears current user identity from localStorage.
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user_id');
  localStorage.removeItem('erp_user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  localStorage.removeItem('erp_username');
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
}

/**
 * Retrieves the stored JWT authentication token.
 */
export function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
}

/**
 * Saves authentication token to localStorage.
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Removes authentication token from localStorage.
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
}


/**
 * Robust helper to check if a message/comment was authored by the current logged-in user.
 * Matches against user_id, user_email, and user_name across various backend envelope formats.
 */
export function isMessageFromSelf(
  msg: any,
  currentUser?: CurrentUser
): boolean {
  if (!msg) return false;

  if (typeof msg.is_self === 'boolean') {
    return msg.is_self;
  }
  if (typeof msg.isSelf === 'boolean') {
    return msg.isSelf;
  }

  const user = currentUser || getCurrentUser();
  const { userId, userEmail, userName } = user;

  // 1. Direct ID comparison
  const msgSenderId =
    msg.sender_id ||
    msg.senderId ||
    msg.created_by_id ||
    msg.CreatedByID ||
    (typeof msg.created_by === 'object' ? msg.created_by?.id : undefined);
  if (userId && userId !== 'usr-self' && msgSenderId) {
    if (String(msgSenderId).toLowerCase() === String(userId).toLowerCase()) {
      return true;
    }
  }

  // 2. Email comparison
  const msgEmail =
    msg.sender_email ||
    msg.senderEmail ||
    msg.email ||
    (typeof msg.created_by === 'object' ? msg.created_by?.email : undefined);
  if (userEmail && msgEmail) {
    if (String(msgEmail).toLowerCase() === String(userEmail).toLowerCase()) {
      return true;
    }
  }

  // 3. CreatedBy string (can be email or name)
  const createdBy = msg.created_by || msg.CreatedBy;
  if (createdBy) {
    const cbLower = String(createdBy).toLowerCase();
    if (userEmail && cbLower === String(userEmail).toLowerCase()) {
      return true;
    }
    if (userName && cbLower === String(userName).toLowerCase()) {
      return true;
    }
  }

  // 4. Sender name
  const senderName = msg.sender_name || msg.senderName;
  if (senderName && userName) {
    if (String(senderName).toLowerCase() === String(userName).toLowerCase()) {
      return true;
    }
  }

  return false;
}
