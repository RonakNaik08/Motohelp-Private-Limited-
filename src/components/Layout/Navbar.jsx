import React, { useState } from 'react';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/react';
import { useSCM } from '../../context/SCMContext';
import { CSVDataImporterModal } from '../Common/CSVDataImporterModal';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  UploadCloud,
  Box,
  Building2,
  Shield,
  User,
  ShoppingCart,
  Factory,
  Receipt,
  Truck,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onOpenSearch }) => {
  const {
    theme,
    setTheme,
    currentUser,
    isSuperAdmin,
    isAdmin,
    SUPER_ADMIN_EMAIL,
    activePortal,
    setActivePortal,
    SCM_PORTALS,
    login,
    logout,
    notifications,
    setNotifications,
    setActiveModule,
    switchRole
  } = useSCM();

  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const getPortalIcon = (iconName) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'User': return User;
      case 'ShoppingCart': return ShoppingCart;
      case 'Building2': return Building2;
      case 'Truck': return Truck;
      case 'Receipt': return Receipt;
      case 'Factory': return Factory;
      default: return Box;
    }
  };

  const currentPortal = (SCM_PORTALS || []).find(p => p.key === activePortal) || SCM_PORTALS[0];
  const PortalIcon = getPortalIcon(currentPortal?.icon);

  const unreadCount = notifications.filter(n => !n.read).length || 3;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const userDisplayName = currentUser?.name || (isAdmin ? 'Rajesh Verma' : 'Ronak');
  const userInitials = isAdmin ? 'RV' : 'RO';

  return (
    <>
      <header
        className="navbar-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          gap: '1rem',
          height: '64px',
          minHeight: '64px'
        }}
      >
        {/* Left: Global Search Bar */}
        <div
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-input)',
            padding: '7px 12px',
            maxWidth: '380px',
            minWidth: '240px',
            flex: 1,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAdmin ? 'Search orders, SKUs, vendors, consignments...' : 'Search your orders, part numbers, or tracking #...'}
          </span>
          <span className="code-tag" style={{ fontSize: '10px', padding: '1px 5px', flexShrink: 0, background: '#FFFFFF' }}>
            ⌘ K
          </span>
        </div>

        {/* Center: Interactive 7-Portals Switcher (5 Phases) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPortalMenu(!showPortalMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            title="Switch SCM Portal Interface"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: currentPortal?.color ? `${currentPortal.color}18` : 'var(--bg-tertiary)',
                color: currentPortal?.color || 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PortalIcon size={14} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {currentPortal?.label || 'Select Portal'}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: currentPortal?.color || 'var(--brand-primary)',
                    color: '#FFFFFF',
                    fontWeight: '700'
                  }}
                >
                  {currentPortal?.phase}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {currentPortal?.priority}
              </span>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
          </button>

          {showPortalMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                padding: '10px',
                zIndex: 100,
                boxShadow: 'var(--shadow-modal)',
                background: '#FFFFFF'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '4px 8px 8px 8px', borderBottom: '1px solid var(--border-table)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>7 Enterprise SCM Portals</span>
                <span className="badge badge-info" style={{ fontSize: '9px' }}>5 Phases</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {SCM_PORTALS.map(portal => {
                  const isSelected = portal.key === activePortal;
                  const isLockedAdmin = portal.key === 'admin' && !isSuperAdmin;
                  const Icon = getPortalIcon(portal.icon);
                  return (
                    <div
                      key={portal.key}
                      onClick={() => {
                        if (isLockedAdmin) {
                          alert(`Access Denied: Only ${SUPER_ADMIN_EMAIL} is authorized for the Admin ERP Portal.`);
                          return;
                        }
                        setActivePortal(portal.key);
                        setShowPortalMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: isLockedAdmin ? 'not-allowed' : 'pointer',
                        opacity: isLockedAdmin ? 0.65 : 1,
                        background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                        border: isSelected ? `1px solid ${portal.color}50` : '1px solid transparent',
                        transition: 'var(--transition)'
                      }}
                      title={isLockedAdmin ? `Restricted exclusively to ${SUPER_ADMIN_EMAIL}` : portal.label}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isLockedAdmin) e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: `${portal.color}18`,
                            color: portal.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: isSelected ? '700' : '600', color: isSelected ? portal.color : 'var(--text-primary)' }}>
                              {portal.label}
                            </span>
                            {isLockedAdmin && (
                              <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--semantic-danger)', fontWeight: '700' }}>
                                🔒 Restricted
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                            {isLockedAdmin ? `Only ${SUPER_ADMIN_EMAIL}` : portal.priority}
                          </div>
                        </div>
                      </div>

                      <span
                        className="badge"
                        style={{
                          fontSize: '9px',
                          background: isSelected ? portal.color : 'var(--bg-tertiary)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                        }}
                      >
                        {portal.phase}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Role Badge + Notification Bell + Theme Toggle + User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Role Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            {isAdmin ? (
              <>
                <Building2 size={13} style={{ color: 'var(--brand-primary)' }} />
                <span>Mumbai DC (WH-01)</span>
              </>
            ) : (
              <>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--semantic-success)' }} />
                <span>Verified B2B Account</span>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-btn)'
              }}
              title="Operational Alerts"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--semantic-danger)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '700',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  padding: '12px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-modal)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-table)' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>Operational Alerts</span>
                  <span onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '600' }}>
                    Mark all read
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: notif.read ? 'transparent' : 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.timestamp}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: 'var(--semantic-warning)' }} /> : <Moon size={15} />}
          </button>

          {/* Clerk Auth Controls */}
          <Show when="signed-out">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SignInButton mode="modal">
                <button className="btn btn-secondary btn-sm" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary btn-sm" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Role Toggle Switcher: Strictly reserved for ronak.naik019@gmail.com */}
              {isSuperAdmin ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => switchRole(isAdmin ? 'customer' : 'admin')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  title={isAdmin ? "Switch to Customer Portal" : "Switch to Admin ERP Suite"}
                >
                  {isAdmin ? (
                    <Shield size={12} style={{ color: 'var(--semantic-warning)' }} />
                  ) : (
                    <User size={12} style={{ color: 'var(--brand-primary)' }} />
                  )}
                  <span>{isAdmin ? 'Admin View' : 'Customer View'}</span>
                </button>
              ) : (
                <div
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)'
                  }}
                  title="B2B Client Access"
                >
                  <User size={12} style={{ color: 'var(--brand-primary)' }} />
                  <span>Customer Account</span>
                </div>
              )}

              {isAdmin && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCsvModalOpen(true)}
                  style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Bulk CSV Importer"
                >
                  <UploadCloud size={12} /> CSV
                </button>
              )}

              {/* Clerk User Button */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: { width: '32px', height: '32px' }
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </Show>
        </div>
      </header>

      {/* CSV Importer Modal */}
      <CSVDataImporterModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </>
  );
};
