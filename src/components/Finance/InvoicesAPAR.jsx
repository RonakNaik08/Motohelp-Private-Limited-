import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Building,
  Users,
  FileCheck,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ThreeWayMatchingModal } from './ThreeWayMatchingModal';
import { GSTTaxInvoiceModal } from './GSTTaxInvoiceModal';

export const InvoicesAPAR = () => {
  const { invoices, purchaseOrders, grns, recordInvoicePayment, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, AP, AR
  const [selectedInvoiceForMatch, setSelectedInvoiceForMatch] = useState(null);
  const [selectedGstInvoice, setSelectedGstInvoice] = useState(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          inv.vendorOrCustomer.toLowerCase().includes(search.toLowerCase()) ||
                          inv.poNumber.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === 'ALL' || inv.type === activeTab;

    return matchesSearch && matchesTab;
  });

  const totalAP = invoices.filter(i => i.type === 'AP').reduce((acc, i) => acc + i.amount, 0);
  const totalAR = invoices.filter(i => i.type === 'AR').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Invoicing & 3-Way Match Accounting (AP/AR)</h2>
            <span className="badge badge-purple">{invoices.length} Ledgers</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Financials: <strong>{selectedBranch.name}</strong> • Automated 3-Way Matching (PO ↔ GRN ↔ Invoice) & Receivable Tracking
          </p>
        </div>
      </div>

      {/* Financial KPI Strip */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Accounts Payable (Vendors)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f87171' }}>
              ₹{(totalAP / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Accounts Receivable (Fleets)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              ₹{(totalAR / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>3-Way Match Verification</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              100% Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Invoice number, Supplier / Customer, PO reference..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'ALL', label: 'All Invoices' },
            { id: 'AP', label: 'Accounts Payable (Vendor Bills)' },
            { id: 'AR', label: 'Accounts Receivable (Fleet Invoices)' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice Number & Type</th>
              <th>Vendor / Client Entity</th>
              <th>PO & GRN Reference</th>
              <th>Due Date</th>
              <th>Invoice Amount (₹)</th>
              <th>3-Way Match Status</th>
              <th>Settlement Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No Invoices found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map(inv => {
                const isPaid = inv.status.includes('Paid');

                return (
                  <tr key={inv.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                          {inv.invoiceNumber}
                        </div>
                        <span className={`badge ${inv.type === 'AP' ? 'badge-amber' : 'badge-green'}`} style={{ marginTop: '0.2rem', fontSize: '0.65rem' }}>
                          {inv.type === 'AP' ? 'AP (Vendor Pay)' : 'AR (Customer Bill)'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{inv.vendorOrCustomer}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem' }}>PO: <span className="code-tag">{inv.poNumber}</span></div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GRN: {inv.grnNumber}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{inv.dueDate}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: inv.type === 'AP' ? '#f87171' : '#34d399' }}>
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${inv.matchStatus.includes('Matched') || inv.matchStatus.includes('Delivered') ? 'badge-green' : 'badge-amber'}`}>
                        {inv.matchStatus}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${isPaid ? 'badge-green' : 'badge-red'}`}>
                        {inv.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Generate & View GST Tax Invoice"
                          onClick={() => setSelectedGstInvoice(inv)}
                        >
                          <FileText size={14} style={{ color: 'var(--accent-blue)' }} />
                          GST Bill
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          title="Verify 3-Way Match"
                          onClick={() => setSelectedInvoiceForMatch(inv)}
                        >
                          <FileCheck size={14} style={{ color: 'var(--accent-purple)' }} />
                          Audit
                        </button>

                        {!isPaid && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Settle Payment"
                            onClick={() => recordInvoicePayment(inv.id)}
                          >
                            <CreditCard size={14} />
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3-Way Matching Modal */}
      {selectedInvoiceForMatch && (
        <ThreeWayMatchingModal
          invoice={selectedInvoiceForMatch}
          purchaseOrders={purchaseOrders}
          grns={grns}
          onClose={() => setSelectedInvoiceForMatch(null)}
          onApprovePayment={(id) => recordInvoicePayment(id)}
        />
      )}

      {/* GST Tax Invoice & E-Way Bill Modal */}
      {selectedGstInvoice && (
        <GSTTaxInvoiceModal
          isOpen={Boolean(selectedGstInvoice)}
          onClose={() => setSelectedGstInvoice(null)}
          invoiceData={selectedGstInvoice}
        />
      )}
    </div>
  );
};
