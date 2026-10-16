import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Package,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const CreateRMAModal = ({
  isOpen,
  onClose,
  salesOrders = [],
  preselectedSO = null
}) => {
  const { createRMARequest, currentUser } = useSCM();

  const [selectedSOId, setSelectedSOId] = useState(preselectedSO?.id || salesOrders[0]?.id || '');
  const [selectedItemSku, setSelectedItemSku] = useState('');
  const [returnReason, setReturnReason] = useState('Damaged in Transit');
  const [returnType, setReturnType] = useState('Replacement'); // 'Replacement' | 'CreditNote'
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRMA, setCreatedRMA] = useState(null);

  if (!isOpen) return null;

  const currentSO = salesOrders.find(s => s.id === selectedSOId || s.soNumber === selectedSOId) || salesOrders[0];
  const itemsList = currentSO?.items || [];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedItem = itemsList.find(it => it.sku === selectedItemSku || it.productId === selectedItemSku) || itemsList[0] || { productName: 'Auto Spare Part', unitPrice: 2250, sku: 'MH-SKU' };

    const newRMA = {
      id: `RMA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      soNumber: currentSO?.soNumber || 'SO-2026-1190',
      customerId: currentUser?.id || 'CUST-001',
      customerName: currentUser?.name || 'Ronak',
      itemSku: selectedItem.sku || selectedItemSku,
      itemName: selectedItem.productName || selectedItem.name || 'OEM Component',
      quantity: Number(quantity),
      unitPrice: Number(selectedItem.unitPrice || 0),
      refundAmount: Number(selectedItem.unitPrice || 0) * Number(quantity),
      reason: returnReason,
      returnType: returnType,
      notes: notes,
      status: 'Requested',
      pickupAddress: currentSO?.shippingAddress || 'Metro Fleet Workshop, Andheri East, Mumbai - 400069',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (createRMARequest) {
      createRMARequest(newRMA);
    }

    setCreatedRMA(newRMA);
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: 'var(--radius-panel)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-table)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {createdRMA ? 'Return Request Registered' : 'Initiate B2B Return / Warranty Claim'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                15-day verified return guarantee & OEM replacement claim
              </p>
            </div>
          </div>

          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {createdRMA ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--semantic-success-bg)', color: 'var(--semantic-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid var(--semantic-success-border)' }}>
              <CheckCircle2 size={30} />
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                RMA Case #{createdRMA.id} Created
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Your return request for <strong>{createdRMA.itemName}</strong> (Qty: {createdRMA.quantity}) has been scheduled for reverse pickup.
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Return Settlement:</span>
                <strong>{createdRMA.returnType === 'Replacement' ? '1-to-1 OEM Replacement' : `Credit Note (₹${createdRMA.refundAmount?.toLocaleString('en-IN')})`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reverse Logistics Partner:</span>
                <span>FastTrack Dedicated Fleet (Next Day Pickup)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pickup Facility:</span>
                <span style={{ maxWidth: '280px', textAlign: 'right' }}>{createdRMA.pickupAddress}</span>
              </div>
            </div>

            <button type="button" className="btn btn-primary" onClick={onClose}>
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Select Order */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Select Purchase Order: *
              </label>
              <select
                className="form-input"
                value={selectedSOId}
                onChange={(e) => {
                  setSelectedSOId(e.target.value);
                  setSelectedItemSku('');
                }}
                required
              >
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    Order #{so.soNumber} ({so.orderDate}) — ₹{(so.grandTotal || so.totalAmount || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Select SKU Item */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Select Item to Return / Claim Warranty: *
              </label>
              <select
                className="form-input"
                value={selectedItemSku}
                onChange={(e) => setSelectedItemSku(e.target.value)}
                required
              >
                <option value="">-- Choose Item from Order --</option>
                {itemsList.map((item, idx) => (
                  <option key={idx} value={item.sku || item.productId}>
                    {item.productName || item.name} (SKU: {item.sku}) • Qty: {item.quantity}
                  </option>
                ))}
              </select>
            </div>

            {/* Return Reason & Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Reason for Return / Claim: *
                </label>
                <select
                  className="form-input"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <option value="Damaged in Transit">Damaged in Transit / Crushed Packaging</option>
                  <option value="Quality Inspection Failure">Quality Inspection Failure (Defective Friction/Seal)</option>
                  <option value="Incorrect Part Supplied">Incorrect Part / Compatibility Mismatch</option>
                  <option value="Excess Inventory Staged">Excess Warehouse Stock / Cancelled Workshop Job</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Resolution Type */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Preferred Resolution:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: returnType === 'Replacement' ? 'var(--bg-tertiary)' : '#FFFFFF',
                    border: returnType === 'Replacement' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                >
                  <input
                    type="radio"
                    name="returnType"
                    checked={returnType === 'Replacement'}
                    onChange={() => setReturnType('Replacement')}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>1-to-1 Replacement</span>
                </label>

                <label
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: returnType === 'CreditNote' ? 'var(--bg-tertiary)' : '#FFFFFF',
                    border: returnType === 'CreditNote' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                >
                  <input
                    type="radio"
                    name="returnType"
                    checked={returnType === 'CreditNote'}
                    onChange={() => setReturnType('CreditNote')}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>GST Credit Note Refund</span>
                </label>
              </div>
            </div>

            {/* Additional Remarks */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Inspection Notes / Serial Number (Optional):
              </label>
              <textarea
                rows={2}
                placeholder="Provide batch details, defect photos reference, or workshop feedback..."
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1.5 }}>
                <RotateCcw size={14} /> Submit Return Claim
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
