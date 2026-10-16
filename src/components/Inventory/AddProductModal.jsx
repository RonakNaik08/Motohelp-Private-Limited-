import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { X, Plus, Package, Check } from 'lucide-react';

export const AddProductModal = ({ isOpen, onClose }) => {
  const { addProduct, suppliers } = useSCM();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Engine & Powertrain',
    uom: 'Pcs',
    hsn: '87082900',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    safetyStock: 30,
    reorderPoint: 50,
    maxStock: 250,
    binLocation: 'A-01-01',
    primarySupplier: suppliers[0]?.name || 'Bosch Auto Systems',
    abcCategory: 'A',
    fsnCategory: 'F',
    gstRate: 18,
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.costPrice || !formData.sellingPrice) {
      alert('Please fill out the product name and pricing details.');
      return;
    }
    addProduct(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Add New Automotive SKU</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MOTOHELP Master Catalog Registry</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Part / Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dual-Mass Flywheel Assembly"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">SKU Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MH-FLW-009"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Engine & Powertrain">Engine & Powertrain</option>
                  <option value="Braking & Suspension">Braking & Suspension</option>
                  <option value="Electricals & Sensors">Electricals & Sensors</option>
                  <option value="Lubricants & Fluids">Lubricants & Fluids</option>
                  <option value="Body & Consumables">Body & Consumables</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Cost Price (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="2400"
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="3600"
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="50"
                  value={formData.currentStock}
                  onChange={e => setFormData({ ...formData, currentStock: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.reorderPoint}
                  onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Bin</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="A-02-04"
                  value={formData.binLocation}
                  onChange={e => setFormData({ ...formData, binLocation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">UOM</label>
                <select
                  className="form-select"
                  value={formData.uom}
                  onChange={e => setFormData({ ...formData, uom: e.target.value })}
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Sets">Sets</option>
                  <option value="Cans">Cans</option>
                  <option value="Packs">Packs</option>
                  <option value="Pairs">Pairs</option>
                  <option value="Liters">Liters</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Primary OEM Supplier</label>
                <select
                  className="form-select"
                  value={formData.primarySupplier}
                  onChange={e => setFormData({ ...formData, primarySupplier: e.target.value })}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Bracket (%)</label>
                <select
                  className="form-select"
                  value={formData.gstRate}
                  onChange={e => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                >
                  <option value={18}>18% (Standard Auto Components)</option>
                  <option value={28}>28% (Batteries & High-Value Assemblies)</option>
                  <option value={12}>12% (Consumables)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              Register SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
