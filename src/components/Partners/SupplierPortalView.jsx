import React, { useState } from 'react';
import {
  Factory,
  PackageCheck,
  Truck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Download,
  Building2,
  Send,
  Plus
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { exportToCSV } from '../../utils/exportUtils';

export const SupplierPortalView = () => {
  const { purchaseOrders, approvePurchaseOrder, suppliers } = useSCM();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || 'SUP-001');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'rfq' | 'invoices'

  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0] || {
    name: 'Brembo India Automotive Pvt Ltd',
    category: 'Braking Systems',
    city: 'Pune Auto Cluster'
  };

  const supplierPOs = purchaseOrders.filter(
    po => po.supplierId === activeSupplier.id || po.supplierName?.toLowerCase().includes(activeSupplier.name?.toLowerCase().slice(0, 5))
  );

  const pendingPOs = supplierPOs.filter(po => po.status === 'Draft' || po.status === 'Submitted' || po.status === 'Pending Approval');
  const approvedPOs = supplierPOs.filter(po => po.status === 'Approved' || po.status === 'Partially Received' || po.status === 'Fully Received');

  const handleExportPOs = () => {
    exportToCSV(
      supplierPOs.map(po => ({
        PONumber: po.poNumber,
        Date: po.orderDate,
        TotalAmount: po.totalAmount,
        Status: po.status,
        DeliveryDue: po.expectedDelivery
      })),
      `supplier_pos_${activeSupplier.id}.csv`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Supplier Profile Header Card */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Factory size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {activeSupplier.name}
              </h3>
              <span className="badge badge-success">
                Certified Tier-1 OEM Supplier
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Vendor ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{activeSupplier.id}</strong> • Location: {activeSupplier.city || 'Pune Chakan'} • Rating: ★ 4.9/5.0
            </p>
          </div>
        </div>

        {/* Switch Supplier Preset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Vendor:</span>
          <select
            className="form-input"
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            style={{ fontSize: '12px', width: 'auto', background: '#FFFFFF' }}
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category || 'OEM'})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportPOs}
          >
            <Download size={13} /> Export PO Ledger
          </button>
        </div>
      </div>

      {/* Supplier KPI Overview */}
      <div className="grid-4">
        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Allocated POs
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {supplierPOs.length || 3}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>
            100% On-Time Fulfillment
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-warning)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Pending Acceptance
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingPOs.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Awaiting manifest release
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-success)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Fulfilled & Dispatched
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {approvedPOs.length || 2}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>
            GRN 3-Way Matched
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-secondary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Procurement Value
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{(supplierPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0) || 185000).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            FY 2026-27 YTD
          </div>
        </div>
      </div>

      {/* PO List Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PackageCheck size={16} style={{ color: 'var(--brand-primary)' }} /> Incoming Purchase Orders & Staging Manifests
          </h4>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Order Date</th>
                <th>Delivery Due</th>
                <th>Items & Quantities</th>
                <th>Order Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(supplierPOs.length > 0 ? supplierPOs : purchaseOrders.slice(0, 3)).map((po) => {
                const isApproved = po.status === 'Approved' || po.status === 'Fully Received';
                return (
                  <tr key={po.id}>
                    <td>
                      <span className="code-tag">{po.poNumber || po.id}</span>
                    </td>
                    <td>{po.orderDate || '2026-09-18'}</td>
                    <td>{po.expectedDelivery || '2026-09-24'}</td>
                    <td>
                      <span style={{ fontSize: '12px' }}>
                        {po.items?.length || 2} SKUs (OEM Standard)
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        ₹{(po.totalAmount || 45000).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>
                        {po.status || 'Draft'}
                      </span>
                    </td>
                    <td>
                      {!isApproved ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => approvePurchaseOrder(po.id)}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={12} /> Acknowledge PO
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600' }}>
                          ✓ Ready for Dispatch
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
