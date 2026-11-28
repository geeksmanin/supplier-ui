import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, useToast, useMediaQuery, useRefreshOnVisible, ConfirmModal } from '@geeksman/core-ui';
import { BranchesListDesktop, Branch } from './BranchesList.desktop';
import { BranchesListMobile } from './BranchesList.mobile';

export const BranchesList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tenant/branches');
      setBranches(res.data?.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load branches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [location.key]);

  useRefreshOnVisible(() => {
    fetchBranches();
  });

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/tenant/branches/${deleteTargetId}`);
      showToast('Branch deleted successfully', 'success');
      setDeleteTargetId(null);
      fetchBranches();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete branch', 'error');
    }
  };

  const props = {
    branches,
    loading,
    onRefresh: fetchBranches,
    onDelete: handleDeleteClick,
    onCreate: (parentBranchId?: string) =>
      navigate(parentBranchId ? `/settings/branches/new?parent_branch_id=${parentBranchId}` : '/settings/branches/new'),
    onEdit: (id: string) => navigate(`/settings/branches/${id}/edit`)
  };

  return (
    <>
      {isDesktop ? (
        <BranchesListDesktop {...props} />
      ) : (
        <BranchesListMobile {...props} />
      )}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? Orders and staff associated with this branch may be impacted."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
};
