import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Building,
  Plus,
  Star,
  Award,
  Search,
  CheckCircle2,
  ShoppingCart,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { SupplierScorecardModal } from './SupplierScorecardModal';

export const SupplierManagement = ({ onOpenCreatePO }) => {
  const { suppliers, purchaseOrders, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>OEM Supplier & Vendor Management</h2>
            <span className="badge badge-amber">{suppliers.length} Approved Suppliers</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Contracted Hub: <strong>{selectedBranch.name}</strong> • Performance Ratings, Lead Time Compliance & OTIF Index
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenCreatePO && onOpenCreatePO()}>
            <ShoppingCart size={15} />
            Create Vendor PO
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Supplier name, category, GSTIN or city..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid-2">
        {filteredSuppliers.map(s => {
          const poCount = purchaseOrders.filter(p => p.vendorName === s.name).length;

          return (
            <div
              key={s.id}
              className="glass-card glass-card-interactive"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              onClick={() => setSelectedVendor(s)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="code-tag">{s.code}</span>
                    <span className="badge badge-green">{s.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '0.35rem' }}>
                    {s.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{s.category}</strong> • {s.city}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: '800', fontSize: '1rem' }}>
                    <Star size={16} fill="#fbbf24" />
                    <span>{s.rating}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Rating Score</div>
                </div>
              </div>

              {/* Metrics Strip */}
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>OTIF Score</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#34d399' }}>{s.otifScore}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Lead Time</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-blue)' }}>{s.leadTimeDays}d</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Payment Terms</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{s.paymentTerms}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Contact: <strong>{s.contactPerson}</strong> ({s.phone})
                </div>
                <button className="btn btn-outline btn-sm" style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}>
                  Scorecard &gt;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vendor Scorecard Modal */}
      {selectedVendor && (
        <SupplierScorecardModal
          supplier={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onOpenCreatePO={() => onOpenCreatePO && onOpenCreatePO()}
        />
      )}
    </div>
  );
};
