import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  Info,
  Car,
  Package,
  Layers,
  Plus,
  Minus
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const ProductDetailModal = ({ product, onClose, onBuyNowDirect }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useSCM();

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('400069');
  const [pincodeStatus, setPincodeStatus] = useState({ checked: true, msg: 'Delivery by Tomorrow, 4:00 PM • FREE Express Shipping' });
  const [selectedVehicle, setSelectedVehicle] = useState('Honda City (2018-2023)');
  const [addedToast, setAddedToast] = useState(false);
  const [activeImgTab, setActiveImgTab] = useState(0);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const sellingPrice = Number(product.sellingPrice || 0);
  const originalMrp = product.mrp || Math.round(sellingPrice * 1.35);
  const savings = (originalMrp - sellingPrice) * quantity;
  const brandName = (product.primarySupplier || 'OEM DIRECT').replace(' Pvt Ltd', '').replace(' India', '').toUpperCase();

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus({
        checked: true,
        msg: `Delivery to ${pincode} by Tomorrow, 4:00 PM • FREE B2B Dispatch`
      });
    } else {
      setPincodeStatus({
        checked: true,
        msg: 'Please enter a valid 6-digit Indian Pincode'
      });
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (onBuyNowDirect) {
      onBuyNowDirect(product, quantity);
    }
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
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: 'var(--radius-panel)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {/* 2-Column Product Detail Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '24px', padding: '24px' }}>
          {/* LEFT COLUMN: Product Image & Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '280px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => handleImageError(e, product)}
              />

              {/* Genuine Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <ShieldCheck size={13} style={{ color: 'var(--brand-primary)' }} /> Certified OEM SKU
              </div>

              {/* Stock Status */}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                <span className={`badge ${product.currentStock <= 30 ? 'badge-warning' : 'badge-success'}`}>
                  {product.currentStock <= 30 ? `Only ${product.currentStock} Units Left` : `In Stock: ${product.currentStock} Units`}
                </span>
              </div>
            </div>

            {/* Quality Specs Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}
            >
              <div>
                <ShieldCheck size={16} style={{ color: 'var(--brand-primary)', margin: '0 auto 2px auto' }} />
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)' }}>100% Genuine</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>OEM Sealed</div>
              </div>

              <div>
                <RotateCcw size={16} style={{ color: 'var(--semantic-success)', margin: '0 auto 2px auto' }} />
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)' }}>15 Days Return</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>B2B Policy</div>
              </div>

              <div>
                <Truck size={16} style={{ color: 'var(--brand-secondary)', margin: '0 auto 2px auto' }} />
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)' }}>Fast Dispatch</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Within 24 Hours</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Brand, Pricing, Pincode & Order Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header: Brand & Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                  {brandName}
                </span>
                <span className="code-tag">{product.sku}</span>
                <span className="badge badge-neutral">{product.category}</span>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {product.name}
              </h2>
            </div>

            {/* Price Section */}
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-input)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  / unit + GST
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>HSN Code: <strong>{product.hsn || '87083000'}</strong> (18% Input Tax Credit Eligible)</span>
                <span style={{ color: 'var(--semantic-success)', fontWeight: '600' }}>In-Stock Staging</span>
              </div>
            </div>

            {/* Pincode & Dispatch Estimator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: 'var(--brand-primary)' }} /> Dispatch Location & Pincode Check:
              </div>
              <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  className="form-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                >
                  Verify
                </button>
              </form>
              {pincodeStatus.checked && (
                <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> {pincodeStatus.msg}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-table)' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                >
                  <Minus size={13} />
                </button>
                <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                >
                  <Plus size={13} />
                </button>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Subtotal: <strong style={{ color: 'var(--text-primary)' }}>₹{(sellingPrice * quantity).toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flex: 1.2 }}
              >
                <ShoppingBag size={14} /> {addedToast ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="btn btn-secondary btn-icon"
                title="Save for Later"
              >
                <Heart size={15} fill={isWishlisted ? 'var(--semantic-danger)' : 'none'} color={isWishlisted ? 'var(--semantic-danger)' : 'var(--text-secondary)'} />
              </button>
            </div>

            {/* Technical Specifications */}
            <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-table)', paddingTop: '10px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Technical & Logistics Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12px' }}>
                <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>HSN:</span> <strong>{product.hsn || '87083000'}</strong>
                </div>
                <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Unit Weight:</span> <strong>{product.weightKg ? `${product.weightKg} KG` : '2.4 KG'}</strong>
                </div>
                <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Dimensions:</span> <strong>{product.dimensions || '22 x 15 x 8 cm'}</strong>
                </div>
                <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Warehouse Staging:</span> <strong>{product.binLocation || 'WH-01 / Dock 4'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
