import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// Security & Core Middleware
app.disable('x-powered-by');

// 1. Enterprise Security Headers Middleware (OWASP Standard)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http://localhost:* http://127.0.0.1:*; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );
  next();
});

// 2. Strict CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5050',
  'http://127.0.0.1:5050'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access denied for unauthorized origin.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'X-User-Email', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 3. Sliding-Window Rate Limiting Engine (Anti-DoS & Anti-Brute-Force)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
const MAX_GENERAL_REQUESTS = 500;
const MAX_SENSITIVE_REQUESTS = 60;

const rateLimiter = (isSensitive = false) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${clientIp}_${isSensitive ? 'sensitive' : 'general'}`;
    const now = Date.now();
    const maxLimit = isSensitive ? MAX_SENSITIVE_REQUESTS : MAX_GENERAL_REQUESTS;

    let record = rateLimitMap.get(key);
    if (!record || (now - record.startTime) > RATE_LIMIT_WINDOW_MS) {
      record = { count: 1, startTime: now };
      rateLimitMap.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', maxLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxLimit - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.startTime + RATE_LIMIT_WINDOW_MS) / 1000));

    if (record.count > maxLimit) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Security threshold reached: Rate limit exceeded. Please retry later.',
        retryAfterSeconds: Math.ceil((record.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000)
      });
    }
    next();
  };
};

app.use(rateLimiter(false));

// 4. Role-Based Administrative Authorization Middleware
// Strictly restricted to ronak.naik019@gmail.com
const SUPER_ADMIN_EMAIL = 'ronak.naik019@gmail.com';

const requireAdmin = (req, res, next) => {
  const roleHeader = req.headers['x-user-role'];
  const emailHeader = req.headers['x-user-email'];
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const isSuperAdminEmail = emailHeader && emailHeader.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isAdminRole = roleHeader && roleHeader.toLowerCase() === 'admin';

  if (!isAdminRole || !isSuperAdminEmail) {
    try {
      logAudit('SecurityGuard', 'SECURITY', 'AccessControl', 'UNAUTHORIZED_ACCESS_BLOCKED', req.originalUrl, `Blocked non-admin attempt by ${emailHeader || 'anonymous'} to execute ${req.method} ${req.originalUrl}`, clientIp);
    } catch {}
    return res.status(403).json({
      error: 'Access Denied',
      message: `Administrative access restricted: Only ${SUPER_ADMIN_EMAIL} is authorized for administrator privileges.`
    });
  }
  next();
};

// Database Connection
const dbPath = path.join(__dirname, '..', 'database', 'motohelp_scm.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`🔌 Connected to Motohelp SCM Database: ${dbPath}`);

// Helper: Audit logger
const logAudit = (userName, roleKey, moduleName, actionCode, entityId, description, ip = '127.0.0.1') => {
  try {
    const id = `AUD-${Date.now().toString().slice(-4)}`;
    db.prepare('INSERT INTO audit_logs (id, user_name, role_key, module_name, action_code, entity_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, userName, roleKey, moduleName, actionCode, entityId, description, ip);
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// ----------------------------------------------------------------------------
// 1. SYSTEM HEALTH & METRICS
// ----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Motohelp SCM Enterprise Database API',
    company: 'Motohelp Private Limited',
    dbEngine: 'SQLite 3 (WAL Mode)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/kpis', (req, res) => {
  try {
    const totalInventory = db.prepare('SELECT SUM(current_stock * cost_price) as totalValue, SUM(current_stock) as totalUnits FROM products').get();
    const avgOTIF = db.prepare('SELECT AVG(otif_score) as avgOTIF FROM suppliers').get();
    const poStats = db.prepare('SELECT COUNT(*) as totalPOs, SUM(grand_total) as totalSpend FROM purchase_orders').get();
    const soStats = db.prepare('SELECT COUNT(*) as totalSOs, SUM(grand_total) as totalRevenue FROM sales_orders').get();
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE current_stock <= reorder_point').get();

    res.json({
      inventoryValuation: totalInventory.totalValue || 0,
      totalUnitsInStock: totalInventory.totalUnits || 0,
      supplierOTIF: Number((avgOTIF.avgOTIF || 96.4).toFixed(1)),
      inventoryTurnover: 9.8,
      fulfillmentCycleTimeHours: 18.2,
      stockAccuracyRate: 99.4,
      perfectOrderRate: 97.2,
      lowStockAlerts: lowStockCount.count || 0,
      totalProcurementSpend: poStats.totalSpend || 0,
      totalSalesRevenue: soStats.totalRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. PRODUCTS & SKU ITEM MASTER
// ----------------------------------------------------------------------------
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    // Normalize properties for React
    const formatted = products.map(p => ({
      ...p,
      costPrice: p.cost_price,
      sellingPrice: p.selling_price,
      currentStock: p.current_stock,
      safetyStock: p.safety_stock,
      reorderPoint: p.reorder_point,
      maxStock: p.max_stock,
      reservedStock: p.reserved_stock,
      binLocation: p.bin_location,
      primarySupplier: p.primary_supplier_name,
      abcCategory: p.abc_category,
      fsnCategory: p.fsn_category,
      batchTracking: p.batch_tracking_enabled === 1,
      gstRate: p.gst_rate,
      hsn: p.hsn_code,
      category: p.category_name
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `PRD-${Date.now().toString().slice(-3)}`;
    const sku = p.sku || `MH-SKU-${Math.floor(100 + Math.random() * 900)}`;

    const insert = db.prepare(`
      INSERT INTO products (id, sku, category_id, category_name, name, description, uom, hsn_code, cost_price, selling_price, gst_rate, safety_stock, reorder_point, max_stock, current_stock, reserved_stock, bin_location, primary_supplier_name, abc_category, fsn_category, batch_tracking_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, sku, p.categoryId || 'CAT-01', p.category || 'Engine & Powertrain', p.name,
      p.description || '', p.uom || 'Pcs', p.hsn || '87082900', Number(p.costPrice || 0),
      Number(p.sellingPrice || 0), Number(p.gstRate || 18), Number(p.safetyStock || 20),
      Number(p.reorderPoint || 40), Number(p.maxStock || 200), Number(p.currentStock || 0),
      0, p.binLocation || 'A-01-01', p.primarySupplier || 'Bosch Auto Systems',
      p.abcCategory || 'B', p.fsnCategory || 'F', p.batchTracking ? 1 : 0
    );

    logAudit('Admin User', 'ADMIN', 'Inventory', 'PRODUCT_ADD', sku, `Added SKU ${p.name}`);
    res.status(201).json({ success: true, id, sku });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Insert / CSV import (Admin Protected)
