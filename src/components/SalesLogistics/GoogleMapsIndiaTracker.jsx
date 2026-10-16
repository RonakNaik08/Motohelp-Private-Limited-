import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Truck,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  CheckCircle2,
  Navigation,
  Clock,
  Zap
} from 'lucide-react';

// Exact Indian Subcontinent Bounding Box (Kanyakumari to Kashmir, Gujarat to Arunachal Pradesh)
export const INDIA_BOUNDS = [
  [7.0, 67.5],  // South-West (Indian Ocean / Lakshadweep Sea)
  [36.5, 97.5]  // North-East (Kashmir / Arunachal Pradesh)
];

// India Regional Corridors Presets (Strictly Indian Coordinates)
export const INDIA_CORRIDOR_PRESETS = [
  {
    id: 'all_india',
    name: '🇮🇳 All India Fleet',
    center: { lat: 21.8, lng: 79.5 },
    zoom: 5,
    bounds: INDIA_BOUNDS,
    description: 'National freight view strictly focused on the Map of India'
  },
  {
    id: 'western',
    name: '🏙️ Western Hub (Mumbai-Pune-Thane)',
    center: { lat: 19.0760, lng: 73.05 },
    zoom: 9,
    description: 'Bhandup HQ, Bhiwandi Logistics Depot, Chakan Auto Cluster & JVLR'
  },
  {
    id: 'northern',
    name: '🏛️ Northern Hub (Delhi-Jaipur)',
    center: { lat: 27.8, lng: 76.5 },
    zoom: 8,
    description: 'Delhi NCR Gurugram Hub to Jaipur VKIA Industrial Corridor'
  },
  {
    id: 'southern',
    name: '🚀 Southern Hub (Bengaluru-Chennai)',
    center: { lat: 13.0, lng: 78.8 },
    zoom: 8,
    description: 'Whitefield Tech Park to Ambattur Industrial Estate via Hosur'
  },
  {
    id: 'gujarat',
    name: '🏭 Gujarat Belt (Sanand-Vadodara)',
    center: { lat: 22.8, lng: 72.8 },
    zoom: 9,
    description: 'Sanand Auto Hub to Vadodara GIDC via NE1 National Expressway'
  }
];

