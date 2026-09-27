import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useBranch } from '../context/BranchContext';
import { apiClient } from '../api/client';
import { Select, SelectOption } from './Select';

export interface BranchTeamStaffPickerProps {
  // Controlled values
  branchCode?: string;
  teamId?: string;
  staffId?: string;

  // Change callbacks
  onBranchChange?: (branchCode: string) => void;
  onTeamChange?: (teamId: string) => void;
  onStaffChange?: (staffId: string) => void;

  // Visibility toggles
  showBranch?: boolean;
  showTeam?: boolean;
  showStaff?: boolean;

  // Custom labels
  branchLabel?: string;
  teamLabel?: string;
  staffLabel?: string;

  // Placeholders
  branchPlaceholder?: string;
  teamPlaceholder?: string;
  staffPlaceholder?: string;

  // Constraints & flags
  required?: boolean;
  disabled?: boolean;
  lockBranch?: boolean; // force lock branch even if multi-branch user

  // Styling & layout
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
  style?: React.CSSProperties;
}

interface TeamItem {
  id: string;
  name: string;
  business_code?: string;
  branch_code?: string;
  description?: string;
}

interface StaffItem {
  id: string;
  name: string;
  email?: string;
  business_code?: string;
  allowed_branches?: string[];
  team_id?: string;
  team_ids?: string[];
  role_ids?: string[];
}

