import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, CheckCircle2, AlertTriangle, Boxes, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoodsReceiptModal = ({ isOpen, onClose, defaultPO }) => {
  const { purchaseOrders, selectedBranch, activeRole, createGRN } = useSCM();

  const activePOs = purchaseOrders.filter(p => p.status === 'Approved' || (defaultPO && p.id === defaultPO.id));

  const [selectedPONumber, setSelectedPONumber] = useState(defaultPO?.poNumber || activePOs[0]?.poNumber || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-SUP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [gatePassNumber, setGatePassNumber] = useState(`GP-${selectedBranch.code}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [batchNumber, setBatchNumber] = useState(`LOT-MH-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(10 + Math.random() * 90)}`);
  const [binAllocated, setBinAllocated] = useState('A-01-03');
  const [qcStatus, setQcStatus] = useState('Passed');
  const [receivedQty, setReceivedQty] = useState(50);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('None. Visual inspection and dimensional tolerances verified.');

  if (!isOpen) return null;

  const matchedPO = purchaseOrders.find(p => p.poNumber === selectedPONumber) || activePOs[0] || purchaseOrders[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const acceptedQty = Math.max(0, Number(receivedQty) - Number(rejectedQty));

    createGRN({
      poNumber: matchedPO.poNumber,
      vendorName: matchedPO.vendorName,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      receivedBy: `${activeRole.name}`,
      invoiceNumber,
      gatePassNumber,
      batchNumber,
      binAllocated,
      qcStatus,
      totalReceivedQty: Number(receivedQty),
      totalAcceptedQty: acceptedQty,
      totalRejectedQty: Number(rejectedQty),
      rejectionReason,
      inspectedBy: 'Priya Sharma (QC Officer)'
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Boxes size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Goods Receipt Note (GRN) & QC Inwarding</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP Quality Assurance & Warehouse Stock Inward</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Link Approved Purchase Order (PO) *</label>
              <select
                className="form-select"
                value={selectedPONumber}
                onChange={e => setSelectedPONumber(e.target.value)}
              >
                {activePOs.map(po => (
                  <option key={po.id} value={po.poNumber}>
                    {po.poNumber} — {po.vendorName} (₹{po.grandTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Supplier Invoice No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Security Gate Entry Pass No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={gatePassNumber}
                  onChange={e => setGatePassNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Manufacturing Batch / Lot No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Bin Slot</label>
                <input
                  type="text"
                  className="form-input"
                  value={binAllocated}
                  onChange={e => setBinAllocated(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* QC Inspection Module */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Quality Control (QC) Inspection Breakdown
                </span>
                <span className="badge badge-green">ISO 9001 Protocol</span>
              </div>

              <div className="grid-3" style={{ marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Received Qty</label>
                  <input
                    type="number"
                    className="form-input"
                    value={receivedQty}
                    onChange={e => setReceivedQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rejected (Damaged)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={rejectedQty}
                    onChange={e => setRejectedQty(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">QC Verification</label>
                  <select
                    className="form-select"
                    value={qcStatus}
                    onChange={e => setQcStatus(e.target.value)}
                  >
                    <option value="Passed">Passed (100%)</option>
                    <option value="Passed with Minor Variance">Passed with Variance</option>
                    <option value="Rejected Entire Consignment">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">QC Inspector Notes / Reason for Discrepancy</label>
                <input
                  type="text"
                  className="form-input"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Approve GRN & Increment Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
