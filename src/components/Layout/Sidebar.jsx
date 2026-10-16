import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  CheckSquare,
  Boxes,
  Truck,
  TrendingUp,
  Users,
  Building,
  Building2,
  Receipt,
  FileBarChart,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Radio,
  FileText,
  RotateCcw,
  Sliders,
  Layers,
  CheckCheck,
  CreditCard,
  UserCheck,
  Bell,
  Award,
  Box,
  Heart,
  Headphones,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeModule,
    setActiveModule,
    activePortal,
    setActivePortal,
    SCM_PORTALS,
    purchaseOrders,
    products,
    salesOrders,
    shipments,
    currentUser,
    isSuperAdmin,
    isAdmin,
    logout,
    cart,
    cartItemsCount,
    wishlistCount
  } = useSCM();
  const [collapsed, setCollapsed] = useState(false);

  const activeShipmentsCount = shipments.filter(s => s.status === 'In Transit').length;

  // -------------------------------------------------------------
  // PHASE 1: CUSTOMER PORTAL SECTIONS (Exact 11 Items)
  // -------------------------------------------------------------
  const userNavSections = [
    {
      title: 'CUSTOMER PORTAL (PHASE 1)',
      items: [
        { key: 'customer_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'customer_orders', label: 'My Orders', icon: Package, badge: `${salesOrders.length}` },
        { key: 'customer_products', label: 'Products', icon: ShoppingBag },
        { key: 'customer_cart', label: 'Cart', icon: ShoppingCart, badge: cart?.length > 0 ? `${cartItemsCount}` : null },
        { key: 'customer_track', label: 'Track Delivery', icon: Truck, badge: activeShipmentsCount > 0 ? `${activeShipmentsCount}` : null },
        { key: 'customer_invoices', label: 'Invoices', icon: FileText },
        { key: 'customer_payments', label: 'Payments', icon: CreditCard },
        { key: 'customer_favorites', label: 'Favorites', icon: Heart, badge: wishlistCount > 0 ? `${wishlistCount}` : null },
        { key: 'customer_support', label: 'Support', icon: Headphones },
        { key: 'customer_profile', label: 'Profile', icon: User },
        { key: 'customer_settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 2: PROCUREMENT PORTAL SECTIONS (Purchase-to-Stock)
  // -------------------------------------------------------------
  const procurementNavSections = [
    {
      title: 'PURCHASE-TO-STOCK (PHASE 2)',
      items: [
        { key: 'procurement_req', label: 'Purchase Requisitions', icon: ShoppingCart },
        { key: 'procurement', label: 'Purchase Orders', icon: FileText, badge: `${purchaseOrders.length}` },
        { key: 'grn', label: 'Goods Receipt (GRN)', icon: CheckSquare }
      ]
    },
    {
      title: 'VENDORS & CATALOG',
      items: [
        { key: 'suppliers', label: 'Supplier Directory', icon: Building },
        { key: 'supplier_perf', label: 'Vendor Performance', icon: Award },
        { key: 'inventory', label: 'Item Master Catalog', icon: Package }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 2: WAREHOUSE PORTAL SECTIONS (Stock Management)
  // -------------------------------------------------------------
  const warehouseNavSections = [
    {
      title: 'WAREHOUSE & STORAGE (PHASE 2)',
      items: [
        { key: 'warehouse', label: '2D Warehouses Map', icon: Building2 },
        { key: 'storage_bins', label: 'Storage Locations', icon: Layers },
        { key: 'receiving_picking', label: 'Receiving & Inward', icon: CheckCheck },
        { key: 'inventory', label: 'Inventory Overview', icon: Package },
        { key: 'stock_mgmt', label: 'Stock Movement', icon: Boxes },
        { key: 'stock_transfer', label: 'Stock Transfers', icon: RotateCcw },
        { key: 'adjustments', label: 'Stock Adjustments', icon: Sliders }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 3: LOGISTICS PORTAL SECTIONS (Dispatch-to-Delivery)
  // -------------------------------------------------------------
  const logisticsNavSections = [
    {
      title: 'DISPATCH-TO-DELIVERY (PHASE 3)',
      items: [
        { key: 'sales', label: 'Sales Orders', icon: TrendingUp, badge: `${salesOrders.length}` },
        { key: 'dispatch_delivery', label: 'Dispatch Center', icon: Truck },
        { key: 'deliveries', label: 'Deliveries', icon: Truck },
        { key: 'shipments_list', label: 'Consignment Shipments', icon: Box, badge: shipments.length > 0 ? `${shipments.length}` : null },
        { key: 'logistics', label: 'Live GPS Route Tracker', icon: Radio, badge: activeShipmentsCount > 0 ? `${activeShipmentsCount}` : null }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 4: FINANCE PORTAL SECTIONS (3-Way Matching & Invoices)
  // -------------------------------------------------------------
  const financeNavSections = [
    {
      title: '3-WAY MATCH & FINANCE (PHASE 4)',
      items: [
        { key: 'invoices', label: 'Invoices AP/AR', icon: Receipt },
        { key: 'payments', label: 'Payment Ledgers', icon: CreditCard },
        { key: 'reports', label: 'Financial Audit MIS', icon: FileBarChart }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 5: SUPPLIER SELF-SERVICE PORTAL SECTIONS
  // -------------------------------------------------------------
  const supplierNavSections = [
    {
      title: 'SUPPLIER SELF-SERVICE (PHASE 5)',
      items: [
        { key: 'supplier_portal', label: 'Vendor Dashboard', icon: LayoutDashboard },
        { key: 'procurement', label: 'Assigned POs', icon: FileText, badge: `${purchaseOrders.length}` },
        { key: 'grn', label: 'Delivery Receipts (GRN)', icon: CheckSquare },
        { key: 'supplier_perf', label: 'Vendor Scorecard', icon: Award }
      ]
    }
  ];

  // -------------------------------------------------------------
  // PHASE 1: ADMIN SECTIONS (Master ERP Suite)
  // -------------------------------------------------------------
  const adminNavSections = [
    {
      title: 'PROCUREMENT (PHASE 2)',
      items: [
        { key: 'procurement_req', label: 'Purchase Requisitions', icon: ShoppingCart },
        { key: 'procurement', label: 'Purchase Orders', icon: FileText },
        { key: 'grn', label: 'Goods Receipt', icon: CheckSquare }
      ]
    },
    {
      title: 'INVENTORY & WAREHOUSE (PHASE 2)',
      items: [
        { key: 'warehouse', label: 'Warehouses', icon: Building2 },
        { key: 'inventory', label: 'Inventory Overview', icon: Package },
        { key: 'storage_bins', label: 'Storage Locations', icon: Layers },
        { key: 'stock_mgmt', label: 'Stock Movement', icon: Boxes },
        { key: 'stock_transfer', label: 'Stock Transfer', icon: RotateCcw },
        { key: 'adjustments', label: 'Stock Adjustment', icon: Sliders }
      ]
    },
    {
      title: 'LOGISTICS & SALES (PHASE 3)',
      items: [
        { key: 'sales', label: 'Sales Orders', icon: TrendingUp },
        { key: 'deliveries', label: 'Deliveries', icon: Truck },
        { key: 'shipments_list', label: 'Shipments', icon: Box },
        { key: 'logistics', label: 'Live GPS Tracking', icon: Radio }
      ]
    },
    {
      title: 'FINANCE & AUDIT (PHASE 4)',
      items: [
        { key: 'invoices', label: 'Invoices AP/AR', icon: Receipt },
        { key: 'payments', label: 'Payments Ledger', icon: CreditCard },
        { key: 'reports', label: 'Reports Center', icon: FileBarChart }
      ]
    },
    {
      title: 'PARTNERS & GOVERNANCE',
      items: [
        { key: 'suppliers', label: 'Suppliers', icon: Building },
        { key: 'supplier_perf', label: 'Supplier Portal View', icon: Award },
        { key: 'customers', label: 'Customers', icon: Users },
        { key: 'audit', label: 'Audit Trail', icon: ShieldAlert },
        { key: 'settings', label: 'Branch & Roles', icon: UserCheck },
        { key: 'infrastructure', label: 'Infrastructure', icon: Settings }
      ]
    }
  ];

  const currentNavSections = (() => {
    switch (activePortal) {
      case 'customer': return userNavSections;
      case 'procurement': return procurementNavSections;
      case 'warehouse': return warehouseNavSections;
      case 'logistics': return logisticsNavSections;
      case 'finance': return financeNavSections;
      case 'supplier': return supplierNavSections;
      case 'admin':
      default:
        return isSuperAdmin ? adminNavSections : userNavSections;
    }
  })();

  const currentPortalObj = (SCM_PORTALS || []).find(p => p.key === activePortal) || SCM_PORTALS[0];

  return (
    <aside style={{
      width: collapsed ? '68px' : '230px',
      height: '100vh',
      flexShrink: 0,
      background: '#172B3A',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 40,
      userSelect: 'none',
      color: '#D6DEE5'
    }}>
      {/* 1. Brand Header */}
      <div style={{
        padding: collapsed ? '1.1rem 0.5rem' : '1.1rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        {/* Navy Square Emblem */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            background: '#1E3A5F',
            border: '1px solid #5B8FA8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <Box size={16} />
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Motohelp SCM
            </span>
            <span style={{ fontSize: '0.66rem', color: currentPortalObj?.color || '#AAB8C4', whiteSpace: 'nowrap', fontWeight: '600' }}>
              {currentPortalObj?.label || 'Enterprise SCM'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Navigation Scroll Area */}
      <div style={{
        padding: collapsed ? '0.75rem 0.35rem' : '0.75rem 0.65rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1
      }}>
        {/* Top Dashboard Button for Admin */}
        {activePortal === 'admin' && (
          <div style={{ marginBottom: '0.85rem' }}>
            <button
              onClick={() => setActiveModule('dashboard')}
              title={collapsed ? 'Dashboard' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                width: '100%',
                padding: collapsed ? '0.55rem' : '0.55rem 0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '6px',
                background: activeModule === 'dashboard' ? '#1E3A5F' : 'transparent',
                color: activeModule === 'dashboard' ? '#FFFFFF' : '#D6DEE5',
                border: 'none',
                borderLeft: activeModule === 'dashboard' ? '3px solid #5B8FA8' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeModule === 'dashboard' ? '600' : '500',
                fontSize: '0.82rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (activeModule !== 'dashboard') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeModule !== 'dashboard') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#D6DEE5';
                }
              }}
            >
              <LayoutDashboard size={16} style={{ minWidth: '16px', color: activeModule === 'dashboard' ? '#FFFFFF' : '#AAB8C4' }} />
              {!collapsed && <span>Dashboard</span>}
            </button>
          </div>
        )}

        {/* Dynamic Nav Sections */}
        {currentNavSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '1rem' }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.65rem',
                fontWeight: '600',
                color: '#AAB8C4',
                letterSpacing: '0.06em',
                padding: '0 0.75rem',
                marginBottom: '0.25rem',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.key ||
                  (item.key === 'customer_products' && (activeModule === 'products' || activeModule === 'catalog' || activeModule === 'customer_products' || activeModule === 'create_order')) ||
                  (item.key === 'customer_dashboard' && (activeModule === 'dashboard' || activeModule === 'customer_dashboard')) ||
                  (item.key === 'customer_orders' && (activeModule === 'orders' || activeModule === 'sales' || activeModule === 'customer_orders')) ||
                  (item.key === 'customer_cart' && (activeModule === 'cart' || activeModule === 'customer_cart')) ||
                  (item.key === 'customer_track' && (activeModule === 'track' || activeModule === 'logistics' || activeModule === 'customer_track')) ||
                  (item.key === 'customer_invoices' && (activeModule === 'invoices' || activeModule === 'customer_invoices')) ||
                  (item.key === 'customer_payments' && (activeModule === 'payments' || activeModule === 'customer_payments')) ||
                  (item.key === 'customer_favorites' && (activeModule === 'favorites' || activeModule === 'wishlist' || activeModule === 'customer_favorites')) ||
                  (item.key === 'customer_support' && (activeModule === 'support' || activeModule === 'customer_support')) ||
                  (item.key === 'customer_profile' && (activeModule === 'profile' || activeModule === 'customer_profile')) ||
                  (item.key === 'customer_settings' && (activeModule === 'settings' || activeModule === 'customer_settings'));

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (!isAdmin) {
                        setActiveModule(item.key);
                        return;
                      }
                      if (item.key === 'procurement_req') setActiveModule('procurement');
                      else if (item.key === 'stock_mgmt' || item.key === 'adjustments') setActiveModule('inventory');
                      else if (item.key === 'stock_transfer' || item.key === 'storage_bins' || item.key === 'receiving_picking') setActiveModule('warehouse');
                      else if (item.key === 'dispatch_delivery' || item.key === 'deliveries') setActiveModule('sales');
                      else if (item.key === 'shipments_list') setActiveModule('logistics');
                      else if (item.key === 'supplier_perf') setActiveModule('suppliers');
                      else if (item.key === 'payments') setActiveModule('invoices');
                      else setActiveModule(item.key);
                    }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      width: '100%',
                      padding: collapsed ? '0.55rem' : '0.5rem 0.75rem',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '6px',
                      background: isActive ? '#1E3A5F' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#D6DEE5',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #5B8FA8' : '3px solid transparent',
                      cursor: 'pointer',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '0.8rem',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#D6DEE5';
                      }
                    }}
                  >
                    <Icon size={16} style={{ minWidth: '16px', color: isActive ? '#FFFFFF' : '#AAB8C4' }} />
                    {!collapsed && (
                      <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: '700',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: '#1E3A5F',
                          color: '#FFFFFF',
                          border: '1px solid #2F6F8F'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom User Account & Collapse Bar */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#132431',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#1E3A5F',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.72rem',
                  border: '1px solid #5B8FA8',
                  flexShrink: 0
                }}
              >
                {(currentUser?.name || (isAdmin ? 'A' : 'R')).charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                  {currentUser?.name || (isAdmin ? 'Admin User' : 'Ronak')}
                </span>
                <span style={{ fontSize: '0.64rem', color: '#AAB8C4' }}>
                  {isAdmin ? 'Administrator' : 'Customer Account'}
                </span>
              </div>
            </div>

            <button
              className="btn-icon"
              onClick={logout}
              title="Sign Out"
              style={{ width: '26px', height: '26px', background: 'transparent', color: '#AAB8C4', border: 'none' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="btn-icon"
              onClick={logout}
              title="Sign Out"
              style={{ width: '28px', height: '28px', background: 'transparent', color: '#AAB8C4', border: 'none' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {!collapsed && (
            <span style={{ fontSize: '0.62rem', color: '#AAB8C4' }}>
              v2.6 Enterprise
            </span>
          )}
          <button
            className="btn-icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ padding: '0.15rem', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined, background: 'transparent', color: '#AAB8C4', border: 'none' }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
