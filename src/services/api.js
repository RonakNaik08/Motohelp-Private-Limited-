// Motohelp SCM — Enterprise Live REST API Client connecting to Express/SQLite Backend (Port 5050)

const API_BASE_URL = 'http://localhost:5050/api';

const getAuthHeaders = async () => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    // 1. Prioritize authentic Clerk JWT Session Token if signed in
    if (window?.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        return headers;
      }
    }
  } catch (err) {
    console.warn('[API Auth] Clerk session token retrieval notice:', err);
  }

  // 2. Development offline demo token
  try {
    const raw = localStorage.getItem('MOTOHELP_SCM_AUTH_USER');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.email) {
        const email = encodeURIComponent((user.email || '').trim().toLowerCase());
        const role = encodeURIComponent(user.role || user.roleType || 'customer');
        headers['Authorization'] = `Bearer SCM-DEMO-${email}-${role}`;
      }
    }
  } catch {}

  return headers;
};

const secureFetch = async (endpoint, options = {}) => {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(errText);
    } catch {
      parsed = { error: errText };
    }
    throw new Error(parsed.message || parsed.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

export const SCM_API = {
  // 1. Health & System Metrics
  getHealth: async () => {
    const start = performance.now();
    const data = await secureFetch('/health');
    const latencyMs = Math.round(performance.now() - start);
    return { ...data, latencyMs };
  },

  getKPIs: async () => {
    return secureFetch('/kpis');
  },

  // 2. Products & Inventory
  getProducts: async () => {
    return secureFetch('/products');
  },

  addProduct: async (productData) => {
    return secureFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  bulkImportProducts: async (products) => {
    return secureFetch('/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  },

  adjustStock: async (productId, deltaQty, reason) => {
    return secureFetch(`/products/${productId}/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ deltaQty, reason })
    });
  },

  // 3. Suppliers & Customers
  getSuppliers: async () => {
    return secureFetch('/suppliers');
  },

  addSupplier: async (supplierData) => {
    return secureFetch('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },

  getCustomers: async () => {
    return secureFetch('/customers');
  },

  addCustomer: async (customerData) => {
    return secureFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  // 4. Branches
  getBranches: async () => {
    return secureFetch('/branches');
  },

  // 5. Procurement (Purchase Orders)
  getPurchaseOrders: async () => {
    return secureFetch('/purchase-orders');
  },

  createPurchaseOrder: async (poData) => {
    return secureFetch('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(poData)
    });
  },

  approvePurchaseOrder: async (poId, approvedBy) => {
    return secureFetch(`/purchase-orders/${poId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy })
    });
  },

  // 6. Goods Receipt Notes (GRN)
  getGRNs: async () => {
    return secureFetch('/grns');
  },

  createGRN: async (grnData) => {
    return secureFetch('/grns', {
      method: 'POST',
      body: JSON.stringify(grnData)
    });
  },

  // 7. Sales Orders
  getSalesOrders: async () => {
    return secureFetch('/sales-orders');
  },

  createSalesOrder: async (soData) => {
    return secureFetch('/sales-orders', {
      method: 'POST',
      body: JSON.stringify(soData)
    });
  },

  // 8. Shipments & 3PL Tracking
  getShipments: async () => {
    return secureFetch('/shipments');
  },

  createShipment: async (shipmentData) => {
    return secureFetch('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  },

  advanceShipmentMilestone: async (shipmentId) => {
    return secureFetch(`/shipments/${shipmentId}/advance`, {
      method: 'PUT'
    });
  },

  // 9. Invoices & 3-Way Matching
  getInvoices: async () => {
    return secureFetch('/invoices');
  },

  matchInvoice: async (invoiceId) => {
    return secureFetch(`/invoices/${invoiceId}/match`, {
      method: 'PUT'
    });
  },

  settleInvoicePayment: async (invoiceId, paymentData = {}) => {
    return secureFetch(`/invoices/${invoiceId}/pay`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  },

  // 10. Audit Trail Logs
  getAuditLogs: async () => {
    return secureFetch('/audit-logs');
  },

  logAudit: async (auditData) => {
    return secureFetch('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(auditData)
    });
  },

  // 11. Live Database Explorer Studio (Admin Hardened)
  getDatabaseTables: async () => {
    return secureFetch('/db/tables');
  },

  getTableData: async (tableName) => {
    return secureFetch(`/db/table/${tableName}`);
  },

  runSqlQuery: async (sql) => {
    return secureFetch('/db/query', {
      method: 'POST',
      body: JSON.stringify({ sql })
    });
  },

  resetDatabase: async () => {
    return secureFetch('/db/reset', {
      method: 'POST'
    });
  }
};
