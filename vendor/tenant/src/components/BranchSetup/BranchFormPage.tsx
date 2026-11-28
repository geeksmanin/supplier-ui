import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient, useToast, useMediaQuery, ConfirmModal } from '@geeksman/core-ui';
import { useOrganisationForm, OrganisationFormPageDesktopProps } from '@geeksman/contacts';
import {
  BranchFormPageDesktop,
  BranchOperationsState,
  LocationOption,
  BranchOption,
} from './BranchFormPage.desktop';
import { BranchFormPageMobile } from './BranchFormPage.mobile';

export const BranchFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const parentBranchIdParam = searchParams.get('parent_branch_id') || '';
  const isEdit = !!id;
  const { showToast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [warehouseLocations, setWarehouseLocations] = useState<LocationOption[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<BranchOption[]>([]);
  const [linkedOrgId, setLinkedOrgId] = useState<string>('');

  // Branch Operations & Settings State
  const [operationsState, setOperationsState] = useState<BranchOperationsState>({
    parent_branch_id: parentBranchIdParam,
    default_location_id: '',
    storage_facility_id: '',
    default_sellable_location_id: '',
    default_qc_location_id: '',
    default_damaged_location_id: '',
    default_gate_location_id: '',
    default_reserved_location_id: '',
    order_prefix_override: '',
    invoice_prefix_override: '',
    allowed_modules: 'sales,contacts,hr,catalogue,inventory',
    holiday_calendar: '[]',
  });

  // Custom unified save handler coordinating Organisation + Branch
  const handleUnifiedSave = async (orgPayload: any) => {
    try {
      setSaving(true);
      let branchCode = (orgPayload.code || '').trim().toUpperCase();
      const branchName = (orgPayload.name || '').trim();
      const autoGenerate = Boolean(orgPayload.auto_generate_code);

      if (!branchCode && !autoGenerate) {
        showToast('Branch code is required', 'error');
        return;
      }
      if (!branchName) {
        showToast('Branch name is required', 'error');
        return;
      }

      // Resolve parent organisation ID and branch ID from either Tab 1 or Tab 2
      let parentOrgId = undefined;
      let effectiveParentBranchId = operationsState.parent_branch_id;
      if (effectiveParentBranchId) {
        const parentBranch = availableBranches.find(b => b.id === effectiveParentBranchId);
        parentOrgId = parentBranch?.organisation_id;
      } else if (orgForm.parentCompany && orgForm.parentCompany !== 'Primary') {
        const parentBranch = availableBranches.find(b => b.name === orgForm.parentCompany || b.code === orgForm.parentCompany);
        if (parentBranch) {
          effectiveParentBranchId = parentBranch.id;
          parentOrgId = parentBranch.organisation_id;
        }
      } else if (branchCode && branchCode !== 'HQ') {
        const hqBranch = availableBranches.find(b => b.code === 'HQ' || b.is_head_office);
        parentOrgId = hqBranch?.organisation_id;
      }

      // Step 1: Save Backing Organisation (type BRANCH)
      let resolvedOrgId = linkedOrgId;
      const enrichedOrgPayload = {
        ...orgPayload,
        code: branchCode || undefined,
        auto_generate_code: autoGenerate,
        name: branchName,
        organisation_type: 'BRANCH',
        assigned_branch_code: branchCode || undefined,
        parent_organisation_id: parentOrgId || undefined,
      };

      if (resolvedOrgId) {
        try {
          const orgPutRes = await apiClient.put(`/contacts/organisations/${resolvedOrgId}`, enrichedOrgPayload);
          if (!branchCode && orgPutRes.data?.data?.code) {
            branchCode = orgPutRes.data.data.code.trim().toUpperCase();
          }
        } catch (orgPutErr) {
          console.warn('Failed to update backing organisation', orgPutErr);
        }
      } else {
        try {
          const orgRes = await apiClient.post('/contacts/organisations', enrichedOrgPayload);
          if (orgRes.data?.data?.id) {
            resolvedOrgId = orgRes.data.data.id;
            setLinkedOrgId(resolvedOrgId);
            if (!branchCode && orgRes.data?.data?.code) {
              branchCode = orgRes.data.data.code.trim().toUpperCase();
            }
          }
        } catch (orgPostErr) {
          console.warn('Could not auto-create backing organisation, proceeding with branch', orgPostErr);
        }
      }

      // Fallback: If auto-generated and backend org didn't provide a code, derive from branchName
      if (!branchCode) {
        const cleanName = branchName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'BR';
        branchCode = `${cleanName}-${Date.now().toString().slice(-4)}`;
      }

      // Step 2: Save Branch Record in tenant
      const branchPayload = {
        code: branchCode,
        name: branchName,
        parent_branch_id: effectiveParentBranchId || undefined,
        holiday_calendar: operationsState.holiday_calendar || undefined,
        organisation_id: resolvedOrgId || undefined,
        is_head_office: false,
        gstin: orgPayload.tax_number || orgPayload.gst || undefined,
        phone: orgPayload.primary_contact_phone || undefined,
        email: orgPayload.primary_contact_email || undefined,
        default_location_id: operationsState.default_location_id || operationsState.storage_facility_id || undefined,
        storage_facility_id: operationsState.storage_facility_id || undefined,
        default_sellable_location_id: operationsState.default_sellable_location_id || undefined,
        default_qc_location_id: operationsState.default_qc_location_id || undefined,
        default_damaged_location_id: operationsState.default_damaged_location_id || undefined,
        default_gate_location_id: operationsState.default_gate_location_id || undefined,
        default_reserved_location_id: operationsState.default_reserved_location_id || undefined,
        order_prefix_override: operationsState.order_prefix_override?.trim() || undefined,
        invoice_prefix_override: operationsState.invoice_prefix_override?.trim() || undefined,
        is_active: orgPayload.status === 'Active',
        address_line1: orgPayload.billing_address?.address_line1 || undefined,
        address_line2: orgPayload.billing_address?.address_line2 || undefined,
        city: orgPayload.billing_address?.city || undefined,
        district: orgPayload.billing_address?.district || undefined,
        state: orgPayload.billing_address?.state || undefined,
        country: 'India',
        pincode: orgPayload.billing_address?.postal_code || undefined,
        allowed_modules: operationsState.allowed_modules || 'sales,contacts,hr,catalogue,inventory',
      };

      if (isEdit) {
        await apiClient.put(`/tenant/branches/${id}`, branchPayload);
        showToast('Branch updated successfully', 'success');
      } else {
        await apiClient.post('/tenant/branches', branchPayload);
        showToast('Branch created successfully', 'success');
      }

      setIsDirty(false);
      navigate('/settings/branches');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save branch', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Common Organisation Form Hook
  const orgForm = useOrganisationForm({
    fixedType: 'BRANCH',
    formKey: 'tenant-branch-form-draft',
    isEdit,
    id: linkedOrgId || undefined,
    onSave: handleUnifiedSave,
  });

  // Fetch Locations & Location Types
  const fetchLocations = useCallback(async () => {
    try {
      setLoadingLocations(true);
      const [locRes, typeRes] = await Promise.all([
        apiClient.get('/locations?limit=500&business_code=*'),
        apiClient.get('/locations/location-types?limit=500').catch(() => ({ data: { data: [] } })),
      ]);
      const items = locRes.data?.data || [];
      const typeItems = typeRes.data?.data || [];
      const typeMap = new Map<string, any>(typeItems.map((t: any) => [t.id, t]));

      setWarehouseLocations(items.map((l: any) => {
        const lt = typeMap.get(l.location_type_id);
        return {
          id: l.id,
          code: l.code,
          name: l.name,
          parent_id: l.parent_id,
          location_type_id: l.location_type_id,
          role: l.role || lt?.role,
          is_sellable: l.is_sellable !== undefined ? l.is_sellable : lt?.is_sellable,
          tier: l.tier !== undefined ? l.tier : lt?.tier,
        };
      }));
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  // Fetch Branches for Parent selection
  const fetchBranches = useCallback(async () => {
    try {
      const res = await apiClient.get('/tenant/branches');
      const items = res.data?.data || [];
      setAvailableBranches(
        items
          .filter((b: any) => !id || b.id !== id)
          .map((b: any) => ({
            id: b.id,
            code: b.code,
            name: b.name,
            organisation_id: b.organisation_id,
            is_head_office: b.is_head_office,
          }))
      );
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  }, [id]);

  // Fetch Branch for Edit
  const fetchBranchDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/tenant/branches/${id}`);
      const data = res.data?.data;
      if (data) {
        if (data.code) orgForm.setCode(data.code);
        if (data.name) orgForm.setName(data.name);
        if (data.organisation_id) {
          setLinkedOrgId(data.organisation_id);
        }
        setOperationsState({
          parent_branch_id: data.parent_branch_id || '',
          default_location_id: data.default_location_id || '',
          storage_facility_id: data.storage_facility_id || '',
          default_sellable_location_id: data.default_sellable_location_id || '',
          default_qc_location_id: data.default_qc_location_id || '',
          default_damaged_location_id: data.default_damaged_location_id || '',
          default_gate_location_id: data.default_gate_location_id || '',
          default_reserved_location_id: data.default_reserved_location_id || '',
          order_prefix_override: data.order_prefix_override || '',
          invoice_prefix_override: data.invoice_prefix_override || '',
          allowed_modules: data.allowed_modules || 'sales,contacts,hr,catalogue,inventory',
          holiday_calendar: typeof data.holiday_calendar === 'string' ? data.holiday_calendar : JSON.stringify(data.holiday_calendar || []),
        });
      }
    } catch (err) {
      console.error('Failed to load branch details', err);
      showToast('Failed to load branch details', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchLocations();
    fetchBranches();
    if (isEdit) {
      fetchBranchDetails();
    }
  }, [isEdit, fetchLocations, fetchBranches, fetchBranchDetails]);

  // Synchronize Tab 1 Parent Company and Tab 2 Parent Branch
  useEffect(() => {
    if (!orgForm.parentCompany || orgForm.parentCompany === 'Primary') {
      return;
    }
    const matchingBranch = availableBranches.find(
      b => b.name === orgForm.parentCompany || b.code === orgForm.parentCompany
    );
    if (matchingBranch && matchingBranch.id !== operationsState.parent_branch_id) {
      setOperationsState(prev => ({ ...prev, parent_branch_id: matchingBranch.id }));
    }
  }, [orgForm.parentCompany, availableBranches, operationsState.parent_branch_id]);

  useEffect(() => {
    if (!operationsState.parent_branch_id) return;
    const matchingBranch = availableBranches.find(b => b.id === operationsState.parent_branch_id);
    if (matchingBranch && orgForm.parentCompany !== matchingBranch.name) {
      orgForm.setParentCompany(matchingBranch.name);
    }
  }, [operationsState.parent_branch_id, availableBranches, orgForm.parentCompany, orgForm.setParentCompany]);

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      navigate('/settings/branches');
    }
  };

  // Convert orgForm into OrganisationFormPageDesktopProps
  const orgFormProps: OrganisationFormPageDesktopProps = {
    isEdit,
    saving: saving || orgForm.saving,
    code: orgForm.code,
    setCode: orgForm.setCode,
    autoGenerateCode: orgForm.autoGenerateCode,
    setAutoGenerateCode: orgForm.setAutoGenerateCode,
    name: orgForm.name,
    setName: orgForm.setName,
    constitutionType: orgForm.constitutionType,
    setConstitutionType: orgForm.setConstitutionType,
    constitutionOptions: orgForm.constitutionOptions,
    setConstitutionOptions: orgForm.setConstitutionOptions,
    organisationGroup: orgForm.organisationGroup,
    setOrganisationGroup: orgForm.setOrganisationGroup,
    groupOptions: orgForm.groupOptions,
    setGroupOptions: orgForm.setGroupOptions,
    parentCompany: orgForm.parentCompany,
    setParentCompany: orgForm.setParentCompany,
    parentCompanyOptions: orgForm.parentCompanyOptions,
    asyncParentConfig: null,
    industry: orgForm.industry,
    setIndustry: orgForm.setIndustry,
    industryOptions: orgForm.industryOptions,
    setIndustryOptions: orgForm.setIndustryOptions,
    organisationCategories: orgForm.organisationCategories,
    setOrganisationCategories: orgForm.setOrganisationCategories,
    categoryOptions: orgForm.categoryOptions,
    setCategoryOptions: orgForm.setCategoryOptions,
    organisationType: 'BRANCH',
    setOrganisationType: orgForm.setOrganisationType,
    typeOptions: orgForm.typeOptions,
    setTypeOptions: orgForm.setTypeOptions,
    businessCategory: orgForm.businessCategory,
    setBusinessCategory: orgForm.setBusinessCategory,
    businessCategories: orgForm.selectedBusinessCategories,
    setBusinessCategories: orgForm.setSelectedBusinessCategories,
    businessCategoryOptions: orgForm.businessCategoryOptions,
    setBusinessCategoryOptions: orgForm.setBusinessCategoryOptions,
    status: orgForm.status,
    setStatus: orgForm.setStatus,
    mailingName: orgForm.mailingName,
    setMailingName: orgForm.setMailingName,
    contactPerson: orgForm.contactPerson,
    setContactPerson: orgForm.setContactPerson,
    contactPersonDesignation: orgForm.contactPersonDesignation,
    setContactPersonDesignation: orgForm.setContactPersonDesignation,
    mobileNo: orgForm.mobileNo,
    setMobileNo: orgForm.setMobileNo,
    email: orgForm.email,
    setEmail: orgForm.setEmail,
    address: orgForm.address,
    setAddress: orgForm.setAddress,
    gstin: orgForm.gstin,
    setGstin: orgForm.setGstin,
    handleGstinChange: orgForm.handleGstinChange,
    fetchingGstDetails: orgForm.fetchingGstDetails,
    gstVerifiedDetails: orgForm.gstVerifiedDetails,
    regType: orgForm.regType,
    setRegType: orgForm.setRegType,
    pan: orgForm.pan,
    setPan: orgForm.setPan,
    handlePanChange: orgForm.handlePanChange,
    placeOfSupply: orgForm.placeOfSupply,
    setPlaceOfSupply: orgForm.setPlaceOfSupply,
    stateOptions: orgForm.stateOptions,
    remarks: orgForm.remarks,
    setRemarks: orgForm.setRemarks,
    linkedContacts: orgForm.linkedContacts,
    setLinkedContacts: orgForm.setLinkedContacts,
    existingContactsOptions: orgForm.existingContactsOptions,
    additionalAddresses: orgForm.additionalAddresses,
    setAdditionalAddresses: orgForm.setAdditionalAddresses,
    addressTypeOptions: orgForm.addressTypeOptions,
    setAddressTypeOptions: orgForm.setAddressTypeOptions,
    documentAttachments: orgForm.documentAttachments,
    setDocumentAttachments: orgForm.setDocumentAttachments,
    documentTypeOptions: orgForm.documentTypeOptions,
    setDocumentTypeOptions: orgForm.setDocumentTypeOptions,
    bankAccounts: orgForm.bankAccounts,
    setBankAccounts: orgForm.setBankAccounts,
    handleSave: async () => {
      const payload = orgForm.buildPayload();
      await handleUnifiedSave(payload);
    },
    handleFormKeyDown: (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const payload = orgForm.buildPayload();
        handleUnifiedSave(payload);
      }
    },
    onCancel: handleCancel,
    masterCreateConfig: null,
    setMasterCreateConfig: () => {},
    masterCodeExists: false,
    setMasterCodeExists: () => {},
    isMasterValidatingCode: false,
    setIsMasterValidatingCode: () => {},
    hasMasterValidatedCode: false,
    setHasMasterValidatedCode: () => {},
    triggerCreateMaster: () => {},
    handleCreateMaster: async () => null,
    hasDraft: orgForm.hasDraft,
    handleRestoreDraft: orgForm.handleRestoreDraft,
    draftRestored: orgForm.draftRestored,
    draftTime: orgForm.draftTime,
    discardDraft: orgForm.discardDraft,
    handleClearForm: () => orgForm.resetFormState(true),
    organisationsList: orgForm.organisationsList,
    captchaBase64: orgForm.captchaBase64,
    captchaInput: orgForm.captchaInput,
    setCaptchaInput: orgForm.setCaptchaInput,
    loadingCaptcha: orgForm.loadingCaptcha,
    submittingGstDetails: orgForm.submittingGstDetails,
    gstErrorMsg: orgForm.gstErrorMsg,
    loadCaptcha: orgForm.loadCaptcha,
    handleVerifyGstWithCaptcha: orgForm.handleVerifyGstWithCaptcha,
  };

  return (
    <>
      {isDesktop ? (
        <BranchFormPageDesktop
          orgFormProps={orgFormProps}
          operationsState={operationsState}
          setOperationsState={setOperationsState}
          setIsDirty={setIsDirty}
          warehouseLocations={warehouseLocations}
          loadingLocations={loadingLocations}
          availableBranches={availableBranches}
        />
      ) : (
        <BranchFormPageMobile
          orgFormProps={orgFormProps}
          operationsState={operationsState}
          setOperationsState={setOperationsState}
          setIsDirty={setIsDirty}
          warehouseLocations={warehouseLocations}
          loadingLocations={loadingLocations}
          availableBranches={availableBranches}
        />
      )}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes on this branch form. Navigating away will lose your modifications."
        confirmText="Discard & Leave"
        variant="danger"
        onConfirm={() => {
          setShowCancelConfirm(false);
          setIsDirty(false);
          navigate('/settings/branches');
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
};
