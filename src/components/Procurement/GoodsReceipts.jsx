import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Boxes,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  FileCheck,
  Building,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GoodsReceiptModal } from './GoodsReceiptModal';

export const GoodsReceipts = () => {
  const { grns, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [showInwardModal, setShowInwardModal] = useState(false);

  const filteredGRNs = grns.filter(g =>
    g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
    g.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    g.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    g.batchNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalAcceptedUnits = grns.reduce((acc, g) => acc + (g.totalAcceptedQty || 0), 0);
  const totalRejectedUnits = grns.reduce((acc, g) => acc + (g.totalRejectedQty || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Goods Receipt Notes (GRN) & QC Inwarding</h2>
            <span className="badge badge-cyan">{grns.length} Inward Records</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Inward Gate: <strong>{selectedBranch.name}</strong> • Material Inspection, Lot Batching & Direct Bin Allocation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowInwardModal(true)}>
            <Plus size={16} />
            Inward Material (New GRN)
          </button>
        </div>
      </div>

      {/* QC Summary KPIs */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Units Accepted</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {totalAcceptedUnits.toLocaleString('en-IN')} Units
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>QC Rejection Rate</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f87171' }}>
              {totalAcceptedUnits ? ((totalRejectedUnits / (totalAcceptedUnits + totalRejectedUnits)) * 100).toFixed(2) : 0}% Defect Rate
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>3-Way Match Verification</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              100% Reconciled
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search GRN number, PO reference, Vendor or Batch Lot..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* GRN Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>GRN Number & PO Ref</th>
              <th>Vendor & Invoice No.</th>
              <th>Received Date & Gate Pass</th>
              <th>Batch / Lot No.</th>
              <th>Bin Slot</th>
              <th>Inspection Status</th>
              <th>Quantities (Accepted / Recv)</th>
            </tr>
          </thead>
          <tbody>
            {filteredGRNs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No Material Inwarding records found.
                </td>
              </tr>
            ) : (
              filteredGRNs.map(grn => {
                const isPassed = grn.qcStatus.includes('Passed');

                return (
                  <tr key={grn.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                          {grn.grnNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Ref PO: <strong>{grn.poNumber}</strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{grn.vendorName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inv: {grn.invoiceNumber}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{grn.receivedDate}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{grn.gatePassNumber}</div>
                    </td>

                    <td>
                      <span className="code-tag">{grn.batchNumber}</span>
                    </td>

                    <td>
                      <span className="badge badge-purple">{grn.binAllocated}</span>
                    </td>

                    <td>
                      <span className={`badge ${isPassed ? 'badge-green' : 'badge-red'}`}>
                        {grn.qcStatus}
                      </span>
                      {grn.rejectionReason && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {grn.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                        <span style={{ color: '#34d399' }}>{grn.totalAcceptedQty}</span> / {grn.totalReceivedQty}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {grn.totalRejectedQty > 0 ? `${grn.totalRejectedQty} Rejected` : 'Zero Defects'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inward GRN Modal */}
      {showInwardModal && (
        <GoodsReceiptModal isOpen={showInwardModal} onClose={() => setShowInwardModal(false)} />
      )}
    </div>
  );
};
