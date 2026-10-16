import React, { useState, useRef } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  X,
  Truck,
  CheckCircle2,
  Circle,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Navigation,
  Gauge,
  Activity,
  PenTool,
  ShieldCheck,
  Zap,
  Radio,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleMapsIndiaTracker } from './GoogleMapsIndiaTracker';

export const ShipmentTrackerModal = ({ shipment, onClose }) => {
  const { advanceShipmentMilestone, shipments } = useSCM();
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'milestones' | 'pod'
  const [isSigned, setIsSigned] = useState(false);
  const signatureCanvasRef = useRef(null);

  if (!shipment) return null;

  const isDelivered = shipment.status === 'Delivered';

  const handleAdvance = () => {
    advanceShipmentMilestone(shipment.id);
    if (!isDelivered) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch {}
    }
  };

  const handleSignPOD = () => {
    setIsSigned(true);
    alert('Digital Proof of Delivery (e-POD) signed and geostamped with SHA-256 cryptographic hash!');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '940px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1.75rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Live Consignment GPS Tracking & Telemetry (India)</h3>
                <span className="badge badge-blue">
                  <Radio size={10} className="spin" /> GPS Active
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Waybill: <strong>{shipment.waybillNumber}</strong> • Carrier: {shipment.carrier} • Vehicle: <strong>{shipment.vehicleNumber || 'MH-03-TR-8812'}</strong>
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              CURRENT STATUS & GEOFENCE
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: isDelivered ? '#34d399' : 'var(--accent-cyan)', marginTop: '0.1rem' }}>
              {shipment.status}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              📍 {shipment.currentLocation}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Speed / Telemetry
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#60a5fa' }}>
                {isDelivered ? '0 km/h (Docked)' : (shipment.telemetry?.speed || 62) + ' km/h'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Cargo Temp / Fuel
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                {shipment.telemetry?.temperature || '24°C'} • {shipment.telemetry?.fuel || '78%'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Estimated Delivery
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
                {shipment.estimatedDelivery}
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('map')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Navigation size={14} /> 🗺️ Live India GPS Corridor Map
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'milestones' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('milestones')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Activity size={14} /> Checkpoint Milestones ({shipment.milestones?.filter(m => m.completed).length || 2}/{shipment.milestones?.length || 5})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'pod' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pod')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PenTool size={14} /> ✍️ Digital Proof of Delivery (e-POD)
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, minHeight: '340px', overflowY: 'auto' }}>
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Embed Live Google Maps / Vector India Map focused on this shipment */}
              <GoogleMapsIndiaTracker
                shipments={shipments}
                selectedShipment={shipment}
                showControls={false}
                height="320px"
              />

              {/* Telemetry Metrics Row */}
              <div className="grid-3">
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Odometer & Telemetry</div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                    {shipment.telemetry?.odometer || '48,210 km'} • Bearing: {shipment.telemetry?.heading || 240}°
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Driver Assigned</div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '0.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{shipment.driverName}</span>
                    <a href={`tel:${shipment.driverPhone}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Phone size={11} /> Call Driver
                    </a>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fastag Corridor Status</div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-green)', marginTop: '0.15rem' }}>
                    ✓ {shipment.telemetry?.fastagStatus || 'Cleared Fastag Toll'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '7px',
                width: '2px',
                background: 'var(--border-medium)',
                zIndex: 0
              }} />

              {shipment.milestones?.map((milestone, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: milestone.completed ? '#10b981' : 'var(--bg-tertiary)',
                    border: `2px solid ${milestone.completed ? '#10b981' : 'var(--text-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {milestone.completed && <CheckCircle2 size={10} color="#fff" />}
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: milestone.completed ? '600' : '400', color: milestone.completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {milestone.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: milestone.completed ? 'var(--accent-green)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {milestone.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pod' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Digital Proof of Delivery (e-POD) Capture</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receiving supervisor signature acknowledging intact delivery of all consignment boxes
                </p>
              </div>

              {isSigned ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--accent-green)' }}>
                    e-POD Cryptographically Signed & Captured
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Signed by: Receiver Store Incharge • Geo-Stamp: 19.1482° N, 72.9351° E • Timestamp: {new Date().toLocaleString()}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    height: '110px',
                    border: '2px dashed var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#0a0e17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'crosshair',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}
                  onClick={handleSignPOD}
                  >
                    ✍️ Click here to sign Digital POD Signature
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleSignPOD} style={{ marginTop: '0.75rem', width: '100%' }}>
                    Confirm & Save Digital POD
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {!isDelivered ? (
            <button
              className="btn btn-primary"
              onClick={handleAdvance}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={15} />
              Simulate Live Progress Update
            </button>
          ) : (
            <span className="badge badge-green" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ✓ Consignment Delivered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
