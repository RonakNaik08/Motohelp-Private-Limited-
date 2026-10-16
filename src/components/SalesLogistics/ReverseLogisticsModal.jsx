import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  Package,
  Boxes,
  Truck,
  Building,
  RefreshCw,
  Award
} from 'lucide-react';

export const ReverseLogisticsModal = ({ isOpen, onClose }) => {
  const { customers, suppliers, products, salesOrders, adjustStock, logAction } = useSCM();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [returnType, setReturnType] = useState('fitment'); // 'fitment' | 'warranty' | 'transit_damage' | 'excess'
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedSOId, setSelectedSOId] = useState(salesOrders[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [returnQty, setReturnQty] = useState(5);
  const [disposition, setDisposition] = useState('restock'); // 'restock' | 'scrap' | 'rtv_warranty'
  const [notes, setNotes] = useState('Customer workshop reported wrong brake disc diameter fitment for 2024 model.');

  // Live Return Requests State
  const [rmaList, setRmaList] = useState([
    {
      id: 'RMA-2026-081',
      rmaNumber: 'RMA-2026-081',
      customerName: 'Metro Fleet Mobility Solutions',
      productName: 'CRDi Common Rail Fuel Injector Kit',
      sku: 'MH-INJ-CRDI',
      quantity: 2,
      reason: 'Defective Injector Pressure under OEM Warranty',
      disposition: 'Return-to-Vendor (Warranty Claim: Bosch)',
      creditNoteAmount: 20400,
      status: 'Approved & Credit Note Issued',
      date: '2026-09-14'
    },
    {
      id: 'RMA-2026-082',
      rmaNumber: 'RMA-2026-082',
      customerName: 'Royal Multi-Brand Automotive Works',
      productName: 'Ceramic High-Performance Brake Pad Kit',
      sku: 'MH-BRK-001',
      quantity: 10,
      reason: 'Wrong Fitment Ordered (Workshop Model Mismatch)',
      disposition: 'QC Passed & Restocked in Bin A-01-03',
      creditNoteAmount: 22500,
      status: 'Restocked in Warehouse',
      date: '2026-09-15'
    }
  ]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const creditValue = (selectedProduct?.sellingPrice || 1000) * Number(returnQty || 1);

  const handleCreateRMA = (e) => {
    e.preventDefault();
    const rmaId = `RMA-2026-0${Math.floor(83 + Math.random() * 50)}`;

    let dispText = 'Restocked in Warehouse';
    if (disposition === 'restock') {
      dispText = `QC Passed & Restocked in Bin ${selectedProduct?.binLocation || 'A-01-01'}`;
      adjustStock(selectedProduct.id, Number(returnQty), `RMA Return Restock from ${selectedCustomer.name}`);
    } else if (disposition === 'rtv_warranty') {
      dispText = `Return-to-Vendor Warranty Claim against ${selectedProduct?.primarySupplier || 'OEM Supplier'}`;
    } else {
      dispText = 'Scrapped / Defective Loss Written Off';
    }

    const newRMA = {
      id: rmaId,
      rmaNumber: rmaId,
      customerName: selectedCustomer.name,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(returnQty),
      reason: notes,
      disposition: dispText,
      creditNoteAmount: creditValue,
      status: 'Approved & Credit Note Issued',
      date: new Date().toISOString().split('T')[0]
    };

    setRmaList([newRMA, ...rmaList]);
    logAction('Logistics', 'RMA_PROCESSED', rmaId, `Processed Customer RMA for ${selectedCustomer.name} (${returnQty}x ${selectedProduct.sku}, Credit Note: ₹${creditValue.toLocaleString('en-IN')})`);
    setActiveTab('list');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Reverse Logistics, Customer Returns & Warranty (RMA)
                </h3>
                <span className="badge badge-red">RMA Engine</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Handle Customer Returns, Inward QC Inspection, Credit Note Issuance & OEM Warranty Claims
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('list')}
            style={{ fontSize: '0.78rem' }}
          >
            📋 Active RMA Returns & Warranty Claims ({rmaList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('create')}
            style={{ fontSize: '0.78rem' }}
          >
            + Initiate Customer Return (RMA)
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="table-container">
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>RMA #</th>
                      <th>Customer</th>
                      <th>Returned Part</th>
                      <th>Qty</th>
                      <th>Return Reason</th>
                      <th>QC & Disposition</th>
                      <th>Credit Note (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rmaList.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '700', color: 'var(--accent-red)' }}>{item.rmaNumber}</td>
                        <td>{item.customerName}</td>
                        <td>
                          <div>{item.productName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                        </td>
                        <td style={{ fontWeight: '700' }}>{item.quantity} Units</td>
                        <td>{item.reason}</td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                            {item.disposition}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                          ₹{item.creditNoteAmount?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateRMA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Customer / Fleet Client:
                  </label>
                  <select
                    className="form-control"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Original Sales Order Linkage:
                  </label>
                  <select
                    className="form-control"
                    value={selectedSOId}
                    onChange={(e) => setSelectedSOId(e.target.value)}
                    style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                  >
                    {salesOrders.map(s => (
                      <option key={s.id} value={s.id}>{s.soNumber} — ₹{Number(s.grandTotal).toLocaleString('en-IN')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Select Part to Return:
                  </label>
                  <select
                    className="form-control"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Return Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    QC Inspection & Disposition:
                  </label>
                  <select
                    className="form-control"
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                  >
                    <option value="restock">✅ Restock in Warehouse Bin (Good Condition)</option>
                    <option value="rtv_warranty">🛠️ OEM Warranty Return to Vendor (Claim Credit)</option>
                    <option value="scrap">🗑️ Scrap / Damage Write-Off</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Reason for Return & Defect Notes:
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.8rem' }}
                />
              </div>

              {/* Summary Credit Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '700' }}>
                    Customer Credit Note to Issue:
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Credit will automatically deduct from {selectedCustomer?.name} outstanding receivable ledger.
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                  ₹{creditValue.toLocaleString('en-IN')}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Authorize RMA & Generate Credit Note
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
