import React, { useState } from 'react';
import {
  OrganisationFormPageMobile,
  OrganisationFormPageDesktopProps,
} from '@geeksman/contacts';
import { Button, Input, Select } from '@geeksman/core-ui';
import { Building2, Sliders, Calendar, Plus, Trash2, Warehouse, Sparkles } from 'lucide-react';
import {
  LocationOption,
  BranchOption,
  HolidayItem,
  BranchOperationsState,
} from './BranchFormPage.desktop';

export interface BranchFormMobileProps {
  orgFormProps: OrganisationFormPageDesktopProps;
  operationsState: BranchOperationsState;
  setOperationsState: React.Dispatch<React.SetStateAction<BranchOperationsState>>;
  setIsDirty: (dirty: boolean) => void;
  warehouseLocations: LocationOption[];
  loadingLocations: boolean;
  availableBranches?: BranchOption[];
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '1.25rem',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#0f172a',
};

const fieldColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.25rem',
};

const labelWithDotStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  marginBottom: '0.25rem',
};

const smallLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.725rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '0.2rem',
};

const fullWidthStyle: React.CSSProperties = { width: '100%' };

const dotStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: color,
});

export const BranchFormPageMobile: React.FC<BranchFormMobileProps> = ({
  orgFormProps,
  operationsState,
  setOperationsState,
  setIsDirty,
  warehouseLocations,
  loadingLocations,
  availableBranches,
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');

  // Holiday Calendar Local State
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayType, setNewHolidayType] = useState<'NATIONAL' | 'REGIONAL' | 'OPTIONAL'>('NATIONAL');

  const updateOpField = (field: keyof BranchOperationsState, value: any) => {
    setOperationsState(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const holidays: HolidayItem[] = (() => {
    try {
      return operationsState.holiday_calendar ? JSON.parse(operationsState.holiday_calendar) : [];
    } catch {
      return [];
    }
  })();

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    const item: HolidayItem = {
      id: String(Date.now()),
      date: newHolidayDate,
      name: newHolidayName.trim(),
      type: newHolidayType,
    };
    const updated = [...holidays, item];
    updateOpField('holiday_calendar', JSON.stringify(updated));
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  const handleRemoveHoliday = (index: number) => {
    const updated = holidays.filter((_, i) => i !== index);
    updateOpField('holiday_calendar', JSON.stringify(updated));
    setIsDirty(true);
  };

  // Filter facility options (Tier 1 Hubs, Tier 2 Branch Warehouses, and root facilities)
  const facilityOptions = warehouseLocations.filter(loc => {
    if (loc.role === 'FACILITY') return true;
    if (loc.location_type_id === 'lt_warehouse' || loc.location_type_id === 'lt_hub' || loc.location_type_id === 'lt_sub_warehouse') return true;
    if (!loc.parent_id) return true;
    return false;
  });
  const effectiveFacilities = facilityOptions.length > 0 ? facilityOptions : warehouseLocations;

  // Filter child areas belonging to the selected storage facility
  const selectedFacilityId = operationsState.storage_facility_id;
  const facilityChildren = selectedFacilityId
    ? warehouseLocations.filter(loc => loc.parent_id === selectedFacilityId)
    : [];
  const areaCandidates = facilityChildren.length > 0 ? facilityChildren : warehouseLocations;

  const sellableOptions = areaCandidates.filter(loc => loc.role === 'SELLABLE_STORAGE' || loc.is_sellable === true);
  const effectiveSellable = sellableOptions.length > 0 ? sellableOptions : areaCandidates;

  const qcOptions = areaCandidates.filter(loc => loc.role === 'QC_INSPECTION');
  const effectiveQC = qcOptions.length > 0 ? qcOptions : areaCandidates;

  const damagedOptions = areaCandidates.filter(loc => loc.role === 'DAMAGED_SCRAP');
  const effectiveDamaged = damagedOptions.length > 0 ? damagedOptions : areaCandidates;

  const gateOptions = areaCandidates.filter(loc => loc.role === 'GATE_ENTRY');
  const effectiveGate = gateOptions.length > 0 ? gateOptions : areaCandidates;

  const reservedOptions = areaCandidates.filter(loc => loc.role === 'RESERVED_STORAGE' || (loc.code && loc.code.toUpperCase().includes('RESERVED')));
  const effectiveReserved = reservedOptions.length > 0 ? reservedOptions : areaCandidates;

  const handleAutoDetectAreas = (facilityId: string) => {
    if (!facilityId) return;
    const children = warehouseLocations.filter(loc => loc.parent_id === facilityId);
    if (children.length === 0) return;

    const sellable = children.find(loc => loc.role === 'SELLABLE_STORAGE' || loc.is_sellable === true);
    const qc = children.find(loc => loc.role === 'QC_INSPECTION');
    const damaged = children.find(loc => loc.role === 'DAMAGED_SCRAP');
    const gate = children.find(loc => loc.role === 'GATE_ENTRY');
    const reserved = children.find(loc => loc.role === 'RESERVED_STORAGE' || (loc.code && loc.code.toUpperCase().includes('RESERVED')));

    setOperationsState(prev => ({
      ...prev,
      storage_facility_id: facilityId,
      default_location_id: prev.default_location_id || facilityId,
      default_sellable_location_id: sellable ? sellable.id : prev.default_sellable_location_id,
      default_qc_location_id: qc ? qc.id : prev.default_qc_location_id,
      default_damaged_location_id: damaged ? damaged.id : prev.default_damaged_location_id,
      default_gate_location_id: gate ? gate.id : prev.default_gate_location_id,
      default_reserved_location_id: reserved ? reserved.id : prev.default_reserved_location_id,
    }));
    setIsDirty(true);
  };

  // Tab 2 Content: Branch Operations & Settings (Mobile)
  const operationsTabContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Card 1: Hierarchy & Governance */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Building2 size={18} color="#2563eb" />
          <h2 style={cardTitleStyle}>Hierarchy & Governance</h2>
        </div>

        <div style={fieldColStyle}>
          <div>
            <label style={labelStyle}>Parent Branch</label>
            <Select
              value={operationsState.parent_branch_id}
              onChange={(val) => updateOpField('parent_branch_id', val)}
              options={[
                { value: '', label: '-- None (Root HQ) --' },
                ...(availableBranches || []).map(b => ({
                  value: b.id,
                  label: `${b.name} (${b.code})`
                }))
              ]}
            />
          </div>

          <div>
            <label style={labelStyle}>Allowed Operational Modules</label>
            <Input
              placeholder="sales,contacts,hr,catalogue,inventory"
              value={operationsState.allowed_modules}
              onChange={(e) => updateOpField('allowed_modules', e.target.value)}
              style={fullWidthStyle}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Storage Facility & Operational Mapping */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={cardHeaderStyle}>
            <Warehouse size={18} color="#2563eb" />
            <h2 style={cardTitleStyle}>Storage & Operations</h2>
          </div>
          {operationsState.storage_facility_id && (
            <Button
              variant="secondary"
              onClick={() => handleAutoDetectAreas(operationsState.storage_facility_id)}
              disabled={loadingLocations}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            >
              <Sparkles size={13} style={{ marginRight: '0.25rem' }} /> Auto-Detect
            </Button>
          )}
        </div>

        <div style={fieldColStyle}>
          <div>
            <label style={labelStyle}>Primary Storage Facility (Warehouse)</label>
            <Select
              value={operationsState.storage_facility_id}
              onChange={(val) => {
                updateOpField('storage_facility_id', val);
                if (!operationsState.default_location_id) {
                  updateOpField('default_location_id', val);
                }
                handleAutoDetectAreas(val);
              }}
              options={[
                { value: '', label: '-- Select Storage Facility --' },
                ...effectiveFacilities.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>

          <div>
            <div style={labelWithDotStyle}>
              <span style={dotStyle('#10b981')} />
              <label style={labelStyle}>Default Sellable Area (POS & Orders)</label>
            </div>
            <Select
              value={operationsState.default_sellable_location_id}
              onChange={(val) => updateOpField('default_sellable_location_id', val)}
              options={[
                { value: '', label: '-- Select Sellable Storage Area --' },
                ...effectiveSellable.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>

          <div>
            <div style={labelWithDotStyle}>
              <span style={dotStyle('#f59e0b')} />
              <label style={labelStyle}>Default QC / Inspection Bay</label>
            </div>
            <Select
              value={operationsState.default_qc_location_id}
              onChange={(val) => updateOpField('default_qc_location_id', val)}
              options={[
                { value: '', label: '-- Select QC Inspection Bay --' },
                ...effectiveQC.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>

          <div>
            <div style={labelWithDotStyle}>
              <span style={dotStyle('#ef4444')} />
              <label style={labelStyle}>Default Damaged / Scrap Bay</label>
            </div>
            <Select
              value={operationsState.default_damaged_location_id}
              onChange={(val) => updateOpField('default_damaged_location_id', val)}
              options={[
                { value: '', label: '-- Select Damaged / Scrap Bay --' },
                ...effectiveDamaged.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>

          <div>
            <div style={labelWithDotStyle}>
              <span style={dotStyle('#6366f1')} />
              <label style={labelStyle}>Default Inward Gate Dock</label>
            </div>
            <Select
              value={operationsState.default_gate_location_id}
              onChange={(val) => updateOpField('default_gate_location_id', val)}
              options={[
                { value: '', label: '-- Select Inward Gate Dock --' },
                ...effectiveGate.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>

          <div>
            <div style={labelWithDotStyle}>
              <span style={dotStyle('#8b5cf6')} />
              <label style={labelStyle}>Default Reserved Area (Holding)</label>
            </div>
            <Select
              value={operationsState.default_reserved_location_id || ''}
              onChange={(val) => updateOpField('default_reserved_location_id', val)}
              options={[
                { value: '', label: '-- Select Reserved / Committed Area --' },
                ...effectiveReserved.map(loc => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.code})`
                }))
              ]}
              disabled={loadingLocations}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Operations & Prefixes */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Sliders size={18} color="#2563eb" />
          <h2 style={cardTitleStyle}>Document Prefixes</h2>
        </div>

        <div style={fieldColStyle}>
          <div>
            <label style={labelStyle}>Custom Sales Order Prefix</label>
            <Input
              placeholder="e.g. SO-BLR-"
              value={operationsState.order_prefix_override}
              onChange={(e) => updateOpField('order_prefix_override', e.target.value.toUpperCase())}
              style={fullWidthStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Custom Invoice Prefix</label>
            <Input
              placeholder="e.g. INV-BLR-"
              value={operationsState.invoice_prefix_override}
              onChange={(e) => updateOpField('invoice_prefix_override', e.target.value.toUpperCase())}
              style={fullWidthStyle}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Branch Holiday Calendar */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={cardHeaderStyle}>
            <Calendar size={18} color="#2563eb" />
            <h2 style={cardTitleStyle}>Holiday Calendar</h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {holidays.length} holiday{holidays.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          <div>
            <label style={smallLabelStyle}>Date</label>
            <Input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} style={fullWidthStyle} />
          </div>
          <div>
            <label style={smallLabelStyle}>Name</label>
            <Input placeholder="e.g. Founders Day" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} style={fullWidthStyle} />
          </div>
          <div>
            <label style={smallLabelStyle}>Type</label>
            <Select
              value={newHolidayType}
              onChange={(val) => setNewHolidayType(val as any)}
              options={[
                { value: 'NATIONAL', label: 'National Holiday' },
                { value: 'REGIONAL', label: 'Regional Holiday' },
                { value: 'OPTIONAL', label: 'Optional / Floating' },
              ]}
            />
          </div>
          <Button variant="secondary" onClick={handleAddHoliday} disabled={!newHolidayDate || !newHolidayName.trim()}>
            <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Holiday
          </Button>
        </div>

        {holidays.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {holidays.map((h, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{h.name}</div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{h.date} • {h.type}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <OrganisationFormPageMobile
      {...orgFormProps}
      customTabs={[
        { id: 'general', label: 'General & Identity', icon: <Building2 size={15} /> },
        { id: 'operations', label: 'Operations & Settings', icon: <Sliders size={15} /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabContent={{
        operations: operationsTabContent,
      }}
      saveButtonText={orgFormProps.isEdit ? 'Save Changes' : 'Create Branch'}
    />
  );
};
