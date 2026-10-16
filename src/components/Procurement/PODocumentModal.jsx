import React from 'react';
import { X, Printer, Download, CheckCircle, FileText } from 'lucide-react';

export const PODocumentModal = ({ po, onClose }) => {
  if (!po) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Official Purchase Order Document</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{po.poNumber} • Motohelp Procurement</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', color: '#0f172a', padding: '2rem' }}>
          {/* Printable Letterhead */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#090d16' }}>
                MOTOHELP PRIVATE LIMITED
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: '1.4', marginTop: '0.2rem' }}>
                C210, Neptune Eastern Business, Metro Mall, Bhandup (W), Mumbai - 400078<br />
                Email: Info@motohelpindia.com • Web: www.motohelpindia.com • GSTIN: 27AABCM9102K1ZV
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>PURCHASE ORDER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ea580c', fontFamily: 'monospace' }}>{po.poNumber}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {po.orderDate}</div>
            </div>
          </div>

          {/* Vendor & Delivery Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                VENDOR / SUPPLIER
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{po.vendorName}</div>
              <div style={{ color: '#475569' }}>Payment Terms: <strong>{po.paymentTerms || 'Net 30'}</strong></div>
              <div style={{ color: '#475569' }}>Expected Delivery: <strong>{po.expectedDate}</strong></div>
            </div>

            <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                SHIP TO DESTINATION
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{po.branchName || 'Bhandup Central Hub (HQ)'}</div>
              <div style={{ color: '#475569' }}>Status: <strong style={{ color: '#10b981' }}>{po.status}</strong></div>
              <div style={{ color: '#475569' }}>Authorized By: <strong>{po.approvedBy || 'Rajesh Verma (Director)'}</strong></div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>#</th>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Item Description</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>GST</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '0.6rem' }}>{idx + 1}</td>
                  <td style={{ padding: '0.6rem' }}>
                    <strong>{it.name}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SKU: {it.sku}</div>
                  </td>
                  <td style={{ padding: '0.6rem', textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ padding: '0.6rem', textAlign: 'right' }}>₹{it.unitPrice.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.6rem', textAlign: 'right' }}>{it.gstRate}%</td>
                  <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: '700' }}>₹{it.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ width: '280px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Subtotal:</span>
                <span style={{ fontWeight: '600' }}>₹{po.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>GST Tax Amount:</span>
                <span style={{ fontWeight: '600' }}>₹{po.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: '800', fontSize: '1rem', color: '#090d16' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#ea580c' }}>₹{po.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signatures box */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div>
              <p>Special Notes: {po.notes || 'Standard OEM Supply Protocol'}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '40px' }} />
              <div style={{ borderTop: '1px solid #0f172a', width: '180px', fontWeight: '700', color: '#0f172a' }}>
                Authorized Signatory
              </div>
              <div>Motohelp Private Limited</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};
