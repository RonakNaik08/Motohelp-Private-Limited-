import React, { useState } from 'react';
import {
  Package,
  Calendar,
  Truck,
  FileText,
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  CreditCard,
  Check,
  ChevronRight,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const CustomerOrdersView = ({
  onTrackOrder,
  onViewInvoice,
  onReorder
}) => {
  const { salesOrders, shipments } = useSCM();
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const statusTabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = salesOrders.filter(so => {
    const matchesSearch =
      (so.soNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (so.shippingAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (so.items || []).some(item => (item.productName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (activeStatusTab === 'Processing') matchesStatus = so.status === 'Ready for Dispatch' || so.status === 'Approved';
    else if (activeStatusTab === 'Shipped') matchesStatus = so.status === 'In Transit' || so.status === 'Dispatched';
    else if (activeStatusTab === 'Delivered') matchesStatus = so.status === 'Delivered';
    else if (activeStatusTab === 'Cancelled') matchesStatus = so.status === 'Cancelled';

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Search / Tab Filter */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: 'var(--brand-primary)' }} /> Purchase Orders & Shipment History
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Review consignment fulfillment statuses, GST invoices, and live carrier tracking
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by PO # or product..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Status Tabs Filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-table)' }}>
          {statusTabs.map((tab) => {
            const isTab = activeStatusTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatusTab(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isTab ? '600' : '500',
                  border: isTab ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: isTab ? 'var(--brand-primary)' : '#FFFFFF',
                  color: isTab ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredOrders.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Package size={36} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>No Orders Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No orders match your selected search query or status filter.</p>
          </div>
        ) : (
          filteredOrders.map((so) => {
            const matchedShipment = shipments.find(s => s.soNumber === so.soNumber || s.soId === so.id);
            const isDelivered = so.status === 'Delivered' || matchedShipment?.status === 'Delivered';
            const isInTransit = so.status === 'In Transit' || matchedShipment?.status === 'In Transit';

            let statusBadgeClass = 'badge-info';
            let statusLabel = 'In Transit';
            if (isDelivered) {
              statusBadgeClass = 'badge-success';
              statusLabel = 'Delivered';
            } else if (so.status === 'Ready for Dispatch' || so.status === 'Approved') {
              statusBadgeClass = 'badge-warning';
              statusLabel = 'Processing';
            } else if (so.status === 'Cancelled') {
              statusBadgeClass = 'badge-danger';
              statusLabel = 'Cancelled';
            }

            return (
              <div
                key={so.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-table)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                      {so.soNumber || 'ORD-10482'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> Order Date: {so.orderDate || '07 Oct 2026'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Expected Delivery: <strong style={{ color: 'var(--text-primary)' }}>{so.deliveryDue || '10 Oct 2026'}</strong>
                    </span>
                    <span className={`badge ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Middle Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {so.items?.length || 1} SKUs • {so.items?.[0]?.productName || so.productName || 'Ceramic Brake Pad Kit'}
                      {(so.items?.length || 1) > 1 && ` + ${so.items.length - 1} more items`}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {so.shippingAddress || 'Metro Fleet Workshop, Andheri East, Mumbai'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Total Amount (Incl. GST)</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      ₹{(so.grandTotal || so.totalAmount || 12450).toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Paid via B2B Corporate Ledger</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedOrderDetails(so)}
                    >
                      Details
                    </button>

                    {matchedShipment && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onTrackOrder(matchedShipment)}
                      >
                        <Truck size={12} /> Live Track
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewInvoice(so)}
                    >
                      <FileText size={12} /> Invoice
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onReorder(so)}
                    >
                      <RotateCcw size={12} /> Reorder
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Detailed Order Modal with 6-Stage Timeline */}
      {selectedOrderDetails && (
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
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '88vh',
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Order #{selectedOrderDetails.soNumber || 'ORD-10482'}
                  </h2>
                  <span className="badge badge-info">
                    In Transit
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Placed on <strong>{selectedOrderDetails.orderDate || '07 Oct 2026'}</strong> • Expected Arrival: <strong>{selectedOrderDetails.deliveryDue || '10 Oct 2026'}</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={() => setSelectedOrderDetails(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Payment Terms</span>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--semantic-success)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Prepaid via Corporate Ledger
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Invoice Reference: INV-2026-8402</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Delivery Hub Destination</span>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedOrderDetails.shippingAddress || 'Metro Fleet Workshop, Andheri East, Mumbai - 400069'}
                </div>
              </div>
            </div>

            {/* 6-Stage Timeline Stepper:
                1. Order Placed
                2. Order Confirmed
                3. Packed
                4. Dispatched
                5. In Transit
                6. Delivered
            */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Fulfillment Milestone Progression
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', textAlign: 'center' }}>
                {[
                  { label: 'Order Placed', time: '09:15 AM', status: 'done' },
                  { label: 'Confirmed', time: '09:45 AM', status: 'done' },
                  { label: 'Packed', time: '11:00 AM', status: 'done' },
                  { label: 'Dispatched', time: '12:30 PM', status: 'done' },
                  { label: 'In Transit', time: 'Active GPS', status: 'current' },
                  { label: 'Delivered', time: 'Pending', status: 'pending' }
                ].map((st, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: st.status === 'done' ? 'var(--semantic-success)' : st.status === 'current' ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                        color: st.status === 'done' || st.status === 'current' ? '#FFFFFF' : 'var(--text-muted)',
                        border: st.status === 'current' ? '2px solid var(--brand-secondary)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {st.status === 'done' ? <Check size={13} /> : st.status === 'current' ? '●' : '○'}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: st.status === 'current' ? '600' : '500', color: st.status === 'current' ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{st.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Line Items
              </h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrderDetails.items || [
                    { productName: 'Wireless Barcode Scanner WH-2048', sku: 'WBS-2048', quantity: 2, unitPrice: 4850, total: 9700 },
                    { productName: 'Thermal Label Printer PR-3012', sku: 'PR-3012', quantity: 1, unitPrice: 12500, total: 12500 }
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.productName || item.name}</div>
                        <span className="code-tag" style={{ fontSize: '10px' }}>{item.sku}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>₹{(item.unitPrice || 4850).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>₹{(item.total || (item.unitPrice || 4850) * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-table)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Total Order Value (18% GST incl.): <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>₹{(selectedOrderDetails.grandTotal || 12450).toLocaleString('en-IN')}</strong>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onViewInvoice(selectedOrderDetails)}
              >
                <FileText size={13} /> View GST Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
