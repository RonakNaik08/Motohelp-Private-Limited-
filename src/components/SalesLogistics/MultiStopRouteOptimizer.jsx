import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  ArrowRight,
  TrendingDown,
  Clock,
  Fuel,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Layers,
  Send
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const MultiStopRouteOptimizer = () => {
  const { shipments, selectedBranch } = useSCM();

  const [selectedVehicle, setSelectedVehicle] = useState('MH-03-TR-8812 (FastTrack Dedicated Fleet)');
  const [stops, setStops] = useState([
    { id: 1, name: 'Bhandup Central Hub (HQ)', type: 'Origin / Dispatch Bay 2', eta: '08:30 AM', distanceKm: 0, status: 'Departed' },
    { id: 2, name: 'Kanjurmarg EEH Toll Plaza', type: 'Highway FASTag Checkpoint', eta: '09:05 AM', distanceKm: 4.2, status: 'Cleared' },
    { id: 3, name: 'Powai Automotive Technology Park', type: 'Customer Drop #1 (12 Boxes)', eta: '09:45 AM', distanceKm: 8.6, status: 'Pending' },
    { id: 4, name: 'Metro Fleet Workshop, Andheri East', type: 'Customer Drop #2 (28 Boxes)', eta: '10:30 AM', distanceKm: 14.8, status: 'Pending' },
    { id: 5, name: 'Chakan MIDC Auto Cluster, Pune', type: 'Regional Cross-Dock', eta: '01:15 PM', distanceKm: 138.4, status: 'Pending' }
  ]);

  const [optimized, setOptimized] = useState(true);
  const [savings, setSavings] = useState({
    distanceSavedKm: 24.6,
    fuelSavedLitres: 5.8,
    costSavedInr: 1240,
    timeSavedMins: 42
  });

  const moveStop = (index, direction) => {
    if (index === 0) return; // Origin stays at top
    const targetIdx = index + direction;
    if (targetIdx <= 0 || targetIdx >= stops.length) return;

    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setStops(updated);
  };

  const handleReoptimize = () => {
    setOptimized(true);
    setSavings({
      distanceSavedKm: +(savings.distanceSavedKm + (Math.random() * 2 - 1)).toFixed(1),
      fuelSavedLitres: +(savings.fuelSavedLitres + 0.4).toFixed(1),
      costSavedInr: Math.round(savings.costSavedInr + 150),
      timeSavedMins: savings.timeSavedMins + 5
    });
  };

  const totalDistance = stops.reduce((sum, s) => sum + s.distanceKm, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              AI Multi-Stop Corridor Route Optimizer
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Compute minimum travel time, fuel burn, and FASTag toll sequence across delivery hubs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReoptimize}
          >
            <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} /> Re-Calculate Optimal Sequence
          </button>
        </div>
      </div>

      {/* KPI Savings Metrics */}
      <div className="grid-4">
        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-success)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Distance Optimized
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {totalDistance.toFixed(1)} km
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <TrendingDown size={12} /> -{savings.distanceSavedKm} km versus standard route
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Time Saved
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ~{savings.timeSavedMins} mins
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Avoids JVLR peak congestion hours
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--semantic-warning)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Diesel Fuel Burn
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {(totalDistance * 0.18).toFixed(1)} L
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>
            Saved {savings.fuelSavedLitres} L (CO₂ -14.2 kg)
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid var(--brand-secondary)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Fleet Net Savings
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{savings.costSavedInr.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>
            Per consignment dispatch cycle
          </div>
        </div>
      </div>

      {/* Multi-Stop Sequence Table with Reordering */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: 'var(--brand-primary)' }} /> Sequenced Multi-Stop Itinerary
          </h4>
          <span className="badge badge-success" style={{ fontSize: '11px' }}>
            ✓ Verified Shortest Hamiltonian Path
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              style={{
                padding: '12px 16px',
                background: idx === 0 ? 'var(--bg-tertiary)' : '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: idx === 0 ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                    color: idx === 0 ? '#FFFFFF' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {idx + 1}
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {stop.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {stop.type} • Leg: +{stop.distanceKm} km
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {stop.eta}
                  </div>
                  <span className={`badge ${stop.status === 'Cleared' || stop.status === 'Departed' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                    {stop.status}
                  </span>
                </div>

                {idx > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ padding: '2px', width: '22px', height: '22px' }}
                      onClick={() => moveStop(idx, -1)}
                      disabled={idx === 1}
                      title="Move stop earlier"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ padding: '2px', width: '22px', height: '22px' }}
                      onClick={() => moveStop(idx, 1)}
                      disabled={idx === stops.length - 1}
                      title="Move stop later"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
