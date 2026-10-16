import React from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Package
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const WishlistView = ({ onExploreCatalog, onOpenQuickView }) => {
  const { wishlist, toggleWishlist, addToCart } = useSCM();

  const handleMoveToBag = (product) => {
    addToCart(product, 1);
    toggleWishlist(product);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              color: 'var(--semantic-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Heart size={18} fill="var(--semantic-danger)" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Saved Items ({wishlist?.length || 0} Products)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Standard catalog items saved for rapid replenishment and repeat orders
            </p>
          </div>
        </div>

        {wishlist && wishlist.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onExploreCatalog}
          >
            Product Catalog <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Wishlist Grid or Empty State */}
      {(!wishlist || wishlist.length === 0) ? (
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
              color: 'var(--semantic-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            No Saved Items in Wishlist
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Browse the OEM parts catalog and click the favorite heart icon to save products for quick one-click purchase.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onExploreCatalog}
            style={{ marginTop: '6px' }}
          >
            <ShoppingBag size={14} /> Explore Catalog
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--space-md)'
          }}
        >
          {wishlist.map((product) => {
            const sellingPrice = Number(product.sellingPrice || 0);
            const originalMrp = product.mrp || Math.round(sellingPrice * 1.35);
            const brandName = (product.primarySupplier || 'OEM DIRECT').replace(' Pvt Ltd', '').replace(' India', '').toUpperCase();

            return (
              <div
                key={product.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Remove from wishlist button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                    color: 'var(--semantic-danger)'
                  }}
                  title="Remove from Saved"
                >
                  <Trash2 size={13} />
                </button>

                {/* Product Image */}
                <div
                  onClick={() => onOpenQuickView && onOpenQuickView(product)}
                  style={{
                    height: '140px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => handleImageError(e, product)}
                  />

                  <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
                    <span className="code-tag" style={{ fontSize: '10px' }}>
                      {product.sku}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                      {brandName}
                    </div>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        lineHeight: '1.35',
                        marginTop: '2px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.name}
                    </h4>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ₹{sellingPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        + GST
                      </span>
                    </div>

                    {/* Move to Bag Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <ShoppingBag size={13} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
