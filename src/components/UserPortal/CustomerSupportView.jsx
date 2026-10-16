import React, { useState } from 'react';
import {
  Headphones,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  CreditCard,
  Truck,
  Layers,
  HelpCircle,
  X,
  Send
} from 'lucide-react';
import { INITIAL_SUPPORT_TICKETS } from '../../data/mockData';

export const CustomerSupportView = () => {
  const [tickets, setTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: 'Delivery Issue',
    issue: '',
    description: '',
    orderId: 'ORD-10482',
    priority: 'Normal'
  });
  const [ticketCreatedSuccess, setTicketCreatedSuccess] = useState(false);

  const categories = [
    { key: 'Order Issue', icon: Package, desc: 'Damage, wrong SKU or quantity amendment' },
    { key: 'Payment Issue', icon: CreditCard, desc: 'GSTIN tax invoice reconciliation' },
    { key: 'Delivery Issue', icon: Truck, desc: 'Corridor GPS delay, Toll gate clearance' },
    { key: 'Product Issue', icon: Layers, desc: 'OEM fitment compatibility inquiry' },
    { key: 'Other', icon: HelpCircle, desc: 'General corporate procurement support' }
  ];

  const filteredTickets = tickets.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.issue.trim()) return;

    const created = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newTicket.category,
      issue: newTicket.issue,
      description: newTicket.description || 'Customer submitted support inquiry.',
      createdDate: '07 Oct 2026',
      status: 'In Progress',
      lastUpdated: 'Just now',
      orderId: newTicket.orderId,
      priority: newTicket.priority
    };

    setTickets([created, ...tickets]);
    setShowCreateModal(false);
    setTicketCreatedSuccess(true);
    setTimeout(() => setTicketCreatedSuccess(false), 3000);
    setNewTicket({ category: 'Delivery Issue', issue: '', description: '', orderId: 'ORD-10482', priority: 'Normal' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Action Bar */}
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
            <Headphones size={18} style={{ color: 'var(--brand-primary)' }} /> Customer Support & Corporate Helpdesk
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Dedicated B2B SLA support with rapid 15-minute response guarantee
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={14} /> Raise Support Ticket
        </button>
      </div>

      {ticketCreatedSuccess && (
        <div
          style={{
            background: 'var(--semantic-success-bg)',
            border: '1px solid var(--semantic-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-card)',
            color: 'var(--semantic-success)',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>Support Ticket successfully logged. An operations engineer will contact you shortly.</span>
        </div>
      )}

      {/* 2. Support Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <div
              key={cat.key}
              onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'All' : cat.key)}
              className="card"
              style={{
                padding: '12px 14px',
                background: isSelected ? 'var(--bg-tertiary)' : '#FFFFFF',
                borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: isSelected ? '#FFFFFF' : 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                  {cat.key}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.2' }}>
                  {cat.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Ticket Table */}
      <div className="card" style={{ padding: '16px 20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Ticket History ({filteredTickets.length})
          </h3>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue Summary</th>
              <th>Category & Order</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{t.id}</span>
                  <div>
                    <span className={`badge ${t.priority === 'High' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '10px', marginTop: '2px' }}>
                      {t.priority || 'Normal'} Priority
                    </span>
                  </div>
                </td>

                <td style={{ maxWidth: '300px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{t.issue}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.description}
                  </div>
                </td>

                <td>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{t.category}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PO: {t.orderId}</div>
                </td>

                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t.createdDate}
                </td>

                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : t.status === 'In Progress' ? 'badge-warning' : 'badge-info'}`}>
                    {t.status === 'Resolved' ? '✓ Resolved' : t.status === 'In Progress' ? '● In Progress' : '○ Open'}
                  </span>
                </td>

                <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Create Support Ticket Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(23, 43, 58, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-modal)',
              borderRadius: 'var(--radius-panel)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} style={{ color: 'var(--brand-primary)' }} /> Raise Support Ticket
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Issue Category</label>
                <select
                  className="form-input"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                >
                  <option value="Delivery Issue">Delivery Issue (GPS Tracking, Toll Delay)</option>
                  <option value="Order Issue">Order Issue (Cancellation, Quantity Amendment)</option>
                  <option value="Payment Issue">Payment Issue (Invoice, GSTIN, Receipt)</option>
                  <option value="Product Issue">Product Issue (OEM Fitment & Warranty)</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Related Order ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTicket.orderId}
                  onChange={(e) => setNewTicket({ ...newTicket, orderId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Consignment gate clearance required"
                  className="form-input"
                  value={newTicket.issue}
                  onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your issue with part numbers or freight details..."
                  className="form-input"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  <Send size={13} /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
