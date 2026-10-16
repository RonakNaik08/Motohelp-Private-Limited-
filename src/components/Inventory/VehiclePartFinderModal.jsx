import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Car,
  Search,
  CheckCircle2,
  X,
  Plus,
  Package,
  SlidersHorizontal,
  ChevronRight,
  Info,
  MapPin,
  ShoppingCart,
  ShieldCheck
} from 'lucide-react';

const VEHICLE_DATABASE = [
  { make: 'Maruti Suzuki', model: 'Swift / Dzire (3rd & 4th Gen)', years: '2018 - 2026', engines: ['1.2L K12N DualJet Petrol', '1.2L S-CNG', '1.3L DDiS Diesel'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-FIL-OIL08', 'MH-SPK-IRIDIUM', 'MH-WPR-HYBRID'] },
  { make: 'Maruti Suzuki', model: 'Brezza / Grand Vitara', years: '2020 - 2026', engines: ['1.5L K15C Smart Hybrid Petrol', '1.5L Strong Hybrid'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-FIL-OIL08', 'MH-ALT-12V', 'MH-WPR-HYBRID'] },
  { make: 'Hyundai', model: 'Creta (1st & 2nd Gen) / Alcazar', years: '2019 - 2026', engines: ['1.5L U2 CRDi Diesel', '1.5L MPi Petrol', '1.4L / 1.5L Turbo GDi'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-FIL-OIL08', 'MH-RAD-COOLANT'] },
  { make: 'Hyundai', model: 'Venue / i20 N-Line', years: '2019 - 2026', engines: ['1.0L Turbo GDi', '1.2L Kappa Petrol', '1.5L CRDi Diesel'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-FIL-OIL08', 'MH-SPK-IRIDIUM'] },
  { make: 'Tata Motors', model: 'Nexon / Punch', years: '2018 - 2026', engines: ['1.2L Revotron Turbo Petrol', '1.5L Revotorq Diesel'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-FIL-OIL08', 'MH-CLT-PLATE', 'MH-WPR-HYBRID'] },
  { make: 'Tata Motors', model: 'Harrier / Safari (Kyros 2.0L)', years: '2019 - 2026', engines: ['2.0L Kryotec Turbocharged Diesel'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-ALT-12V', 'MH-RAD-COOLANT'] },
  { make: 'Mahindra', model: 'Thar / Scorpio-N / Scorpio Classic', years: '2020 - 2026', engines: ['2.2L mHawk CRDe Diesel', '2.0L mStallion Turbo Petrol'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-ALT-12V', 'MH-CLT-PLATE'] },
  { make: 'Mahindra', model: 'XUV700 / XUV300', years: '2021 - 2026', engines: ['2.2L mHawk Diesel (185PS)', '2.0L mStallion Turbo Petrol (200PS)'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-ALT-12V'] },
  { make: 'Toyota', model: 'Innova Crysta / Innova HyCross', years: '2016 - 2026', engines: ['2.4L 2GD-FTV Diesel', '2.0L Dynamic Force Hybrid Petrol'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-ALT-12V', 'MH-FIL-OIL08', 'MH-RAD-COOLANT'] },
  { make: 'Toyota', model: 'Fortuner / Hilux', years: '2017 - 2026', engines: ['2.8L 1GD-FTV Turbo Diesel', '2.7L 2TR-FE Petrol'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-INJ-CRDI', 'MH-ALT-12V', 'MH-CLT-PLATE'] },
  { make: 'Honda', model: 'City (5th Gen) / Elevate', years: '2020 - 2026', engines: ['1.5L i-VTEC DOHC Petrol', '1.5L e:HEV Strong Hybrid'], compatibleSKUs: ['MH-BRK-001', 'MH-OIL-5W40', 'MH-FIL-OIL08', 'MH-SPK-IRIDIUM', 'MH-WPR-HYBRID'] }
];

export const VehiclePartFinderModal = ({ isOpen, onClose }) => {
  const { products, selectedBranch } = useSCM();

  const [selectedMake, setSelectedMake] = useState('All');
  const [searchModel, setSearchModel] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_DATABASE[0]);

  if (!isOpen) return null;

  const makes = ['All', ...new Set(VEHICLE_DATABASE.map(v => v.make))];

  const filteredVehicles = VEHICLE_DATABASE.filter(v => {
    const matchesMake = selectedMake === 'All' || v.make === selectedMake;
    const matchesSearch = v.model.toLowerCase().includes(searchModel.toLowerCase()) ||
                          v.make.toLowerCase().includes(searchModel.toLowerCase());
    return matchesMake && matchesSearch;
  });

  // Compatible Products in Inventory
  const matchingProducts = products.filter(p => selectedVehicle?.compatibleSKUs.includes(p.sku) || selectedVehicle?.compatibleSKUs.includes(p.id));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '950px',
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
              background: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Automotive Fitment & Vehicle Compatibility Finder
                </h3>
                <span className="badge badge-blue">OEM Fitment DB</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select Vehicle Make, Model & Engine to pull 100% verified compatible parts and live inventory in <strong>{selectedBranch.name}</strong>
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search Swift, Creta, Thar, Innova, Nexon..."
              value={searchModel}
              onChange={(e) => setSearchModel(e.target.value)}
              style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {makes.map(m => (
              <button
                key={m}
                className={`btn btn-sm ${selectedMake === m ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedMake(m)}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split View: Vehicle List + Compatible Parts */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', flex: 1, minHeight: '340px', overflow: 'hidden' }}>
          {/* Left Column: Vehicle Selector */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.75rem', overflowY: 'auto', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.2rem 0.4rem' }}>
              Select Vehicle ({filteredVehicles.length} Matches)
            </div>
            {filteredVehicles.map((veh, idx) => {
              const isSelected = selectedVehicle?.model === veh.model;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedVehicle(veh)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.84rem', color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                      {veh.make} {veh.model}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{veh.years}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Engines: {veh.engines.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Compatible Verified Parts */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {selectedVehicle && (
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--accent-blue)' }}>
                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.years})
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Engine Specs: {selectedVehicle.engines.join(' • ')}
                  </div>
                </div>
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} /> 100% OEM Verified
                </span>
              </div>
            )}

            <div style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.6rem' }}>
              Compatible In-Stock SKUs ({matchingProducts.length} Available in Catalog)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
              {matchingProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No compatible parts currently mapped in inventory for this model.
                </div>
              ) : (
                matchingProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="glass-card"
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: 'var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{prod.name}</span>
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{prod.sku}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Category: {prod.category} • HSN: {prod.hsn} • Bin: <strong>{prod.binLocation}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          ₹{prod.sellingPrice?.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: prod.currentStock > prod.reorderPoint ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '700' }}>
                          {prod.currentStock} Units in Stock
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                        onClick={() => {
                          alert(`Added SKU ${prod.sku} (${prod.name}) to active quote cart!`);
                        }}
                      >
                        <ShoppingCart size={13} /> Add to Quote
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Close Fitment Finder
          </button>
        </div>
      </div>
    </div>
  );
};