export const BranchTeamStaffPicker: React.FC<BranchTeamStaffPickerProps> = ({
  branchCode,
  teamId,
  staffId,
  onBranchChange,
  onTeamChange,
  onStaffChange,
  showBranch = true,
  showTeam = true,
  showStaff = true,
  branchLabel = 'Branch',
  teamLabel = 'Team',
  staffLabel = 'Assigned Staff',
  branchPlaceholder = 'Select Branch...',
  teamPlaceholder = 'Select Team...',
  staffPlaceholder = 'Select Staff Member...',
  required = false,
  disabled = false,
  lockBranch = false,
  layout = 'grid',
  className = '',
  style,
}) => {
  // Access global branch context if available
  const branchContext = useBranch();
  const availableBranches = branchContext?.availableBranches || [];
  const activeBranch = branchContext?.activeBranch || 'HQ';
  const isMultiBranch = branchContext?.isMultiBranch ?? false;

  // Local state for teams and staff
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);
  const [loadingStaff, setLoadingStaff] = useState<boolean>(false);

  // Determine effective branch
  const effectiveBranch = branchCode || (isMultiBranch ? (activeBranch !== 'ALL' ? activeBranch : '') : (availableBranches[0]?.code || activeBranch || 'HQ'));

  // Ensure branch is initialized if not set
  useEffect(() => {
    if (!branchCode && effectiveBranch && onBranchChange) {
      onBranchChange(effectiveBranch);
    }
  }, [branchCode, effectiveBranch, onBranchChange]);

  // Load Teams from HR API
  useEffect(() => {
    let isMounted = true;
    const loadTeams = async () => {
      setLoadingTeams(true);
      try {
        const res = await apiClient.get('/hr/teams');
        if (isMounted) {
          const list = res.data?.data || [];
          setTeams(list);
        }
      } catch (err) {
        console.warn('BranchTeamStaffPicker: Failed to fetch teams', err);
      } finally {
        if (isMounted) setLoadingTeams(false);
      }
    };

    loadTeams();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Staff from tenant/users or /hr/staff
  useEffect(() => {
    let isMounted = true;
    const loadStaff = async () => {
      setLoadingStaff(true);
      try {
        const res = await apiClient.get('/tenant/users');
        if (isMounted) {
          const list = res.data?.data || [];
          setStaffList(list);
        }
      } catch (err) {
        // Fallback to /hr/staff
        try {
          const resFallback = await apiClient.get('/hr/staff');
          if (isMounted) {
            const list = resFallback.data?.data || [];
            setStaffList(
              list.map((s: any) => ({
                id: s.id,
                name: s.display_name || s.name || s.email,
                email: s.email,
                business_code: s.business_code,
                team_id: s.team_id,
              }))
            );
          }
        } catch (fallbackErr) {
          console.warn('BranchTeamStaffPicker: Failed to fetch staff', fallbackErr);
        }
      } finally {
        if (isMounted) setLoadingStaff(false);
      }
    };

    loadStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter teams based on selected branch
  const filteredTeams = useMemo(() => {
    if (!effectiveBranch || effectiveBranch === 'ALL') {
      return teams;
    }
    return teams.filter(t => {
      const bCode = t.business_code || t.branch_code;
      // If team has no specific branch set, allow it across all or HQ
      if (!bCode || bCode === 'HQ' || bCode === '') {
        return true;
      }
      return bCode === effectiveBranch;
    });
  }, [teams, effectiveBranch]);

  // Filter staff based on selected branch and selected team
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      // 1. Branch match
      if (effectiveBranch && effectiveBranch !== 'ALL') {
        const bCode = staff.business_code;
        const allowed = staff.allowed_branches || [];
        const matchesBranch =
          bCode === effectiveBranch ||
          allowed.includes(effectiveBranch) ||
          allowed.includes('*') ||
          allowed.includes('ALL');
        if (!matchesBranch && bCode) {
          return false;
        }
      }

      // 2. Team match
      if (teamId) {
        const matchesTeam =
          staff.team_id === teamId ||
          (staff.team_ids && staff.team_ids.includes(teamId));
        if (!matchesTeam) {
          return false;
        }
      }

      return true;
    });
  }, [staffList, effectiveBranch, teamId]);

  // Handle branch change with cascading reset
  const handleBranchSelect = useCallback(
    (newBranch: string) => {
      if (onBranchChange) {
        onBranchChange(newBranch);
      }

      // Check if current team is valid for new branch
      if (teamId) {
        const teamStillValid = teams.some(t => {
          if (t.id !== teamId) return false;
          const bCode = t.business_code || t.branch_code;
          return !bCode || bCode === 'HQ' || bCode === newBranch;
        });
        if (!teamStillValid && onTeamChange) {
          onTeamChange('');
        }
      }

      // Check if current staff is valid for new branch
      if (staffId) {
        const staffStillValid = staffList.some(s => {
          if (s.id !== staffId) return false;
          const bCode = s.business_code;
          const allowed = s.allowed_branches || [];
          return (
            !bCode ||
            bCode === newBranch ||
            allowed.includes(newBranch) ||
            allowed.includes('*')
          );
        });
        if (!staffStillValid && onStaffChange) {
          onStaffChange('');
        }
      }
    },
    [onBranchChange, onTeamChange, onStaffChange, teamId, staffId, teams, staffList]
  );

  // Handle team change with cascading reset of staff
  const handleTeamSelect = useCallback(
    (newTeam: string) => {
      if (onTeamChange) {
        onTeamChange(newTeam);
      }

      // Check if current staff is valid for new team
      if (staffId && newTeam) {
        const staffStillValid = staffList.some(s => {
          if (s.id !== staffId) return false;
          return (
            s.team_id === newTeam ||
            (s.team_ids && s.team_ids.includes(newTeam))
          );
        });
        if (!staffStillValid && onStaffChange) {
          onStaffChange('');
        }
      }
    },
    [onTeamChange, onStaffChange, staffId, staffList]
  );

  // Build Select options
  const branchOptions: SelectOption[] = useMemo(() => {
    return availableBranches.map(b => ({
      value: b.code,
      label: `${b.name} (${b.code})`,
    }));
  }, [availableBranches]);

  const teamOptions: SelectOption[] = useMemo(() => {
    return filteredTeams.map(t => ({
      value: t.id,
      label: t.name,
    }));
  }, [filteredTeams]);

  const staffOptions: SelectOption[] = useMemo(() => {
    return filteredStaff.map(s => ({
      value: s.id,
      label: s.name ? `${s.name} (${s.email || s.id.slice(0, 8)})` : s.email || s.id,
    }));
  }, [filteredStaff]);

  // Layout container style
  const containerStyle: React.CSSProperties = {
    display: layout === 'horizontal' ? 'flex' : layout === 'vertical' ? 'flex' : 'grid',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(220px, 1fr))' : undefined,
    gap: '1rem',
    alignItems: layout === 'horizontal' ? 'flex-end' : undefined,
    width: '100%',
    ...style,
  };

  const isBranchLocked = lockBranch || !isMultiBranch;

  return (
    <div className={`branch-team-staff-picker ${className}`} style={containerStyle}>
      {/* 1. Branch Selector */}
      {showBranch && (
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '0.35rem',
            }}
          >
            {branchLabel}
            {required && <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>*</span>}
          </label>

          {isBranchLocked ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.85rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{effectiveBranch || 'HQ'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>Fixed</span>
            </div>
          ) : (
            <Select
              value={effectiveBranch}
              onChange={val => handleBranchSelect(String(val))}
              options={branchOptions}
              placeholder={branchPlaceholder}
              disabled={disabled}
            />
          )}
        </div>
      )}

      {/* 2. Team Selector */}
      {showTeam && (
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '0.35rem',
            }}
          >
            {teamLabel}
          </label>
          <Select
            value={teamId || ''}
            onChange={val => handleTeamSelect(String(val))}
            options={teamOptions}
            placeholder={loadingTeams ? 'Loading teams...' : teamPlaceholder}
            disabled={disabled || loadingTeams}
          />
        </div>
      )}

      {/* 3. Staff Selector */}
      {showStaff && (
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '0.35rem',
            }}
          >
            {staffLabel}
          </label>
          <Select
            value={staffId || ''}
            onChange={val => onStaffChange && onStaffChange(String(val))}
            options={staffOptions}
            placeholder={loadingStaff ? 'Loading staff...' : staffPlaceholder}
            disabled={disabled || loadingStaff}
          />
        </div>
      )}
    </div>
  );
};
