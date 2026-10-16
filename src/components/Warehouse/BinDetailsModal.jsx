import React from 'react';
import { X, Boxes, ArrowRight, Package, Truck } from 'lucide-react';

export const BinDetailsModal = ({ bin, products, onClose, onTransfer }) => {
  if (!bin) return null;

  const containedProducts = products.filter(p => p.binLocation.startsWith(bin.code.slice(0, 4)) || p.binLocation === bin.code);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Boxes size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Warehouse Bin Slot #{bin.code}</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zone: {bin.zone} • {bin.type}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Bin Utilization Stat */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Capacity Occupancy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: bin.occupancy > 80 ? '#f87171' : '#34d399' }}>
                {bin.occupancy}% Filled
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Max Weight Limit</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{bin.maxWeightKg} kg</div>
            </div>
          </div>

          {/* Stored SKUs List */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Allocated SKUs in this Bin
            </div>

            {containedProducts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                No active parts currently slotted into Bin {bin.code}. Ready for inward staging.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {containedProducts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        SKU: <span className="code-tag">{p.sku}</span> • Cost: ₹{p.costPrice}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--accent-amber)' }}>
                        {p.currentStock} {p.uom}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Physical Count</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => { onClose(); onTransfer(); }}>
            <Truck size={15} />
            Transfer Stock
          </button>
        </div>
      </div>
    </div>
  );
};
