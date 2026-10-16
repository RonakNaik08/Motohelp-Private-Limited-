import React from 'react';
import {
  Package,
  Truck,
  FileText,
  Headphones,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  CreditCard
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
    addToCart
  } = useSCM();

  const totalSpent = salesOrders.reduce((sum, so) => sum + (so.grandTotal || so.totalAmount || 0), 0) || 48500;
  const activeOrdersCount = salesOrders.filter(so => so.status === 'In Transit' || so.status === 'Ready for Dispatch').length || 3;
  const inTransitShipments = shipments.filter(s => s.status === 'In Transit');
  const activeShipment = inTransitShipments[0] || shipments[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header with Greeting & Current Delivery Destination */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Ronak'} 👋
            </h1>
            <span className="badge badge-blue">
              Verified B2B Account
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '3px' }}>
            Manage your corporate purchase orders, schedule bulk dispatches, and track interstate consignments.
          </p>
        </div>

        {/* Current Delivery Destination Badge */}
        <div
          style={{
            padding: '8px 14px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-input)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFFFFF', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
            <MapPin size={15} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Default Receiving Hub:</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Metro Fleet Workshop, Andheri East, Mumbai - 400069
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Uniform KPI Cards */}
      <div className="grid-4">
        {/* Card 1: Total Orders */}
        <div
          className="card"
          onClick={() => onNavigateTab('history')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Total Orders
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {salesOrders.length > 0 ? salesOrders.length + 21 : 24}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={12} /> +3 orders
              </span>
              <span style={{ color: 'var(--text-muted)' }}>placed this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div
          className="card"
          onClick={() => onNavigateTab('history')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Active Orders
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {activeOrdersCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-info)', fontWeight: '600' }}>
                ● Processing & In Transit
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Deliveries */}
        <div
          className="card"
          onClick={() => onNavigateTab('tracking')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Pending Deliveries
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Truck size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {inTransitShipments.length || 2}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-warning)', fontWeight: '600' }}>
                1 arriving tomorrow, 4:30 PM
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Spent */}
        <div
          className="card"
          onClick={() => onNavigateTab('payments')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Total Spent
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CreditCard size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600' }}>
                ✓ Verified GST Invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Four Restrained Enterprise Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
        <div
          className="card"
          onClick={() => onNavigateTab('catalog')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '3px solid var(--brand-primary)'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>New Order</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Browse OEM catalog & place POs</div>
          </div>
        </div>

        <div
          className="card"
          onClick={() => onNavigateTab('tracking')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '3px solid var(--brand-secondary)'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--brand-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Track Consignments</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Consignment milestone status & ETA</div>
          </div>
        </div>

        <div
          className="card"
          onClick={() => onNavigateTab('invoices')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '3px solid var(--brand-accent)'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>View Tax Invoices</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Download GST invoices & receipts</div>
          </div>
        </div>

        <div
          className="card"
          onClick={() => onNavigateTab('support')}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '3px solid var(--border-medium)'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Headphones size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Corporate Support</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Create tickets & helpdesk</div>
          </div>
        </div>
      </div>

      {/* 4. Live Delivery Snapshot & Recent Purchase Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Orders Table */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Recent Corporate Orders
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Status of latest PO releases and dispatch schedules
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('history')}
            >
              All Orders <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.slice(0, 4).map((so) => (
                  <tr
                    key={so.id}
                    onClick={() => onOpenOrderDetails(so)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                        {so.soNumber || 'ORD-10482'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {so.orderDate || '07 Oct 2026'}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {so.items?.length || 5} SKUs
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                      ₹{(so.grandTotal || so.totalAmount || 12450).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${so.status === 'Delivered' ? 'badge-success' : so.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>
                        {so.status || 'In Transit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Delivery Snapshot Card */}
        {activeShipment && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-info">
                  ● In Transit
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {activeShipment.waybillNumber || 'FTL829402'}
                </span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px' }}>
                Consignment in Transit to Mumbai
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Carrier: <strong>{activeShipment.carrier || 'FastTrack Logistics'}</strong> ({activeShipment.vehicleNumber || 'MH-12-AB-4521'})
              </p>

              {/* ETA Display */}
              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Estimated Delivery ETA</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  Tomorrow, 4:30 PM IST
                </div>
              </div>
            </div>

            {/* Delivery OTP & CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gate Security OTP:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                  8421
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigateTab('tracking')}
              >
                Track Consignment <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Frequently Ordered Products Row */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={16} style={{ color: 'var(--brand-primary)' }} /> Frequently Ordered Catalog SKUs
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Standard OEM spare parts ready for same-day warehouse staging
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('catalog')}
          >
            Full Product Catalog <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
          {products.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => onOpenQuickView(p)}
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ height: '90px', background: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', marginBottom: '8px', border: '1px solid var(--border-subtle)' }}>
                <img
                  src={getProductImageUrl(p)}
                  alt={p.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => handleImageError(e, p)}
                />
              </div>
              <div>
                <span className="code-tag" style={{ fontSize: '10px' }}>{p.sku}</span>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{(p.sellingPrice || 2250).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
