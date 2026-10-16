import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Key,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Lock,
  Edit2
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const CustomerProfileView = () => {
  const { currentUser } = useSCM();
  const [activeSubTab, setActiveSubTab] = useState('personal'); // 'personal' | 'addresses' | 'payments' | 'notifications' | 'security'
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: currentUser?.name || 'Ronak',
    email: currentUser?.email || 'ronak@enterprise.com',
    phone: '+91 98201 44520',
    companyName: 'Metro Fleet Mobility Solutions Pvt Ltd',
    gstin: '27AABCM8821Q1ZB',
    pan: 'AABCM8821Q',
    designation: 'Fleet Operations Director'
  });

  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'ADDR-01',
      title: 'Primary Fleet Depot (MIDC Workshop)',
      address: 'Metro Fleet Workshop, Plot 44, MIDC Andheri East, Mumbai, Maharashtra - 400069',
      isDefault: true
    },
    {
      id: 'ADDR-02',
      title: 'Corporate Regional Office',
      address: 'Suite 804, Neptune Business Hub, LBS Marg, Bhandup West, Mumbai - 400078',
      isDefault: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    whatsappUpdates: true,
    smsAlerts: true,
    emailInvoices: true,
    dispatchPings: true,
    promoOffers: false
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Profile Header Card */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid var(--brand-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--brand-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              flexShrink: 0
            }}
          >
            {profile.fullName.charAt(0)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {profile.fullName}
              </h2>
              <span className="badge badge-success">
                ✓ Enterprise Verified
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {profile.designation} • <strong>{profile.companyName}</strong>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              GSTIN: <strong style={{ color: 'var(--text-secondary)' }}>{profile.gstin}</strong> • PAN: <strong style={{ color: 'var(--text-secondary)' }}>{profile.pan}</strong>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div style={{ background: 'var(--semantic-success-bg)', color: 'var(--semantic-success)', border: '1px solid var(--semantic-success-border)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} /> Changes Saved Successfully
          </div>
        )}
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div
        className="card"
        style={{
          padding: '4px',
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap'
        }}
      >
        {[
          { key: 'personal', label: 'Organization & Profile', icon: User },
          { key: 'addresses', label: 'Delivery Hubs & Addresses', icon: MapPin },
          { key: 'payments', label: 'Payment Terms & Ledgers', icon: CreditCard },
          { key: 'notifications', label: 'Dispatch Alerts & Preferences', icon: Bell },
          { key: 'security', label: 'Security & Access Keys', icon: Shield }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isTab = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: isTab ? 'var(--brand-primary)' : 'transparent',
                color: isTab ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isTab ? '600' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition)'
              }}
            >
              <IconComp size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content Views */}

      {/* SECTION A: Personal Information */}
      {activeSubTab === 'personal' && (
        <form
          onSubmit={handleSaveProfile}
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Organization & Authorized Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Authorized Officer Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Corporate Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Legal Entity Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN (Verified Tax Identifier)</label>
              <input
                type="text"
                className="form-input"
                value={profile.gstin}
                onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Officer Designation</label>
              <input
                type="text"
                className="form-input"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={14} /> Save Profile Settings
            </button>
          </div>
        </form>
      )}

      {/* SECTION B: Saved Addresses */}
      {activeSubTab === 'addresses' && (
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Registered Receiving Hubs & Warehouses
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
            >
              <Plus size={13} /> Add New Location
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-card)',
                  border: addr.isDefault ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {addr.title}
                    </span>
                    {addr.isDefault && (
                      <span className="badge badge-info" style={{ fontSize: '11px' }}>
                        Default Hub
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                    {addr.address}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '12px' }}>
                    Edit Details
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ color: 'var(--semantic-danger)', fontSize: '12px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: Payment Methods */}
      {activeSubTab === 'payments' && (
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Configured Payment Methods & Credit Accounts
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
            >
              <Plus size={13} /> Add Payment Method
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>HDFC Corporate Fleet Card</span>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>Active</span>
              </div>
              <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--brand-primary)', margin: '8px 0' }}>
                •••• •••• •••• 8819
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expires: 08/29 • Holder: Ronak</div>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Corporate NetBanking Credit</span>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>Active</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '8px 0', fontFamily: 'var(--font-mono)' }}>
                A/C: 9810-XXXX-4421 (RTGS / NEFT)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Credit Facility: ₹10,00,000 (Net 30 Terms)</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: Notification Preferences */}
      {activeSubTab === 'notifications' && (
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Real-Time Alert & Dispatch Telemetry Notifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { key: 'whatsappUpdates', title: 'WhatsApp Live Dispatch Pings', desc: 'Receive truck dispatch alerts, checkpoint crossing pings & gate OTP on registered WhatsApp.' },
              { key: 'smsAlerts', title: 'SMS Handover Verification', desc: 'Receive security OTP via SMS when consignment reaches destination receiving bay.' },
              { key: 'emailInvoices', title: 'Automatic GST Invoice PDF Dispatch', desc: 'Email signed B2B tax invoice and delivery challan upon order approval.' },
              { key: 'dispatchPings', title: 'Corridor Delay Warnings', desc: 'Instant alerts if freight encounters toll plaza or highway hold-ups.' }
            ].map((pref) => (
              <label
                key={pref.key}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{pref.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{pref.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings[pref.key]}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [pref.key]: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* SECTION E: Security */}
      {activeSubTab === 'security' && (
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Account Security & Multi-Factor Access
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Secured with SMS OTP for purchase order authorisations</div>
              </div>
              <span className="badge badge-success">Enabled</span>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Account Password</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last changed 45 days ago</div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
