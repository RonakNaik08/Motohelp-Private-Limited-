import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Package,
  Plus,
  QrCode,
  SlidersHorizontal,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShoppingCart,
  Layers,
  ArrowUpDown,
  UploadCloud,
  Car,
  Scan,
  Calendar,
  Download,
  Zap
} from 'lucide-react';
import { BarcodeModal } from './BarcodeModal';
import { AddProductModal } from './AddProductModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { CSVDataImporterModal } from '../Common/CSVDataImporterModal';
import { VehiclePartFinderModal } from './VehiclePartFinderModal';
import { BarcodeScannerModal } from '../Warehouse/BarcodeScannerModal';
import { BatchExpiryTrackerModal } from '../Warehouse/BatchExpiryTrackerModal';
import { exportToCSV } from '../../utils/exportUtils';

export const ItemMaster = ({ onOpenCreatePO }) => {
  const { products, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [barcodeProduct, setBarcodeProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showFitmentModal, setShowFitmentModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  const categories = ['All', 'Warehouse & Scanning', 'Safety & PPE Gear', 'Packaging & Labelling', 'Engine & Powertrain', 'Braking & Suspension', 'Electricals & Sensors', 'Lubricants & Fluids'];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.hsn && p.hsn.includes(search)) ||
                          (p.binLocation && p.binLocation.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'Low Stock') matchesStatus = p.currentStock <= p.reorderPoint;
    if (selectedStatus === 'Fast Moving') matchesStatus = p.fsnCategory === 'F';
    if (selectedStatus === 'Slow Moving') matchesStatus = p.fsnCategory === 'S';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalSKUs = products.length;
  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Stats */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Inventory Item Master Catalog</h2>
            <span className="badge badge-info">{totalSKUs} Master SKUs</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Facility: <strong>{selectedBranch.name}</strong> • Bin Locations, Dynamic Safety Stock & Barcode Label Intelligence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowExpiryModal(true)}>
            <Calendar size={13} />
            LOT & FEFO Expiry
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowScannerModal(true)}>
            <Scan size={13} />
            Barcode Terminal
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCsvModal(true)}>
            <UploadCloud size={13} />
            Import CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(filteredProducts.map(p => ({ sku: p.sku, name: p.name, category: p.category, currentStock: p.currentStock, reorderPoint: p.reorderPoint, costPrice: p.costPrice, sellingPrice: p.sellingPrice, binLocation: p.binLocation })), 'inventory-export')}>
            <Download size={13} />
            Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenCreatePO && onOpenCreatePO()} title="Auto-create PO for all low stock items">
            <Zap size={13} style={{ color: 'var(--accent-amber)' }} />
            Auto-Reorder ({lowStockCount})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenCreatePO && onOpenCreatePO()}>
            <ShoppingCart size={13} />
            Raise Bulk PO
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            Add SKU
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid-3">
        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Inventory Valuation</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{(totalValue / 100000).toFixed(2)} Lakhs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Based on weighted average unit cost</div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Low Stock Watchlist</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: lowStockCount > 0 ? 'var(--semantic-warning)' : 'var(--text-primary)', marginTop: '4px' }}>
            {lowStockCount} SKUs Critical
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Stock breached safety threshold</div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Stock Health Ratio</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--semantic-success)', marginTop: '4px' }}>
            {(((totalSKUs - lowStockCount) / totalSKUs) * 100).toFixed(0)}% Optimal
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Safety buffer maintained across bins</div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by SKU, Part Name, HSN code or Bin..."
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <select
            className="form-input"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ width: '220px' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Low Stock', 'Fast Moving', 'Slow Moving'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ padding: '16px 20px', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU / Part Information</th>
              <th>Category & HSN</th>
              <th>Bin Location</th>
              <th>Pricing (Cost / MRP)</th>
              <th>Current Stock / Threshold</th>
              <th>Velocity (FSN)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No catalog items match the applied search criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const isLow = p.currentStock <= p.reorderPoint;
                const stockPercent = Math.min(100, Math.round((p.currentStock / (p.maxStock || 100)) * 100));

                return (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>
                          {p.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span className="code-tag">{p.sku}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vendor: {p.primarySupplier}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{p.category}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HSN: {p.hsn || '87083000'} • {p.gstRate || 18}% GST</div>
                    </td>

                    <td>
                      <span className="code-tag">
                        {p.binLocation || 'A-01-02'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        Cost: ₹{p.costPrice.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        MRP: ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '700', color: isLow ? 'var(--semantic-danger)' : 'var(--text-primary)' }}>
                            {p.currentStock} {p.uom}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            Min: {p.reorderPoint}
                          </span>
                        </div>
                        <div style={{ width: '110px', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${stockPercent}%`,
                            height: '100%',
                            background: isLow ? 'var(--semantic-danger)' : 'var(--brand-primary)'
                          }} />
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span className={`badge ${p.fsnCategory === 'F' ? 'badge-success' : 'badge-neutral'}`}>
                          {p.fsnCategory === 'F' ? 'Fast Moving' : 'Standard'}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn-icon"
                          title="Print Barcode Label"
                          onClick={() => setBarcodeProduct(p)}
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Stock Adjustment / Audit"
                          onClick={() => setAdjustProduct(p)}
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barcode Modal */}
      {barcodeProduct && (
        <BarcodeModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />
      )}

      {/* Add SKU Modal */}
      {showAddModal && (
        <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <StockAdjustmentModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />
      )}

      {/* CSV Importer Modal */}
      {showCsvModal && (
        <CSVDataImporterModal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} />
      )}

      {/* Vehicle Fitment Modal */}
      {showFitmentModal && (
        <VehiclePartFinderModal isOpen={showFitmentModal} onClose={() => setShowFitmentModal(false)} />
      )}

      {/* Barcode Scanner Modal */}
      {showScannerModal && (
        <BarcodeScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} />
      )}

      {/* Batch Expiry Modal */}
      {showExpiryModal && (
        <BatchExpiryTrackerModal isOpen={showExpiryModal} onClose={() => setShowExpiryModal(false)} />
      )}
    </div>
  );
};
