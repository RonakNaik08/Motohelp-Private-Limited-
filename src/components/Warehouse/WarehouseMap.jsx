import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Boxes,
  Truck,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Scan,
  Calendar
} from 'lucide-react';
import { BinDetailsModal } from './BinDetailsModal';
import { StockTransferModal } from './StockTransferModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { BatchExpiryTrackerModal } from './BatchExpiryTrackerModal';

export const WarehouseMap = () => {
  const { products, selectedBranch } = useSCM();

  const [selectedBin, setSelectedBin] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [activeZoneFilter, setActiveZoneFilter] = useState('ALL');

  // Interactive 2D Warehouse layout bins definition
  const warehouseBins = [
    // Zone A: Engine & Powertrain (Fast Moving)
    { code: 'A-01-01', zone: 'Zone A - Powertrain & Fast Moving', type: 'High Density Rack', occupancy: 72, maxWeightKg: 1500, skuCount: 3 },
    { code: 'A-01-02', zone: 'Zone A - Powertrain & Fast Moving', type: 'High Density Rack', occupancy: 88, maxWeightKg: 1500, skuCount: 2 },
    { code: 'A-01-03', zone: 'Zone A - Powertrain & Fast Moving', type: 'High Density Rack', occupancy: 65, maxWeightKg: 1500, skuCount: 1 },
    { code: 'A-02-01', zone: 'Zone A - Powertrain & Fast Moving', type: 'Precision Bin', occupancy: 45, maxWeightKg: 800, skuCount: 2 },
    { code: 'A-02-04', zone: 'Zone A - Powertrain & Fast Moving', type: 'Precision Bin', occupancy: 92, maxWeightKg: 800, skuCount: 4 },
    { code: 'A-03-01', zone: 'Zone A - Powertrain & Fast Moving', type: 'Small Parts Shelf', occupancy: 58, maxWeightKg: 500, skuCount: 6 },
    { code: 'A-03-04', zone: 'Zone A - Powertrain & Fast Moving', type: 'Small Parts Shelf', occupancy: 80, maxWeightKg: 500, skuCount: 3 },

    // Zone B: Braking & Heavy Suspension
    { code: 'B-01-01', zone: 'Zone B - Heavy Braking & Battery Systems', type: 'Heavy Duty Floor Pallet', occupancy: 78, maxWeightKg: 3000, skuCount: 2 },
    { code: 'B-02-04', zone: 'Zone B - Heavy Braking & Battery Systems', type: 'Cantilever Rack', occupancy: 60, maxWeightKg: 2000, skuCount: 2 },
    { code: 'B-03-02', zone: 'Zone B - Heavy Braking & Battery Systems', type: 'Medium Rack', occupancy: 28, maxWeightKg: 1200, skuCount: 1 },

    // Zone C: Lubricants & Fluids (Hazmat)
    { code: 'C-01-01', zone: 'Zone C - Lubricants & Chemical Storage', type: 'Spill-Contained Pallet', occupancy: 85, maxWeightKg: 2500, skuCount: 1 },
    { code: 'C-02-01', zone: 'Zone C - Lubricants & Chemical Storage', type: 'Spill-Contained Pallet', occupancy: 52, maxWeightKg: 2500, skuCount: 2 },

    // Zone D: Staging & Dispatch Docks
    { code: 'D-01-01', zone: 'Zone D - Inward Staging & Dispatch Bay', type: 'Loading Bay Buffer', occupancy: 35, maxWeightKg: 4000, skuCount: 3 },
    { code: 'D-02-03', zone: 'Zone D - Inward Staging & Dispatch Bay', type: 'Staging Rack', occupancy: 42, maxWeightKg: 1500, skuCount: 2 }
  ];

  const filteredBins = activeZoneFilter === 'ALL'
    ? warehouseBins
    : warehouseBins.filter(b => b.code.startsWith(activeZoneFilter));

  const getOccupancyColor = (occ) => {
    if (occ >= 85) return '#ef4444'; // Red full
    if (occ >= 60) return '#f59e0b'; // Amber
    return '#10b981'; // Green optimal
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>2D Visual Warehouse & Bin Layout</h2>
            <span className="badge badge-purple">{selectedBranch.name}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Interactive Spatial Mapping • Capacity Heatmaps, SKU Binning & Transfer Management
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowExpiryModal(true)} style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
            <Calendar size={15} />
            LOT & FEFO Expiry
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowScannerModal(true)} style={{ borderColor: '#a78bfa', color: '#a78bfa' }}>
            <Scan size={15} />
            Scanner Terminal
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTransferModal(true)}>
            <Truck size={15} />
            Inter-Warehouse Transfer
          </button>
        </div>
      </div>

      {/* Zone Selector & Legend */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Warehouse Zones' },
            { id: 'A', label: 'Zone A (Engine & Fast Moving)' },
            { id: 'B', label: 'Zone B (Braking & Heavy Duty)' },
            { id: 'C', label: 'Zone C (Lubricants & Fluids)' },
            { id: 'D', label: 'Zone D (Staging & Dispatch)' }
          ].map(z => (
            <button
              key={z.id}
              className={`btn btn-sm ${activeZoneFilter === z.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveZoneFilter(z.id)}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
            <span>&lt; 60% (Optimal)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
            <span>60-84% (Moderate)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} />
            <span>≥ 85% (Near Full)</span>
          </div>
        </div>
      </div>

      {/* 2D Interactive Grid Visualization */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {filteredBins.map(bin => {
            const color = getOccupancyColor(bin.occupancy);
            const matchedProducts = products.filter(p => p.binLocation === bin.code || p.binLocation.startsWith(bin.code.slice(0, 4)));

            return (
              <div
                key={bin.code}
                onClick={() => setSelectedBin(bin)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  position: 'relative'
                }}
              >
                {/* Header of bin card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Boxes size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
                      {bin.code}
                    </span>
                  </div>
                  <span className="badge" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40`, fontSize: '0.65rem' }}>
                    {bin.occupancy}% Filled
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {bin.zone}
                </div>

                {/* Occupancy Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${bin.occupancy}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
                </div>

                {/* Stored Preview */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{matchedProducts.length > 0 ? `${matchedProducts.length} Active SKU(s)` : 'Empty Slot'}</span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>Inspect &gt;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bin Inspection Modal */}
      {selectedBin && (
        <BinDetailsModal
          bin={selectedBin}
          products={products}
          onClose={() => setSelectedBin(null)}
          onTransfer={() => setShowTransferModal(true)}
        />
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <StockTransferModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} />
      )}

      {/* Industrial Barcode Scanner Terminal Modal */}
      {showScannerModal && (
        <BarcodeScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} />
      )}

      {/* Batch / LOT Expiry Tracker & FEFO Modal */}
      {showExpiryModal && (
        <BatchExpiryTrackerModal isOpen={showExpiryModal} onClose={() => setShowExpiryModal(false)} />
      )}
    </div>
  );
};
