import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Boxes,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Filter,
  Search,
  PackageCheck
} from 'lucide-react';

export const BatchExpiryTrackerModal = ({ isOpen, onClose }) => {
  const { products, logAction } = useSCM();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [fefoSimulationItem, setFefoSimulationItem] = useState(null);
  const [fefoAllocated, setFefoAllocated] = useState(false);

  // High-fidelity Batch/LOT live records for perishable & sensitive automotive SKUs
  const [batchData, setBatchData] = useState([
    {
      id: 'LOT-2024-C09',
      sku: 'MH-LUB-001',
      productName: 'Castrol Edge 5W-40 Fully Synthetic (4L)',
      category: 'Lubricants & Fluids',
      mfgDate: '2024-04-10',
      expDate: '2026-10-15',
      daysLeft: 24,
      batchQty: 45,
      binLocation: 'D-01-02',
      status: 'Expiring Soon (Critical FEFO)',
      qcCertificate: 'QC-CAST-2024-098'
    },
    {
      id: 'LOT-2025-A01',
      sku: 'MH-LUB-001',
      productName: 'Castrol Edge 5W-40 Fully Synthetic (4L)',
      category: 'Lubricants & Fluids',
      mfgDate: '2025-01-15',
      expDate: '2027-01-15',
      daysLeft: 480,
      batchQty: 180,
      binLocation: 'D-01-05',
      status: 'Optimal Fresh',
      qcCertificate: 'QC-CAST-2025-012'
    },
    {
      id: 'LOT-2024-B04',
      sku: 'MH-FLU-002',
      productName: 'Motul DOT 4 High-Temp Brake Fluid (500ml)',
      category: 'Lubricants & Fluids',
      mfgDate: '2024-03-20',
      expDate: '2026-11-05',
      daysLeft: 45,
      batchQty: 30,
      binLocation: 'D-02-01',
      status: 'Expiring Soon (Critical FEFO)',
      qcCertificate: 'QC-MOT-2024-331'
    },
    {
      id: 'LOT-2025-B12',
      sku: 'MH-FLU-002',
      productName: 'Motul DOT 4 High-Temp Brake Fluid (500ml)',
      category: 'Lubricants & Fluids',
      mfgDate: '2025-02-10',
      expDate: '2027-02-10',
      daysLeft: 506,
      batchQty: 140,
      binLocation: 'D-02-03',
      status: 'Optimal Fresh',
      qcCertificate: 'QC-MOT-2025-442'
    },
    {
      id: 'LOT-2024-G11',
      sku: 'MH-GSK-001',
      productName: 'EPDM Multi-Layer Cylinder Head Gasket',
      category: 'Engine & Powertrain',
      mfgDate: '2024-06-01',
      expDate: '2026-12-01',
      daysLeft: 71,
      batchQty: 60,
      binLocation: 'A-03-04',
      status: 'Moderate Shelf Life',
      qcCertificate: 'QC-EPDM-2024-902'
    },
    {
      id: 'LOT-2025-C08',
      sku: 'MH-BAT-001',
      productName: 'Amaron Pro 12V 65Ah AGM Lead-Acid Battery',
      category: 'Electricals & Sensors',
      mfgDate: '2025-05-10',
      expDate: '2026-11-10',
      daysLeft: 50,
      batchQty: 25,
      binLocation: 'E-01-02',
      status: 'Recharge / Rotate Required',
      qcCertificate: 'QC-AMR-2025-101'
    }
  ]);

  if (!isOpen) return null;

  const filteredBatches = batchData.filter(b => {
    const matchesSearch = b.productName.toLowerCase().includes(search.toLowerCase()) ||
                          b.sku.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.toLowerCase().includes(search.toLowerCase()) ||
                          b.binLocation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalCount = batchData.filter(b => b.daysLeft <= 60).length;

  const handleRunFEFO = (sku) => {
    const skuBatches = batchData.filter(b => b.sku === sku).sort((a, b) => a.daysLeft - b.daysLeft);
    setFefoSimulationItem({ sku, batches: skuBatches });
    setFefoAllocated(false);
  };

  const handleConfirmFefoPick = () => {
    if (!fefoSimulationItem || fefoSimulationItem.batches.length === 0) return;
    const prioritizedBatch = fefoSimulationItem.batches[0];

    logAction('Warehouse', 'FEFO_PICK_DISPATCH', prioritizedBatch.id, `Prioritized FEFO picking for ${prioritizedBatch.productName} from Bin ${prioritizedBatch.binLocation} (Expires in ${prioritizedBatch.daysLeft} days)`);
    setFefoAllocated(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '980px',
          maxWidth: '96vw',
          maxHeight: '92vh',
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
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  Batch / LOT Expiry Tracking & FEFO Picking Engine
                </h3>
                <span className="badge badge-amber">{criticalCount} Expiring Soon</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                First-Expired, First-Out (FEFO) Dispatch Matrix • Automotive Lubricants, Fluids & Chemical Shelf-Life Management
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Filter & Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search LOT #, SKU, Part Name or Bin Location..."
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Lubricants & Fluids', 'Engine & Powertrain', 'Electricals & Sensors'].map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ fontSize: '0.75rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* FEFO Interactive Simulator Banner */}
          {fefoSimulationItem && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--accent-blue)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>
                    FEFO Recommendation Algorithm Result: <span style={{ color: 'var(--accent-blue)' }}>{fefoSimulationItem.batches[0]?.productName}</span>
                  </h4>
                </div>
                <button className="btn-icon" onClick={() => setFefoSimulationItem(null)}>
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                The algorithm compared all active batches for SKU <strong>{fefoSimulationItem.sku}</strong>. To prevent shelf obsolescence, dispatch staff MUST pick from the oldest valid lot first:
              </p>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                {fefoSimulationItem.batches.map((b, idx) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      background: idx === 0 ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                      border: idx === 0 ? '2px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{b.id}</span>
                        {idx === 0 && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>⭐ 1ST FEFO PICK TARGET</span>}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Bin Location: <strong>{b.binLocation}</strong> • Qty: <strong>{b.batchQty} Units</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: idx === 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        Expiry: {b.expDate} ({b.daysLeft} days remaining)
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {fefoAllocated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} /> FEFO Pick Wave Routed to Zebra RF Scanner
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={handleConfirmFefoPick}>
                    <PackageCheck size={15} />
                    Confirm & Lock FEFO Pick Instruction
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Batches Table */}
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>LOT / Batch #</th>
                  <th>Product SKU & Description</th>
                  <th>Mfg & Expiry Date</th>
                  <th>Shelf-Life Countdown</th>
                  <th>Stock in Bin</th>
                  <th>QC Certification</th>
                  <th>FEFO Advisory</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(b => {
                  const isCritical = b.daysLeft <= 60;

                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {b.id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.category}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '700' }}>{b.productName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SKU: {b.sku}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.75rem' }}>Mfg: {b.mfgDate}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isCritical ? '#f87171' : 'var(--text-primary)' }}>
                          Exp: {b.expDate}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className={`badge ${isCritical ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                            {b.daysLeft} Days Left
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '800' }}>{b.batchQty} Units</div>
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>
                          Bin: {b.binLocation}
                        </span>
                      </td>

                      <td>
                        <span className="code-tag" style={{ fontSize: '0.68rem' }}>{b.qcCertificate}</span>
                      </td>

                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleRunFEFO(b.sku)}
                          style={{ fontSize: '0.72rem', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
                        >
                          <Sparkles size={13} />
                          FEFO Match
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
