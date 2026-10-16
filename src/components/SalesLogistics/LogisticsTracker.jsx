import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Truck,
  MapPin,
  Search,
  CheckCircle2,
  Navigation,
  Clock,
  Phone,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  Gauge,
  Compass,
  Radio,
  RadioTower,
  Eye,
  Zap,
  Globe,
  Route,
  RotateCcw
} from 'lucide-react';
import { GoogleMapsIndiaTracker } from './GoogleMapsIndiaTracker';
import { ShipmentTrackerModal } from './ShipmentTrackerModal';
import { MultiStopRouteOptimizer } from './MultiStopRouteOptimizer';
import { RMAManagementHub } from './RMAManagementHub';

export const LogisticsTracker = () => {
  const { shipments, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cards' | 'telemetry' | 'route' | 'rma'

  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      s.waybillNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()) ||
      (s.driverName && s.driverName.toLowerCase().includes(search.toLowerCase()));

    const matchesCarrier = carrierFilter === 'All' || s.carrier.toLowerCase().includes(carrierFilter.toLowerCase());

    return matchesSearch && matchesCarrier;
  });

  const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Control Center Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Globe size={20} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>3PL Logistics & Live India Fleet GPS Tracking</h2>
            <span className="badge badge-blue">{shipments.length} Active Waybills</span>
            <span className="badge badge-green">
              <Radio size={10} className="spin" /> GPS Live
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Hub Corridor: <strong>{selectedBranch.name}</strong> • Real-time Maps JavaScript API (@vis.gl/react-google-maps), Live Corridor Waypoints & Proof of Delivery (e-POD)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
          <button
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('map')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none' }}
          >
            <Navigation size={14} /> 🗺️ India Live Fleet Map
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('cards')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none' }}
          >
            <Layers size={14} /> 📋 Consignment Registry
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'telemetry' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('telemetry')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none' }}
          >
            <Activity size={14} /> ⚡ Telemetry & Sensors
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'route' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('route')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none' }}
          >
            <Route size={14} /> 🛣️ Route Optimizer
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'rma' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('rma')}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none' }}
          >
            <RotateCcw size={14} /> 🔄 Returns & RMA
          </button>
        </div>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid-4">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>In Transit Fleet (India)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
              {inTransitCount} Consignments
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Delivered & Signed POD</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {deliveredCount} Delivered
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <Gauge size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Average Fleet Speed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
              64.2 km/h
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Fastag Cleared Tolls</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>
              100% Automated
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Waybill number, Carrier, Driver name, Tracking ID or Destination in India..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['All', 'Delhivery', 'BlueDart', 'Motohelp'].map(c => (
            <button
              key={c}
              className={`btn btn-sm ${carrierFilter === c ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCarrierFilter(c)}
            >
              {c === 'All' ? 'All 3PL Carriers' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Mode: 🗺️ India Live Fleet Map */}
      {viewMode === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Google Maps of India Component */}
          <GoogleMapsIndiaTracker
            shipments={filteredShipments}
            selectedShipment={selectedShipment}
            onSelectShipment={shp => setSelectedShipment(shp)}
            showControls={true}
            height="560px"
          />

          {/* Quick Consignment Selection Strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Active Corridors & Tracking Details</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click any consignment to zoom and view full GPS route</span>
            </div>

            <div className="grid-3">
              {filteredShipments.map(shp => {
                const isSelected = selectedShipment && selectedShipment.id === shp.id;
                const isDelivered = shp.status === 'Delivered';

                return (
                  <div
                    key={shp.id}
                    className={`glass-card glass-card-interactive ${isSelected ? 'selected-border' : ''}`}
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      border: isSelected ? '1px solid var(--accent-amber)' : undefined
                    }}
                    onClick={() => setSelectedShipment(shp)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="code-tag">{shp.waybillNumber}</span>
                          <span className="badge badge-purple">{shp.carrier}</span>
                        </div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: '800', marginTop: '0.3rem' }}>
                          {shp.customerName}
                        </h4>
                      </div>
                      <span className={`badge ${isDelivered ? 'badge-green' : 'badge-blue'}`}>
                        {shp.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      📍 <strong>Current:</strong> {shp.currentLocation}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                      <span style={{ color: '#60a5fa', fontWeight: '700' }}>
                        ⚡ Speed: {isDelivered ? '0 km/h' : (shp.telemetry?.speed || 60) + ' km/h'}
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShipment(shp);
                        }}
                      >
                        Open Telemetry Hub →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Secondary View Mode: 📋 Consignment Cards Grid */}
      {viewMode === 'cards' && (
        <div className="grid-2">
          {filteredShipments.map(shp => {
            const isDelivered = shp.status === 'Delivered';

            return (
              <div
                key={shp.id}
                className="glass-card glass-card-interactive"
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                onClick={() => setSelectedShipment(shp)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="code-tag">{shp.waybillNumber}</span>
                      <span className="badge badge-purple">{shp.carrier}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginTop: '0.35rem' }}>
                      {shp.customerName}
                    </h3>
                  </div>

                  <span className={`badge ${isDelivered ? 'badge-green' : shp.status === 'In Transit' ? 'badge-blue' : 'badge-amber'}`}>
                    {shp.status}
                  </span>
                </div>

                {/* Route snippet */}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-amber)' }} />
                    <span>From: {shp.origin}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-green)' }} />
                    <span>To: {shp.destination}</span>
                  </div>
                </div>

                {/* Live Location & ETA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>📍 {shp.currentLocation}</span>
                  <span style={{ color: 'var(--text-muted)' }}>ETA: {shp.estimatedDelivery}</span>
                </div>

                {/* Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Driver: <strong>{shp.driverName}</strong> ({shp.vehicleNumber})
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                    <Sparkles size={13} />
                    Live GPS Tracker
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tertiary View Mode: ⚡ Telemetry & Sensors Monitor */}
      {viewMode === 'telemetry' && (
        <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Waybill / Carrier</th>
                <th>Consignee</th>
                <th>Current GPS Corridor</th>
                <th>Speed (km/h)</th>
                <th>Cargo Temp</th>
                <th>Fuel Level</th>
                <th>Fastag Status</th>
                <th>Driver & Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map(shp => (
                <tr key={shp.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedShipment(shp)}>
                  <td>
                    <div style={{ fontWeight: '700' }}>{shp.waybillNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)' }}>{shp.carrier}</div>
                  </td>
                  <td>{shp.customerName}</td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>📍 {shp.currentLocation}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ETA: {shp.estimatedDelivery}</div>
                  </td>
                  <td>
                    <span className="code-tag" style={{ color: '#60a5fa', fontWeight: '700' }}>
                      {shp.status === 'Delivered' ? '0 km/h (Docked)' : (shp.telemetry?.speed || 60) + ' km/h'}
                    </span>
                  </td>
                  <td>{shp.telemetry?.temperature || '24°C'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                        {shp.telemetry?.fuel || '75%'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                      ✓ {shp.telemetry?.fastagStatus || 'Fastag Cleared'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '0.78rem' }}>{shp.driverName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{shp.driverPhone}</div>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
                      Inspect Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Route Optimizer View */}
      {viewMode === 'route' && (
        <MultiStopRouteOptimizer shipments={shipments} />
      )}

      {/* Returns & RMA View */}
      {viewMode === 'rma' && (
        <RMAManagementHub />
      )}

      {/* Tracker Modal */}
      {selectedShipment && (
        <ShipmentTrackerModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}
    </div>
  );
};
