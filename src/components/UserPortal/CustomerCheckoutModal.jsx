import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  Plus,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSCM } from '../../context/SCMContext';

export const CustomerCheckoutModal = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { cart, clearCart, createSalesOrder, dispatchOrder, currentUser } = useSCM();

  const [step, setStep] = useState(1); // 1: Address, 2: Summary, 3: Payment, 4: Confirmation
  const [selectedAddress, setSelectedAddress] = useState('Metro Fleet Workshop, Plot 44, MIDC Andheri East, Mumbai, Maharashtra - 400069');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking' | 'COD'
  const [carrier, setCarrier] = useState('FastTrack Logistics');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const cartSubtotal = (cart || []).reduce((sum, item) => sum + (Number(item.product?.sellingPrice || 0) * (item.quantity || 1)), 0);
  const taxAmount = Math.round(cartSubtotal * 0.18);
  const deliveryCharges = 0; // FREE
  const discountAmount = Math.round(cartSubtotal * 0.10); // 10% auto fleet discount
  const grandTotal = cartSubtotal + taxAmount - discountAmount;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSO = {
      customerName: currentUser?.name || 'Ronak',
      customerId: 'CUST-001',
      shippingAddress: selectedAddress,
      priority: 'Express',
      paymentTerms: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid (Verified)',
      paymentStatus: paymentMethod === 'COD' ? 'Pending COD' : 'Paid',
      paymentMode: paymentMethod,
      transactionId: txnId,
      carrier: carrier,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.product.sellingPrice || 0),
        total: Number(item.product.sellingPrice || 0) * Number(item.quantity)
      })),
      subtotal: cartSubtotal,
      taxAmount: taxAmount,
      grandTotal: grandTotal
    };

    const created = await createSalesOrder(newSO);

    setConfirmedOrder({ ...created, transactionId: txnId });
    clearCart();
    setIsProcessing(false);
    setStep(4);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(23, 43, 58, 0.65)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '640px',
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
        {/* Header & Steps Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-table)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {step === 4 ? 'Purchase Order Confirmed' : 'Purchase Order Checkout'}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Step {step} of 4: {step === 1 ? 'Receiving Address' : step === 2 ? 'Order Verification' : step === 3 ? 'Payment Settlement' : 'Order Receipt'}
            </div>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Stepper */}
        {step < 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { num: 1, title: '1. Destination' },
              { num: 2, title: '2. Review' },
              { num: 3, title: '3. Payment' }
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: step >= s.num ? 'var(--bg-tertiary)' : 'transparent',
                  border: step >= s.num ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  color: step >= s.num ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                {s.title}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Delivery Address */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Select Receiving Facility:
            </div>

            {[
              { title: 'Primary Fleet Workshop (MIDC)', addr: 'Metro Fleet Workshop, Plot 44, MIDC Andheri East, Mumbai, Maharashtra - 400069' },
              { title: 'Regional Corporate Office', addr: 'Suite 804, Neptune Business Hub, LBS Marg, Bhandup West, Mumbai - 400078' }
            ].map((item, idx) => (
              <label
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-input)',
                  background: selectedAddress === item.addr ? 'var(--bg-tertiary)' : '#FFFFFF',
                  border: selectedAddress === item.addr ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === item.addr}
                  onChange={() => setSelectedAddress(item.addr)}
                  style={{ marginTop: '3px', accentColor: 'var(--brand-primary)' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.addr}</div>
                </div>
              </label>
            ))}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(2)}
              style={{ marginTop: '4px' }}
            >
              Continue to Order Summary <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: Order Summary */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SKU: {item.product.sku} • Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    ₹{(Number(item.product.sellingPrice || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--semantic-success)' }}>
                <span>Fleet Partner Discount (10%)</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated GST (18%)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Freight & Handling</span>
                <span style={{ color: 'var(--semantic-success)', fontWeight: '600' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 2 }}>
                Proceed to Payment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Choose Settlement Method:
            </div>

            {[
              { key: 'UPI', label: 'Corporate UPI / Fast QR Transfer', desc: 'Direct corporate VPA settlement' },
              { key: 'Card', label: 'Commercial Fleet Card', desc: 'Visa, MasterCard, RuPay Commercial' },
              { key: 'NetBanking', label: 'RTGS / NEFT Inter-Bank Transfer', desc: 'HDFC, ICICI, SBI, Axis corporate portals' },
              { key: 'COD', label: 'Net 30 Days Invoice Terms', desc: 'Pre-approved corporate credit ledger' }
            ].map((p) => (
              <label
                key={p.key}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-input)',
                  background: paymentMethod === p.key ? 'var(--bg-tertiary)' : '#FFFFFF',
                  border: paymentMethod === p.key ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === p.key}
                  onChange={() => setPaymentMethod(p.key)}
                  style={{ accentColor: 'var(--brand-primary)' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
              </label>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                style={{ flex: 2 }}
              >
                {isProcessing ? 'Authorising Order...' : `Confirm & Place PO (₹${grandTotal.toLocaleString('en-IN')})`} <Check size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Order Confirmation */}
        {step === 4 && confirmedOrder && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--semantic-success-bg)', color: 'var(--semantic-success)', border: '1px solid var(--semantic-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Purchase Order #{confirmedOrder.soNumber || 'ORD-10482'} Generated
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Order successfully verified and scheduled for dispatch via <strong>{carrier}</strong>.
              </p>
            </div>

            <div style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)', width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Transaction Ref: <strong style={{ fontFamily: 'var(--font-mono)' }}>{confirmedOrder.transactionId}</strong></span>
              <span>Settled Total: <strong style={{ color: 'var(--text-primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                Continue Catalog
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onOrderSuccess) onOrderSuccess(confirmedOrder);
                }}
                style={{ flex: 1.5 }}
              >
                <Truck size={14} /> Track Delivery Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
