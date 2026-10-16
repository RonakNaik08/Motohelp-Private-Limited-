import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Users,
  Plus,
  Building,
  CreditCard,
  Search,
  Phone,
  Mail,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const CustomerManagement = ({ onOpenCreateSO }) => {
  const { customers, salesOrders, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstandingDue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Customer Directory & Fleet Accounts</h2>
            <span className="badge badge-green">{customers.length} B2B Accounts</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Servicing: <strong>{selectedBranch.name}</strong> • Fleet Chains, Workshop Networks, Credit Exposures & Outstanding Dues
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenCreateSO && onOpenCreateSO()}>
            <TrendingUp size={15} />
            Book Sales Order
          </button>
        </div>
      </div>

      {/* Financial Receivables KPI Strip */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Active Fleet Partners</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              {customers.length} Enterprise Clients
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Outstanding AR Dues</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
              ₹{(totalOutstanding / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Receipt size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Average DSO Collection</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
              24.5 Days (Healthy)
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Customer name, Fleet Type, City, GSTIN..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid-2">
        {filteredCustomers.map(c => {
          const soCount = salesOrders.filter(s => s.customerId === c.id).length;

          return (
            <div
              key={c.id}
              className="glass-card"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="code-tag">{c.code}</span>
                    <span className="badge badge-green">{c.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '0.35rem' }}>
                    {c.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.type} • {c.city}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: c.outstandingDue > 0 ? '#f59e0b' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                    ₹{(c.outstandingDue / 100000).toFixed(2)}L
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Due Outstanding</div>
                </div>
              </div>

              {/* Commercials Strip */}
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
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Credit Limit</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{(c.creditLimit / 100000).toFixed(1)}L</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Credit Terms</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{c.paymentTerms}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Orders Placed</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-green)' }}>{soCount} Orders</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Contact: <strong>{c.contactPerson}</strong> ({c.phone})
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                  onClick={() => onOpenCreateSO && onOpenCreateSO()}
                >
                  + New Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
