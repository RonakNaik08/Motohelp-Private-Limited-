import React, { useState } from 'react';
import {
  RotateCcw,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  FileText,
  Plus,
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { CreateRMAModal } from './CreateRMAModal';

export const CustomerReturnsView = ({ onExploreCatalog }) => {
  const { salesOrders, returns = [] } = useSCM();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sample default returns if none in state
  const defaultReturns = [
    {
      id: 'RMA-2026-0841',
      soNumber: 'SO-2026-1191',
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

  const allReturns = returns.length > 0 ? returns : defaultReturns;

  const filteredReturns = allReturns.filter(rma => {
    const matchesStatus = statusFilter === 'All' || rma.status === statusFilter;
    const matchesSearch =
      rma.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rma.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rma.soNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Card */}
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
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={20} style={{ color: 'var(--brand-primary)' }} /> Customer Returns & Warranty Claims (RMA)
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            15-day verified return guarantee, doorstep reverse pickups, and instant GST credit notes
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={14} /> File Return / Warranty Claim
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by RMA #, Item name, or Order #..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Requested', 'Reverse Pickup Scheduled', 'Credit Note Issued'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
              style={{ fontSize: '11px' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredReturns.map((rma) => (
          <div
            key={rma.id}
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              borderLeft: rma.status === 'Credit Note Issued' ? '4px solid var(--semantic-success)' : '4px solid var(--brand-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Package size={20} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="code-tag">{rma.id}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Linked to Order <strong>#{rma.soNumber}</strong>
                  </span>
                  <span className={`badge ${rma.status === 'Credit Note Issued' ? 'badge-success' : 'badge-warning'}`}>
                    {rma.status}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '3px' }}>
                  {rma.itemName} (Qty: {rma.quantity})
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Reason: <strong style={{ color: 'var(--text-secondary)' }}>{rma.reason}</strong> • Filed: {rma.createdAt}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Resolution Settlement
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {rma.returnType === 'Replacement' ? '1-to-1 OEM Replacement' : `Credit Note: ₹${rma.refundAmount?.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create RMA Modal */}
      <CreateRMAModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        salesOrders={salesOrders}
      />
    </div>
  );
};
