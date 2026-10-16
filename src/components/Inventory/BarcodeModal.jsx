import React from 'react';
import { X, Printer, QrCode, BarChart3, Check } from 'lucide-react';

export const BarcodeModal = ({ product, onClose }) => {
  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <QrCode size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>SKU Barcode & Smart Label</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP PRIVATE LIMITED</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          {/* Printable Label Card */}
          <div style={{
            background: '#ffffff',
            color: '#000000',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px dashed #94a3b8',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.05em', color: '#090d16' }}>
              MOTOHELP SCM • BHANDUP HQ
            </div>

            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>
              {product.name}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              Category: <strong>{product.category}</strong> • UOM: <strong>{product.uom}</strong>
            </div>

            {/* Generated Barcode Display Simulation */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              width: '100%'
            }}>
              {/* SVG Barcode Bars */}
              <svg width="220" height="55" viewBox="0 0 220 55" style={{ display: 'block' }}>
                <rect x="10" y="5" width="3" height="45" fill="#000" />
                <rect x="16" y="5" width="2" height="45" fill="#000" />
                <rect x="22" y="5" width="4" height="45" fill="#000" />
                <rect x="30" y="5" width="2" height="45" fill="#000" />
                <rect x="36" y="5" width="5" height="45" fill="#000" />
                <rect x="45" y="5" width="3" height="45" fill="#000" />
                <rect x="52" y="5" width="2" height="45" fill="#000" />
                <rect x="58" y="5" width="4" height="45" fill="#000" />
                <rect x="66" y="5" width="2" height="45" fill="#000" />
                <rect x="74" y="5" width="6" height="45" fill="#000" />
                <rect x="84" y="5" width="3" height="45" fill="#000" />
                <rect x="91" y="5" width="2" height="45" fill="#000" />
                <rect x="97" y="5" width="4" height="45" fill="#000" />
                <rect x="106" y="5" width="3" height="45" fill="#000" />
                <rect x="113" y="5" width="5" height="45" fill="#000" />
                <rect x="122" y="5" width="2" height="45" fill="#000" />
                <rect x="128" y="5" width="4" height="45" fill="#000" />
                <rect x="136" y="5" width="3" height="45" fill="#000" />
                <rect x="143" y="5" width="5" height="45" fill="#000" />
                <rect x="152" y="5" width="2" height="45" fill="#000" />
                <rect x="158" y="5" width="4" height="45" fill="#000" />
                <rect x="166" y="5" width="2" height="45" fill="#000" />
                <rect x="172" y="5" width="5" height="45" fill="#000" />
                <rect x="181" y="5" width="3" height="45" fill="#000" />
                <rect x="188" y="5" width="2" height="45" fill="#000" />
                <rect x="194" y="5" width="4" height="45" fill="#000" />
                <rect x="202" y="5" width="3" height="45" fill="#000" />
              </svg>
              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.15em', color: '#0f172a' }}>
                *{product.sku}*
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
              <span>Bin: <strong>{product.binLocation}</strong></span>
              <span>HSN: <strong>{product.hsn}</strong></span>
              <span>MRP: <strong>₹{product.sellingPrice}</strong></span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print Barcode Label
          </button>
        </div>
      </div>
    </div>
  );
};
