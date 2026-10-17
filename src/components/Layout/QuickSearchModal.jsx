import React, { useState, useEffect } from 'react';
import { useSCM } from '../../context/SCMContext';
import { Search, X, Package, ShoppingCart, Truck, Building, Users, ArrowRight } from 'lucide-react';

export const QuickSearchModal = ({ isOpen, onClose }) => {
  const { products, purchaseOrders, salesOrders, shipments, suppliers, customers, setActiveModule, isAdmin } = useSCM();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggles
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtered results
  const matchedProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))).slice(0, 3) : [];
  const matchedSOs = q ? salesOrders.filter(s => s.soNumber.toLowerCase().includes(q) || (s.customerName && s.customerName.toLowerCase().includes(q))).slice(0, 3) : [];
  const matchedShipments = q ? shipments.filter(s => (s.waybillNumber && s.waybillNumber.toLowerCase().includes(q)) || (s.trackingNumber && s.trackingNumber.toLowerCase().includes(q)) || (s.carrier && s.carrier.toLowerCase().includes(q))).slice(0, 3) : [];
  // Admin-only search results
  const matchedPOs = (isAdmin && q) ? purchaseOrders.filter(p => p.poNumber.toLowerCase().includes(q) || (p.vendorName && p.vendorName.toLowerCase().includes(q))).slice(0, 3) : [];
  const matchedSuppliers = (isAdmin && q) ? suppliers.filter(s => s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q))).slice(0, 2) : [];
  const matchedCustomers = (isAdmin && q) ? customers.filter(c => c.name.toLowerCase().includes(q) || (c.city && c.city.toLowerCase().includes(q))).slice(0, 2) : [];

  const totalMatches = matchedProducts.length + matchedPOs.length + matchedSOs.length + matchedShipments.length + matchedSuppliers.length + matchedCustomers.length;

  const handleSelect = (module) => {
    if (!isAdmin) {
      if (module === 'inventory' || module === 'products') {
        setActiveModule('customer_products');
      } else if (module === 'procurement' || module === 'sales') {
        setActiveModule('customer_orders');
      } else if (module === 'logistics') {
        setActiveModule('customer_track');
      } else {
        setActiveModule(`customer_${module}`);
      }
    } else {
      setActiveModule(module);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)'
        }}>
          <Search size={20} style={{ color: 'var(--accent-amber)' }} />
          <input
            type="text"
            placeholder="Search SKUs, Purchase Orders, Shipments, Vendors, Customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-main)'
            }}
          />
          <button className="btn-icon" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Search Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {!query ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Type a keyword to instantly query Motohelp SCM records</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Brake', 'Oil', 'Bosch', 'Castrol', 'PO-2026', 'Delhivery'].map(tag => (
                  <span
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="code-tag"
                    style={{ cursor: 'pointer', padding: '0.2rem 0.5rem' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No records found matching "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Matched Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Products & SKUs
                  </div>
                  {matchedProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelect('inventory')}
                      className="glass-card"
                      style={{ padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.3rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Package size={16} style={{ color: 'var(--accent-amber)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{p.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {p.sku} • Stock: {p.currentStock} {p.uom}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Matched POs */}
              {matchedPOs.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Purchase Orders
                  </div>
                  {matchedPOs.map(po => (
                    <div
                      key={po.id}
                      onClick={() => handleSelect('procurement')}
                      className="glass-card"
                      style={{ padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.3rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShoppingCart size={16} style={{ color: 'var(--accent-blue)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{po.poNumber} — {po.vendorName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Value: ₹{po.grandTotal.toLocaleString('en-IN')} • Status: {po.status}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Shipments */}
              {matchedShipments.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Shipments & Logistics
                  </div>
                  {matchedShipments.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleSelect('logistics')}
                      className="glass-card"
                      style={{ padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.3rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Truck size={16} style={{ color: 'var(--accent-green)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>Waybill {s.waybillNumber} ({s.carrier})</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Destination: {s.destination} • Status: {s.status}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
