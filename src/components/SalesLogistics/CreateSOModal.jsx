import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, Plus, Trash2, TrendingUp, Check, AlertCircle } from 'lucide-react';

export const CreateSOModal = ({ isOpen, onClose }) => {
  const { customers, products, selectedBranch, createSalesOrder } = useSCM();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [deliveryDue, setDeliveryDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState('Standard');
  const [shippingAddress, setShippingAddress] = useState(customers[0]?.city || 'Andheri Workshop Hub, Mumbai');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', quantity: 15 }
  ]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === customerId) || customers[0];

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 10 }]);
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

  let subtotal = 0;
  let taxAmount = 0;

  const processedItems = items.map(it => {
    const prod = products.find(p => p.id === it.productId) || products[0] || {};
    const qty = Number(it.quantity) || 1;
    const rate = Number(prod.sellingPrice || 0);
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
      total: itemTotal,
      currentStock: prod.currentStock || 0
    };
  });

  const grandTotal = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check stock availability
    for (const it of processedItems) {
      if (it.quantity > it.currentStock) {
        alert(`Insufficient stock for ${it.name}. Requested: ${it.quantity}, Available: ${it.currentStock}`);
        return;
      }
    }

    createSalesOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      deliveryDue,
      priority,
      shippingAddress,
      items: processedItems,
      subtotal,
      taxAmount,
      grandTotal,
      paymentTerms: selectedCustomer.paymentTerms || 'Net 30'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent-green)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Book B2B Sales Order (SO)</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP Fleet & Garage Order Fulfillment</div>
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
                <label className="form-label">Client / Fleet Account *</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setShippingAddress(cust.city);
                  }}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Priority SLA</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="Standard">Standard (48-72h)</option>
                  <option value="Express">Express (24h)</option>
                  <option value="Emergency Fleet">Emergency Fleet Breakdown (Same Day)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Destination Address</label>
              <input
                type="text"
                className="form-input"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                required
              />
            </div>

            {/* Line Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Ordered Items ({items.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItem}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Plus size={14} />
                  Add Part
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {items.map((it, idx) => {
                  const prod = products.find(p => p.id === it.productId) || products[0];
                  const hasEnough = prod.currentStock >= (Number(it.quantity) || 0);

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
                      <div>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                          value={it.productId}
                          onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.sellingPrice} • Stock: {p.currentStock})
                            </option>
                          ))}
                        </select>
                        {!hasEnough && (
                          <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '0.2rem' }}>
                            ⚠️ Only {prod.currentStock} in stock!
                          </div>
                        )}
                      </div>

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
                        ₹{((Number(it.quantity) || 1) * prod.sellingPrice * (1 + (prod.gstRate || 18)/100)).toFixed(0)}
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

            {/* Calculations Summary */}
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
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Base: ₹{subtotal.toLocaleString('en-IN')} + GST: ₹{taxAmount.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '600' }}>Credit Limit: ₹{(selectedCustomer.creditLimit / 100000).toFixed(1)}L</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Invoice Value</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Book Order & Reserve Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
