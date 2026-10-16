import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  Receipt,
  Download,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { INITIAL_CUSTOMER_PAYMENTS } from '../../data/mockData';

export const CustomerPaymentsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments] = useState(INITIAL_CUSTOMER_PAYMENTS);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = 0;
  const outstandingAmount = 0;

  const filteredPayments = payments.filter(p =>
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: 'var(--brand-primary)' }} /> Payments & Settlement Ledger
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Complete audit trail of B2B corporate payments, RTGS/NEFT transfers, and digital settlements
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search txn ID, order # or method..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid-3">
        {/* Total Paid */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Paid</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--semantic-success)', marginTop: '4px' }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>✓ 100% Settled with zero overdue</div>
        </div>

        {/* Pending Amount */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Pending Amount</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{pendingAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Next corporate billing cycle on 01 Nov 2026</div>
        </div>

        {/* Outstanding Amount */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Credit Standing</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--brand-primary)', marginTop: '4px' }}>
            Rating A+
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Outstanding: ₹0.00 • Clean credit record</div>
        </div>
      </div>

      {/* 3. Payment History Table */}
      <div className="card" style={{ padding: '16px 20px', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Amount (₹)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id}>
                <td>
                  <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{p.id}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bank Ref: REF-{p.id.slice(-4)}881</div>
                </td>

                <td>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{p.orderId}</span>
                </td>

                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {p.date}
                </td>

                <td>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.method}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified Gateway Transfer</div>
                </td>

                <td>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    ₹{p.amount.toLocaleString('en-IN')}
                  </div>
                </td>

                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-success">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
