import React from 'react';
import { X, Building, Award, CheckCircle2, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';

export const VendorScorecardModal = ({ vendor, purchaseOrders, onClose, onReorder }) => {
  if (!vendor) return null;

  const vendorPOs = purchaseOrders.filter(p => p.vendorName === vendor.name || p.vendorId === vendor.id);
  const totalSpend = vendorPOs.reduce((acc, p) => acc + p.grandTotal, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>OEM Supplier Scorecard & KPI Profile</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{vendor.name} • Code: {vendor.code}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Score Banner */}
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
                OVERALL VENDOR TIER
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.15rem' }}>
                {vendor.status} Partner
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                GSTIN: {vendor.gstin} • Hub City: {vendor.city}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Quality Rating
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                ★ {vendor.rating} / 5.0
              </div>
            </div>
          </div>

          {/* KPI Metrics Breakdown */}
          <div className="grid-3">
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                OTIF (On-Time In-Full)
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {vendor.otifScore}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Target: ≥ 95.0%</div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Defect PPM Rate
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: vendor.defectPpm < 300 ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {vendor.defectPpm} PPM
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Benchmark: &lt; 500 PPM</div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Avg Lead Time
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {vendor.leadTimeDays} Days
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PO to Gate Delivery</div>
            </div>
          </div>

          {/* Commercial & Contact Information */}
          <div className="grid-2">
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.25rem' }}>
                Commercial Credit Profile
              </div>
              <div style={{ fontSize: '0.82rem' }}>Payment Terms: <strong>{vendor.paymentTerms}</strong></div>
              <div style={{ fontSize: '0.82rem' }}>Credit Limit: <strong>₹{(vendor.creditLimit / 100000).toFixed(1)} Lakhs</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>YTD Spend: ₹{((vendor.spendYTD + totalSpend) / 100000).toFixed(2)} Lakhs</div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.25rem' }}>
                Key Account Contact
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{vendor.contactPerson}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>✉️ {vendor.email}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📞 {vendor.phone}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => { onClose(); onReorder(); }}>
            <ShoppingCart size={15} />
            Issue Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};
