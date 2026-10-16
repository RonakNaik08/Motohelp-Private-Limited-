import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { GSTTaxInvoiceModal } from '../Finance/GSTTaxInvoiceModal';

export const CustomerInvoicesView = () => {
  const { salesOrders } = useSCM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceSO, setSelectedInvoiceSO] = useState(null);

  // Generate Customer B2B Invoices list from sales orders
  const invoicesList = salesOrders.map((so, idx) => ({
    id: `INV-2026-09${80 - idx}`,
    orderId: so.soNumber || `ORD-104${82 - idx}`,
    invoiceDate: so.orderDate || '07 Oct 2026',
    amount: so.grandTotal || so.totalAmount || (12450 + idx * 3200),
    status: idx === 2 ? 'Pending' : idx === 4 ? 'Overdue' : 'Paid',
    salesOrder: so
  }));

  const filteredInvoices = invoicesList.filter(inv =>
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInvoiced = invoicesList.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoicesList.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoicesList.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Search */}
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
            <FileText size={18} style={{ color: 'var(--brand-primary)' }} /> GST Tax Invoices & B2B Billing
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Download compliant Indian GST tax invoices (HSN breakdown, CGST, SGST & IGST)
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search invoice or PO #..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid-3">
        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Invoiced</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>All B2B tax billings</div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Settled / Paid Amount</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--semantic-success)', marginTop: '4px' }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Cleared via NEFT / UPI</div>
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Outstanding Balance</span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: totalPending > 0 ? 'var(--semantic-warning)' : 'var(--text-primary)', marginTop: '4px' }}>
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Credit terms: Net 30 days</div>
        </div>
      </div>

      {/* 3. Invoices Table */}
      <div className="card" style={{ padding: '16px 20px', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Order ID</th>
              <th>Invoice Date</th>
              <th>Amount (₹)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              let statusClass = 'badge-success';
              if (inv.status === 'Pending') statusClass = 'badge-warning';
              if (inv.status === 'Overdue') statusClass = 'badge-danger';

              return (
                <tr key={inv.id}>
                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{inv.id}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GSTIN: 27AABCM8821Q1ZB</div>
                  </td>

                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{inv.orderId}</span>
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {inv.invoiceDate}
                  </td>

                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Incl. 18% GST</div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${statusClass}`}>
                      {inv.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedInvoiceSO(inv.salesOrder)}
                      >
                        <Eye size={12} /> View
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedInvoiceSO(inv.salesOrder)}
                      >
                        <Download size={12} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* GST Tax Invoice Viewer Modal */}
      {selectedInvoiceSO && (
        <GSTTaxInvoiceModal
          salesOrder={selectedInvoiceSO}
          onClose={() => setSelectedInvoiceSO(null)}
        />
      )}
    </div>
  );
};