export const GoogleMapsIndiaTracker = ({
  shipments = [],
  selectedShipment = null,
  onSelectShipment = () => {},
  showControls = true,
  height = '480px'
}) => {
  const mapContainerRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  const [activePreset, setActivePreset] = useState('all_india');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedCoords, setSimulatedCoords] = useState({});

  // 1. Initialize Map Strictly Locked & Bounded to the Map of India
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletInstanceRef.current) {
      // Create Leaflet instance strictly constrained to India
      const map = L.map(mapContainerRef.current, {
        center: [21.8, 79.5],
        zoom: 5,
        minZoom: 5,
        maxZoom: 18,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        maxBounds: [
          [5.5, 66.5],   // Hard boundary south-west of India
          [37.5, 98.5]   // Hard boundary north-east of India
        ],
        maxBoundsViscosity: 1.0, // 100% rigid lock - cannot drag outside India
        zoomControl: false,
        attributionControl: false
      });

      // High-resolution OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        subdomains: 'abc',
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add Zoom Control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletInstanceRef.current = map;

      // Fit map strictly to Indian borders on load
      setTimeout(() => {
        if (leafletInstanceRef.current) {
          leafletInstanceRef.current.invalidateSize();
          leafletInstanceRef.current.fitBounds(INDIA_BOUNDS, {
            padding: [15, 15],
            maxZoom: 5.5
          });
        }
      }, 150);

      setTimeout(() => {
        if (leafletInstanceRef.current) {
          leafletInstanceRef.current.invalidateSize();
        }
      }, 400);
    }

    // Auto-resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 2. Render Indian Highway Corridors, Routes & Live Vehicle Markers
  useEffect(() => {
    const map = leafletInstanceRef.current;
    if (!map) return;

    // Clear old layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    shipments.forEach(shp => {
      const isSelected = selectedShipment && selectedShipment.id === shp.id;
      const isDelivered = shp.status === 'Delivered';
      const livePos = (isSelected && simulatedCoords[shp.id])
        ? simulatedCoords[shp.id]
        : (shp.currentCoords || { lat: 19.1310, lng: 72.9050 });

      // Draw Route Polyline across India Highway
      if (shp.routeWaypoints && shp.routeWaypoints.length > 0) {
        const polyline = L.polyline(
          shp.routeWaypoints.map(w => [w.lat, w.lng]),
          {
            color: isSelected ? '#f59e0b' : (isDelivered ? '#10b981' : '#2563eb'),
            weight: isSelected ? 5 : 3.5,
            opacity: isSelected ? 0.95 : 0.75,
            dashArray: isDelivered ? undefined : '6, 8'
          }
        ).addTo(map);

        polylinesRef.current.push(polyline);
      }

      // Origin Pin
      if (shp.originCoords) {
        const originIcon = L.divIcon({
          className: 'origin-marker',
          html: `<div style="background: #10b981; color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">O</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const originMarker = L.marker([shp.originCoords.lat, shp.originCoords.lng], { icon: originIcon })
          .addTo(map)
          .bindPopup(`<strong>Origin:</strong> ${shp.origin}<br/><span style="color:#64748b; font-size:11px;">Waybill: ${shp.waybillNumber}</span>`);
        markersRef.current.push(originMarker);
      }

      // Destination Pin
      if (shp.destinationCoords) {
        const destIcon = L.divIcon({
          className: 'dest-marker',
          html: `<div style="background: #ef4444; color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">D</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const destMarker = L.marker([shp.destinationCoords.lat, shp.destinationCoords.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<strong>Destination:</strong> ${shp.destination}<br/><span style="color:#64748b; font-size:11px;">Consignee: ${shp.customerName}</span>`);
        markersRef.current.push(destMarker);
      }

      // Live Animated Vehicle Marker
      const truckIcon = L.divIcon({
        className: 'truck-marker',
        html: `
          <div style="
            background: ${isSelected ? '#f59e0b' : '#2563eb'};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 12px ${isSelected ? 'rgba(245, 158, 11, 0.55)' : 'rgba(37, 99, 235, 0.45)'};
            transition: transform 0.3s ease;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 17h4V5H2v12h3"></path>
              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
              <circle cx="7.5" cy="17.5" r="2.5"></circle>
              <circle cx="17.5" cy="17.5" r="2.5"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const truckMarker = L.marker([livePos.lat, livePos.lng], { icon: truckIcon })
        .addTo(map)
        .on('click', () => {
          onSelectShipment(shp);
        })
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 190px; color: #0f172a; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 13px;">${shp.waybillNumber}</strong>
              <span style="background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${shp.carrier}</span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">📍 ${shp.currentLocation}</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 700;">⚡ Speed: ${isDelivered ? '0 km/h (Docked)' : (shp.telemetry?.speed || 62) + ' km/h'}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Driver: ${shp.driverName} (${shp.vehicleNumber})</div>
          </div>
        `);

      markersRef.current.push(truckMarker);
    });
  }, [shipments, selectedShipment, simulatedCoords, isSimulating, onSelectShipment]);

  // 3. Handle Preset Change (Strictly Focused on Indian Corridors)
  const handlePresetSelect = useCallback(presetId => {
    const map = leafletInstanceRef.current;
    if (!map) return;

    setActivePreset(presetId);
    const preset = INDIA_CORRIDOR_PRESETS.find(p => p.id === presetId);

    if (presetId === 'all_india' || !preset) {
      map.fitBounds(INDIA_BOUNDS, {
        padding: [15, 15],
        duration: 1.0,
        maxZoom: 5.5
      });
    } else if (preset) {
      map.flyTo([preset.center.lat, preset.center.lng], preset.zoom, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }
  }, []);

  // When selected shipment changes, pan into that shipment's corridor
  useEffect(() => {
    const map = leafletInstanceRef.current;
    if (!map || !selectedShipment) return;

    if (selectedShipment.routeWaypoints && selectedShipment.routeWaypoints.length > 1) {
      const bounds = L.latLngBounds(selectedShipment.routeWaypoints.map(w => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, duration: 1.0 });
    } else if (selectedShipment.currentCoords) {
      map.flyTo([selectedShipment.currentCoords.lat, selectedShipment.currentCoords.lng], 10, {
        duration: 1.0
      });
    }
  }, [selectedShipment]);

  // Real-time GPS Simulation Loop
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      let simStep = 0;
      interval = setInterval(() => {
        simStep += 1;
        const targetShipment = selectedShipment || shipments.find(s => s.status === 'In Transit') || shipments[0];
        if (targetShipment && targetShipment.routeWaypoints && targetShipment.routeWaypoints.length > 0) {
          const waypoints = targetShipment.routeWaypoints;
          const currentWpIndex = simStep % waypoints.length;
          const currentWp = waypoints[currentWpIndex];

          setSimulatedCoords(prev => ({
            ...prev,
            [targetShipment.id]: { lat: currentWp.lat, lng: currentWp.lng }
          }));
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, selectedShipment, shipments]);

  const activeFocusShipment = selectedShipment || shipments.find(s => s.status === 'In Transit') || shipments[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {/* 1. Indian Corridor Bar & Simulation Button */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '0.4rem'
          }}
        >
          {/* Corridor Preset Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Corridor Hub:
            </span>
            {INDIA_CORRIDOR_PRESETS.map(preset => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '7px',
                    border: 'none',
                    background: isActive ? '#2563eb' : 'var(--bg-tertiary)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                    transition: 'var(--transition)'
                  }}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Simulation Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.74rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                border: 'none',
                background: isSimulating ? '#ef4444' : '#10b981',
                color: '#ffffff',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: isSimulating ? '0 2px 6px rgba(239, 68, 68, 0.3)' : '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              <span>{isSimulating ? 'Pause GPS Telemetry' : '▶ Simulate Live Fleet Movement'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Map of India Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: height,
          minHeight: '440px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          background: '#f8fafc'
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Map Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#334155',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }} />
            <span>Origin Hub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2563eb' }} />
            <span>En Route (GPS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }} />
            <span>Destination Dock</span>
          </div>
        </div>

        {/* Floating Live Telemetry HUD Card for Focused Indian Consignment */}
        {activeFocusShipment && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '0.85rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>
                  {activeFocusShipment.vehicleNumber || 'MH-12-TR-8812'}
                </span>
                <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                  {activeFocusShipment.carrier}
                </span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                ● {activeFocusShipment.status}
              </span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <div>📍 <strong>{activeFocusShipment.origin}</strong> → <strong>{activeFocusShipment.destination}</strong></div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Waybill: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{activeFocusShipment.waybillNumber}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.35rem' }}>
              <span style={{ color: '#2563eb', fontWeight: '700' }}>
                ⚡ Speed: {activeFocusShipment.telemetry?.speed || 62} km/h
              </span>
              <span style={{ color: '#d97706', fontWeight: '700' }}>
                ETA: {activeFocusShipment.estimatedDelivery}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
