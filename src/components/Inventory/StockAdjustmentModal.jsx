import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, RefreshCw, AlertCircle, Check } from 'lucide-react';

export const StockAdjustmentModal = ({ product, onClose }) => {
  const { adjustStock } = useSCM();
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [qty, setQty] = useState(10);
  const [reason, setReason] = useState('Cycle Count Audit Reconciliation');

  if (!product) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const delta = adjustmentType === 'add' ? Number(qty) : -Number(qty);
    adjustStock(product.id, delta, reason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={18} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Stock Reconciliation & Adjustment</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audit & Physical Count Adjustment</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{product.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                SKU: <span className="code-tag">{product.sku}</span> • Current System Stock: <strong>{product.currentStock} {product.uom}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${adjustmentType === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setAdjustmentType('add')}
                >
                  + Add Found Stock
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${adjustmentType === 'deduct' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setAdjustmentType('deduct')}
                >
                  - Deduct (Damage / Loss)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Quantity ({product.uom})</label>
              <input
                type="number"
                min="1"
                max={adjustmentType === 'deduct' ? product.currentStock : 10000}
                className="form-input"
                value={qty}
                onChange={e => setQty(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Audit Justification</label>
              <select
                className="form-select"
                value={reason}
                onChange={e => setReason(e.target.value)}
              >
                <option value="Cycle Count Audit Reconciliation">Cycle Count Audit Reconciliation</option>
                <option value="Damaged during Warehouse Stacking">Damaged during Warehouse Stacking</option>
                <option value="Customer Return Stock Inward">Customer Return Stock Inward</option>
                <option value="Shelf Life Expiry / Rusting">Shelf Life Expiry / Rusting</option>
                <option value="Sample Taken for QC Testing">Sample Taken for QC Testing</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Confirm Stock Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
