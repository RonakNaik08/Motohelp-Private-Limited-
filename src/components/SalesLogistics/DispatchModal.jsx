import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, Truck, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DispatchModal = ({ so, onClose, onDispatched }) => {
  const { selectedBranch, dispatchOrder } = useSCM();

  const [carrier, setCarrier] = useState('Delhivery Express Logistics');
  const [vehicleNumber, setVehicleNumber] = useState('MH-03-CP-4821');
  const [driverName, setDriverName] = useState('Ramesh Sawant');
  const [driverPhone, setDriverPhone] = useState('+91 98200 44102');
  const [eWayBill, setEWayBill] = useState(`EWB-2026-${Math.floor(10000000 + Math.random() * 90000000)}`);

  if (!so) return null;

  const handleDispatch = (e) => {
    e.preventDefault();
    dispatchOrder(so.id, carrier);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onDispatched) onDispatched();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={20} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Outward Dispatch & Waybill Generation</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sales Order #{so.soNumber} • {so.customerName}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleDispatch}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{so.customerName}</span>
                <span className="badge badge-amber">{so.priority} Priority</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Destination: {so.shippingAddress}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned 3PL Logistics Partner / Fleet</label>
              <select
                className="form-select"
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
              >
                <option value="Delhivery Express Logistics">Delhivery Express Logistics (Air/Surface)</option>
                <option value="BlueDart Surface Cargo">BlueDart Surface Cargo</option>
                <option value="Motohelp Dedicated Fleet">Motohelp Dedicated Fleet (Local Mumbai/Pune)</option>
                <option value="DTDC Express Courier">DTDC Express Courier</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Government E-Way Bill Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={eWayBill}
                  onChange={e => setEWayBill(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Vehicle Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Truck size={16} />
              Confirm Gate Dispatch & Generate Waybill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
