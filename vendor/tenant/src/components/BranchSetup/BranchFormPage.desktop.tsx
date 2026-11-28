import React, { useState } from 'react';
import {
  OrganisationFormPageDesktop,
  OrganisationFormPageDesktopProps,
} from '@geeksman/contacts';
import { Button, Input, Select } from '@geeksman/core-ui';
import { Building2, Sliders, Calendar, Plus, Trash2, Warehouse, Sparkles } from 'lucide-react';

export interface LocationOption {
  id: string;
  code: string;
  name: string;
  parent_id?: string | null;
  location_type_id?: string;
  role?: string;
  is_sellable?: boolean;
  tier?: number;
}

export interface BranchOption {
  id: string;
  code: string;
  name: string;
  organisation_id?: string;
  is_head_office?: boolean;
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  type: 'NATIONAL' | 'REGIONAL' | 'OPTIONAL';
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1.25rem'
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0f172a'
};

const gridTwoColStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.35rem'
};

const hintStyle: React.CSSProperties = {
  fontSize: '0.725rem',
  color: '#64748b'
};

const subAreaGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1rem',
  padding: '1.25rem',
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

const subAreaHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  marginBottom: '0.35rem'
};

const subAreaLabelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#334155'
};

const subAreaHintStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#64748b'
};

const dotStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: color
});

export interface BranchOperationsState {
  parent_branch_id: string;
  default_location_id: string;
  storage_facility_id: string;
  default_sellable_location_id: string;
  default_qc_location_id: string;
  default_damaged_location_id: string;
  default_gate_location_id: string;
  default_reserved_location_id?: string;
  order_prefix_override: string;
  invoice_prefix_override: string;
  allowed_modules: string;
  holiday_calendar: string;
}

export interface BranchFormDesktopProps {
  orgFormProps: OrganisationFormPageDesktopProps;
  operationsState: BranchOperationsState;
  setOperationsState: React.Dispatch<React.SetStateAction<BranchOperationsState>>;
  setIsDirty: (dirty: boolean) => void;
  warehouseLocations: LocationOption[];
  loadingLocations: boolean;
  availableBranches?: BranchOption[];
}