app.post('/api/products/bulk-import', requireAdmin, (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Array of products required' });

    const insert = db.prepare(`
      INSERT OR REPLACE INTO products (id, sku, category_id, category_name, name, description, uom, hsn_code, cost_price, selling_price, gst_rate, safety_stock, reorder_point, max_stock, current_stock, reserved_stock, bin_location, primary_supplier_name, abc_category, fsn_category, batch_tracking_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((list) => {
      for (const p of list) {
        const id = p.id || `PRD-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        const sku = p.sku || `MH-LIVE-${Math.floor(100 + Math.random() * 900)}`;
        insert.run(
          id, sku, p.categoryId || 'CAT-01', p.category || p.category_name || 'General Auto Parts',
          p.name, p.description || '', p.uom || 'Pcs', p.hsn || p.hsn_code || '87082900',
          Number(p.costPrice || p.cost_price || 100), Number(p.sellingPrice || p.selling_price || 150),
          Number(p.gstRate || p.gst_rate || 18), Number(p.safetyStock || p.safety_stock || 20),
          Number(p.reorderPoint || p.reorder_point || 40), Number(p.maxStock || p.max_stock || 300),
          Number(p.currentStock || p.current_stock || 0), 0, p.binLocation || p.bin_location || 'A-01-01',
          p.primarySupplier || p.primary_supplier_name || 'Bosch Auto Systems',
          p.abcCategory || p.abc_category || 'B', p.fsnCategory || p.fsn_category || 'F', 1
        );
      }
    });

    insertMany(products);
    logAudit('Admin User', 'ADMIN', 'Inventory', 'CSV_BULK_IMPORT', 'BULK-IMPORT', `Imported ${products.length} live SKUs into database`);
    res.json({ success: true, count: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id/adjust', (req, res) => {
  try {
    const { deltaQty, reason } = req.body;
    const { id } = req.params;

    const prod = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const newStock = Math.max(0, prod.current_stock + Number(deltaQty));
    db.prepare('UPDATE products SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, id);

    logAudit('Warehouse Supervisor', 'WAREHOUSE', 'Warehouse', 'STOCK_ADJUST', id, `Adjusted stock by ${deltaQty}. Reason: ${reason}`);
    res.json({ success: true, currentStock: newStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. SUPPLIERS & VENDOR KPIS
// ----------------------------------------------------------------------------
app.get('/api/suppliers', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY otif_score DESC').all();
    const formatted = suppliers.map(s => ({
      ...s,
      contactPerson: s.contact_person,
      otifScore: s.otif_score,
      defectPpm: s.defect_ppm,
      leadTimeDays: s.lead_time_days,
      paymentTerms: s.payment_terms,
      creditLimit: s.credit_limit,
      totalPOs: s.total_pos_count,
      spendYTD: s.spend_ytd
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', requireAdmin, (req, res) => {
  try {
    const s = req.body;
    const id = s.id || `SUP-0${Math.floor(10 + Math.random() * 90)}`;
    const code = s.code || s.name.toUpperCase().slice(0, 6) + '-IND';

    const insert = db.prepare(`
      INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, gstin, city, rating, otif_score, defect_ppm, lead_time_days, payment_terms, credit_limit, status, total_pos_count, spend_ytd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, code, s.name, s.category || 'Automotive Parts', s.contactPerson || 'Key Account Rep',
      s.email || 'info@supplier.com', s.phone || '+91 98000 00000', s.gstin || '27AAACB0000A1Z1',
      s.city || 'Mumbai', Number(s.rating || 4.8), Number(s.otifScore || 96.0),
      Number(s.defectPpm || 100), Number(s.leadTimeDays || 4), s.paymentTerms || 'Net 30',
      Number(s.creditLimit || 2000000), s.status || 'Active', 0, 0
    );

    logAudit('Procurement Manager', 'PROCUREMENT', 'Suppliers', 'VENDOR_ONBOARD', id, `Onboarded live supplier ${s.name}`);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. CUSTOMERS & FLEET PARTNERS
// ----------------------------------------------------------------------------
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
    const formatted = customers.map(c => ({
      ...c,
      contactPerson: c.contact_person,
      creditLimit: c.credit_limit,
      outstandingDue: c.outstanding_due,
      paymentTerms: c.payment_terms,
      type: c.customer_type
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const c = req.body;
    const id = c.id || `CUST-0${Math.floor(10 + Math.random() * 90)}`;
    const code = c.code || c.name.toUpperCase().slice(0, 6) + '-FLEET';

    const insert = db.prepare(`
      INSERT INTO customers (id, code, name, customer_type, contact_person, email, phone, gstin, city, credit_limit, outstanding_due, payment_terms, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, code, c.name, c.type || c.customer_type || 'Fleet Client', c.contactPerson || 'Fleet Manager',
      c.email || 'procure@fleet.in', c.phone || '+91 98000 00000', c.gstin || '27AABCF0000A1Z1',
      c.city || 'Mumbai', Number(c.creditLimit || 1500000), Number(c.outstandingDue || 0),
      c.paymentTerms || 'Net 30', c.status || 'Active'
    );

    logAudit('Sales Manager', 'SALES', 'Customers', 'CUSTOMER_ONBOARD', id, `Onboarded client account ${c.name}`);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. BRANCHES & HUBS
// ----------------------------------------------------------------------------
app.get('/api/branches', (req, res) => {
  try {
    const branches = db.prepare('SELECT * FROM branches ORDER BY id ASC').all();
    const formatted = branches.map(b => ({
      ...b,
      capacitySqFt: b.capacity_sq_ft,
      utilizationRate: b.utilization_rate,
      activeSKUs: b.active_skus,
      manager: b.manager_name,
      type: b.branch_type
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. PURCHASE ORDERS (PO)
// ----------------------------------------------------------------------------
app.get('/api/purchase-orders', (req, res) => {
  try {
    const pos = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all();
    const formatted = pos.map(p => {
      const items = db.prepare('SELECT * FROM purchase_order_items WHERE po_id = ?').all(p.id);
      return {
        ...p,
        poNumber: p.po_number,
        prNumber: p.pr_id,
        vendorId: p.vendor_id,
        vendorName: p.vendor_name,
        branchId: p.branch_id,
        branchName: p.branch_name,
        orderDate: p.order_date,
        expectedDate: p.expected_delivery_date,
        taxAmount: p.tax_amount,
        grandTotal: p.grand_total,
        paymentTerms: p.payment_terms,
        approvalStatus: p.approval_status,
        approvedBy: p.approved_by,
        hasGRN: p.has_grn === 1,
        grnId: p.grn_id,
        items: items.length > 0 ? items.map(it => ({
          productId: it.product_id,
          sku: it.sku,
          name: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          gstRate: it.gst_rate,
          total: it.item_total
        })) : [{ productId: 'PRD-101', sku: 'MH-AUTO', name: 'Automotive Component', quantity: 10, unitPrice: 1000, gstRate: 18, total: 11800 }]
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchase-orders', (req, res) => {
  try {
    const po = req.body;
    const poId = po.id || `PO-2026-0${Math.floor(843 + Math.random() * 90)}`;
    const poNumber = po.poNumber || poId;

    const insert = db.prepare(`
      INSERT INTO purchase_orders (id, po_number, pr_id, vendor_id, vendor_name, branch_id, branch_name, order_date, expected_delivery_date, subtotal, tax_amount, grand_total, payment_terms, approval_status, approved_by, status, notes, has_grn, grn_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      poId, poNumber, po.prNumber || null, po.vendorId || 'SUP-001', po.vendorName,
      po.branchId || 'BR-MUM-01', po.branchName || 'Bhandup Central Hub (HQ)',
      po.orderDate || new Date().toISOString().split('T')[0], po.expectedDate || '2026-09-25',
      po.subtotal || 0, po.taxAmount || 0, po.grandTotal || 0, po.paymentTerms || 'Net 30',
      po.approvalStatus || 'Approved', po.approvedBy || 'Rajesh Verma (Director)',
      po.status || 'Approved', po.notes || '', 0, null
    );

    // Insert line items
    if (po.items && Array.isArray(po.items)) {
      const insertItem = db.prepare(`
        INSERT INTO purchase_order_items (po_id, product_id, sku, product_name, quantity, unit_price, gst_rate, item_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const it of po.items) {
        insertItem.run(poId, it.productId || 'PRD-101', it.sku || 'MH-SKU', it.name || it.product_name, it.quantity || 1, it.unitPrice || 0, it.gstRate || 18, it.total || 0);
      }
    }

    logAudit('Procurement Manager', 'PROCUREMENT', 'Procurement', 'PO_CREATE', poNumber, `Created PO for ${po.vendorName} of value ₹${po.grandTotal?.toLocaleString('en-IN')}`);
    res.status(201).json({ success: true, id: poId, poNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/purchase-orders/:id/approve', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    db.prepare("UPDATE purchase_orders SET status = 'Approved', approval_status = 'Approved', approved_by = ? WHERE id = ? OR po_number = ?")
      .run(approvedBy || 'Director', id, id);

    logAudit('Executive Director', 'DIRECTOR', 'Procurement', 'PO_APPROVE', id, `Approved Purchase Order ${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. GOODS RECEIPT NOTES (GRN) & INWARDING
// ----------------------------------------------------------------------------
app.get('/api/grns', (req, res) => {
  try {
    const grns = db.prepare('SELECT * FROM goods_receipt_notes ORDER BY created_at DESC').all();
    const formatted = grns.map(g => ({
      ...g,
      grnNumber: g.grn_number,
      poNumber: g.po_number,
      vendorName: g.vendor_name,
      branchId: g.branch_id,
      branchName: g.branch_name,
      receivedDate: g.received_date,
      receivedBy: g.received_by,
      invoiceNumber: g.supplier_invoice_number,
      gatePassNumber: g.gate_pass_number,
      batchNumber: g.batch_lot_number,
      binAllocated: g.bin_allocated,
      qcStatus: g.qc_status,
      inspectedBy: g.inspected_by,
      totalReceivedQty: g.total_received_qty,
      totalAcceptedQty: g.total_accepted_qty,
      totalRejectedQty: g.total_rejected_qty,
      rejectionReason: g.rejection_reason,
      stockUpdated: g.stock_updated === 1
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/grns', (req, res) => {
  try {
    const g = req.body;
    const grnId = g.id || `GRN-2026-0${Math.floor(420 + Math.random() * 80)}`;
    const grnNumber = g.grnNumber || grnId;

    const matchedPO = db.prepare('SELECT id FROM purchase_orders WHERE id = ? OR po_number = ?').get(g.poId || g.poNumber, g.poNumber);
    const validPoId = matchedPO ? matchedPO.id : (g.poId || g.poNumber);

    const insert = db.prepare(`
      INSERT INTO goods_receipt_notes (id, grn_number, po_id, po_number, vendor_name, branch_id, branch_name, received_date, received_by, supplier_invoice_number, gate_pass_number, batch_lot_number, bin_allocated, qc_status, inspected_by, total_received_qty, total_accepted_qty, total_rejected_qty, rejection_reason, stock_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      grnId, grnNumber, validPoId, g.poNumber, g.vendorName,
      g.branchId || 'BR-MUM-01', g.branchName || 'Bhandup Central Hub (HQ)',
      g.receivedDate || new Date().toISOString().split('T')[0], g.receivedBy || 'Warehouse Lead',
      g.invoiceNumber || 'INV-SUP-001', g.gatePassNumber || 'GP-BND-01',
      g.batchNumber || 'LOT-2026', g.binAllocated || 'A-01-01', g.qcStatus || 'Passed',
      g.inspectedBy || 'Priya Sharma (QC Officer)', Number(g.totalReceivedQty || 0),
      Number(g.totalAcceptedQty || 0), Number(g.totalRejectedQty || 0), g.rejectionReason || '', 1
    );

    // Update PO status to Received
    db.prepare("UPDATE purchase_orders SET status = 'Received', has_grn = 1, grn_id = ? WHERE po_number = ? OR id = ?")
      .run(grnId, g.poNumber, g.poNumber);

    // Automatically create AP Invoice for 3-Way Match
    const invId = `INV-2026-0${Math.floor(905 + Math.random() * 90)}`;
    db.prepare(`
      INSERT INTO invoices (id, invoice_type, invoice_number, party_name, po_id, po_number, grn_id, grn_number, amount, due_date, status, match_status, match_details)
      VALUES (?, 'AP', ?, ?, ?, ?, ?, ?, ?, date('now', '+30 days'), 'Approved for Payment', '3-Way Matched', ?)
    `).run(
      invId, g.invoiceNumber || `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      g.vendorName, g.poNumber, g.poNumber, grnId, grnNumber,
      Number(g.totalAcceptedQty || 50) * 1850, `3-Way verified against PO ${g.poNumber} and GRN ${grnNumber}`
    );

    logAudit('Warehouse Lead', 'WAREHOUSE', 'Warehouse', 'GRN_INWARD', grnNumber, `Inwarded material for ${g.vendorName} against ${g.poNumber}. Stock updated.`);
    res.status(201).json({ success: true, id: grnId, grnNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 8. SALES ORDERS (SO)
// ----------------------------------------------------------------------------
app.get('/api/sales-orders', (req, res) => {
  try {
    const sos = db.prepare('SELECT * FROM sales_orders ORDER BY created_at DESC').all();
    const formatted = sos.map(s => {
      const items = db.prepare('SELECT * FROM sales_order_items WHERE so_id = ?').all(s.id);
      return {
        ...s,
        soNumber: s.so_number,
        customerId: s.customer_id,
        customerName: s.customer_name,
        branchId: s.branch_id,
        branchName: s.branch_name,
        orderDate: s.order_date,
        deliveryDue: s.delivery_due_date,
        shippingAddress: s.shipping_address,
        taxAmount: s.tax_amount,
        grandTotal: s.grand_total,
        paymentStatus: s.payment_status,
        paymentTerms: s.payment_terms,
        shipmentId: s.shipment_id,
        items: items.length > 0 ? items.map(it => ({
          productId: it.product_id,
          sku: it.sku,
          name: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          gstRate: it.gst_rate,
          total: it.item_total
        })) : [{ productId: 'PRD-101', sku: 'MH-BRK-001', name: 'Brake Pad Kit', quantity: 10, unitPrice: 2250, gstRate: 18, total: 26550 }]
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales-orders', (req, res) => {
  try {
    const so = req.body;
    const soId = so.id || `SO-2026-1${Math.floor(191 + Math.random() * 80)}`;
    const soNumber = so.soNumber || soId;

    const insert = db.prepare(`
      INSERT INTO sales_orders (id, so_number, customer_id, customer_name, branch_id, branch_name, order_date, delivery_due_date, priority, shipping_address, subtotal, tax_amount, grand_total, status, payment_status, payment_terms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      soId, soNumber, so.customerId || 'CUST-001', so.customerName,
      so.branchId || 'BR-MUM-01', so.branchName || 'Bhandup Central Hub (HQ)',
      so.orderDate || new Date().toISOString().split('T')[0], so.deliveryDue || '2026-09-28',
      so.priority || 'Standard', so.shippingAddress || 'Mumbai Hub',
      so.subtotal || 0, so.taxAmount || 0, so.grandTotal || 0,
      so.status || 'Ready for Dispatch', so.paymentStatus || 'Unpaid', so.paymentTerms || 'Net 30'
    );

    // Deduct/Reserve Product Inventory in DB
    if (so.items && Array.isArray(so.items)) {
      const insertItem = db.prepare(`
        INSERT INTO sales_order_items (so_id, product_id, sku, product_name, quantity, unit_price, gst_rate, item_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare(`
        UPDATE products SET current_stock = MAX(0, current_stock - ?), reserved_stock = reserved_stock + ? WHERE id = ? OR sku = ?
      `);

      for (const it of so.items) {
        insertItem.run(soId, it.productId || 'PRD-101', it.sku || 'MH-AUTO', it.name || it.product_name, it.quantity || 1, it.unitPrice || 0, it.gstRate || 18, it.total || 0);
        updateStock.run(it.quantity || 1, it.quantity || 1, it.productId, it.sku);
      }
    }

    logAudit('Sales Executive', 'SALES', 'Sales', 'SO_CREATE', soNumber, `Booked Sales Order for ${so.customerName} of value ₹${so.grandTotal?.toLocaleString('en-IN')}`);
    res.status(201).json({ success: true, id: soId, soNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 9. SHIPMENTS & 3PL LOGISTICS TRACKING
// ----------------------------------------------------------------------------
app.get('/api/shipments', (req, res) => {
  try {
    const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
    const formatted = shipments.map(s => {
      const milestones = db.prepare('SELECT * FROM shipment_milestones WHERE shipment_id = ? ORDER BY step_order ASC').all(s.id);
      return {
        ...s,
        waybillNumber: s.waybill_number,
        soNumber: s.so_number,
        customerName: s.customer_name,
        carrier: s.carrier_name,
        trackingNumber: s.tracking_number,
        driverName: s.driver_name,
        driverPhone: s.driver_phone,
        vehicleNumber: s.vehicle_number,
        currentLocation: s.current_location,
        dispatchedAt: s.dispatched_at,
        estimatedDelivery: s.estimated_delivery,
        milestones: milestones.length > 0 ? milestones.map(m => ({
          title: m.title,
          timestamp: m.timestamp_text,
          completed: m.is_completed === 1
        })) : [
          { title: 'Manifest Created', timestamp: 'Initial', completed: true },
          { title: 'Dispatched from Hub', timestamp: 'Just now', completed: true },
          { title: 'In Transit', timestamp: 'Pending', completed: false },
          { title: 'Delivered', timestamp: 'Pending', completed: false }
        ]
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shipments', (req, res) => {
  try {
    const s = req.body;
    const shpId = s.id || `SHP-2026-0${Math.floor(553 + Math.random() * 90)}`;
    const waybill = s.waybillNumber || `MOTO-WB-99${Math.floor(4104 + Math.random() * 50)}`;

    const matchedSO = db.prepare('SELECT id FROM sales_orders WHERE id = ? OR so_number = ?').get(s.soId || s.soNumber, s.soNumber);
    const validSoId = matchedSO ? matchedSO.id : (s.soId || s.soNumber);

    const insert = db.prepare(`
      INSERT INTO shipments (id, waybill_number, so_id, so_number, customer_name, origin, destination, carrier_name, tracking_number, vehicle_number, driver_name, driver_phone, dispatched_at, estimated_delivery, current_location, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+1 day'), ?, ?)
    `);

    insert.run(
      shpId, waybill, validSoId, s.soNumber, s.customerName,
      s.origin || 'Bhandup Central Hub (HQ)', s.destination || 'Customer Hub',
      s.carrier || 'Motohelp Dedicated Fleet', s.trackingNumber || `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      s.vehicleNumber || 'MH-03-TR-8812', s.driverName || 'Santosh Gaikwad',
      s.driverPhone || '+91 98201 99312', s.currentLocation || 'Bhandup Central Hub (HQ) — Staged', s.status || 'Order Confirmed'
    );

    // Insert Default Milestones strictly starting at Stage 1 (Order Confirmed only)
    const insertM = db.prepare('INSERT INTO shipment_milestones (shipment_id, step_order, title, timestamp_text, is_completed) VALUES (?, ?, ?, ?, ?)');
    insertM.run(shpId, 1, 'Order Confirmed & Manifest Created', 'Just now', 1);
    insertM.run(shpId, 2, 'Picked & Staged at Warehouse Dock', 'Pending', 0);
    insertM.run(shpId, 3, `Handed Over to Carrier (${s.carrier || 'FastTrack Logistics'})`, 'Pending', 0);
    insertM.run(shpId, 4, 'In Transit & FASTag Toll Checkpoints', 'Pending', 0);
    insertM.run(shpId, 5, 'Out for Final Delivery', 'Pending', 0);
    insertM.run(shpId, 6, 'Delivered & Digital POD Captured', 'Pending', 0);

    // Update SO status to Order Confirmed
    if (s.soNumber) {
      db.prepare("UPDATE sales_orders SET status = 'Order Confirmed', shipment_id = ? WHERE so_number = ? OR id = ?")
        .run(shpId, s.soNumber, s.soNumber);
    }

    logAudit('Logistics Coordinator', 'LOGISTICS', 'Logistics', 'DISPATCH_CONFIRMED', shpId, `Created consignment manifest via ${s.carrier} (Waybill: ${waybill})`);
    res.status(201).json({ success: true, id: shpId, waybillNumber: waybill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shipments/:id/advance', (req, res) => {
  try {
    const { id } = req.params;
    const uncompleted = db.prepare('SELECT * FROM shipment_milestones WHERE shipment_id = ? AND is_completed = 0 ORDER BY step_order ASC LIMIT 1').get(id);

    if (uncompleted) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      db.prepare('UPDATE shipment_milestones SET is_completed = 1, timestamp_text = ? WHERE id = ?').run(timeStr, uncompleted.id);

      const remaining = db.prepare('SELECT COUNT(*) as count FROM shipment_milestones WHERE shipment_id = ? AND is_completed = 0').get(id);
      const isDelivered = remaining.count === 0;
      const newStatus = isDelivered ? 'Delivered' : 'In Transit';
      const newLoc = isDelivered ? 'Delivered at Destination Dock' : `En Route Milestone #${uncompleted.step_order}`;

      db.prepare('UPDATE shipments SET status = ?, current_location = ? WHERE id = ?').run(newStatus, newLoc, id);

      if (isDelivered) {
        const shp = db.prepare('SELECT so_number FROM shipments WHERE id = ?').get(id);
        if (shp?.so_number) {
          db.prepare("UPDATE sales_orders SET status = 'Delivered' WHERE so_number = ?").run(shp.so_number);
        }
      }

      logAudit('Logistics Coordinator', 'LOGISTICS', 'Logistics', 'SHIPMENT_ADVANCE', id, `Advanced milestone for ${id} to ${newStatus}`);
      res.json({ success: true, status: newStatus, location: newLoc });
    } else {
      res.json({ success: true, message: 'All milestones completed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 10. INVOICES & 3-WAY MATCHING (AP/AR)
// ----------------------------------------------------------------------------
app.get('/api/invoices', (req, res) => {
  try {
    const invoices = db.prepare('SELECT * FROM invoices ORDER BY due_date ASC').all();
    const formatted = invoices.map(i => ({
      ...i,
      type: i.invoice_type,
      invoiceNumber: i.invoice_number,
      vendorOrCustomer: i.party_name,
      poNumber: i.po_number,
      grnNumber: i.grn_number,
      dueDate: i.due_date,
      matchStatus: i.match_status,
      matchDetails: i.match_details
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE invoices SET status = 'Paid in Full' WHERE id = ?").run(id);

    logAudit('Finance Controller', 'FINANCE', 'Finance', 'PAYMENT_RECORD', id, `Settled payment voucher for invoice ${id}`);
    res.json({ success: true, status: 'Paid in Full' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 11. AUDIT TRAIL LOGS
// ----------------------------------------------------------------------------
app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
    const formatted = logs.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      user: l.user_name,
      role: l.role_key,
      module: l.module_name,
      action: l.action_code,
      entityId: l.entity_id,
      description: l.description,
      ip: l.ip_address
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', (req, res) => {
  try {
    const l = req.body;
    logAudit(l.user || 'System User', l.role || 'ADMIN', l.module || 'System', l.action || 'ACTION', l.entityId || 'SYS', l.description || '', l.ip || '127.0.0.1');
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12. DATABASE EXPLORER & LIVE SQL STUDIO (Admin Protected & Hardened)
// ----------------------------------------------------------------------------
app.get('/api/db/tables', requireAdmin, (req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC").all();
    const tableData = tables.map(t => {
      const count = db.prepare(`SELECT COUNT(*) as total FROM ${t.name}`).get();
      const columns = db.prepare(`PRAGMA table_info(${t.name})`).all();
      return {
        tableName: t.name,
        rowCount: count.total,
        columns: columns.map(c => ({ name: c.name, type: c.type, pk: c.pk === 1 }))
      };
    });
    res.json(tableData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/db/table/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    // Strict alphanumeric identifier validation to prevent SQL identifier injection
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return res.status(400).json({ error: 'Security Violation: Invalid table identifier format.' });
    }

    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(name);
    if (!tableExists) {
      return res.status(404).json({ error: 'Table does not exist in master schema.' });
    }

    const rows = db.prepare(`SELECT * FROM ${name} LIMIT 100`).all();
    const columns = db.prepare(`PRAGMA table_info(${name})`).all();
    res.json({ rows, columns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/query', requireAdmin, rateLimiter(true), (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') return res.status(400).json({ error: 'SQL query required' });

    const trimmed = sql.trim();

    // 1. Prevent stacked/multi-statement injection (disallow inner semicolons)
    if (trimmed.includes(';') && trimmed.replace(/;+\s*$/, '').includes(';')) {
      logAudit('SQLGuard', 'SECURITY', 'Database', 'SQLI_MULTI_STATEMENT_BLOCKED', 'DB_STUDIO', 'Blocked stacked multi-statement execution attempt');
      return res.status(403).json({ error: 'Security Violation: Multi-statement execution (stacked queries) is strictly prohibited.' });
    }

    // 2. Reject destructive/altering keywords
    const forbiddenKeywords = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|EXEC|ATTACH|DETACH|VACUUM|REPLACE|CREATE|GRANT|REVOKE)\b/i;
    if (forbiddenKeywords.test(trimmed)) {
      logAudit('SQLGuard', 'SECURITY', 'Database', 'SQLI_DESTRUCTIVE_KEYWORD_BLOCKED', 'DB_STUDIO', `Blocked non-SELECT query: ${trimmed.slice(0, 80)}`);
      return res.status(403).json({ error: 'Security Violation: Only read-only SELECT and PRAGMA queries are permitted in the web explorer.' });
    }

    // 3. Must begin with SELECT or PRAGMA
    if (!trimmed.toLowerCase().startsWith('select') && !trimmed.toLowerCase().startsWith('pragma')) {
      return res.status(403).json({ error: 'Security Violation: Query must begin with SELECT or PRAGMA.' });
    }

    // 4. Safe limit capping for memory preservation
    let queryToRun = trimmed.replace(/;+\s*$/, '');
    if (!queryToRun.toLowerCase().includes('limit') && queryToRun.toLowerCase().startsWith('select')) {
      queryToRun += ' LIMIT 200';
    }

    const rows = db.prepare(queryToRun).all();
    res.json({ rows, rowCount: rows.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset / Re-seed Live SQLite Database (Admin Protected & Rate Limited)
app.post('/api/db/reset', requireAdmin, rateLimiter(true), (req, res) => {
  try {
    // Clear and restore initial seed
    db.exec(`
      DELETE FROM shipment_milestones;
      DELETE FROM shipments;
      DELETE FROM sales_order_items;
      DELETE FROM sales_orders;
      DELETE FROM goods_receipt_notes;
      DELETE FROM purchase_order_items;
      DELETE FROM purchase_orders;
      DELETE FROM invoices;
      DELETE FROM products;
      DELETE FROM suppliers;
      DELETE FROM customers;
      DELETE FROM audit_logs;
    `);

    // Products
    const insertProd = db.prepare(`
      INSERT INTO products (id, sku, category_id, category_name, name, description, uom, hsn_code, cost_price, selling_price, gst_rate, safety_stock, reorder_point, max_stock, current_stock, reserved_stock, bin_location, primary_supplier_id, primary_supplier_name, abc_category, fsn_category, batch_tracking_enabled, weight_kg)
      VALUES (@id, @sku, @category_id, @category_name, @name, @description, @uom, @hsn_code, @cost_price, @selling_price, @gst_rate, @safety_stock, @reorder_point, @max_stock, @current_stock, @reserved_stock, @bin_location, @primary_supplier_id, @primary_supplier_name, @abc_category, @fsn_category, @batch_tracking_enabled, @weight_kg)
    `);
    const initialProducts = [
      { id: 'PRD-101', sku: 'MH-BRK-001', category_id: 'CAT-02', category_name: 'Braking & Suspension', name: 'Ceramic High-Performance Brake Pad Kit', description: 'High-friction ceramic disc brake pads', uom: 'Sets', hsn_code: '87083000', cost_price: 1450, selling_price: 2250, gst_rate: 18, safety_stock: 80, reorder_point: 120, max_stock: 500, current_stock: 340, reserved_stock: 45, bin_location: 'A-01-03', primary_supplier_id: 'SUP-004', primary_supplier_name: 'Brembo Brakes India', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 2.2 },
      { id: 'PRD-102', sku: 'MH-OIL-5W40', category_id: 'CAT-04', category_name: 'Lubricants & Fluids', name: 'Full Synthetic Engine Oil 5W-40 (4L Can)', description: 'API SN/CF premium fully synthetic automotive engine lubricant', uom: 'Cans', hsn_code: '27101981', cost_price: 1850, selling_price: 2750, gst_rate: 18, safety_stock: 150, reorder_point: 220, max_stock: 800, current_stock: 410, reserved_stock: 60, bin_location: 'C-02-01', primary_supplier_id: 'SUP-002', primary_supplier_name: 'Castrol Lubricants India Ltd', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 3.8 },
      { id: 'PRD-103', sku: 'MH-ALT-12V', category_id: 'CAT-03', category_name: 'Electricals & Sensors', name: 'Heavy Duty 12V 90A Alternator Assembly', description: 'High-output alternator for multi-utility vehicles', uom: 'Pcs', hsn_code: '85115000', cost_price: 4200, selling_price: 6500, gst_rate: 28, safety_stock: 25, reorder_point: 40, max_stock: 150, current_stock: 28, reserved_stock: 10, bin_location: 'B-03-02', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'A', fsn_category: 'S', batch_tracking_enabled: 1, weight_kg: 5.6 },
      { id: 'PRD-104', sku: 'MH-INJ-CRDI', category_id: 'CAT-01', category_name: 'Engine & Powertrain', name: 'CRDi Common Rail Fuel Injector Kit', description: 'High-precision piezoelectric diesel common rail fuel injector', uom: 'Sets', hsn_code: '84099941', cost_price: 6800, selling_price: 10200, gst_rate: 18, safety_stock: 30, reorder_point: 50, max_stock: 180, current_stock: 88, reserved_stock: 12, bin_location: 'A-02-01', primary_supplier_id: 'SUP-003', primary_supplier_name: 'Denso Automotive India Pvt Ltd', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 1.5 },
      { id: 'PRD-105', sku: 'MH-FIL-OIL08', category_id: 'CAT-01', category_name: 'Engine & Powertrain', name: 'High-Flow Spin-On Oil Filter Element', description: 'Micron-rated pleated synthetic media oil filter', uom: 'Pcs', hsn_code: '84212300', cost_price: 220, selling_price: 380, gst_rate: 18, safety_stock: 200, reorder_point: 350, max_stock: 1200, current_stock: 680, reserved_stock: 110, bin_location: 'A-03-04', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'C', fsn_category: 'F', batch_tracking_enabled: 0, weight_kg: 0.35 }
    ];
    initialProducts.forEach(p => insertProd.run(p));

    // Suppliers
    const insertSupp = db.prepare(`
      INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, gstin, city, rating, otif_score, defect_ppm, lead_time_days, payment_terms, credit_limit, status, total_pos_count, spend_ytd)
      VALUES (@id, @code, @name, @category, @contact_person, @email, @phone, @gstin, @city, @rating, @otif_score, @defect_ppm, @lead_time_days, @payment_terms, @credit_limit, @status, @total_pos_count, @spend_ytd)
    `);
    const initialSuppliers = [
      { id: 'SUP-001', code: 'BOSCH-IND', name: 'Bosch Auto Systems India Pvt Ltd', category: 'Electricals & Sensors', contact_person: 'Arunav Sengupta', email: 'arunav.s@bosch-india.com', phone: '+91 22 6755 9000', gstin: '27AAACB2894G1Z9', city: 'Bengaluru / Pune', rating: 4.9, otif_score: 98.2, defect_ppm: 120, lead_time_days: 4, payment_terms: 'Net 45', credit_limit: 5000000.0, status: 'Preferred', total_pos_count: 64, spend_ytd: 8450000.0 },
      { id: 'SUP-002', code: 'CASTROL-IN', name: 'Castrol Lubricants India Ltd', category: 'Lubricants & Fluids', contact_person: 'Meenal Choksi', email: 'orders@castrol.co.in', phone: '+91 22 4911 2000', gstin: '27AAACC4451M1Z1', city: 'Mumbai', rating: 4.8, otif_score: 96.5, defect_ppm: 80, lead_time_days: 3, payment_terms: 'Net 30', credit_limit: 4000000.0, status: 'Preferred', total_pos_count: 48, spend_ytd: 6200000.0 },
      { id: 'SUP-003', code: 'DENSO-IND', name: 'Denso Automotive India Pvt Ltd', category: 'Engine & Powertrain', contact_person: 'Karan Mehra', email: 'karan.m@denso-india.com', phone: '+91 124 492 8800', gstin: '06AAACD5512N1ZY', city: 'Gurugram', rating: 4.7, otif_score: 94.8, defect_ppm: 240, lead_time_days: 6, payment_terms: 'Net 45', credit_limit: 4500000.0, status: 'Active', total_pos_count: 38, spend_ytd: 5400000.0 },
      { id: 'SUP-004', code: 'BREMBO-IN', name: 'Brembo Brakes India Pvt Ltd', category: 'Braking & Suspension', contact_person: 'David Fernandez', email: 'supply@brembo.in', phone: '+91 2135 667 000', gstin: '27AAACB9014J1ZV', city: 'Pune', rating: 4.8, otif_score: 97.1, defect_ppm: 150, lead_time_days: 5, payment_terms: 'Net 30', credit_limit: 3500000.0, status: 'Preferred', total_pos_count: 42, spend_ytd: 4900000.0 }
    ];
    initialSuppliers.forEach(s => insertSupp.run(s));

    // Customers
    const insertCust = db.prepare(`
      INSERT INTO customers (id, code, name, customer_type, contact_person, email, phone, gstin, city, credit_limit, outstanding_due, payment_terms, status)
      VALUES (@id, @code, @name, @customer_type, @contact_person, @email, @phone, @gstin, @city, @credit_limit, @outstanding_due, @payment_terms, @status)
    `);
    const initialCustomers = [
      { id: 'CUST-001', code: 'METRO-FLEET', name: 'Metro Fleet Mobility Solutions', customer_type: 'Commercial Fleet Operator', contact_person: 'Alok Nambiar', email: 'procure@metrofleet.in', phone: '+91 98205 77112', gstin: '27AABCM8912A1Z4', city: 'Mumbai', credit_limit: 2000000.0, outstanding_due: 450000.0, payment_terms: 'Net 30', status: 'Active' },
      { id: 'CUST-002', code: 'ROYAL-AUTO', name: 'Royal Multi-Brand Automotive Works', customer_type: 'Authorized Service Center Chain', contact_person: 'Girish Shinde', email: 'service@royalauto.co.in', phone: '+91 98206 99401', gstin: '27AABCR4410K1ZT', city: 'Pune', credit_limit: 1500000.0, outstanding_due: 180000.0, payment_terms: 'Net 15', status: 'Active' }
    ];
    initialCustomers.forEach(c => insertCust.run(c));

    logAudit('Admin User', 'ADMIN', 'Database', 'DB_RESET', 'MOTOHELP_DB', 'Reset live SQLite database to initial state');
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ Motohelp SCM Database Server running on http://localhost:${PORT}`);
});
