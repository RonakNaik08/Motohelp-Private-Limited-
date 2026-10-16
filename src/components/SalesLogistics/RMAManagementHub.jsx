import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Package,
  Truck,
  FileText,
  Download,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { exportToCSV } from '../../utils/exportUtils';

export const RMAManagementHub = () => {
  const { returns = [], updateRMAStatus, salesOrders } = useSCM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const defaultRMAList = [
    {
      id: 'RMA-2026-0841',
      soNumber: 'SO-2026-1191',
      customerName: 'Metro Fleet Mobility Solutions',
      itemName: 'High Performance Spark Plug Set (Platinum)',
      itemSku: 'SPK-PLUG-IRID',
      quantity: 2,
      refundAmount: 1760,
      reason: 'Quality Inspection Failure (Defective Electrode Gap)',
      returnType: 'Replacement',
      status: 'Reverse Pickup Scheduled',
      pickupAddress: 'Metro Fleet Workshop, Andheri East, Mumbai - 400069',
      createdAt: '2026-09-20'
    },
    {
      id: 'RMA-2026-0792',
      soNumber: 'SO-2026-1188',
      customerName: 'Royal Multi-Brand Automotive Works',
      itemName: 'Heavy Duty Alternator 12V 90A',
      itemSku: 'ELEC-ALT-12V90',
      quantity: 1,
      refundAmount: 6400,
      reason: 'Damaged in Transit (Casing Dent)',
      returnType: 'CreditNote',
      status: 'Credit Note Issued',
      pickupAddress: 'Metro Fleet Workshop, Andheri East, Mumbai - 400069',
      createdAt: '2026-09-14'
    }
  ];

  const allRMAs = returns.length > 0 ? returns : defaultRMAList;

  const filtered = allRMAs.filter((rma) => {
    const matchesStatus = statusFilter === 'All' || rma.status === statusFilter;
    const matchesSearch =
      rma.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rma.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rma.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    exportToCSV(
      filtered.map((r) => ({
        RMANumber: r.id,
        OrderNumber: r.soNumber,
        Customer: r.customerName,
        Item: r.itemName,
        SKU: r.itemSku,
        Quantity: r.quantity,
        Amount: r.refundAmount,
        Reason: r.reason,
        ReturnType: r.returnType,
        Status: r.status,
        Date: r.createdAt
      })),
      'rma_returns_ledger.csv'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={20} style={{ color: 'var(--brand-primary)' }} /> Reverse Logistics & RMA Returns Hub
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage B2B warranty replacements, return authorizations, and GST credit note adjustments
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExportCSV}
        >
          <Download size={13} /> Export RMA Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total RMA Claims
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {allRMAs.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across all active branches
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-warning)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Pending Pickups
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {allRMAs.filter((r) => r.status === 'Requested' || r.status === 'Reverse Pickup Scheduled').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-warning)', fontWeight: '600', marginTop: '2px' }}>
            Scheduled with FastTrack Fleet
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-success)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Settled & Credited
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {allRMAs.filter((r) => r.status === 'Credit Note Issued' || r.status === 'Replaced').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>
            100% Tax Compliant
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-secondary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Credit Note Reversals
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{allRMAs.reduce((sum, r) => sum + (r.refundAmount || 0), 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            18% Input Tax Reversed
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>RMA #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Returned Item</th>
                <th>Defect Reason</th>
                <th>Resolution</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rma) => (
                <tr key={rma.id}>
                  <td><span className="code-tag">{rma.id}</span></td>
                  <td>#{rma.soNumber}</td>
                  <td><strong>{rma.customerName || 'Customer Fleet'}</strong></td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600' }}>{rma.itemName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {rma.itemSku} • Qty: {rma.quantity}</div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: '12px' }}>{rma.reason}</span></td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {rma.returnType === 'Replacement' ? '1-to-1 Replacement' : `Credit Note (₹${rma.refundAmount})`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${rma.status === 'Credit Note Issued' ? 'badge-success' : 'badge-warning'}`}>
                      {rma.status}
                    </span>
                  </td>
                  <td>
                    {rma.status !== 'Credit Note Issued' && rma.status !== 'Replaced' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => updateRMAStatus && updateRMAStatus(rma.id, 'Credit Note Issued')}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        <CheckCircle2 size={12} /> Issue Credit Note
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600' }}>
                        ✓ Resolved
                      </span>
                    )}
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
