import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, Plus, Trash2, ShoppingCart, Check } from 'lucide-react';

export const CreatePOModal = ({ isOpen, onClose }) => {
  const { suppliers, products, selectedBranch, createPurchaseOrder } = useSCM();

  const [vendorId, setVendorId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Urgent safety stock replenishment for automotive maintenance.');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', quantity: 50 }
  ]);

  if (!isOpen) return null;

  const selectedVendor = suppliers.find(s => s.id === vendorId) || suppliers[0];

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 20 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Calculate Subtotals & Taxes
  let subtotal = 0;
  let taxAmount = 0;

  const processedItems = items.map(it => {
    const prod = products.find(p => p.id === it.productId) || products[0] || {};
    const qty = Number(it.quantity) || 1;
    const rate = Number(prod.costPrice || 0);
    const itemSubtotal = qty * rate;
    const gstRate = Number(prod.gstRate || 18);
    const itemTax = (itemSubtotal * gstRate) / 100;
    const itemTotal = itemSubtotal + itemTax;

    subtotal += itemSubtotal;
    taxAmount += itemTax;

    return {
      productId: prod.id || 'PRD-101',
      sku: prod.sku || 'MH-SKU',
      name: prod.name || 'Component Item',
      quantity: qty,
      unitPrice: rate,
      gstRate: gstRate,
      total: itemTotal
    };
  });

  const grandTotal = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    createPurchaseOrder({
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      expectedDate,
      items: processedItems,
      subtotal,
      taxAmount,
      grandTotal,
      paymentTerms: selectedVendor.paymentTerms,
      notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Issue Purchase Order (PO)</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP SCM Procurement System</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Select OEM Vendor / Supplier *</label>
                <select
                  className="form-select"
                  value={vendorId}
                  onChange={e => setVendorId(e.target.value)}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category} • OTIF: {s.otifScore}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Delivery Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Dynamic Items Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Purchase Order Line Items ({items.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItem}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Plus size={14} />
                  Add Another Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {items.map((it, idx) => {
                  const prod = products.find(p => p.id === it.productId) || products[0];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 40px',
                        gap: '0.5rem',
                        alignItems: 'center',
                        background: 'var(--bg-tertiary)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <select
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={it.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.costPrice})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={it.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                      />

                      <div style={{ fontSize: '0.8rem', fontWeight: '700', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ₹{((Number(it.quantity) || 1) * prod.costPrice * (1 + (prod.gstRate || 18)/100)).toFixed(0)}
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length === 1}
                        style={{ padding: '0.35rem', color: 'var(--accent-red)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations Summary Bar */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tax Base: ₹{subtotal.toLocaleString('en-IN')} + GST: ₹{taxAmount.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '600' }}>Terms: {selectedVendor.paymentTerms}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Grand PO Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Procurement Instructions / Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Authorize & Dispatch PO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
