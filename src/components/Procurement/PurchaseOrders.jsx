import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  ShoppingCart,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Boxes,
  Download
} from 'lucide-react';
import { CreatePOModal } from './CreatePOModal';
import { PODocumentModal } from './PODocumentModal';
import { exportToCSV } from '../../utils/exportUtils';

export const PurchaseOrders = ({ onOpenInwardGRN }) => {
  const { purchaseOrders, approvePurchaseOrder, selectedBranch, activeRole } = useSCM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPOForDoc, setSelectedPOForDoc] = useState(null);

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
                          po.vendorName.toLowerCase().includes(search.toLowerCase()) ||
                          (po.prNumber && po.prNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || po.status === statusFilter || po.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalSpend = purchaseOrders.reduce((acc, p) => acc + p.grandTotal, 0);
  const pendingCount = purchaseOrders.filter(p => p.approvalStatus === 'Pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Purchase Requisitions & Orders (PO)</h2>
            <span className="badge badge-blue">{purchaseOrders.length} Records</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub: <strong>{selectedBranch.name}</strong> • Multi-tier Approval Workflows, Supplier Terms & GRN Linkage
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(purchaseOrders, 'purchase-orders')}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Committed PO Spend</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              ₹{(totalSpend / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Pending Director Approvals</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: pendingCount > 0 ? '#f87171' : '#34d399' }}>
              {pendingCount} Orders
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Fulfilled / Inwarded POs</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {purchaseOrders.filter(p => p.hasGRN).length} Inwarded
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search PO Number, Vendor name, PR..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Pending Approval', 'Approved', 'Received'].map(st => (
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

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO Number & PR</th>
              <th>OEM Vendor / Supplier</th>
              <th>Order Date / Delivery Due</th>
              <th>Line Items</th>
              <th>Grand Total (₹)</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No Purchase Orders found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredPOs.map(po => {
                const isPending = po.approvalStatus === 'Pending';
                const isReceived = po.status === 'Received';

                return (
                  <tr key={po.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {po.poNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          PR: {po.prNumber || 'Direct PO'}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{po.vendorName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Terms: {po.paymentTerms || 'Net 30'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>Ordered: {po.orderDate}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {po.expectedDate}</div>
                    </td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {po.items?.length || 1} Item(s)
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-amber)' }}>
                        ₹{po.grandTotal.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GST Incl.</div>
                    </td>

                    <td>
                      <span className={`badge ${isReceived ? 'badge-green' : isPending ? 'badge-red' : 'badge-blue'}`}>
                        {po.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="View & Print PO Document"
                          onClick={() => setSelectedPOForDoc(po)}
                        >
                          <FileText size={14} />
                          Document
                        </button>

                        {isPending && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Approve Purchase Order"
                            onClick={() => approvePurchaseOrder(po.id)}
                          >
                            <ShieldCheck size={14} />
                            Approve
                          </button>
                        )}

                        {!isReceived && !isPending && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Inward Goods Receipt (GRN)"
                            onClick={() => onOpenInwardGRN && onOpenInwardGRN(po)}
                          >
                            <Boxes size={14} />
                            Receive GRN
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

      {/* Create PO Modal */}
      {showCreateModal && (
        <CreatePOModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}

      {/* Printable PO Document Modal */}
      {selectedPOForDoc && (
        <PODocumentModal po={selectedPOForDoc} onClose={() => setSelectedPOForDoc(null)} />
      )}
    </div>
  );
};
