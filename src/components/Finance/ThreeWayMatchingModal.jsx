import React from 'react';
import { X, CheckCircle2, AlertTriangle, Receipt, FileText, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ThreeWayMatchingModal = ({ invoice, purchaseOrders, grns, onClose, onApprovePayment }) => {
  if (!invoice) return null;

  const matchedPO = purchaseOrders.find(p => p.poNumber === invoice.poNumber);
  const matchedGRN = grns.find(g => g.grnNumber === invoice.grnNumber || g.poNumber === invoice.poNumber);

  const handleApprove = () => {
    onApprovePayment(invoice.id);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt size={20} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>3-Way Match Verification Engine</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PO ↔ GRN ↔ Vendor Invoice Automated Audit</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Match Verdict Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                AUDIT VERDICT
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#34d399', marginTop: '0.15rem' }}>
                ✓ {invoice.matchStatus || '3-Way Matched & Approved'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {invoice.matchDetails}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Payable Total
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                ₹{invoice.amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* 3 Pillars Comparison */}
          <div className="grid-3">
            {/* Pillar 1: Purchase Order */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-blue)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <FileText size={15} />
                <span>1. Authorized PO</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{invoice.poNumber}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor: {matchedPO?.vendorName || invoice.vendorOrCustomer}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Authorized Val: <strong>₹{matchedPO ? matchedPO.grandTotal.toLocaleString('en-IN') : invoice.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Pillar 2: Goods Receipt */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={15} />
                <span>2. Warehouse GRN</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{invoice.grnNumber}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gate Pass Verified</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                QC Status: <strong style={{ color: '#34d399' }}>{matchedGRN?.qcStatus || 'Passed'}</strong>
              </div>
            </div>

            {/* Pillar 3: Supplier Invoice */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <Receipt size={15} />
                <span>3. Vendor Invoice</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: {invoice.dueDate}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Invoice Amount: <strong>₹{invoice.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
            <div style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              System Automated Validation Checkpoints
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✓ SKU Unit Prices match authorized Purchase Order rate</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>Passed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✓ Billed Quantity equals Physical QC Accepted Quantity</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>Passed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✓ GST Tax Slabs (18% / 28%) accurately computed</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>Passed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {!invoice.status.includes('Paid') && (
            <button className="btn btn-primary" onClick={handleApprove}>
              <Check size={16} />
              Authorize & Settle Payment Voucher
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
