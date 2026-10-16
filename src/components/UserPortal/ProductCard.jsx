import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Eye,
  Check,
  Truck,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const ProductCard = ({ product, onQuickView, onBuyNow }) => {
  const { addToCart, cart, toggleWishlist, isInWishlist } = useSCM();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const sellingPrice = Number(product.sellingPrice || 0);
  const originalMrp = product.mrp || Math.round(sellingPrice * 1.35);
  const isWishlisted = isInWishlist(product.id);
  const inCartItem = (cart || []).find(item => item.product?.id === product.id);

  const isLowStock = product.currentStock <= 25;
  const isFastMoving = product.fsnCategory === 'F' || product.currentStock > 100;

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const brandName = (product.primarySupplier || 'OEM DIRECT').replace(' Pvt Ltd', '').replace(' India', '').toUpperCase();

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderColor: inCartItem ? 'var(--brand-primary)' : 'var(--border-subtle)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'var(--transition)'
      }}
    >
      {/* 1. Image Showcase */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          background: 'var(--bg-tertiary)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.2s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}
          onError={(e) => handleImageError(e, product)}
        />

        {/* Stock Status Badge */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
          {isLowStock ? (
            <span className="badge badge-warning" style={{ fontSize: '11px' }}>
              Low Stock: {product.currentStock} left
            </span>
          ) : isFastMoving ? (
            <span className="badge badge-success" style={{ fontSize: '11px' }}>
              High Demand
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              Standard Stock
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
            color: isWishlisted ? 'var(--semantic-danger)' : 'var(--text-secondary)',
            transition: 'var(--transition)'
          }}
          title={isWishlisted ? 'Remove from Saved' : 'Save to Favorites'}
        >
          <Heart size={14} fill={isWishlisted ? 'var(--semantic-danger)' : 'none'} />
        </button>
      </div>

      {/* 2. Product Details */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              {brandName}
            </span>
            <span className="code-tag" style={{ fontSize: '10px' }}>
              {product.sku}
            </span>
          </div>

          <h4
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              lineHeight: '1.35',
              marginTop: '4px',
              minHeight: '2.7em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={product.name}
          >
            {product.name}
          </h4>
        </div>

        {/* Pricing & Actions */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-table)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                / unit + GST
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Stock: <strong>{product.currentStock}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
            >
              <Eye size={12} /> View Specs
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddToCartClick}
              style={{
                flex: 1.3,
                padding: '6px 8px',
                fontSize: '12px',
                background: justAdded ? 'var(--semantic-success)' : 'var(--brand-primary)',
                borderColor: justAdded ? 'var(--semantic-success)' : 'var(--brand-primary)'
              }}
            >
              {justAdded ? (
                <>
                  <Check size={12} /> Added
                </>
              ) : inCartItem ? (
                <>
                  <ShoppingBag size={12} /> In Cart ({inCartItem.quantity})
                </>
              ) : (
                <>
                  <ShoppingBag size={12} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
