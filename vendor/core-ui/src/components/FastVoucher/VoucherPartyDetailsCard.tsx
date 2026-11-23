import React, { useMemo } from 'react';
import { VoucherPartyOption } from './FastVoucherEntryLayout.types';
import { getStateNameFromGstin, GST_STATE_MAP } from './voucherTaxEngine';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';

export interface VoucherPartyDetailsCardProps {
  party?: VoucherPartyOption | null;
  isInterState: boolean;
}

interface FormattedAddress {
  line1: string;
  line2: string;
}

function formatAddress(addr: any): FormattedAddress | null {
  if (!addr) return null;
  if (typeof addr === 'string') {
    const trimmed = addr.trim();
    if (!trimmed) return null;
    return { line1: trimmed, line2: '' };
  }
  const streetParts = [
    addr.address_line1 || addr.address1 || addr.street || addr.street_address || addr.building,
    addr.address_line2 || addr.address2,
  ].filter(Boolean);

  const cityStatePinParts = [
    addr.city,
    addr.district,
    addr.state,
    addr.postal_code || addr.pincode || addr.zip_code,
    addr.country && addr.country !== 'India' ? addr.country : undefined,
  ].filter(Boolean);

  const line1 = streetParts.join(', ');
  const line2 = cityStatePinParts.join(', ');

  if (!line1 && !line2) return null;
  return { line1, line2 };
}

export const VoucherPartyDetailsCard: React.FC<VoucherPartyDetailsCardProps> = ({
  party,
  isInterState,
}) => {
  const contactName =
    party?.contact_person ||
    party?.meta?.contact_person ||
    party?.meta?.primary_contact_name ||
    party?.meta?.contacts?.[0]?.full_name ||
    '';
  const phone =
    party?.phone ||
    party?.meta?.phone ||
    party?.meta?.contact_number ||
    party?.meta?.primary_contact_phone ||
    party?.meta?.contacts?.[0]?.mobile_no ||
    '';
  const email =
    party?.email ||
    party?.meta?.email ||
    party?.meta?.contacts?.[0]?.email ||
    '';
  const pan =
    party?.pan ||
    party?.meta?.pan ||
    party?.meta?.pan_number ||
    (party?.gstin && party.gstin.length === 15 ? party.gstin.substring(2, 12) : '');
  const stateName =
    party?.state ||
    (party?.gstin ? getStateNameFromGstin(party.gstin) : '') ||
    (party?.state_code ? GST_STATE_MAP[party.state_code] : '');

  const billingAddr = useMemo(() => {
    if (!party) return null;
    const raw =
      party.billing_address ||
      party.meta?.billing_address ||
      party.meta?.addresses?.find((a: any) => a.address_type === 'billing' || a.is_default) ||
      party.meta?.addresses?.[0] ||
      (party.meta?.address_line1 ? party.meta : null);
    return formatAddress(raw);
  }, [party]);

  const shippingAddr = useMemo(() => {
    if (!party) return null;
    const raw =
      party.shipping_address ||
      party.meta?.shipping_address ||
      party.meta?.addresses?.find((a: any) => a.address_type === 'shipping') ||
      (party.shipping_address ? party.shipping_address : null);
    return formatAddress(raw);
  }, [party]);

  const isShippingSameAsBilling = useMemo(() => {
    if (!shippingAddr && billingAddr) return true;
    if (!shippingAddr && !billingAddr) return false;
    if (shippingAddr && billingAddr) {
      return (
        shippingAddr.line1.trim().toLowerCase() === billingAddr.line1.trim().toLowerCase() &&
        shippingAddr.line2.trim().toLowerCase() === billingAddr.line2.trim().toLowerCase()
      );
    }
    return false;
  }, [billingAddr, shippingAddr]);

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '10px 12px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Party Header & Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Building2 size={14} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {party ? party.label : 'Select Party (Press F2)'}
          </span>
        </div>
        {party && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: isInterState ? '#d97706' : '#059669',
              backgroundColor: isInterState ? '#fef3c7' : '#ecfdf5',
              padding: '1px 6px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
          </span>
        )}
      </div>

      {/* Contact Person, Phone & Email */}
      {party && (contactName || phone || email) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#475569' }}>
          {contactName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <User size={11} color="#64748b" />
              <span>{contactName}</span>
            </div>
          )}
          {phone && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Phone size={11} color="#64748b" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Mail size={11} color="#64748b" />
              <span>{email}</span>
            </div>
          )}
        </div>
      )}

      {/* GSTIN, PAN & Place of Supply */}
      {party && (party.gstin || pan || stateName) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
          {party.gstin && (
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '1px 5px',
                borderRadius: '3px',
                color: '#1d4ed8',
                fontWeight: 700,
              }}
            >
              GSTIN: {party.gstin}
            </span>
          )}
          {pan && (
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '1px 5px',
                borderRadius: '3px',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              PAN: {pan}
            </span>
          )}
          {stateName && (
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              Place of Supply: {stateName}
            </span>
          )}
        </div>
      )}

      {/* Complete Billing and Shipping Addresses */}
      {party ? (
        <div
          style={{
            marginTop: '4px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '5px',
            fontSize: '0.72rem',
            borderTop: '1px dotted #e2e8f0',
            paddingTop: '6px',
          }}
        >
          {/* Billing Address Block */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '6px',
              padding: '6px 8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#334155', marginBottom: '2px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <MapPin size={11} color="#2563eb" />
              <span>Billing Address</span>
            </div>
            {billingAddr ? (
              <div style={{ color: '#475569', lineHeight: '1.35' }}>
                {billingAddr.line1 && <div>{billingAddr.line1}</div>}
                {billingAddr.line2 && <div style={{ color: '#64748b' }}>{billingAddr.line2}</div>}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                No billing address specified
              </div>
            )}
          </div>

          {/* Shipping Address Block */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '6px',
              padding: '6px 8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#334155', marginBottom: '2px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Truck size={11} color="#059669" />
              <span>Shipping Address</span>
            </div>
            {isShippingSameAsBilling ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.7rem' }}>
                <CheckCircle2 size={11} />
                <span>Same as billing address</span>
              </div>
            ) : shippingAddr ? (
              <div style={{ color: '#475569', lineHeight: '1.35' }}>
                {shippingAddr.line1 && <div>{shippingAddr.line1}</div>}
                {shippingAddr.line2 && <div style={{ color: '#64748b' }}>{shippingAddr.line2}</div>}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                Same as billing address
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', padding: '2px 0' }}>
          Press F2 or search above to link customer / supplier and view statutory details.
        </div>
      )}
    </div>
  );
};
