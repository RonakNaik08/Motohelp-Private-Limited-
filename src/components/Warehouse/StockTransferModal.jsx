import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, Truck, ArrowRight, Check } from 'lucide-react';

export const StockTransferModal = ({ isOpen, onClose }) => {
  const { products, branches, selectedBranch, transferStock } = useSCM();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [fromBranchId, setFromBranchId] = useState(selectedBranch.id);
  const [toBranchId, setToBranchId] = useState(branches.find(b => b.id !== selectedBranch.id)?.id || branches[1]?.id);
  const [transferQty, setTransferQty] = useState(20);
  const [transferReason, setTransferReason] = useState('Inter-Branch Regional Stock Balancing');
  const [vehicleNo, setVehicleNo] = useState('MH-03-TR-4912');

  if (!isOpen) return null;

  const activeProd = products.find(p => p.id === selectedProductId) || products[0];
  const fromBranch = branches.find(b => b.id === fromBranchId) || selectedBranch;
  const toBranch = branches.find(b => b.id === toBranchId) || branches[1];

  const handleTransfer = (e) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      alert('Source and destination branches cannot be the same.');
      return;
    }
    if (transferQty > activeProd.currentStock) {
      alert(`Transfer quantity cannot exceed current available stock (${activeProd.currentStock} ${activeProd.uom}).`);
      return;
    }

    transferStock(activeProd.id, fromBranch.name, toBranch.name, Number(transferQty));
    alert(`Inter-hub stock transfer initiated! Gate Pass GP-XFER-${Math.floor(1000 + Math.random() * 9000)} generated for Vehicle ${vehicleNo}.`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={20} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Inter-Warehouse Stock Transfer & Gate Pass</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP Internal Logistics System</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleTransfer}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Automotive Part / SKU *</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Available: {p.currentStock} {p.uom}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Dispatch Origin Hub</label>
                <select
                  className="form-select"
                  value={fromBranchId}
                  onChange={e => setFromBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Receiving Destination Hub</label>
                <select
                  className="form-select"
                  value={toBranchId}
                  onChange={e => setToBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Transfer Quantity ({activeProd?.uom})</label>
                <input
                  type="number"
                  min="1"
                  max={activeProd?.currentStock || 100}
                  className="form-input"
                  value={transferQty}
                  onChange={e => setTransferQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dedicated Transfer Vehicle</label>
                <input
                  type="text"
                  className="form-input"
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transfer Purpose</label>
              <select
                className="form-select"
                value={transferReason}
                onChange={e => setTransferReason(e.target.value)}
              >
                <option value="Inter-Branch Regional Stock Balancing">Inter-Branch Regional Stock Balancing</option>
                <option value="Fulfillment of Large Regional Fleet PO">Fulfillment of Large Regional Fleet PO</option>
                <option value="Warehouse Consolidation">Warehouse Consolidation</option>
                <option value="Emergency Breakdown Fleet Replenishment">Emergency Breakdown Fleet Replenishment</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Generate Gate Pass & Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
