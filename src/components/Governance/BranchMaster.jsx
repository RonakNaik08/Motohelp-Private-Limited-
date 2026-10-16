import React from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Building2,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  Key,
  Users,
  MapPin,
  Phone,
  Database
} from 'lucide-react';

export const BranchMaster = () => {
  const { branches, selectedBranch, setSelectedBranch, activeRole } = useSCM();

  const systemRoles = [
    {
      title: 'Executive Director / VP',
      role: 'director',
      user: 'Rajesh Verma',
      access: 'Full Operational & Financial Sign-off, High-value PO Authorization, Strategic MIS Analytics'
    },
    {
      title: 'Procurement Manager',
      role: 'procurement',
      user: 'Vikram Rao',
      access: 'Purchase Requisitions (PR), Purchase Orders (PO), Vendor Scorecard & Contract Management'
    },
    {
      title: 'Warehouse Supervisor',
      role: 'warehouse',
      user: 'Anita Deshmukh',
      access: 'Material Inwarding (GRN), Bin Allocation, Inter-hub Transfers, Stock Reconciliation'
    },
    {
      title: 'Logistics Coordinator',
      role: 'logistics',
      user: 'Sameer Patil',
      access: 'Outward Dispatch, Waybill Creation, 3PL Carrier Assignment, Live GPS Milestone Tracking'
    },
    {
      title: 'Quality Inspector',
      role: 'quality',
      user: 'Priya Sharma',
      access: 'QC Inward Inspections, Defect PPM Tracking, Damaged Goods Quarantine Logging'
    },
    {
      title: 'Finance Controller',
      role: 'finance',
      user: 'Sneha Kulkarni',
      access: '3-Way Match Auditing (PO ↔ GRN ↔ Invoice), Accounts Payable (AP), Accounts Receivable (AR)'
    },
    {
      title: 'Supplier Portal',
      role: 'supplier',
      user: 'Bosch Auto Systems',
      access: 'View Issued POs, Advance Shipment Notifications (ASN), Submit Invoices'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Company Branches & RBAC Access Matrix</h2>
            <span className="badge badge-amber">Motohelp Private Limited</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Central Registry: C210, Neptune Eastern Business, Metro Mall, Bhandup (W), Mumbai - 400078
          </p>
        </div>
      </div>

      {/* Multi-Branch Registry */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Building2 size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>Fulfillment Hubs & Regional Warehouses ({branches.length})</span>
        </div>

        <div className="grid-2">
          {branches.map(b => {
            const isSelected = selectedBranch.id === b.id;

            return (
              <div
                key={b.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1.25rem',
                  border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)'
                }}
                onClick={() => setSelectedBranch(b)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="code-tag">{b.code}</span>
                      {isSelected && <span className="badge badge-amber">Active Hub</span>}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '0.35rem' }}>
                      {b.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.type}</div>
                  </div>

                  <span className="badge badge-purple">{b.utilizationRate}% Capacity</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  📍 {b.address}
                </div>

                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <span>Manager: <strong>{b.manager}</strong></span>
                  <span>Active SKUs: <strong>{b.activeSKUs}</strong></span>
                  <span>📞 {b.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RBAC Security Matrix */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Shield size={16} style={{ color: 'var(--accent-green)' }} />
          <span>Role-Based Access Control (RBAC) Permission Matrix</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Designated Role</th>
                <th>Assigned User</th>
                <th>Functional Scope & Privileges</th>
                <th>Security Level</th>
              </tr>
            </thead>
            <tbody>
              {systemRoles.map((r, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {r.title}
                    </div>
                    <span className="code-tag" style={{ fontSize: '0.65rem' }}>ROLE_{r.role.toUpperCase()}</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{r.user}</div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {r.access}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${r.role === 'director' ? 'badge-red' : r.role === 'finance' ? 'badge-purple' : 'badge-green'}`}>
                      {r.role === 'director' ? 'Tier 1 (Admin)' : r.role === 'finance' ? 'Tier 2 (Audit)' : 'Tier 3 (Operational)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
