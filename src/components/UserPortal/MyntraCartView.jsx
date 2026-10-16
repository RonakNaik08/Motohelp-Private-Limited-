import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MapPin,
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const MyntraCartView = ({
  onInitiateCheckout,
  onExploreCatalog,
  selectedCityPreset,
  setSelectedCityPreset,
  customAddress,
  setCustomAddress,
  priority,
  setPriority,
  preferredCarrier,
  setPreferredCarrier,
  paymentTerms,
  setPaymentTerms,
  indianCityPresets = []
}) => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    toggleWishlist,
    clearCart,
    cartItemsCount
  } = useSCM();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('MOTO15');
  const [couponError, setCouponError] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Financial Calculations
  const cartSubtotal = (cart || []).reduce(
    (sum, item) => sum + (Number(item.product?.sellingPrice || 0) * (item.quantity || 1)),
    0
  );

  const totalMrp = (cart || []).reduce(
    (sum, item) => {
      const selling = Number(item.product?.sellingPrice || 0);
      const mrp = item.product?.mrp || Math.round(selling * 1.35);
      return sum + (mrp * (item.quantity || 1));
    },
    0
  );

  const discountOnMrp = Math.max(0, totalMrp - cartSubtotal);

  let couponDiscount = 0;
  if (appliedCoupon === 'MOTO15') {
    couponDiscount = Math.round(cartSubtotal * 0.15);
  } else if (appliedCoupon === 'FLEET10') {
    couponDiscount = Math.round(cartSubtotal * 0.10);
  } else if (appliedCoupon === 'FIRST500') {
    couponDiscount = Math.min(500, Math.round(cartSubtotal * 0.20));
  }

  const taxableAfterDiscount = Math.max(0, cartSubtotal - couponDiscount);
  const gstAmount = Math.round(taxableAfterDiscount * 0.18);
  const deliveryFee = 0; // FREE Delivery
  const grandTotal = taxableAfterDiscount + gstAmount + deliveryFee;
  const totalSavings = discountOnMrp + couponDiscount;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (code === 'MOTO15' || code === 'FLEET10' || code === 'FIRST500' || code === 'FREESHIP') {
      setAppliedCoupon(code);
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try MOTO15, FLEET10, or FIRST500');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleMoveToWishlist = (product) => {
    toggleWishlist(product);
    removeFromCart(product.id);
  };

  if (!cart || cart.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingBag size={24} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Your Procurement Cart is Empty
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px' }}>
          Explore OEM certified industrial equipment, barcode scanners, safety PPE, and automotive spare parts ready for same-day warehouse dispatch.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onExploreCatalog}
          style={{ marginTop: '8px' }}
        >
          <ShoppingBag size={14} /> Explore Product Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
      {/* LEFT COLUMN: Destination & Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Delivery Address Banner */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={18} style={{ color: 'var(--brand-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Receiving Hub: <strong style={{ color: 'var(--text-primary)' }}>{selectedCityPreset}</strong>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.3' }}>
                {customAddress}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddressPicker(!showAddressPicker)}
          >
            {showAddressPicker ? 'Done' : 'Change Location'}
          </button>
        </div>

        {/* Address Selection Dropdown if toggled */}
        {showAddressPicker && (
          <div
            className="card"
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Select Receiving Facility:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {indianCityPresets.map((preset) => (
                <button
                  key={preset.city}
                  type="button"
                  onClick={() => {
                    setSelectedCityPreset(preset.city);
                    setCustomAddress(preset.address);
                    setShowAddressPicker(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    background: selectedCityPreset === preset.city ? '#FFFFFF' : 'transparent',
                    border: selectedCityPreset === preset.city ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>{preset.city}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {preset.address}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '4px' }}>
              <label className="form-label">Custom Address / Unloading Dock Details:</label>
              <input
                type="text"
                className="form-input"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                style={{ marginTop: '4px' }}
              />
            </div>
          </div>
        )}

        {/* Free Delivery Tag */}
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--semantic-success-bg)',
            border: '1px solid var(--semantic-success-border)',
            borderRadius: 'var(--radius-input)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--semantic-success)',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <CheckCircle2 size={14} />
          <span>This order qualifies for <strong>Complimentary 24-Hour B2B Freight Dispatch</strong></span>
        </div>

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cart.map(({ product, quantity }) => {
            const sellingPrice = Number(product.sellingPrice || 0);
            const originalMrp = product.mrp || Math.round(sellingPrice * 1.35);
            const brandName = (product.primarySupplier || 'OEM DIRECT').replace(' Pvt Ltd', '').replace(' India', '').toUpperCase();

            return (
              <div
                key={product.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                {/* Product Thumbnail */}
                <div
                  style={{
                    width: '84px',
                    height: '92px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => handleImageError(e, product)}
                  />
                </div>

                {/* Content & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                          {brandName}
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {product.name}
                        </h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          SKU: <span className="code-tag">{product.sku}</span> • UOM: {product.uom}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ₹{(sellingPrice * quantity).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        (₹{sellingPrice.toLocaleString('en-IN')} × {quantity})
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Wishlist Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-table)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Quantity:</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, quantity - 1)}
                          style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: '700' }}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, quantity + 1)}
                          style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(product)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Heart size={13} /> Save for Later
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Discounts, Courier & Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '1rem' }}>
        {/* Corporate Discount Code */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>
            <Tag size={15} style={{ color: 'var(--brand-primary)' }} /> Corporate Discount & Promo Codes
          </div>

          {appliedCoupon ? (
            <div
              style={{
                background: 'var(--semantic-success-bg)',
                border: '1px solid var(--semantic-success-border)',
                padding: '10px 12px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--semantic-success)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--semantic-success)' }}>
                    Promo '{appliedCoupon}' Applied
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Fleet partner saving: ₹{couponDiscount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{ background: 'transparent', border: 'none', color: 'var(--semantic-danger)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Enter corporate code"
                  className="form-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, fontSize: '12px', textTransform: 'uppercase' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleApplyCoupon()}
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div style={{ fontSize: '11px', color: 'var(--semantic-danger)', fontWeight: '500' }}>
                  {couponError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                {['MOTO15', 'FLEET10', 'FIRST500'].map((cp) => (
                  <button
                    key={cp}
                    type="button"
                    onClick={() => handleApplyCoupon(cp)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--brand-primary)',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    + {cp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Carrier Partner Selection */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={15} style={{ color: 'var(--brand-primary)' }} /> Logistics Carrier & SLA Priority
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="form-group">
              <label className="form-label">Carrier</label>
              <select
                className="form-input"
                value={preferredCarrier}
                onChange={(e) => setPreferredCarrier(e.target.value)}
                style={{ fontSize: '12px' }}
              >
                <option value="Delhivery Express Logistics">Delhivery Express</option>
                <option value="BlueDart Surface Cargo">BlueDart Surface</option>
                <option value="Motohelp Dedicated Fleet">Dedicated Fleet</option>
                <option value="GATI KWE Heavy Freight">GATI KWE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ fontSize: '12px' }}
              >
                <option value="Express">Express (Same Day)</option>
                <option value="Standard">Standard (48h)</option>
                <option value="Emergency Fleet">Critical Fleet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Commercial Summary ({cartItemsCount} Items)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '8px', borderTop: '1px solid var(--border-table)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Catalog Value</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{totalMrp.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--semantic-success)' }}>
              <span>B2B Contract Discount</span>
              <span>- ₹{discountOnMrp.toLocaleString('en-IN')}</span>
            </div>

            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--semantic-success)' }}>
                <span>Promo Discount ({appliedCoupon})</span>
                <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Freight & Delivery</span>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600' }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST Tax (18% Input Credit Eligible)</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span>Total Payable</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onInitiateCheckout}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '6px' }}
          >
            Place Purchase Order <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
