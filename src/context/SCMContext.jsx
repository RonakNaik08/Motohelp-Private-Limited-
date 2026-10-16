import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { SCM_API } from '../services/api';
import {
  INITIAL_BRANCHES,
  INITIAL_ROLES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_SALES_ORDERS,
  INITIAL_SHIPMENTS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

export const SCM_PORTALS = [
  { key: 'admin', label: 'Admin ERP Portal', phase: 'Phase 1', priority: 'Core Control', icon: 'Shield', color: '#B45309', badge: 'Super Admin' },
  { key: 'customer', label: 'Customer B2B Portal', phase: 'Phase 1', priority: 'Core Access', icon: 'User', color: '#1E3A5F', badge: 'B2B Client' },
  { key: 'procurement', label: 'Procurement Portal', phase: 'Phase 2', priority: 'Purchase-to-Stock', icon: 'ShoppingCart', color: '#2563EB', badge: 'Purchasing' },
  { key: 'warehouse', label: 'Warehouse Portal', phase: 'Phase 2', priority: 'Stock Management', icon: 'Building2', color: '#059669', badge: '2D Inventory' },
  { key: 'logistics', label: 'Logistics Portal', phase: 'Phase 3', priority: 'Dispatch-to-Delivery', icon: 'Truck', color: '#D97706', badge: '3PL Dispatch' },
  { key: 'finance', label: 'Finance Portal', phase: 'Phase 4', priority: '3-Way Matching', icon: 'Receipt', color: '#7C3AED', badge: 'AP/AR' },
  { key: 'supplier', label: 'Supplier Portal', phase: 'Phase 5', priority: 'Self-Service ASN', icon: 'Factory', color: '#0D9488', badge: 'External Vendor' }
];

export const SUPER_ADMIN_EMAIL = 'ronak.naik019@gmail.com';

const SCMContext = createContext(null);

export const SCMProvider = ({ children }) => {
  // Security: Structural LocalStorage validation helper
  const getStored = (key, fallback) => {
    try {
      const item = localStorage.getItem(`MOTOHELP_SCM_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem('MOTOHELP_SCM_AUTH_USER');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.email || !parsed.role) {
        localStorage.removeItem('MOTOHELP_SCM_AUTH_USER');
        return null;
      }
      // Strict Security Guard: Only ronak.naik019@gmail.com is permitted admin privileges
      const isSuperAdminEmail = parsed.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      if ((parsed.role === 'admin' || parsed.roleType === 'admin') && !isSuperAdminEmail) {
        parsed.role = 'customer';
        parsed.roleType = 'customer';
        parsed.roleKey = 'customer';
        parsed.roleTitle = 'B2B Fleet Customer';
        localStorage.setItem('MOTOHELP_SCM_AUTH_USER', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      localStorage.removeItem('MOTOHELP_SCM_AUTH_USER');
      return null;
    }
  };

  const [theme, setTheme] = useState(() => getStored('THEME', 'light'));
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activePortal, setActivePortalState] = useState(() => {
    const user = getStoredUser();
    const isSuperAdmin = user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (user?.role && SCM_PORTALS.some(p => p.key === user.role)) {
      if (user.role === 'admin' && !isSuperAdmin) {
        return 'customer';
      }
      return user.role;
    }
    return isSuperAdmin ? 'admin' : 'customer';
  });
  const [activeModule, setActiveModule] = useState(() => {
    const user = getStoredUser();
    const isSuperAdmin = user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (!isSuperAdmin) return 'customer_dashboard';
    if (user && user.role === 'customer') return 'customer_dashboard';
    if (user && user.role === 'supplier') return 'supplier_portal';
    return 'dashboard';
  });
  const [selectedBranch, setSelectedBranch] = useState(() => INITIAL_BRANCHES[0]);
  const [activeRole, setActiveRole] = useState(() => INITIAL_ROLES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const setActivePortal = (portalKey) => {
    const isSuperAdmin = Boolean(currentUser?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (portalKey === 'admin' && !isSuperAdmin) {
      console.warn(`[Security Alert] Access Denied: Admin ERP Portal is strictly restricted to ${SUPER_ADMIN_EMAIL}`);
      alert(`Access Restricted: Only ${SUPER_ADMIN_EMAIL} is authorized for Admin ERP Portal access.`);
      setActivePortalState('customer');
      setActiveModule('customer_dashboard');
      return;
    }
    setActivePortalState(portalKey);
    const defaultModules = {
      admin: 'dashboard',
      customer: 'customer_dashboard',
      procurement: 'procurement',
      warehouse: 'warehouse',
      logistics: 'logistics',
      finance: 'invoices',
      supplier: 'supplier_portal'
    };
    if (defaultModules[portalKey]) {
      setActiveModule(defaultModules[portalKey]);
    }
  };

  // Live Database Connectivity State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting'); // 'connected' | 'connecting' | 'offline'
  const [latency, setLatency] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Core Data Collections (Initialized with fallback data, immediately hydrated from live DB)
  const [branches, setBranches] = useState(() => getStored('BRANCHES', INITIAL_BRANCHES));
  const [products, setProducts] = useState(() => getStored('PRODUCTS', INITIAL_PRODUCTS));
  const [suppliers, setSuppliers] = useState(() => getStored('SUPPLIERS', INITIAL_SUPPLIERS));
  const [customers, setCustomers] = useState(() => getStored('CUSTOMERS', INITIAL_CUSTOMERS));
  const [purchaseOrders, setPurchaseOrders] = useState(() => getStored('POS', INITIAL_PURCHASE_ORDERS));
  const [grns, setGrns] = useState(() => getStored('GRNS', INITIAL_GRNS));
  const [salesOrders, setSalesOrders] = useState(() => getStored('SOS', INITIAL_SALES_ORDERS));
  const [shipments, setShipments] = useState(() => getStored('SHIPMENTS', INITIAL_SHIPMENTS));
  const [invoices, setInvoices] = useState(() => getStored('INVOICES', INITIAL_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => getStored('AUDIT', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState(() => getStored('NOTIFS', INITIAL_NOTIFICATIONS));
  const [returns, setReturns] = useState(() => getStored('RETURNS', [
    {
      id: 'RMA-2026-0841',
      soNumber: 'SO-2026-1191',
      customerId: 'CUST-001',
      customerName: 'Metro Fleet Mobility Solutions',
      itemName: 'High Performance Spark Plug Set (Platinum)',
      itemSku: 'SPK-PLUG-IRID',
      quantity: 2,
      refundAmount: 1760,
      reason: 'Quality Inspection Failure (Defective Electrode Gap)',
      returnType: 'Replacement',
      status: 'Reverse Pickup Scheduled',
      pickupAddress: 'Metro Fleet Workshop, Andheri East, Mumbai - 400069',
      createdAt: '2026-09-20'
    },
    {
      id: 'RMA-2026-0792',
      soNumber: 'SO-2026-1188',
      customerId: 'CUST-001',
      customerName: 'Royal Multi-Brand Automotive Works',
      itemName: 'Heavy Duty Alternator 12V 90A',
      itemSku: 'ELEC-ALT-12V90',
      quantity: 1,
      refundAmount: 6400,
      reason: 'Damaged in Transit (Casing Dent)',
      returnType: 'CreditNote',
      status: 'Credit Note Issued',
      pickupAddress: 'Metro Fleet Workshop, Andheri East, Mumbai - 400069',
      createdAt: '2026-09-14'
    }
  ]));

  useEffect(() => {
    try {
      localStorage.setItem('MOTOHELP_SCM_RETURNS', JSON.stringify(returns));
    } catch {}
  }, [returns]);

  // Multi-item E-Commerce Shopping Cart State
  const [cart, setCart] = useState(() => getStored('CART', [
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[1], quantity: 1 }
  ]));

  // Customer Wishlist State (Myntra / Ajio style saved items)
  const [wishlist, setWishlist] = useState(() => getStored('WISHLIST', [INITIAL_PRODUCTS[2] || INITIAL_PRODUCTS[0]]));

  useEffect(() => {
    try {
      localStorage.setItem('MOTOHELP_SCM_CART', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('MOTOHELP_SCM_WISHLIST', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product?.id === product.id);
      if (existing) {
        return prev.map(item => item.product?.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(item => item.product?.id === productId ? { ...item, quantity: newQty } : item));
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product?.id !== productId));
  };

  const clearCart = () => setCart([]);
  const cartItemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return (wishlist || []).some(item => item.id === productId);
  };
  const wishlistCount = (wishlist || []).length;


  // Clerk Authentication Integration
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Synchronize Clerk user state into SCM context
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isClerkSignedIn && clerkUser) {
      const email = (clerkUser.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
      const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || (email ? email.split('@')[0] : 'User');
      const isSuperAdminEmail = email === SUPER_ADMIN_EMAIL.toLowerCase();

      setCurrentUser(prev => {
        let role = prev?.role;
        if (isSuperAdminEmail) {
          // Super admin defaults to admin
          role = role || 'admin';
        } else {
          // Strictly force non-admin for all other emails
          if (!role || role === 'admin') {
            role = 'customer';
          }
        }

        const isLoggingInAsAdmin = isSuperAdminEmail && role === 'admin';
        const matchedRole = INITIAL_ROLES.find(r => r.key === (isLoggingInAsAdmin ? 'director' : 'customer')) || INITIAL_ROLES[0];
        const matchedBranch = branches.find(b => b.id === prev?.branchId) || branches[0] || INITIAL_BRANCHES[0];

        const updated = {
          id: clerkUser.id,
          name: name,
          email: email,
          role: role,
          roleType: role,
          roleKey: isLoggingInAsAdmin ? 'director' : 'customer',
          roleTitle: isLoggingInAsAdmin ? 'Executive Director & Super Admin' : 'B2B Fleet Customer',
          branchId: matchedBranch.id,
          branchName: matchedBranch.name,
          avatar: clerkUser.imageUrl,
          loginTime: prev?.loginTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        localStorage.setItem('MOTOHELP_SCM_AUTH_USER', JSON.stringify(updated));
        return updated;
      });
    } else if (!isClerkSignedIn) {
      setCurrentUser(null);
      localStorage.removeItem('MOTOHELP_SCM_AUTH_USER');
    }
  }, [isClerkLoaded, isClerkSignedIn, clerkUser, branches]);

  // Authentication Helpers: Strictly ronak.naik019@gmail.com for Admin access
  const isAuthenticated = Boolean(isClerkSignedIn || currentUser);
  const isSuperAdmin = Boolean(
    currentUser?.email &&
    currentUser.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );
  const isAdmin = Boolean(
    isSuperAdmin &&
    (currentUser?.role === 'admin' || currentUser?.roleType === 'admin')
  );

  const login = ({ email, roleType = 'customer', name, title, branchId }) => {
    const cleanEmail = (email || clerkUser?.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
    const isSuperAdminEmail = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    // Strict Security Guard: Only ronak.naik019@gmail.com is permitted admin privileges
    let enforcedRole = roleType;
    if (enforcedRole === 'admin' && !isSuperAdminEmail) {
      console.warn(`[Security Alert] Admin role requested for unauthorized email ${cleanEmail}. Reverting to 'customer'.`);
      enforcedRole = 'customer';
    }

    const isLoggingInAsAdmin = enforcedRole === 'admin';
    const matchedRole = INITIAL_ROLES.find(r => r.key === (isLoggingInAsAdmin ? 'director' : 'customer')) || INITIAL_ROLES[0];
    const matchedBranch = branches.find(b => b.id === branchId) || branches[0];

    const newUser = {
      id: clerkUser?.id || (isLoggingInAsAdmin ? `ADM-${Date.now().toString().slice(-4)}` : `CUST-${Date.now().toString().slice(-4)}`),
      name: name || clerkUser?.fullName || (isLoggingInAsAdmin ? 'Ronak Naik' : 'Ronak'),
      email: cleanEmail,
      role: enforcedRole,
      roleType: enforcedRole,
      roleKey: isLoggingInAsAdmin ? 'director' : 'customer',
      roleTitle: title || (isLoggingInAsAdmin ? 'Executive Director & Super Admin' : 'B2B Fleet Customer'),
      branchId: matchedBranch.id,
      branchName: matchedBranch.name,
      avatar: clerkUser?.imageUrl,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCurrentUser(newUser);
    setActiveRole(matchedRole);
    setSelectedBranch(matchedBranch);
    localStorage.setItem('MOTOHELP_SCM_AUTH_USER', JSON.stringify(newUser));

    setActivePortal(enforcedRole);

    logAction('Security', 'USER_LOGIN', newUser.id, `User ${newUser.name} authenticated successfully (${newUser.role.toUpperCase()} Portal)`);
  };

  const switchRole = (newRole) => {
    const isSuperAdminEmail = Boolean(currentUser?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (newRole === 'admin' && !isSuperAdminEmail) {
      console.warn(`[Access Denied] Only ${SUPER_ADMIN_EMAIL} is authorized for administrator access.`);
      alert(`Access Restricted: Only ${SUPER_ADMIN_EMAIL} is authorized for Admin access.`);
      return;
    }

    const isLoggingInAsAdmin = newRole === 'admin';
    const matchedRole = INITIAL_ROLES.find(r => r.key === (isLoggingInAsAdmin ? 'director' : 'customer')) || INITIAL_ROLES[0];
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        role: newRole,
        roleType: newRole,
        roleKey: isLoggingInAsAdmin ? 'director' : 'customer',
        roleTitle: isLoggingInAsAdmin ? 'Executive Director & Super Admin' : 'B2B Fleet Customer'
      };
      localStorage.setItem('MOTOHELP_SCM_AUTH_USER', JSON.stringify(updated));
      return updated;
    });
    setActiveRole(matchedRole);
    setActivePortal(newRole);
    logAction('Security', 'ROLE_SWITCH', currentUser?.id || 'AUTH', `Role switched to ${newRole.toUpperCase()}`);
  };

  const logout = async () => {
    if (currentUser) {
      logAction('Security', 'USER_LOGOUT', currentUser.id, `User ${currentUser.name} logged out`);
    }
    setCurrentUser(null);
    localStorage.removeItem('MOTOHELP_SCM_AUTH_USER');
    setActiveModule('customer_dashboard');
    try {
      if (clerkSignOut) {
        await clerkSignOut();
      }
    } catch (err) {
      console.warn('Clerk signOut notice:', err);
    }
  };

  const safeSetActiveModule = (moduleKey) => {
    const isSuperAdminUser = Boolean(currentUser?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    const adminOnlyModules = [
      'dashboard', 'inventory', 'warehouse', 'procurement', 'grn',
      'sales', 'logistics', 'suppliers', 'customers', 'invoices',
      'reports', 'audit', 'database', 'infrastructure', 'settings',
      'forecasting', 'procurement_req', 'stock_mgmt', 'stock_transfer',
      'adjustments', 'storage_bins', 'receiving_picking', 'dispatch_delivery',
      'deliveries', 'shipments_list', 'supplier_perf'
    ];
    if (!isSuperAdminUser && adminOnlyModules.includes(moduleKey)) {
      console.warn(`[Access Denied] Only ${SUPER_ADMIN_EMAIL} can access admin module '${moduleKey}'`);
      setActiveModule('customer_dashboard');
      return;
    }
    setActiveModule(moduleKey);
  };

  // Sync theme & auth
  useEffect(() => {
    localStorage.setItem('MOTOHELP_SCM_THEME', JSON.stringify(theme));
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Security Watchdog: Auto-logout on 30 minutes of idle inactivity
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId;
    const SESSION_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logAction('Security', 'SESSION_TIMEOUT', currentUser.id, 'Session automatically terminated due to 30 minutes of inactivity');
        logout();
      }, SESSION_INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('MOTOHELP_SCM_AUTH_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('MOTOHELP_SCM_AUTH_USER');
    }
  }, [currentUser]);

  // Keep local storage as emergency offline cache
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_PRODUCTS', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_SUPPLIERS', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_CUSTOMERS', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_POS', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_GRNS', JSON.stringify(grns)); }, [grns]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_SOS', JSON.stringify(salesOrders)); }, [salesOrders]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_SHIPMENTS', JSON.stringify(shipments)); }, [shipments]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_INVOICES', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_AUDIT', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('MOTOHELP_SCM_NOTIFS', JSON.stringify(notifications)); }, [notifications]);

  const isInitialMount = useRef(true);

  // --------------------------------------------------------------------------
  // LIVE DATABASE HYDRATION & REAL-TIME SYNC
  // --------------------------------------------------------------------------
  const fetchLiveState = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    try {
      // 1. Health check & Ping
      const health = await SCM_API.getHealth();
      setLatency(health.latencyMs || 5);
      setIsLiveConnected(true);
      setDbStatus('connected');
      setSyncError(null);

      // 2. Parallel fetch of all live collections from Express/SQLite backend
      const [
        liveProducts,
        liveSuppliers,
        liveCustomers,
        liveBranches,
        livePOs,
        liveGRNs,
        liveSOs,
        liveShipments,
        liveInvoices,
        liveAuditLogs
      ] = await Promise.all([
        SCM_API.getProducts().catch(() => null),
        SCM_API.getSuppliers().catch(() => null),
        SCM_API.getCustomers().catch(() => null),
        SCM_API.getBranches().catch(() => null),
        SCM_API.getPurchaseOrders().catch(() => null),
        SCM_API.getGRNs().catch(() => null),
        SCM_API.getSalesOrders().catch(() => null),
        SCM_API.getShipments().catch(() => null),
        SCM_API.getInvoices().catch(() => null),
        SCM_API.getAuditLogs().catch(() => null)
      ]);

      if (Array.isArray(liveProducts)) setProducts(liveProducts);
      if (Array.isArray(liveSuppliers)) setSuppliers(liveSuppliers);
      if (Array.isArray(liveCustomers)) setCustomers(liveCustomers);
      if (Array.isArray(liveBranches) && liveBranches.length > 0) setBranches(liveBranches);
      if (Array.isArray(livePOs)) setPurchaseOrders(livePOs);
      if (Array.isArray(liveGRNs)) setGrns(liveGRNs);
      if (Array.isArray(liveSOs)) setSalesOrders(liveSOs);
      if (Array.isArray(liveShipments)) setShipments(liveShipments);
      if (Array.isArray(liveInvoices)) setInvoices(liveInvoices);
      if (Array.isArray(liveAuditLogs)) setAuditLogs(liveAuditLogs);

      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Live Database Sync Note:', err.message);
      setIsLiveConnected(false);
      setDbStatus('offline');
      setSyncError(err.message);
    } finally {
      if (!isSilent) setIsSyncing(false);
    }
  }, []);

  // Hydrate on component mount
  useEffect(() => {
    fetchLiveState();
    // Auto sync with live SQLite DB every 10 seconds
    const interval = setInterval(() => {
      fetchLiveState(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveState]);

  // --------------------------------------------------------------------------
  // AUDIT LOGGING HELPER (Persisted to Live SQLite)
  // --------------------------------------------------------------------------
  const logAction = async (module, action, entityId, description) => {
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      user: activeRole.name,
      role: activeRole.key.toUpperCase(),
      module,
      action,
      entityId,
      description,
      ip: '192.168.1.108'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Send to live database
    try {
      await SCM_API.logAudit(newLog);
    } catch (err) {
      console.warn('Failed to write live audit log to SQLite:', err);
    }
  };

  // --------------------------------------------------------------------------
  // 1. PRODUCT & INVENTORY ACTIONS (Direct to Live Database)
  // --------------------------------------------------------------------------
  const addProduct = async (productData) => {
    const id = productData.id || `PRD-${Date.now().toString().slice(-3)}`;
    const sku = productData.sku || `MH-AUTO-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct = {
      ...productData,
      id,
      sku,
      currentStock: Number(productData.currentStock || 0),
      reservedStock: 0,
      safetyStock: Number(productData.safetyStock || 20),
      reorderPoint: Number(productData.reorderPoint || 40),
      maxStock: Number(productData.maxStock || 200),
      costPrice: Number(productData.costPrice || 0),
      sellingPrice: Number(productData.sellingPrice || 0),
      gstRate: Number(productData.gstRate || 18),
      binLocation: productData.binLocation || 'A-01-01',
      primarySupplier: productData.primarySupplier || 'Bosch Auto Systems',
      abcCategory: productData.abcCategory || 'B',
      fsnCategory: productData.fsnCategory || 'F',
      batchTracking: Boolean(productData.batchTracking)
    };

    // Optimistic UI update
    setProducts(prev => [newProduct, ...prev]);

    // Write to Live SQLite DB
    try {
      await SCM_API.addProduct(newProduct);
      fetchLiveState(true);
    } catch (err) {
      console.error('Failed to insert product into live database:', err);
    }

    logAction('Inventory', 'PRODUCT_ADD', sku, `Added new live SKU: ${newProduct.name}`);
    return newProduct;
  };

  const bulkImportProducts = async (importedList) => {
    try {
      const res = await SCM_API.bulkImportProducts(importedList);
      await fetchLiveState();
      logAction('Inventory', 'CSV_BULK_IMPORT', 'BULK-IMPORT', `Imported ${importedList.length} live SKU records into SQLite database`);
      return res;
    } catch (err) {
      console.error('Bulk import error:', err);
      throw err;
    }
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    logAction('Inventory', 'PRODUCT_UPDATE', id, `Updated product attributes for ${id}`);
  };

  const adjustStock = async (productId, deltaQty, reason = 'Cycle Count Adjustment') => {
    // Optimistic UI update
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedStock = Math.max(0, p.currentStock + Number(deltaQty));
        return { ...p, currentStock: updatedStock };
      }
      return p;
    }));

    try {
      await SCM_API.adjustStock(productId, deltaQty, reason);
      fetchLiveState(true);
    } catch (err) {
      console.error('Stock adjust API error:', err);
    }

    logAction('Warehouse', 'STOCK_ADJUST', productId, `Adjusted stock by ${deltaQty > 0 ? '+' : ''}${deltaQty} units. Reason: ${reason}`);
  };

  const transferStock = (productId, fromBranchName, toBranchName, quantity) => {
    logAction('Warehouse', 'STOCK_TRANSFER', productId, `Transferred ${quantity} units from ${fromBranchName} to ${toBranchName}`);
  };

  // --------------------------------------------------------------------------
  // 2. PROCUREMENT & PURCHASE ORDERS (Direct to Live Database)
  // --------------------------------------------------------------------------
  const createPurchaseOrder = async (poData) => {
    const id = poData.id || `PO-2026-0${Math.floor(843 + Math.random() * 90)}`;
    const newPO = {
      ...poData,
      id,
      poNumber: poData.poNumber || id,
      orderDate: poData.orderDate || new Date().toISOString().split('T')[0],
      status: poData.status || 'Approved',
      approvalStatus: poData.approvalStatus || 'Approved',
      approvedBy: poData.approvedBy || `${activeRole.name}`,
      hasGRN: false
    };

    // Optimistic UI update
    setPurchaseOrders(prev => [newPO, ...prev]);

    // Live API call
    try {
      await SCM_API.createPurchaseOrder(newPO);
      fetchLiveState(true);
    } catch (err) {
      console.error('Create PO API error:', err);
    }

    logAction('Procurement', 'PO_CREATED', newPO.poNumber, `Created PO for ${newPO.vendorName} of value ₹${Number(newPO.grandTotal || 0).toLocaleString('en-IN')}`);
    return newPO;
  };

  const approvePurchaseOrder = async (poId) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId || po.poNumber === poId) {
        return {
          ...po,
          status: 'Approved',
          approvalStatus: 'Approved',
          approvedBy: activeRole.name
        };
      }
      return po;
    }));

    try {
      await SCM_API.approvePurchaseOrder(poId, activeRole.name);
      fetchLiveState(true);
    } catch (err) {
      console.error('Approve PO API error:', err);
    }

    logAction('Procurement', 'PO_APPROVE', poId, `Approved Purchase Order ${poId}`);
  };

  // --------------------------------------------------------------------------
  // 3. GOODS RECEIPT NOTE (GRN) & INWARDING (Direct to Live Database)
  // --------------------------------------------------------------------------
  const createGRN = async (grnData) => {
    const grnId = grnData.id || `GRN-2026-0${Math.floor(420 + Math.random() * 80)}`;
    const newGRN = {
      ...grnData,
      id: grnId,
      grnNumber: grnData.grnNumber || grnId,
      receivedDate: grnData.receivedDate || new Date().toISOString().split('T')[0],
      stockUpdated: true
    };

    // Optimistic UI updates
    setGrns(prev => [newGRN, ...prev]);
    setPurchaseOrders(prev => prev.map(po => {
      if (po.poNumber === newGRN.poNumber || po.id === newGRN.poNumber) {
        return { ...po, status: 'Received', hasGRN: true, grnId };
      }
      return po;
    }));

    // Auto-generate Inward Supplier AP Invoice in state
    const newInvoice = {
      id: `INV-2026-0${Math.floor(905 + Math.random() * 90)}`,
      type: 'AP',
      invoiceNumber: newGRN.invoiceNumber || `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorOrCustomer: newGRN.vendorName,
      poNumber: newGRN.poNumber,
      grnNumber: grnId,
      amount: newGRN.totalAcceptedQty ? newGRN.totalAcceptedQty * 1850 : 250000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Approved for Payment',
      matchStatus: '3-Way Matched',
      matchDetails: `Verified against PO ${newGRN.poNumber} and GRN ${grnId}`
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Live API call
    try {
      await SCM_API.createGRN(newGRN);
      fetchLiveState(true);
    } catch (err) {
      console.error('Create GRN API error:', err);
    }

    logAction('Warehouse', 'GRN_INWARD', grnId, `Inwarded material for ${newGRN.vendorName} against ${newGRN.poNumber}. Live stock updated.`);
    return newGRN;
  };

  // --------------------------------------------------------------------------
  // 4. SALES ORDERS & LOGISTICS DISPATCH (Direct to Live Database)
  // --------------------------------------------------------------------------
  const createSalesOrder = async (soData) => {
    const id = soData.id || `SO-2026-1${Math.floor(191 + Math.random() * 80)}`;
    const trackingId = `SHP-2026-0${Math.floor(553 + Math.random() * 90)}`;
    const waybill = `MOTO-WB-99${Math.floor(4104 + Math.random() * 50)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const carrierName = soData.carrier || 'Motohelp Dedicated Fleet';

    const newSO = {
      ...soData,
      id,
      soNumber: soData.soNumber || id,
      orderDate: soData.orderDate || new Date().toISOString().split('T')[0],
      status: soData.status || 'Order Confirmed',
      paymentStatus: soData.paymentStatus || 'Paid',
      shipmentId: trackingId,
      carrier: carrierName
    };

    // Create initial shipment strictly at Stage 1 (Order Confirmed only, Stages 2-6 pending)
    const newShipment = {
      id: trackingId,
      waybillNumber: waybill,
      soId: id,
      soNumber: newSO.soNumber,
      customerName: newSO.customerName || currentUser?.name || 'Customer Delivery',
      origin: selectedBranch?.name || 'Bhandup Central Hub (HQ), Mumbai',
      originCoords: { lat: 19.1558, lng: 72.9372 },
      destination: newSO.shippingAddress || 'Andheri East Fleet Depot, Mumbai',
      destinationCoords: { lat: 19.1136, lng: 72.8697 },
      currentCoords: { lat: 19.1558, lng: 72.9372 },
      routeWaypoints: [
        { lat: 19.1558, lng: 72.9372, name: 'Bhandup Central Hub (HQ)' },
        { lat: 19.1415, lng: 72.9280, name: 'Kanjurmarg Toll Plaza' },
        { lat: 19.1310, lng: 72.9050, name: 'JVLR Eastern Express Corridor' },
        { lat: 19.1136, lng: 72.8697, name: 'Customer Receiving Dock' }
      ],
      carrier: carrierName,
      trackingNumber: `${carrierName.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-IN`,
      driverName: 'Santosh Gaikwad',
      vehicleNumber: 'MH-03-TR-8812',
      driverPhone: '+91 98201 99312',
      dispatchedAt: null,
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      currentLocation: 'Bhandup Central Hub — Order Verified',
      status: 'Order Confirmed',
      currentStageIndex: 0,
      telemetry: {
        speed: 0,
        heading: 0,
        fuel: '100%',
        temperature: '22°C',
        odometer: '38,100 km',
        fastagStatus: 'Awaiting Warehouse Staging'
      },
      milestones: [
        { id: 'ordered', title: 'Order Confirmed', subtitle: 'Order verified & ERP manifest generated', timestamp: `${nowDate} ${nowTime}`, completed: true },
        { id: 'packed', title: 'Picked & Staged', subtitle: 'Passed 14-point OEM friction & seal inspection', timestamp: 'Pending', completed: false },
        { id: 'dispatched', title: 'Handed Over to Carrier', subtitle: `Manifested with ${carrierName} (${newSO.vehicleNumber || 'MH-03-TR-8812'})`, timestamp: 'Pending', completed: false },
        { id: 'in_transit', title: 'In Transit & Checkpoints', subtitle: 'Highway FASTag toll checkpoint monitoring', timestamp: 'Pending', completed: false },
        { id: 'out_for_delivery', title: 'Out for Final Delivery', subtitle: 'Driver Santosh Gaikwad is on schedule', timestamp: 'Pending', completed: false },
        { id: 'delivered', title: 'Delivered & e-POD Signed', subtitle: 'Digital proof of delivery signed by consignee', timestamp: 'Pending', completed: false }
      ]
    };

    // Optimistic UI updates
    setSalesOrders(prev => [newSO, ...prev]);
    setShipments(prev => [newShipment, ...prev]);

    // Reserve stock optimistically
    if (soData.items) {
      setProducts(prev => prev.map(p => {
        const item = soData.items.find(it => it.productId === p.id || it.sku === p.sku);
        if (item) {
          return {
            ...p,
            reservedStock: (p.reservedStock || 0) + Number(item.quantity || 1),
            currentStock: Math.max(0, (p.currentStock || 0) - Number(item.quantity || 1))
          };
        }
        return p;
      }));
    }

    // Live API call
    try {
      await SCM_API.createSalesOrder(newSO);
      await SCM_API.createShipment(newShipment);
      fetchLiveState(true);
    } catch (err) {
      console.error('Create SO / Shipment API error:', err);
    }

    logAction('Sales', 'SO_CREATE', newSO.soNumber, `Booked Sales Order for ${newSO.customerName} of value ₹${Number(newSO.grandTotal || 0).toLocaleString('en-IN')} (Initial Status: Order Confirmed)`);
    return { ...newSO, shipment: newShipment };
  };

  const dispatchOrder = async (soId, carrierName = 'Motohelp Dedicated Fleet') => {
    const matchedSO = salesOrders.find(s => s.id === soId || s.soNumber === soId);
    const trackingId = matchedSO?.shipmentId || `SHP-2026-0${Math.floor(553 + Math.random() * 90)}`;
    const waybill = `MOTO-WB-99${Math.floor(4104 + Math.random() * 50)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setShipments(prev => {
      const existing = prev.find(s => s.id === trackingId || s.soId === soId || s.soNumber === soId);
      if (existing) {
        return prev.map(shp => {
          if (shp.id === existing.id) {
            const updatedMilestones = (shp.milestones || []).map((m, i) => {
              if (i <= 2) {
                return {
                  ...m,
                  completed: true,
                  timestamp: m.timestamp && m.timestamp !== 'Pending' ? m.timestamp : nowTime
                };
              }
              return m;
            });
            return {
              ...shp,
              status: 'Dispatched',
              currentStageIndex: 2,
              currentLocation: 'Central Distribution Gate 2 — Dispatched',
              milestones: updatedMilestones
            };
          }
          return shp;
        });
      }

      return prev;
    });

    setSalesOrders(prev => prev.map(so => (so.id === soId || so.soNumber === soId) ? { ...so, status: 'Dispatched', shipmentId: trackingId } : so));

    logAction('Logistics', 'DISPATCH_CONFIRMED', trackingId, `Dispatched SO ${matchedSO?.soNumber || soId} via ${carrierName} (Waybill: ${waybill})`);
  };

  const advanceShipmentMilestone = async (shipmentId) => {
    let updatedSOStatus = null;
    let targetSONumber = null;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setShipments(prev => prev.map(shp => {
      if (shp.id === shipmentId) {
        const milestones = shp.milestones || [
          { id: 'ordered', title: 'Order Confirmed', completed: true, timestamp: nowTime },
          { id: 'packed', title: 'Picked & Staged', completed: false, timestamp: 'Pending' },
          { id: 'dispatched', title: 'Handed Over to Carrier', completed: false, timestamp: 'Pending' },
          { id: 'in_transit', title: 'In Transit & Checkpoints', completed: false, timestamp: 'Pending' },
          { id: 'out_for_delivery', title: 'Out for Final Delivery', completed: false, timestamp: 'Pending' },
          { id: 'delivered', title: 'Delivered & e-POD Signed', completed: false, timestamp: 'Pending' }
        ];

        const nextIdx = milestones.findIndex(m => !m.completed);
        if (nextIdx === -1) return shp; // Already 100% delivered

        const updatedMilestones = milestones.map((m, i) => {
          if (i === nextIdx) {
            return {
              ...m,
              completed: true,
              timestamp: nowTime
            };
          }
          return m;
        });

        // Map milestone index to status
        let newStatus = 'Order Confirmed';
        let newLocation = shp.currentLocation;
        let speed = 0;

        if (nextIdx === 1) {
          newStatus = 'Picked & Staged';
          newLocation = 'Warehouse Staging Dock #4 (Inspection Passed)';
        } else if (nextIdx === 2) {
          newStatus = 'Dispatched';
          newLocation = 'Central Distribution Gate 2 (Carrier Handover)';
        } else if (nextIdx === 3) {
          newStatus = 'In Transit';
          newLocation = 'Eastern Express Highway Checkpoint (FASTag Verified)';
          speed = 58;
        } else if (nextIdx === 4) {
          newStatus = 'Out for Delivery';
          newLocation = 'Approaching Consignee Receiving Sector (~15 mins)';
          speed = 32;
        } else if (nextIdx === 5) {
          newStatus = 'Delivered';
          newLocation = 'Destination Receiving Dock (e-POD Verified)';
          speed = 0;
        }

        updatedSOStatus = newStatus;
        targetSONumber = shp.soNumber;

        return {
          ...shp,
          status: newStatus,
          currentLocation: newLocation,
          currentStageIndex: nextIdx,
          telemetry: {
            ...shp.telemetry,
            speed: speed,
            fastagStatus: nextIdx >= 3 ? 'Cleared FASTag Toll Checkpoint' : 'Awaiting Gate Dispatch'
          },
          milestones: updatedMilestones
        };
      }
      return shp;
    }));

    if (updatedSOStatus && targetSONumber) {
      setSalesOrders(prev => prev.map(s => s.soNumber === targetSONumber || s.id === targetSONumber ? { ...s, status: updatedSOStatus } : s));
    }

    try {
      await SCM_API.advanceShipmentMilestone(shipmentId);
      fetchLiveState(true);
    } catch (err) {
      console.error('Advance milestone API error:', err);
    }
  };

  const setShipmentStage = (shipmentId, targetStageIndex) => {
    let updatedSOStatus = null;
    let targetSONumber = null;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setShipments(prev => prev.map(shp => {
      if (shp.id === shipmentId) {
        const milestones = shp.milestones || [
          { id: 'ordered', title: 'Order Confirmed', completed: true, timestamp: nowTime },
          { id: 'packed', title: 'Picked & Staged', completed: false, timestamp: 'Pending' },
          { id: 'dispatched', title: 'Handed Over to Carrier', completed: false, timestamp: 'Pending' },
          { id: 'in_transit', title: 'In Transit & Checkpoints', completed: false, timestamp: 'Pending' },
          { id: 'out_for_delivery', title: 'Out for Final Delivery', completed: false, timestamp: 'Pending' },
          { id: 'delivered', title: 'Delivered & e-POD Signed', completed: false, timestamp: 'Pending' }
        ];

        const updatedMilestones = milestones.map((m, i) => ({
          ...m,
          completed: i <= targetStageIndex,
          timestamp: i <= targetStageIndex ? (m.timestamp && m.timestamp !== 'Pending' ? m.timestamp : nowTime) : 'Pending'
        }));

        let newStatus = 'Order Confirmed';
        let newLocation = shp.origin || 'Bhandup Central Hub';
        let speed = 0;

        if (targetStageIndex === 0) {
          newStatus = 'Order Confirmed';
          newLocation = 'Bhandup Central Hub (Order Verified)';
        } else if (targetStageIndex === 1) {
          newStatus = 'Picked & Staged';
          newLocation = 'Warehouse Staging Dock #4';
        } else if (targetStageIndex === 2) {
          newStatus = 'Dispatched';
          newLocation = 'Central Distribution Gate 2';
        } else if (targetStageIndex === 3) {
          newStatus = 'In Transit';
          newLocation = 'Eastern Express Highway Toll';
          speed = 58;
        } else if (targetStageIndex === 4) {
          newStatus = 'Out for Delivery';
          newLocation = 'Approaching Receiving Dock';
          speed = 30;
        } else if (targetStageIndex === 5) {
          newStatus = 'Delivered';
          newLocation = 'Destination Receiving Dock';
          speed = 0;
        }

        updatedSOStatus = newStatus;
        targetSONumber = shp.soNumber;

        return {
          ...shp,
          status: newStatus,
          currentLocation: newLocation,
          currentStageIndex: targetStageIndex,
          telemetry: {
            ...shp.telemetry,
            speed: speed
          },
          milestones: updatedMilestones
        };
      }
      return shp;
    }));

    if (updatedSOStatus && targetSONumber) {
      setSalesOrders(prev => prev.map(s => s.soNumber === targetSONumber || s.id === targetSONumber ? { ...s, status: updatedSOStatus } : s));
    }
    logAction('Logistics', 'SHIPMENT_UPDATE', shipmentId, `Updated tracking stage to index ${targetStageIndex} for ${shipmentId}`);
  };

  const toggleShipmentMilestone = (shipmentId, milestoneIndex) => {
    let updatedSOStatus = null;
    let targetSONumber = null;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setShipments(prev => prev.map(shp => {
      if (shp.id === shipmentId) {
        const milestones = shp.milestones || [];
        const updatedMilestones = milestones.map((m, i) => {
          if (i === milestoneIndex) {
            const nextCompleted = !m.completed;
            return {
              ...m,
              completed: nextCompleted,
              timestamp: nextCompleted ? (m.timestamp && m.timestamp !== 'Pending' ? m.timestamp : nowTime) : 'Pending'
            };
          }
          return m;
        });

        const highestCompletedIdx = updatedMilestones.map((m, idx) => m.completed ? idx : -1).reduce((max, cur) => Math.max(max, cur), -1);

        let newStatus = 'Order Confirmed';
        let newLocation = shp.currentLocation || shp.origin;
        let speed = 0;

        if (highestCompletedIdx <= 0) {
          newStatus = 'Order Confirmed';
          newLocation = shp.origin ? `${shp.origin} (Order Verified)` : 'Bhandup Central Hub (HQ)';
          speed = 0;
        } else if (highestCompletedIdx === 1) {
          newStatus = 'Picked & Staged';
          newLocation = 'Warehouse Staging Dock #4';
          speed = 0;
        } else if (highestCompletedIdx === 2) {
          newStatus = 'Dispatched';
          newLocation = 'Central Distribution Gate 2';
          speed = 0;
        } else if (highestCompletedIdx === 3) {
          newStatus = 'In Transit';
          newLocation = 'Highway Toll Corridor Checkpoint';
          speed = 58;
        } else if (highestCompletedIdx === 4) {
          newStatus = 'Out for Delivery';
          newLocation = 'Approaching Consignee Gate';
          speed = 30;
        } else if (highestCompletedIdx >= 5) {
          newStatus = 'Delivered';
          newLocation = shp.destination ? `${shp.destination} (e-POD Verified)` : 'Destination Receiving Dock';
          speed = 0;
        }

        updatedSOStatus = newStatus;
        targetSONumber = shp.soNumber;

        return {
          ...shp,
          status: newStatus,
          currentLocation: newLocation,
          currentStageIndex: highestCompletedIdx,
          telemetry: {
            ...shp.telemetry,
            speed: speed
          },
          milestones: updatedMilestones
        };
      }
      return shp;
    }));

    if (updatedSOStatus && targetSONumber) {
      setSalesOrders(prev => prev.map(s => s.soNumber === targetSONumber || s.id === targetSONumber ? { ...s, status: updatedSOStatus } : s));
    }
    logAction('Logistics', 'MILESTONE_TOGGLE', shipmentId, `Toggled milestone step #${milestoneIndex + 1} for ${shipmentId}`);
  };

  const addCustomShipmentMilestone = (shipmentId, newMilestone) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatted = {
      id: `step_${Date.now()}`,
      title: newMilestone.title || 'Custom Milestone Checkpoint',
      subtitle: newMilestone.subtitle || newMilestone.location || 'Logged by logistics coordinator',
      timestamp: newMilestone.completed ? (newMilestone.timestamp || nowTime) : 'Pending',
      completed: !!newMilestone.completed,
      isCustom: true
    };

    setShipments(prev => prev.map(shp => {
      if (shp.id === shipmentId) {
        const milestones = shp.milestones || [];
        const insertIdx = milestones.length > 2 ? milestones.length - 2 : milestones.length;
        const updated = [...milestones];
        updated.splice(insertIdx, 0, formatted);
        return {
          ...shp,
          milestones: updated
        };
      }
      return shp;
    }));

    logAction('Logistics', 'MILESTONE_ADD', shipmentId, `Added custom delivery milestone '${formatted.title}' to ${shipmentId}`);
  };

  const removeShipmentMilestone = (shipmentId, milestoneIndex) => {
    setShipments(prev => prev.map(shp => {
      if (shp.id === shipmentId) {
        const updated = (shp.milestones || []).filter((_, idx) => idx !== milestoneIndex);
        return { ...shp, milestones: updated };
      }
      return shp;
    }));
  };

  const resetShipmentTracking = (shipmentId) => {
    setShipmentStage(shipmentId, 0);
  };

  // --------------------------------------------------------------------------
  // RMA / RETURNS & WARRANTY CLAIMS MANAGEMENT
  // --------------------------------------------------------------------------
  const createRMARequest = (rmaData) => {
    setReturns(prev => [rmaData, ...prev]);
    logAction('Sales', 'RMA_CREATED', rmaData.id, `Created return/warranty claim for ${rmaData.itemName} on order ${rmaData.soNumber}`);
  };

  const updateRMAStatus = (rmaId, newStatus) => {
    setReturns(prev => prev.map(r => r.id === rmaId ? { ...r, status: newStatus } : r));
    logAction('Logistics', 'RMA_STATUS_UPDATE', rmaId, `Updated RMA ${rmaId} status to ${newStatus}`);
  };

  // --------------------------------------------------------------------------
  // AUTOMATED PURCHASE REORDER (SAFETY STOCK TRIGGER)
  // --------------------------------------------------------------------------
  const triggerAutoReorder = (product) => {
    const reorderQty = Math.max(50, (product.safetyStock || 25) * 2);
    const newPO = {
      poNumber: `PO-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: product.supplierId || 'SUP-001',
      supplierName: product.primarySupplier || 'Brembo India Automotive Pvt Ltd',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          quantity: reorderQty,
          unitPrice: product.purchasePrice || Math.round(product.sellingPrice * 0.75),
          total: reorderQty * (product.purchasePrice || Math.round(product.sellingPrice * 0.75))
        }
      ],
      totalAmount: reorderQty * (product.purchasePrice || Math.round(product.sellingPrice * 0.75)),
      status: 'Draft',
      notes: `Automated Reorder Triggered: Current stock (${product.currentStock}) fell below safety threshold (${product.safetyStock || 25})`
    };

    createPurchaseOrder(newPO);
    logAction('Procurement', 'AUTO_PO_TRIGGER', newPO.poNumber, `Drafted automated reorder PO for ${product.name} (Qty: ${reorderQty})`);
    return newPO;
  };

  // --------------------------------------------------------------------------
  // 5. INVOICES & 3-WAY MATCH SETTLEMENT (Direct to Live Database)
  // --------------------------------------------------------------------------
  const recordInvoicePayment = async (invoiceId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'Paid in Full' };
      }
      return inv;
    }));

    try {
      await SCM_API.settleInvoicePayment(invoiceId);
      fetchLiveState(true);
    } catch (err) {
      console.error('Settle invoice API error:', err);
    }

    logAction('Finance', 'PAYMENT_SETTLED', invoiceId, `Recorded complete payment clearance for invoice ${invoiceId}`);
  };

  // --------------------------------------------------------------------------
  // 6. SUPPLIERS & CUSTOMERS (Direct to Live Database)
  // --------------------------------------------------------------------------
  const addSupplier = async (supplierData) => {
    const id = supplierData.id || `SUP-0${Math.floor(10 + Math.random() * 90)}`;
    const newSup = { ...supplierData, id };
    setSuppliers(prev => [newSup, ...prev]);

    try {
      await SCM_API.addSupplier(newSup);
      fetchLiveState(true);
    } catch (err) {
      console.error('Add supplier API error:', err);
    }

    logAction('Procurement', 'VENDOR_ONBOARD', id, `Onboarded live vendor ${supplierData.name}`);
    return newSup;
  };

  const addCustomer = async (customerData) => {
    const id = customerData.id || `CUST-0${Math.floor(10 + Math.random() * 90)}`;
    const newCust = { ...customerData, id };
    setCustomers(prev => [newCust, ...prev]);

    try {
      await SCM_API.addCustomer(newCust);
      fetchLiveState(true);
    } catch (err) {
      console.error('Add customer API error:', err);
    }

    logAction('Sales', 'CUSTOMER_ONBOARD', id, `Onboarded live client ${customerData.name}`);
    return newCust;
  };

  // --------------------------------------------------------------------------
  // 7. SYSTEM RESET (Resets Live SQLite Database)
  // --------------------------------------------------------------------------
  const resetDatabase = async () => {
    localStorage.clear();
    try {
      await SCM_API.resetDatabase();
      await fetchLiveState();
      logAction('Governance', 'SYSTEM_RESET', 'MOTOHELP_DB', 'Live SQLite master database restored to clean state');
    } catch (err) {
      console.warn('Backend reset error, restoring state:', err);
      setProducts(INITIAL_PRODUCTS);
      setSuppliers(INITIAL_SUPPLIERS);
      setCustomers(INITIAL_CUSTOMERS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setGrns(INITIAL_GRNS);
      setSalesOrders(INITIAL_SALES_ORDERS);
      setShipments(INITIAL_SHIPMENTS);
      setInvoices(INITIAL_INVOICES);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setBranches(INITIAL_BRANCHES);
    }
  };

  return (
    <SCMContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        SUPER_ADMIN_EMAIL,
        activePortal,
        setActivePortal,
        SCM_PORTALS,
        switchRole,
        isClerkLoaded,
        isClerkSignedIn,
        clerkUser,
        login,
        logout,
        activeModule,
        setActiveModule: safeSetActiveModule,
        selectedBranch,
        setSelectedBranch,
        activeRole,
        setActiveRole,
        searchQuery,
        setSearchQuery,
        // Live Database Status
        isLiveConnected,
        dbStatus,
        latency,
        lastSyncedAt,
        isSyncing,
        syncError,
        fetchLiveState,
        // Collections
        branches,
        products,
        suppliers,
        customers,
        purchaseOrders,
        grns,
        salesOrders,
        shipments,
        invoices,
        auditLogs,
        notifications,
        setNotifications,
        returns,
        // E-Commerce Cart & Wishlist (Myntra / Ajio Superstore)
        cart,
        setCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartItemsCount,
        wishlist,
        setWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        // Live Mutation Methods
        addProduct,
        bulkImportProducts,
        updateProduct,
        adjustStock,
        transferStock,
        createPurchaseOrder,
        approvePurchaseOrder,
        createGRN,
        createSalesOrder,
        dispatchOrder,
        advanceShipmentMilestone,
        setShipmentStage,
        toggleShipmentMilestone,
        addCustomShipmentMilestone,
        removeShipmentMilestone,
        resetShipmentTracking,
        createRMARequest,
        updateRMAStatus,
        triggerAutoReorder,
        recordInvoicePayment,
        addSupplier,
        addCustomer,
        resetDatabase,
        logAction
      }}
    >
      {children}
    </SCMContext.Provider>
  );
};

export const useSCM = () => {
  const context = useContext(SCMContext);
  if (!context) {
    throw new Error('useSCM must be used within a SCMProvider');
  }
  return context;
};
