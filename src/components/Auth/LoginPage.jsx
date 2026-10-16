import React, { useState } from 'react';
import { SignIn } from '@clerk/react';
import { useSCM, SUPER_ADMIN_EMAIL } from '../../context/SCMContext';
import {
  Shield,
  User,
  Lock,
  Building2,
  ArrowRight,
  Package,
  ShoppingBag,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Fingerprint,
  Truck,
  Layers,
  FileText,
  KeyRound,
  ShoppingCart,
  Factory,
  Receipt
} from 'lucide-react';

export const LoginPage = () => {
  const { login, branches, theme, setTheme } = useSCM();

  const [authMethod, setAuthMethod] = useState('clerk'); // 'clerk' | 'demo'
  const [portalType, setPortalType] = useState('customer'); // 'customer' | 'admin'
  const [email, setEmail] = useState('ronak@fleetoperations.com');
  const [password, setPassword] = useState('customerPass2026');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || 'BR-001');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('789421');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Customer Personas (Strictly Customer B2B Accounts)
  const CUSTOMER_DEMO_ACCOUNTS = [
    {
      roleType: 'customer',
      label: 'Fleet Procurement Manager',
      name: 'Ronak',
      title: 'Head of Fleet Operations & Purchasing',
      email: 'ronak@fleetoperations.com',
      password: 'customerPass2026',
      badge: 'Verified B2B Client',
      accentColor: '#1E3A5F',
      icon: ShoppingBag
    },
    {
      roleType: 'customer',
      label: 'Commercial Fleet Purchaser',
      name: 'Apex Motors Logistics',
      title: 'Commercial Spare Parts Purchaser',
      email: 'procurement@apexmotors.in',
      password: 'apexCustomer2026',
      badge: 'Enterprise Tier',
      accentColor: '#2B5C8F',
      icon: Truck
    },
    {
      roleType: 'customer',
      label: '🏢 Metro Transport Co.',
      name: 'Metro Transport Fleet',
      title: 'Maintenance Workshop Lead',
      email: 'orders@metrotrans.com',
      password: 'metroPass2026',
      badge: 'B2B Client',
      accentColor: '#0284C7',
      icon: Layers
    }
  ];

  // Admin Personas (Strictly Internal SCM Staff & Directors)
  // ONLY SUPER_ADMIN_EMAIL (ronak.naik019@gmail.com) has super admin access
  const ADMIN_DEMO_ACCOUNTS = [
    {
      roleType: 'admin',
      label: '🛡️ Executive Super Admin (Phase 1)',
      name: 'Ronak Naik',
      title: 'Executive Director & Super Admin',
      email: SUPER_ADMIN_EMAIL,
      password: 'adminPassword123',
      branchId: 'BR-001',
      badge: 'Exclusive Super Admin',
      accentColor: '#B45309',
      icon: Shield
    },
    {
      roleType: 'procurement',
      label: '🛒 Strategic Procurement Lead (Phase 2)',
      name: 'Suresh Nair',
      title: 'Head of Purchasing & Vendor POs',
      email: 'procurement.lead@motohelp.com',
      password: 'procurement2026',
      branchId: 'BR-001',
      badge: 'Phase 2 • Procurement',
      accentColor: '#2563EB',
      icon: ShoppingCart
    },
    {
      roleType: 'warehouse',
      label: '📦 Warehouse Supervisor (Phase 2)',
      name: 'Anita Deshmukh',
      title: 'Lead Inwarding & 2D Bins Incharge',
      email: 'warehouse.admin@motohelp.com',
      password: 'warehouseAdmin2026',
      branchId: 'BR-002',
      badge: 'Phase 2 • Warehouse',
      accentColor: '#059669',
      icon: Package
    },
    {
      roleType: 'logistics',
      label: '🚚 Logistics & Fleet Director (Phase 3)',
      name: 'Sameer Patil',
      title: '3PL Dispatch & Route Governance',
      email: 'logistics.admin@motohelp.com',
      password: 'logisticsAdmin2026',
      branchId: 'BR-001',
      badge: 'Phase 3 • Logistics',
      accentColor: '#D97706',
      icon: Truck
    },
    {
      roleType: 'finance',
      label: '💳 Financial Controller (Phase 4)',
      name: 'Kavita Iyer',
      title: 'Lead Auditor & 3-Way Match Controller',
      email: 'finance.lead@motohelp.com',
      password: 'financePass2026',
      branchId: 'BR-001',
      badge: 'Phase 4 • Finance',
      accentColor: '#7C3AED',
      icon: Receipt
    },
    {
      roleType: 'supplier',
      label: '🏢 OEM Supplier Partner (Phase 5)',
      name: 'Brembo India Automotive',
      title: 'Tier-1 Certified OEM Supplier',
      email: 'orders@brembo.in',
      password: 'supplierPass2026',
      branchId: 'BR-001',
      badge: 'Phase 5 • Supplier',
      accentColor: '#0D9488',
      icon: Factory
    }
  ];

  const handlePortalSwitch = (type) => {
    setPortalType(type);
    setErrorMsg('');
    if (type === 'customer') {
      setEmail('ronak@fleetoperations.com');
      setPassword('customerPass2026');
    } else {
      setEmail(SUPER_ADMIN_EMAIL);
      setPassword('adminPassword123');
    }
  };

  const handleQuickLogin = (account) => {
    setPortalType(account.roleType);
    setEmail(account.email);
    setPassword(account.password);
    if (account.branchId) setSelectedBranchId(account.branchId);
    setErrorMsg('');

    setIsLoading(true);
    setTimeout(() => {
      login({
        email: account.email,
        password: account.password,
        roleType: account.roleType,
        name: account.name,
        title: account.title,
        branchId: account.branchId || 'BR-001'
      });
      setIsLoading(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (portalType === 'admin') {
      if (email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        setErrorMsg(`Access Denied: Administrative access is strictly restricted to ${SUPER_ADMIN_EMAIL}.`);
        return;
      }
      if (twoFactorCode.trim().length < 6) {
        setErrorMsg('Please enter a valid 6-digit administrative 2FA security code.');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      const activeList = portalType === 'admin' ? ADMIN_DEMO_ACCOUNTS : CUSTOMER_DEMO_ACCOUNTS;
      const matched = activeList.find(a => a.email.toLowerCase() === email.toLowerCase());

      login({
        email,
        password,
        roleType: portalType,
        name: matched ? matched.name : (portalType === 'admin' ? 'System Administrator' : 'B2B Customer'),
        title: matched ? matched.title : (portalType === 'admin' ? 'Executive Director & Super Admin' : 'B2B Client'),
        branchId: selectedBranchId
      });
      setIsLoading(false);
    }, 450);
  };

  const currentPersonas = portalType === 'admin' ? ADMIN_DEMO_ACCOUNTS : CUSTOMER_DEMO_ACCOUNTS;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#1E3A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Motohelp SCM</span>
              <span className="badge badge-info" style={{ fontSize: '10px' }}>
                ENTERPRISE
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Supply Chain Management & Logistics Platform
            </div>
          </div>
        </div>

        <button
          className="btn-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ width: '36px', height: '36px', borderRadius: '6px' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Main Login Nexus Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '1020px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          borderRadius: 'var(--radius-panel)',
          overflow: 'hidden',
          padding: 0,
          marginTop: '3.5rem',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Left Column: Form & Portal Tabs */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem', background: '#FFFFFF' }}>
          <div>
            {/* Primary Auth Selector: Clerk Secure Auth vs Demo Personas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                background: 'var(--bg-tertiary)',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={() => setAuthMethod('clerk')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: authMethod === 'clerk' ? 'var(--brand-primary)' : 'transparent',
                  color: authMethod === 'clerk' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: authMethod === 'clerk' ? '700' : '500',
                  boxShadow: authMethod === 'clerk' ? 'var(--shadow-sm)' : 'none',
                  transition: 'var(--transition)'
                }}
              >
                <KeyRound size={13} /> Clerk Secure Auth
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('demo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: authMethod === 'demo' ? '#FFFFFF' : 'transparent',
                  color: authMethod === 'demo' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: authMethod === 'demo' ? '700' : '500',
                  boxShadow: authMethod === 'demo' ? 'var(--shadow-sm)' : 'none',
                  transition: 'var(--transition)'
                }}
              >
                <Layers size={13} /> Demo Personas
              </button>
            </div>

            {authMethod === 'clerk' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '380px' }}>
                <SignIn
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: { width: '100%' },
                      card: {
                        boxShadow: 'none',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-panel)',
                        width: '100%',
                        background: '#FFFFFF'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <>
                {/* Dual Portal Switcher Tabs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    background: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handlePortalSwitch('customer')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: portalType === 'customer' ? '#FFFFFF' : 'transparent',
                      color: portalType === 'customer' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: portalType === 'customer' ? '700' : '500',
                      boxShadow: portalType === 'customer' ? 'var(--shadow-sm)' : 'none',
                      transition: 'var(--transition)'
                    }}
                  >
                    <User size={15} /> Customer Portal
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePortalSwitch('admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: portalType === 'admin' ? '#1E3A5F' : 'transparent',
                      color: portalType === 'admin' ? '#FFFFFF' : 'var(--text-secondary)',
                      fontWeight: portalType === 'admin' ? '700' : '500',
                      boxShadow: portalType === 'admin' ? 'var(--shadow-sm)' : 'none',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Shield size={15} /> Admin ERP Portal
                  </button>
                </div>

                {/* Portal Title & Subtitle */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                      {portalType === 'admin' ? 'Administrative ERP Sign In' : 'Customer B2B Portal Sign In'}
                    </h2>
                    <span className={`badge ${portalType === 'admin' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '11px' }}>
                      {portalType === 'admin' ? '🛡️ Restricted Admin' : '👤 Customer Access'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {portalType === 'admin'
                      ? 'Access master procurement, supplier scorecards, warehouse 2D maps, and financial 3-way match accounting.'
                      : 'Manage purchase orders, browse OEM catalog, track live consignment milestones, and download tax invoices.'}
                  </p>
                </div>

            {/* Error Alert Box */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  color: 'var(--semantic-danger)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem'
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">
                  {portalType === 'admin' ? 'Admin SSO / Super Admin Email' : 'Customer Work Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder={portalType === 'admin' ? SUPER_ADMIN_EMAIL : 'ronak@fleetoperations.com'}
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '34px', fontSize: '13px' }}
                    required
                  />
                </div>
                {portalType === 'admin' && (
                  <span style={{ fontSize: '11px', color: 'var(--brand-primary)', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                    🔒 Super Admin Access: Exclusively authorized for <strong>{SUPER_ADMIN_EMAIL}</strong>
                  </span>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <span
                    style={{ fontSize: '11px', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => setPassword(portalType === 'admin' ? 'adminPassword123' : 'customerPass2026')}
                  >
                    Auto-Fill Demo
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: '34px', paddingRight: '34px', fontSize: '13px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Admin-Only Controls: Branch Selector & 2FA Token */}
              {portalType === 'admin' && (
                <>
                  <div>
                    <label className="form-label">Fulfillment Hub Master</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select
                        className="form-input"
                        value={selectedBranchId}
                        onChange={e => setSelectedBranchId(e.target.value)}
                        style={{ paddingLeft: '34px', fontSize: '13px' }}
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code}) — {b.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', border: '1px dashed var(--border-medium)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ margin: 0, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Fingerprint size={14} /> Admin 2FA Token Code
                      </label>
                      <span className="code-tag" style={{ fontSize: '10px' }}>Auto-Verified</span>
                    </div>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={e => setTwoFactorCode(e.target.value)}
                      placeholder="789421"
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.25em', fontSize: '14px', textAlign: 'center', fontWeight: '700' }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  Remember session token
                </label>
                <span style={{ color: 'var(--text-muted)' }}>🔒 256-Bit SSL Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <span>Authenticating SCM Token...</span>
                ) : (
                  <>
                    <span>{portalType === 'admin' ? 'Authorize Admin & Launch ERP' : 'Sign In to Customer Portal'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-table)', paddingTop: '10px' }}>
            Motohelp SCM Platform v2.6 • Role-Based Authentication & Session Isolation
          </div>
        </div>

        {/* Right Column: 1-Click Fast Switch Demo Personas */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '2.5rem 1.75rem',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                1-Click Portals Access (5 Phases)
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Directly launch any of the 7 dedicated portal interfaces across Phases 1 to 5:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentPersonas.map((acc, idx) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;

                return (
                  <div
                    key={idx}
                    onClick={() => handleQuickLogin(acc)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? '#FFFFFF' : 'var(--bg-card)',
                      border: isSelected
                        ? '1px solid var(--brand-primary)'
                        : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          color: acc.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {acc.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {acc.title}
                        </div>
                      </div>
                    </div>

                    <span
                      className="badge"
                      style={{
                        fontSize: '10px',
                        background: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                      }}
                    >
                      {acc.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Summary Box */}
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={13} /> Strict Access Isolation
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              {portalType === 'admin'
                ? 'Admin sessions have full ERP read/write permissions.'
                : 'Customer sessions are strictly isolated to catalog, cart, orders & tracking.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
