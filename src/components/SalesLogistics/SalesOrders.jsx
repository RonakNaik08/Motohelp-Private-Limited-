import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  TrendingUp,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Receipt,
  FileText,
  AlertCircle,
  RotateCcw,
  Download,
  X
} from 'lucide-react';
import { CreateSOModal } from './CreateSOModal';
import { DispatchModal } from './DispatchModal';
import { ShipmentTrackerModal } from './ShipmentTrackerModal';
import { RMAManagementHub } from './RMAManagementHub';
import { GSTTaxInvoiceModal } from '../Finance/GSTTaxInvoiceModal';
import { exportToCSV } from '../../utils/exportUtils';

export const SalesOrders = () => {
  const { salesOrders, shipments, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dispatchingSO, setDispatchingSO] = useState(null);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [viewGstInvoiceSO, setViewGstInvoiceSO] = useState(null);

  const filteredSOs = salesOrders.filter(so => {
    const matchesSearch = so.soNumber.toLowerCase().includes(search.toLowerCase()) ||
                          so.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          so.shippingAddress.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || so.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalSalesVal = salesOrders.reduce((acc, s) => acc + s.grandTotal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Sales Order Management (SO)</h2>
            <span className="badge badge-green">{salesOrders.length} B2B Orders</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Dispatch: <strong>{selectedBranch.name}</strong> • Fleet Allocations, Inventory Reservations & Real-time Dispatch
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowRmaModal(true)} style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
            <RotateCcw size={15} />
            Customer Returns (RMA)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(salesOrders, 'sales-orders')}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Book Sales Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Booked Sales Value</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              ₹{(totalSalesVal / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>In-Transit Consignments</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
              {salesOrders.filter(s => s.status === 'In Transit').length} Active
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Ready for Dispatch</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
              {salesOrders.filter(s => s.status === 'Ready for Dispatch').length} Pending Gate
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Sales Order number, Fleet Client, Destination..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Ready for Dispatch', 'In Transit', 'Delivered'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SO Number & Date</th>
              <th>Customer / Fleet Partner</th>
              <th>Priority SLA</th>
              <th>Items & Value</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSOs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No Sales Orders found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredSOs.map(so => {
                const matchedShipment = shipments.find(s => s.soNumber === so.soNumber || s.id === so.shipmentId);

                return (
                  <tr key={so.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {so.soNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Booked: {so.orderDate}</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{so.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{so.shippingAddress}</div>
                    </td>

                    <td>
                      <span className={`badge ${so.priority === 'Express' ? 'badge-amber' : so.priority === 'Emergency Fleet' ? 'badge-red' : 'badge-neutral'}`}>
                        {so.priority}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                        ₹{so.grandTotal.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{so.items?.length || 1} Part Type(s)</div>
                    </td>

                    <td>
                      <span className={`badge ${so.status === 'Delivered' ? 'badge-green' : so.status === 'In Transit' ? 'badge-blue' : 'badge-amber'}`}>
                        {so.status}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${so.paymentStatus === 'Paid' ? 'badge-green' : 'badge-neutral'}`}>
                        {so.paymentStatus}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Generate & Print GST Tax Invoice"
                          onClick={() => setViewGstInvoiceSO(so)}
                        >
                          <FileText size={14} style={{ color: 'var(--accent-blue)' }} />
                          GST Bill
                        </button>

                        {so.status === 'Ready for Dispatch' && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Generate Waybill & Dispatch"
                            onClick={() => setDispatchingSO(so)}
                          >
                            <Truck size={14} />
                            Dispatch Gate
                          </button>
                        )}

                        {matchedShipment && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Track Live Logistics"
                            onClick={() => setTrackingShipment(matchedShipment)}
                          >
                            <Truck size={14} style={{ color: 'var(--accent-blue)' }} />
                            Track
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create SO Modal */}
      {showCreateModal && (
        <CreateSOModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}

      {/* Dispatch Modal */}
      {dispatchingSO && (
        <DispatchModal so={dispatchingSO} onClose={() => setDispatchingSO(null)} />
      )}

      {/* Tracker Modal */}
      {trackingShipment && (
        <ShipmentTrackerModal shipment={trackingShipment} onClose={() => setTrackingShipment(null)} />
      )}

      {/* Reverse Logistics & RMA Panel */}
      {showRmaModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end'
        }}>
          <div style={{
            width: 'min(900px, 95vw)', height: '100vh', overflowY: 'auto',
            background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-medium)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Returns & RMA Management</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRmaModal(false)}>
                <X size={16} /> Close
              </button>
            </div>
            <RMAManagementHub />
          </div>
        </div>
      )}

      {/* GST Tax Invoice & E-Way Bill Modal */}
      {viewGstInvoiceSO && (
        <GSTTaxInvoiceModal
          isOpen={Boolean(viewGstInvoiceSO)}
          onClose={() => setViewGstInvoiceSO(null)}
          salesOrderData={viewGstInvoiceSO}
        />
      )}
    </div>
  );
};
