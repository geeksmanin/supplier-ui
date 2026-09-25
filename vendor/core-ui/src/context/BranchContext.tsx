import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../api/client';

export interface BranchInfo {
  id?: string;
  code: string;
  name: string;
  is_head_office?: boolean;
  gstin?: string;
  is_active?: boolean;
  default_location_id?: string;
}

export interface BranchContextType {
  activeBranch: string; // e.g. 'HQ', 'MUM', or 'ALL'
  activeBranchDetails: BranchInfo | null;
  availableBranches: BranchInfo[];
  isMultiBranch: boolean;
  loading: boolean;
  setActiveBranch: (code: string) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBranch, setActiveBranchState] = useState<string>(() => {
    return localStorage.getItem('active_branch') || '';
  });
  const [availableBranches, setAvailableBranches] = useState<BranchInfo[]>([]);
  const [isMultiBranch, setIsMultiBranch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBranches = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAvailableBranches([]);
      setIsMultiBranch(false);
      setLoading(false);
      return;
    }

    const claims = decodeJwtPayload(token);
    const roles: string[] = claims?.roles || [];
    const allowedBranches: string[] = claims?.allowed_branches || [];
    const userBusinessCode: string = claims?.business_code || 'HQ';

    const isAdmin = roles.includes('admin') || roles.includes('platform-admin');
    const hasWildcard = allowedBranches.includes('*');
    const multiAccess = isAdmin || hasWildcard || allowedBranches.length > 1;
    setIsMultiBranch(multiAccess);

    try {
      setLoading(true);
      const res = await apiClient.get('/hr/branches');
      const allBranches: BranchInfo[] = (res.data?.data || []).map((b: any) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        is_head_office: !!b.is_head_office,
        gstin: b.gstin,
        is_active: b.is_active !== undefined ? !!b.is_active : true,
        default_location_id: b.default_location_id,
      })).filter((b: BranchInfo) => b.is_active);

      let filtered: BranchInfo[] = [];
      if (isAdmin || hasWildcard) {
        filtered = allBranches;
      } else if (allowedBranches.length > 0) {
        filtered = allBranches.filter(b => 
          b.code === userBusinessCode || allowedBranches.includes(b.code)
        );
      } else {
        filtered = allBranches.filter(b => b.code === userBusinessCode);
      }

      // If no matching branch found from backend, provide user's fallback branch
      if (filtered.length === 0) {
        filtered = [{
          code: userBusinessCode,
          name: userBusinessCode === 'HQ' ? 'Head Office' : `Branch ${userBusinessCode}`,
          is_head_office: userBusinessCode === 'HQ',
          is_active: true,
        }];
      }

      setAvailableBranches(filtered);

      // Validate or resolve activeBranch
      const storedBranch = localStorage.getItem('active_branch');
      let targetBranch = storedBranch || userBusinessCode;

      if (targetBranch === 'ALL') {
        if (!multiAccess) {
          targetBranch = userBusinessCode;
        }
      } else if (!filtered.some(b => b.code === targetBranch)) {
        targetBranch = filtered.find(b => b.is_head_office)?.code || filtered[0]?.code || userBusinessCode;
      }

      setActiveBranchState(targetBranch);
      localStorage.setItem('active_branch', targetBranch);
    } catch (err) {
      console.warn('Failed to load branches from /hr/branches:', err);
      // Graceful fallback from JWT claims
      const fallbackList: BranchInfo[] = [{
        code: userBusinessCode,
        name: userBusinessCode === 'HQ' ? 'Head Office' : `Branch ${userBusinessCode}`,
        is_head_office: userBusinessCode === 'HQ',
        is_active: true,
      }];
      setAvailableBranches(fallbackList);
      setActiveBranchState(userBusinessCode);
      localStorage.setItem('active_branch', userBusinessCode);
    } finally {
      setLoading(false);
    }
  }, []);

  const setActiveBranch = useCallback((code: string) => {
    setActiveBranchState(code);
    localStorage.setItem('active_branch', code);
    window.dispatchEvent(new CustomEvent('branch_change_event', { detail: { branch: code } }));
  }, []);

  useEffect(() => {
    fetchBranches();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'active_branch' || e.key === 'tenant_code') {
        fetchBranches();
      }
    };

    const handleAppLogin = () => {
      fetchBranches();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app_login_event', handleAppLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app_login_event', handleAppLogin);
    };
  }, [fetchBranches]);

  const activeBranchDetails = useMemo(() => {
    if (activeBranch === 'ALL') {
      return {
        code: 'ALL',
        name: 'All Branches (Consolidated)',
        is_head_office: false,
        is_active: true,
      };
    }
    return availableBranches.find(b => b.code === activeBranch) || null;
  }, [activeBranch, availableBranches]);

  const contextValue = useMemo<BranchContextType>(() => ({
    activeBranch,
    activeBranchDetails,
    availableBranches,
    isMultiBranch,
    loading,
    setActiveBranch,
    refreshBranches: fetchBranches,
  }), [activeBranch, activeBranchDetails, availableBranches, isMultiBranch, loading, setActiveBranch, fetchBranches]);

  return (
    <BranchContext.Provider value={contextValue}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (!context) {
    // Return a safe fallback if used outside Provider
    const stored = (typeof window !== 'undefined' ? localStorage.getItem('active_branch') : null) || 'HQ';
    return {
      activeBranch: stored,
      activeBranchDetails: null,
      availableBranches: [],
      isMultiBranch: false,
      loading: false,
      setActiveBranch: (code: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('active_branch', code);
          window.dispatchEvent(new CustomEvent('branch_change_event', { detail: { branch: code } }));
        }
      },
      refreshBranches: async () => {},
    };
  }
  return context;
};