export const BranchFormPageDesktop: React.FC<BranchFormDesktopProps> = ({
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

  // Tab 2 Content: Branch Operations & Settings
  const operationsTabContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Card 1: Hierarchy & Governance */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Building2 size={20} color="#2563eb" />
          <h2 style={cardTitleStyle}>Branch Hierarchy & Governance</h2>
        </div>

        <div style={gridTwoColStyle}>
          <div>
            <label style={labelStyle}>
              Parent Branch (Tree Hierarchy)
            </label>
            <Select
              value={operationsState.parent_branch_id}
              onChange={(val) => updateOpField('parent_branch_id', val)}
              options={[
                { value: '', label: '-- None (Root HQ / Top Level Branch) --' },
                ...(availableBranches || []).map(b => ({
                  value: b.id,
                  label: `${b.name} (${b.code})`
                }))
              ]}
            />
            <span style={hintStyle}>
              Select a parent branch if this is a sub-office or regional entity.
            </span>
          </div>

          <div>
            <label style={labelStyle}>
              Allowed Operational Modules
            </label>
            <Input
              placeholder="sales,contacts,hr,catalogue,inventory"
              value={operationsState.allowed_modules}
              onChange={(e) => updateOpField('allowed_modules', e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={hintStyle}>Comma-separated module identifiers enabled for this branch.</span>
          </div>
        </div>
      </div>

      {/* Card 2: Storage Facility & Operational Mapping */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={cardHeaderStyle}>
            <Warehouse size={20} color="#2563eb" />
            <div>
              <h2 style={cardTitleStyle}>
                Storage Facility & Operational Areas
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Maps this branch to a physical warehouse facility and its operational sub-areas for POS sales, QC inspection, gate receipts, and scrap handling.
              </span>
            </div>
          </div>
          {operationsState.storage_facility_id && (
            <Button
              variant="secondary"
              onClick={() => handleAutoDetectAreas(operationsState.storage_facility_id)}
              disabled={loadingLocations}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <Sparkles size={14} /> Auto-Detect Sub-Areas
            </Button>
          )}
        </div>

        {/* Primary Storage Facility */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Primary Storage Facility (Warehouse)
          </label>
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
              { value: '', label: '-- Select Physical Storage Facility --' },
              ...effectiveFacilities.map(loc => ({
                value: loc.id,
                label: `${loc.name} (${loc.code})`
              }))
            ]}
            disabled={loadingLocations}
          />
          <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Physical root storage hub mapped to this branch. Changing this auto-detects operational areas.
          </span>
        </div>

        {/* Operational Sub-Areas Grid */}
        <div style={subAreaGridStyle}>
          {/* Sellable Storage Area */}
          <div>
            <div style={subAreaHeaderStyle}>
              <span style={dotStyle('#10b981')} />
              <label style={subAreaLabelStyle}>
                Default Sellable Area (POS & Orders)
              </label>
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
            <span style={subAreaHintStyle}>
              Inventory source location for POS billing and dispatch fulfillment.
            </span>
          </div>

          {/* QC Inspection Area */}
          <div>
            <div style={subAreaHeaderStyle}>
              <span style={dotStyle('#f59e0b')} />
              <label style={subAreaLabelStyle}>
                Default QC / Inspection Area
              </label>
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
            <span style={subAreaHintStyle}>
              Holding area for inward shipments undergoing quality assurance inspection.
            </span>
          </div>

          {/* Damaged & Expired Area */}
          <div>
            <div style={subAreaHeaderStyle}>
              <span style={dotStyle('#ef4444')} />
              <label style={subAreaLabelStyle}>
                Default Damaged / Scrap Area
              </label>
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
            <span style={subAreaHintStyle}>
              Isolation zone for expired, non-conforming, or damaged items.
            </span>
          </div>

          {/* Gate Entry Dock */}
          <div>
            <div style={subAreaHeaderStyle}>
              <span style={dotStyle('#6366f1')} />
              <label style={subAreaLabelStyle}>
                Default Inward Gate Entry Dock
              </label>
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
            <span style={subAreaHintStyle}>
              Physical receiving dock where inward transport vehicles unload.
            </span>
          </div>

          {/* Reserved Stock Area */}
          <div>
            <div style={subAreaHeaderStyle}>
              <span style={dotStyle('#8b5cf6')} />
              <label style={subAreaLabelStyle}>
                Default Reserved Area (Orders & Holding)
              </label>
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
            <span style={subAreaHintStyle}>
              Committed stock holding area for reserved sales orders and pending dispatch.
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Operations & Prefixes */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Sliders size={20} color="#2563eb" />
          <h2 style={cardTitleStyle}>Document Sequencing & Prefixes</h2>
        </div>

        <div style={gridTwoColStyle}>
          <div>
            <label style={labelStyle}>
              Custom Sales Order Prefix
            </label>
            <Input
              placeholder="e.g. SO-BLR-"
              value={operationsState.order_prefix_override}
              onChange={(e) => updateOpField('order_prefix_override', e.target.value.toUpperCase())}
              style={{ width: '100%' }}
            />
            <span style={hintStyle}>Prefix for sales orders created in this branch.</span>
          </div>

          <div>
            <label style={labelStyle}>
              Custom Invoice Prefix
            </label>
            <Input
              placeholder="e.g. INV-BLR-"
              value={operationsState.invoice_prefix_override}
              onChange={(e) => updateOpField('invoice_prefix_override', e.target.value.toUpperCase())}
              style={{ width: '100%' }}
            />
            <span style={hintStyle}>Prefix for tax invoices issued from this branch.</span>
          </div>
        </div>
      </div>

      {/* Card 4: Branch Holiday Calendar */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={cardHeaderStyle}>
            <Calendar size={20} color="#2563eb" />
            <h2 style={cardTitleStyle}>Branch Holiday Calendar</h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {holidays.length} holiday{holidays.length === 1 ? '' : 's'} configured
          </span>
        </div>

        {/* Add Holiday Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr auto', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Holiday Date
            </label>
            <Input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Holiday Name / Occasion
            </label>
            <Input
              placeholder="e.g. Republic Day, Founders Day"
              value={newHolidayName}
              onChange={(e) => setNewHolidayName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Type
            </label>
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

          <div>
            <Button variant="secondary" onClick={handleAddHoliday} disabled={!newHolidayDate || !newHolidayName.trim()}>
              <Plus size={15} style={{ marginRight: '0.25rem' }} /> Add Holiday
            </Button>
          </div>
        </div>

        {/* Holiday List */}
        {holidays.length > 0 ? (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#475569' }}>Date</th>
                  <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#475569' }}>Name</th>
                  <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#475569', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < holidays.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '0.6rem 1rem', color: '#0f172a', fontWeight: 500 }}>{h.date}</td>
                    <td style={{ padding: '0.6rem 1rem', color: '#334155' }}>{h.name}</td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: h.type === 'NATIONAL' ? '#dbeafe' : h.type === 'REGIONAL' ? '#fef3c7' : '#f1f5f9',
                        color: h.type === 'NATIONAL' ? '#1d4ed8' : h.type === 'REGIONAL' ? '#b45309' : '#475569',
                      }}>
                        {h.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
            No holidays configured for this branch yet.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <OrganisationFormPageDesktop
      {...orgFormProps}
      customTabs={[
        { id: 'general', label: 'General & Legal Identity', icon: <Building2 size={16} /> },
        { id: 'operations', label: 'Branch Operations & Settings', icon: <Sliders size={16} /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabContent={{
        operations: operationsTabContent,
      }}
      saveButtonText={orgFormProps.isEdit ? 'Save Changes (Ctrl+S)' : 'Create Branch (Ctrl+S)'}
    />
  );
};
