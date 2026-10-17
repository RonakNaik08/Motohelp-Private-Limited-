import React, { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  Heart,
  ChevronRight,
  Sparkles,
  Zap,
  Tag,
  Copy,
  Check,
  Star,
  ShieldCheck,
  RotateCcw,
  Clock,
  ArrowRight,
  Package,
  Layers,
  Wrench,
  Fuel,
  BatteryCharging,
  Sliders,
  ExternalLink,
  Flame,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const CustomerHomeDashboard = ({
  onNavigateTab,
  onOpenQuickView,
  onOpenOrderDetails,
  onOpenInvoice
}) => {
  const {
    currentUser,
    salesOrders,
    shipments,
    products,
    cart,
    addToCart,
    wishlist,
    toggleWishlist,
    isInWishlist
  } = useSCM();

  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');

  const copyCouponCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    } catch {}
  };

  const inTransitShipments = (shipments || []).filter(s => s.status === 'In Transit' || s.status === 'Dispatched');
  const activeShipment = inTransitShipments[0] || (shipments && shipments[0]);
  const catalogList = (products && products.length > 0) ? products : [];

  // OEM Brands for Sponsor Ribbon (Myntra "POWERED BY" banner style)
  const OEM_BRANDS = [
    { name: 'BOSCH', subtitle: 'German Engineering', color: '#EA580C', bg: '#FFF7ED', tag: 'Electricals & Sensors' },
    { name: 'BREMBO', subtitle: 'High Friction Braking', color: '#DC2626', bg: '#FEF2F2', tag: 'Disc Brake Systems' },
    { name: 'CASTROL', subtitle: 'Liquid Engineering', color: '#16A34A', bg: '#F0FDF4', tag: 'Synthetic Lubricants' },
    { name: 'DENSO', subtitle: 'Precision Fuel Systems', color: '#2563EB', bg: '#EFF6FF', tag: 'CRDi & Powertrain' },
    { name: 'EXIDE', subtitle: 'Heavy Duty Commercial', color: '#B45309', bg: '#FEF3C7', tag: 'Lead Acid & AGM Batteries' },
    { name: 'GABRIEL', subtitle: 'Ride Control Shocks', color: '#7C3AED', bg: '#F5F3FF', tag: 'Suspension Struts' },
    { name: 'MOBIL 1', subtitle: 'Performance Fluids', color: '#0284C7', bg: '#F0F9FF', tag: 'Gear & Axle Oils' }
  ];

  // Quick Category Bubbles (Myntra Top Circle Navigation)
  const CATEGORIES = [
    { id: 'Braking & Suspension', label: 'Brakes', icon: Sliders, color: '#DC2626', bg: '#FEE2E2', discount: 'Up to 60% Off' },
    { id: 'Engine & Powertrain', label: 'Engine', icon: Wrench, color: '#2563EB', bg: '#DBEAFE', discount: 'Up to 55% Off' },
    { id: 'Lubricants & Fluids', label: 'Oils & Fluids', icon: Fuel, color: '#059669', bg: '#D1FAE5', discount: 'Flat 40% Off' },
    { id: 'Electricals & Sensors', label: 'Electricals', icon: Zap, color: '#D97706', bg: '#FEF3C7', discount: 'Min 50% Off' },
    { id: 'Filters & Servicing', label: 'Filters', icon: Layers, color: '#7C3AED', bg: '#EDE9FE', discount: 'From ₹199' },
    { id: 'Battery & Ignition', label: 'Batteries', icon: BatteryCharging, color: '#EA580C', bg: '#FFEDD5', discount: 'Flat ₹800 Off' }
  ];

  // Curated Flash Steals / Deals of the Day (OEM Auto Parts)
  const dealProducts = catalogList.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '2rem' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP PERFORATED COUPON BANNER (Myntra "FLAT ₹500 OFF" Banner Style) */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(90deg, #F97316 0%, #FB923C 45%, #F59E0B 100%)',
          borderRadius: '12px',
          padding: '12px 24px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(249, 115, 22, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: '#FFFFFF',
              color: '#EA580C',
              fontWeight: '900',
              fontSize: '18px',
              padding: '6px 14px',
              borderRadius: '8px',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Tag size={18} /> FLAT ₹500 OFF
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em' }}>
              On Your 1st Corporate Order Via Motohelp B2B Portal!
            </div>
            <div style={{ fontSize: '12px', opacity: 0.92, marginTop: '2px' }}>
              Applicable on all OEM Genuine Spares, Braking Kits, Engine Oils & Electricals.
            </div>
          </div>
        </div>

        {/* Coupon Code Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            onClick={() => copyCouponCode('MOTO500')}
            style={{
              background: 'rgba(255, 255, 255, 0.22)',
              border: '1.5px dashed #FFFFFF',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
            title="Click to copy coupon code"
          >
            <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.85 }}>Coupon:</span>
            <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
              MOTO500
            </span>
            {copiedCoupon ? <Check size={14} /> : <Copy size={14} />}
          </div>
          {copiedCoupon && (
            <span style={{ fontSize: '12px', fontWeight: '700', background: '#FFFFFF', color: '#EA580C', padding: '3px 8px', borderRadius: '4px' }}>
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRAND FESTIVAL HERO SHOWCASE (Myntra "Big Fashion Festival" Style) */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #7C1D1D 0%, #991B1B 25%, #7F1D1D 50%, #450A0A 100%)',
          border: '2px solid #F59E0B',
          boxShadow: '0 12px 36px rgba(153, 27, 27, 0.35)',
          overflow: 'hidden',
          padding: '28px 36px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}
      >
        {/* Festive Golden Arch Background Details */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)'
          }}
        />

        {/* Festival Badge */}
        <div
          style={{
            background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            border: '1px solid #FDE68A',
            color: '#451A03',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '4px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={13} fill="#451A03" /> Grand Fleet Festival • Live Now <Sparkles size={13} fill="#451A03" />
        </div>

        {/* Big Banner 3D Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <h2
            style={{
              fontSize: '34px',
              fontWeight: '900',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            Mega Auto Spares Carnival
          </h2>

          <div
            style={{
              fontSize: '52px',
              fontWeight: '900',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 50%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px'
            }}
          >
            40% - 80% OFF
          </div>

          <p style={{ fontSize: '14px', color: '#FDE68A', maxWidth: '640px', marginTop: '6px', fontWeight: '500' }}>
            Genuine OEM Brake Kits, Commercial Alternators, Fuel Injectors, Fully Synthetic Oils & Fast-Moving Fleet Spares.
          </p>
        </div>

        {/* Festival Quick Category Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
              color: '#451A03',
              border: '1px solid #FEF08A',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Shop Braking & Suspension <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            Engine & Powertrain
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            Oils & Synthetic Lubricants
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. "POWERED BY" OEM BRANDS SHOWCASE (Myntra Sponsor Ribbon Style) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: '#EA580C',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '4px'
              }}
            >
              POWERED BY
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Authorized OEM Manufacturers & Tier-1 Suppliers
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            100% Genuine Certified Warranties
          </span>
        </div>

        {/* Brand Logos Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {OEM_BRANDS.map(brand => (
            <div
              key={brand.name}
              onClick={() => onNavigateTab('catalog')}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: brand.bg,
                border: `1px solid ${brand.color}25`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '900',
                  letterSpacing: '0.04em',
                  color: brand.color,
                  lineHeight: 1.2
                }}
              >
                {brand.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>
                {brand.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SHOP BY CATEGORY CIRCLES (Myntra Top Category Bubbles) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} style={{ color: '#EA580C' }} /> Explore OEM Spares by Category
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Click any category to browse verified parts with immediate dispatch stock
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('catalog')}
            style={{ fontSize: '12px' }}
          >
            View Full Catalog <ChevronRight size={13} />
          </button>
        </div>

        {/* Category Icons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}
        >
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateTab('catalog')}
                style={{
                  padding: '14px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: cat.bg,
                    color: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '11px', color: cat.color, fontWeight: '700', marginTop: '2px' }}>
                    {cat.discount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ACTIVE CONSIGNMENT TRACKING (Clean, Relevant, No Internal ERP Jargon) */}
      {/* ========================================================================= */}
      {activeShipment && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #172B3A 100%)',
            borderRadius: '12px',
            padding: '16px 22px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(30, 58, 95, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  Live Consignment
                </span>
                <span style={{ fontSize: '12px', color: '#93C5FD', fontFamily: 'var(--font-mono)' }}>
                  Waybill #{activeShipment.waybillNumber || 'MOTO-WB-99412'}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '3px' }}>
                Order #{activeShipment.soNumber || 'SO-2026-1191'} en route via {activeShipment.carrier || 'Motohelp Fleet'}
              </div>
              <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '2px' }}>
                Destination: {activeShipment.destination || 'Metro Fleet Workshop, Mumbai'} • Estimated Delivery: <strong>Tomorrow, 4:30 PM</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('tracking')}
            style={{
              background: '#F59E0B',
              color: '#1E3A5F',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            Track Delivery Live <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. STEAL DEALS OF THE DAY / TRENDING OEM PARTS (Myntra Product Grid) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Flame size={12} fill="#FFFFFF" /> DEALS OF THE DAY
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Fleet Best-Sellers & Flash Steals
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Genuine components with Tier-1 OEM verification and same-day dock dispatch
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('catalog')}
          >
            Explore All Deals <ArrowRight size={13} />
          </button>
        </div>

        {/* Product Deals Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          {dealProducts.map((p, idx) => {
            const originalPrice = Math.round(Number(p.sellingPrice || 1500) * 1.45);
            const sellingPrice = Number(p.sellingPrice || 1200);
            const discountPct = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) || 30;
            const inWish = isInWishlist(p.id);

            return (
              <div
                key={p.id || idx}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 2,
                    background: idx % 2 === 0 ? '#EF4444' : '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em'
                  }}
                >
                  {idx % 2 === 0 ? `${discountPct}% OFF` : 'HOT DEAL'}
                </div>

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 2,
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: inWish ? '#EF4444' : 'var(--text-muted)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                  title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={15} fill={inWish ? '#EF4444' : 'none'} />
                </button>

                {/* Product Image */}
                <div
                  onClick={() => onOpenQuickView(p)}
                  style={{
                    height: '160px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={getProductImageUrl(p)}
                    alt={p.name}
                    onError={handleImageError}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.25s ease'
                    }}
                  />
                </div>

                {/* Product Details */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    {/* Brand & Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                        {p.primarySupplier || 'OEM CERTIFIED'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          background: 'var(--bg-tertiary)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: '#059669'
                        }}
                      >
                        <Star size={11} fill="#059669" /> 4.8
                      </span>
                    </div>

                    {/* Name */}
                    <div
                      onClick={() => onOpenQuickView(p)}
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginTop: '4px',
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      title={p.name}
                    >
                      {p.name}
                    </div>

                    {/* SKU */}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      SKU: {p.sku || p.id}
                    </div>
                  </div>

                  <div>
                    {/* Price with Strikethrough (Myntra pricing format) */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ₹{sellingPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
                        ({discountPct}% OFF)
                      </span>
                    </div>

                    {/* Add to Bag Button */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);
                        onNavigateTab('cart');
                      }}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '7px 0',
                        borderRadius: '6px',
                        background: 'var(--brand-primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.12s ease'
                      }}
                    >
                      <ShoppingBag size={13} /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. MOTOHELP ASSURANCE BAR (Myntra Guarantee Ribbon Style) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>100% Genuine OEM Certified</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Direct manufacturer test-bench certification</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Express Hub Dispatch</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Same-day staging from 4 distribution hubs</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RotateCcw size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Easy 14-Day Returns</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hassle-free reverse logistics & RMA claims</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Verified B2B GST Invoices</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>100% eligible Input Tax Credit (ITC) reconciliation</div>
          </div>
        </div>
      </div>

    </div>
  );
};
