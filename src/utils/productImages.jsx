import React, { useState } from 'react';

// Pre-defined SVG automotive fallback for ultimate resiliency
const SVG_FALLBACK_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <rect width="200" height="200" fill="#F4F6F9"/>
  <circle cx="100" cy="100" r="60" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M100 65 V85 M100 115 V135 M65 100 H85 M115 100 H135" stroke="#1E3A5F" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="22" fill="#1E3A5F"/>
  <circle cx="100" cy="100" r="8" fill="#FFFFFF"/>
  <text x="100" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">OEM GENUINE PART</text>
</svg>
`)}`;

/**
 * Deterministically resolves a guaranteed high-quality product image URL
 * based on product ID, SKU, name, category, or fallback hashing.
 */
export const getProductImageUrl = (product) => {
  if (!product) return '/products/PRD-101.jpg';

  // If passed a simple string
  if (typeof product === 'string') {
    if (product.startsWith('http') || product.startsWith('data:')) return product;
    if (product.startsWith('/products/')) return product;
    return getProductImageUrl({ id: product });
  }

  // If explicit image is supplied and valid
  if (product.image && typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('/') || product.image.startsWith('data:'))) {
    return product.image;
  }
  if (product.imageUrl && typeof product.imageUrl === 'string' && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/') || product.imageUrl.startsWith('data:'))) {
    return product.imageUrl;
  }

  const id = String(product.id || product.productId || '').trim().toUpperCase();
  const sku = String(product.sku || '').trim().toUpperCase();
  const name = String(product.name || product.productName || '').toLowerCase();
  const category = String(product.category || product.category_name || '').toLowerCase();

  // 1. Direct standard ID match (PRD-101 through PRD-110)
  const prdMatch = id.match(/^PRD-(10[1-9]|110)$/);
  if (prdMatch) {
    return `/products/${id}.jpg`;
  }

  // 2. Keyword-based matching for descriptive consistency
  if (name.includes('oil') || name.includes('lubricant') || name.includes('synthetic') || sku.includes('OIL') || category.includes('lubricant')) {
    return '/products/PRD-102.jpg';
  }
  if (name.includes('alternator') || name.includes('starter') || sku.includes('ALT')) {
    return '/products/PRD-103.jpg';
  }
  if (name.includes('injector') || name.includes('crdi') || name.includes('fuel') || sku.includes('INJ')) {
    return '/products/PRD-104.jpg';
  }
  if (name.includes('filter') || sku.includes('FIL')) {
    return '/products/PRD-105.jpg';
  }
  if (name.includes('battery') || sku.includes('BAT')) {
    return '/products/PRD-106.jpg';
  }
  if (name.includes('headlamp') || name.includes('lamp') || name.includes('light') || name.includes('led') || sku.includes('LMP')) {
    return '/products/PRD-107.jpg';
  }
  if (name.includes('clutch') || sku.includes('CLT')) {
    return '/products/PRD-108.jpg';
  }
  if (name.includes('strut') || name.includes('shock') || name.includes('absorber') || sku.includes('STR')) {
    return '/products/PRD-109.jpg';
  }
  if (name.includes('spark') || name.includes('plug') || name.includes('iridium') || sku.includes('SPK')) {
    return '/products/PRD-110.jpg';
  }
  if (name.includes('brake') || name.includes('pad') || name.includes('rotor') || name.includes('disc') || sku.includes('BRK') || sku.includes('DISC') || category.includes('braking')) {
    return '/products/PRD-101.jpg';
  }

  // 3. Category Fallbacks
  if (category.includes('electrical')) return '/products/PRD-103.jpg';
  if (category.includes('engine')) return '/products/PRD-104.jpg';
  if (category.includes('body') || category.includes('consumables')) return '/products/PRD-107.jpg';

  // 4. Deterministic string hash fallback (Ensures consistent image for any dynamic SKU/ID)
  const hashKey = id || sku || name || 'default-part';
  let hash = 0;
  for (let i = 0; i < hashKey.length; i++) {
    hash = ((hash << 5) - hash) + hashKey.charCodeAt(i);
    hash |= 0;
  }
  const index = 101 + (Math.abs(hash) % 10);
  return `/products/PRD-${index}.jpg`;
};

/**
 * Resilient image error handler to attach to img onError
 */
export const handleImageError = (e, product) => {
  const target = e.currentTarget;
  const currentSrc = target.src;

  // Step 1: If current src failed, try safe category fallback or PRD-101
  if (!target.dataset.fallbackLevel) {
    target.dataset.fallbackLevel = '1';
    const fallbackUrl = getProductImageUrl(product);
    if (!currentSrc.includes(fallbackUrl)) {
      target.src = fallbackUrl;
      return;
    }
  }

  // Step 2: If category fallback also failed, try primary default PRD-101.jpg
  if (target.dataset.fallbackLevel === '1') {
    target.dataset.fallbackLevel = '2';
    if (!currentSrc.includes('PRD-101.jpg')) {
      target.src = '/products/PRD-101.jpg';
      return;
    }
  }

  // Step 3: Ultimate guarantee — inline SVG placeholder
  if (target.dataset.fallbackLevel === '2') {
    target.dataset.fallbackLevel = '3';
    target.src = SVG_FALLBACK_DATA_URI;
  }
};

/**
 * Reusable ProductImage component with guaranteed fallback & smooth transitions
 */
export const ProductImage = ({
  product,
  alt = '',
  style = {},
  className = '',
  hoverZoom = false,
  isHovered = false
}) => {
  const [imgSrc, setImgSrc] = useState(() => getProductImageUrl(product));
  const [hasError, setHasError] = useState(false);

  const finalAlt = alt || product?.name || 'Automotive Component';

  return (
    <img
      src={hasError ? SVG_FALLBACK_DATA_URI : imgSrc}
      alt={finalAlt}
      className={className}
      style={{
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain',
        transition: 'transform 0.2s ease',
        transform: hoverZoom && isHovered ? 'scale(1.05)' : 'scale(1)',
        ...style
      }}
      onError={(e) => {
        if (!hasError) {
          handleImageError(e, product);
          setHasError(true);
        }
      }}
    />
  );
};
