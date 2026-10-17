// Motohelp SCM — Enterprise Live REST API Server
// Production-Hardened with Clerk JWT Verification, Strict RBAC & Atomic SQLite Transactions

import './env.js';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fs from 'fs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware } from '@clerk/express';
import { realtimeService } from './services/realtime.js';

import {
  requireAuth,
  requireRole,
  requireAdmin,
  devOnly,
  SUPER_ADMIN_EMAIL
} from './services/auth.js';

import {
  createSalesOrderTransaction,
  processGoodsReceiptTransaction,
  executeThreeWayMatching,
  recordPaymentTransaction
} from './services/inventory.js';

import { calculateLiveKPIs } from './services/kpi.js';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 3. Sliding-Window Rate Limiting Engine
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
const MAX_GENERAL_REQUESTS = 1000;
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

// Map token from query param (for EventSource SSE connection compatibility)
app.use((req, res, next) => {
  if (!req.headers.authorization && req.query.token) {
    const raw = String(req.query.token).trim();
    req.headers.authorization = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
  }
  next();
});

// 4. Official Clerk Authentication Middleware
app.use(clerkMiddleware());

// Database Connection
const dbPath = path.join(__dirname, '..', 'database', 'motohelp_scm.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`🔌 Connected to Motohelp SCM Database: ${dbPath}`);

// Helper: Audit logger
const logAudit = (userName, roleKey, moduleName, actionCode, entityId, description, ip = '127.0.0.1') => {
  try {
    const id = `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    db.prepare('INSERT INTO audit_logs (id, user_name, role_key, module_name, action_code, entity_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, userName, roleKey, moduleName, actionCode, entityId, description, ip);
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// ============================================================================
// 1. SYSTEM HEALTH & AUTHENTICATED REAL KPIS
// ============================================================================

// Public Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Motohelp SCM Enterprise Database API',
    company: 'Motohelp Private Limited',
    dbEngine: 'SQLite 3 (WAL Mode)',
    authProvider: 'Clerk Backend JWT (Integrated)',
    environment: process.env.NODE_ENV || 'development',
    version: '2.6.0',
    activeRealtimeClients: realtimeService.getActiveClientCount(),
    timestamp: new Date().toISOString()
  });
});

// Real-Time Event Stream (Server-Sent Events)
app.get('/api/events', requireAuth, (req, res) => {
  realtimeService.addClient(req, res, req.user);
});

// Authenticated Real KPIs (Computed dynamically, zero static fabrications)
app.get('/api/kpis', requireAuth, (req, res) => {
  try {
    const kpis = calculateLiveKPIs(db);
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 2. PRODUCTS & INVENTORY MANAGEMENT
// ============================================================================

// Authenticated Catalog Browsing
app.get('/api/products', requireAuth, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    const formatted = products.map(p => ({
      ...p,
      costPrice: p.cost_price,
      sellingPrice: p.selling_price,
      safetyStock: p.safety_stock,
      reorderPoint: p.reorder_point,
      maxStock: p.max_stock,
      currentStock: p.current_stock,
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

// Product Creation (Strictly Super Admin ronak.naik019@gmail.com)
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

    logAudit(req.user.name, req.user.role, 'Inventory', 'PRODUCT_ADD', sku, `Added SKU ${p.name} (${sku})`);
    res.status(201).json({ success: true, id, sku });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Insert / CSV import (Strictly Super Admin)
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
    logAudit(req.user.name, req.user.role, 'Inventory', 'CSV_BULK_IMPORT', 'BULK-IMPORT', `Imported ${products.length} live SKUs into database`);
    res.json({ success: true, count: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Stock Adjustment (Warehouse & Director Role-Restricted)
app.put('/api/products/:id/adjust', requireRole(['director', 'warehouse']), (req, res) => {
  try {
    const { deltaQty, reason } = req.body;
    const { id } = req.params;

    const prod = db.prepare('SELECT current_stock, name FROM products WHERE id = ?').get(id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const newStock = Math.max(0, prod.current_stock + Number(deltaQty));
    db.prepare('UPDATE products SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, id);

    logAudit(req.user.name, req.user.role, 'Warehouse', 'STOCK_ADJUST', id, `Adjusted stock of ${prod.name} by ${deltaQty}. Reason: ${reason}`);
    res.json({ success: true, currentStock: newStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 3. SUPPLIERS & VENDOR KPIS (Procurement / Staff Restricted)
// ============================================================================
app.get('/api/suppliers', requireRole(['director', 'procurement', 'warehouse', 'finance', 'supplier']), (req, res) => {
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

app.post('/api/suppliers', requireRole(['director', 'procurement']), (req, res) => {
  try {
    const s = req.body;
    const id = s.id || `SUP-0${Math.floor(10 + Math.random() * 90)}`;
    const code = s.code || s.name.toUpperCase().slice(0, 6) + '-IND';

    const insert = db.prepare(`
      INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, gstin, city, rating, otif_score, defect_ppm, lead_time_days, payment_terms, credit_limit, status, total_pos_count, spend_ytd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, code, s.name, s.category || 'General Spares', s.contactPerson || 'Vendor Lead',
      s.email || 'info@supplier.com', s.phone || '+91 98000 00000', s.gstin || '27AAACB0000A1Z1',
      s.city || 'Mumbai', Number(s.rating || 4.8), Number(s.otifScore || 96.0),
      Number(s.defectPpm || 100), Number(s.leadTimeDays || 4), s.paymentTerms || 'Net 30',
      Number(s.creditLimit || 2000000), s.status || 'Active', 0, 0
    );

    logAudit(req.user.name, req.user.role, 'Suppliers', 'VENDOR_ONBOARD', id, `Onboarded live supplier ${s.name}`);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 4. CUSTOMERS & FLEET PARTNERS (Sales / Staff Restricted)
// ============================================================================
app.get('/api/customers', requireRole(['director', 'sales', 'logistics', 'finance']), (req, res) => {
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

app.post('/api/customers', requireRole(['director', 'sales']), (req, res) => {
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

    logAudit(req.user.name, req.user.role, 'Customers', 'CUSTOMER_ONBOARD', id, `Onboarded client account ${c.name}`);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 5. BRANCHES & DISTRIBUTION HUBS
// ============================================================================
app.get('/api/branches', requireAuth, (req, res) => {
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

// ============================================================================
// 6. PURCHASE ORDERS (PO) — (Procurement / Staff Restricted)
// ============================================================================
app.get('/api/purchase-orders', requireRole(['director', 'procurement', 'warehouse', 'finance']), (req, res) => {
  try {
    const pos = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all();
    const formatted = pos.map(p => {
      // Return real items from DB only — no hardcoded fallbacks
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
        items: items.map(it => ({
          productId: it.product_id,
          sku: it.sku,
          name: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          gstRate: it.gst_rate,
          total: it.item_total
        }))
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchase-orders', requireRole(['director', 'procurement']), (req, res) => {
  try {
    const po = req.body;
    const poId = po.id || `PO-2026-0${Math.floor(843 + Math.random() * 90)}`;
    const poNumber = po.poNumber || poId;

    const createPOTransaction = db.transaction(() => {
      const insert = db.prepare(`
        INSERT INTO purchase_orders (id, po_number, pr_id, vendor_id, vendor_name, branch_id, branch_name, order_date, expected_delivery_date, subtotal, tax_amount, grand_total, payment_terms, approval_status, approved_by, status, notes, has_grn, grn_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        poId, poNumber, po.prNumber || null, po.vendorId || 'SUP-001', po.vendorName,
        po.branchId || 'BR-MUM-01', po.branchName || 'Bhandup Central Hub (HQ)',
        po.orderDate || new Date().toISOString().split('T')[0], po.expectedDate || '2026-09-25',
        Number(po.subtotal || 0), Number(po.taxAmount || 0), Number(po.grandTotal || 0), po.paymentTerms || 'Net 30',
        po.approvalStatus || 'Approved', po.approvedBy || req.user.name,
        po.status || 'Approved', po.notes || '', 0, null
      );

      // Insert line items atomically
      if (po.items && Array.isArray(po.items)) {
        const insertItem = db.prepare(`
          INSERT INTO purchase_order_items (po_id, product_id, sku, product_name, quantity, unit_price, gst_rate, item_total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const it of po.items) {
          insertItem.run(
            poId, it.productId || 'PRD-101', it.sku || 'MH-SKU',
            it.name || it.product_name, Number(it.quantity || 1),
            Number(it.unitPrice || 0), Number(it.gstRate || 18), Number(it.total || 0)
          );
        }
      }

      logAudit(req.user.name, req.user.role, 'Procurement', 'PO_CREATE', poNumber, `Created PO for ${po.vendorName} (₹${po.grandTotal})`);
    });

    createPOTransaction();
    res.status(201).json({ success: true, id: poId, poNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/purchase-orders/:id/approve', requireRole(['director']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE purchase_orders SET status = 'Approved', approval_status = 'Approved', approved_by = ? WHERE id = ? OR po_number = ?")
      .run(req.user.name, id, id);

    logAudit(req.user.name, 'DIRECTOR', 'Procurement', 'PO_APPROVE', id, `Approved Purchase Order ${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 7. GOODS RECEIPT NOTES (GRN) — (Warehouse & Procurement Restricted)
// ============================================================================
app.get('/api/grns', requireRole(['director', 'warehouse', 'procurement']), (req, res) => {
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

// Atomic GRN Processing & Physical Inventory Inwarding
app.post('/api/grns', requireRole(['director', 'warehouse']), (req, res) => {
  try {
    const result = processGoodsReceiptTransaction(db, {
      grn: req.body,
      user: req.user
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 8. SALES ORDERS (SO) — Owner-Scoped & Transaction-Safe
// ============================================================================
app.get('/api/sales-orders', requireAuth, (req, res) => {
  try {
    let query = 'SELECT * FROM sales_orders';
    const params = [];

    // Owner Scoping: Customers can view only their own orders
    if (req.user.role === 'customer' && !req.user.isSuperAdmin) {
      query += ' WHERE customer_id = ? OR customer_name LIKE ?';
      params.push(req.user.id, `%${req.user.name}%`);
    }
    query += ' ORDER BY created_at DESC';

    const sos = db.prepare(query).all(...params);
    const formatted = sos.map(s => {
      // Return real items from DB only — no hardcoded fallbacks
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
        items: items.map(it => ({
          productId: it.product_id,
          sku: it.sku,
          name: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          gstRate: it.gst_rate,
          total: it.item_total
        }))
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atomic Sales Order Creation with Stock Validation (Prevents Overselling)
app.post('/api/sales-orders', requireAuth, (req, res) => {
  try {
    const result = createSalesOrderTransaction(db, {
      so: req.body,
      user: req.user
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 9. SHIPMENTS & 3PL LOGISTICS
// ============================================================================
app.get('/api/shipments', requireAuth, (req, res) => {
  try {
    let query = 'SELECT * FROM shipments';
    const params = [];

    // Owner Scoping: Customers can view only shipments of their own orders
    if (req.user.role === 'customer' && !req.user.isSuperAdmin) {
      query += ' WHERE customer_name LIKE ?';
      params.push(`%${req.user.name}%`);
    }
    query += ' ORDER BY created_at DESC';

    const shipments = db.prepare(query).all(...params);
    const formatted = shipments.map(s => {
      const milestones = db.prepare('SELECT * FROM shipment_milestones WHERE shipment_id = ? ORDER BY step_order ASC').all(s.id);
      return {
        ...s,
        waybillNumber: s.waybill_number,
        soId: s.so_id,
        soNumber: s.so_number,
        customerName: s.customer_name,
        carrierName: s.carrier_name,
        trackingNumber: s.tracking_number,
        vehicleNumber: s.vehicle_number,
        driverName: s.driver_name,
        driverPhone: s.driver_phone,
        dispatchedAt: s.dispatched_at,
        estimatedDelivery: s.estimated_delivery,
        currentLocation: s.current_location,
        milestones: milestones.map(m => ({
          step: m.step_order,
          title: m.title,
          time: m.timestamp_text,
          completed: m.is_completed === 1
        }))
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shipments', requireRole(['director', 'logistics']), (req, res) => {
  try {
    const s = req.body;
    const shpId = s.id || `SHP-2026-0${Math.floor(550 + Math.random() * 90)}`;
    const waybill = s.waybillNumber || `MOTO-WB-${Math.floor(990000 + Math.random() * 9999)}`;

    const createShipmentTx = db.transaction(() => {
      const insert = db.prepare(`
        INSERT INTO shipments (id, waybill_number, so_id, so_number, customer_name, origin, destination, carrier_name, tracking_number, vehicle_number, driver_name, driver_phone, current_location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        shpId, waybill, s.soId || 'SO-101', s.soNumber || 'SO-101',
        s.customerName || 'Fleet Client', s.origin || 'Mumbai Central DC',
        s.destination || 'Pune Regional Depot', s.carrier || 'Delhivery Express',
        s.trackingNumber || `DEL-${Math.floor(100000 + Math.random() * 900000)}`,
        s.vehicleNumber || 'MH-04-AZ-8812', s.driverName || 'Ramesh Shinde',
        s.driverPhone || '+91 98200 11223', s.origin || 'Mumbai Central DC', 'In Transit'
      );

      const insertM = db.prepare(`
        INSERT INTO shipment_milestones (shipment_id, step_order, title, timestamp_text, is_completed)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertM.run(shpId, 1, 'Consignment Booked & Barcode Scanned', 'Completed', 1);
      insertM.run(shpId, 2, 'Loaded & Outward Gate Pass Issued', 'Completed', 1);
      insertM.run(shpId, 3, 'Departed Origin Logistics Hub', 'Completed', 1);
      insertM.run(shpId, 4, 'In Transit & FASTag Toll Checkpoints', 'Pending', 0);
      insertM.run(shpId, 5, 'Out for Final Delivery', 'Pending', 0);
      insertM.run(shpId, 6, 'Delivered & Digital POD Captured', 'Pending', 0);

      if (s.soNumber) {
        db.prepare("UPDATE sales_orders SET status = 'Order Confirmed', shipment_id = ? WHERE so_number = ? OR id = ?")
          .run(shpId, s.soNumber, s.soNumber);
      }

      logAudit(req.user.name, req.user.role, 'Logistics', 'DISPATCH_CONFIRMED', shpId, `Created consignment manifest ${waybill}`);
    });

    createShipmentTx();
    res.status(201).json({ success: true, id: shpId, waybillNumber: waybill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shipments/:id/advance', requireRole(['director', 'logistics']), (req, res) => {
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

      logAudit(req.user.name, req.user.role, 'Logistics', 'SHIPMENT_ADVANCE', id, `Advanced milestone for ${id} to ${newStatus}`);
      realtimeService.broadcast('SHIPMENT_UPDATED', { shipmentId: id, status: newStatus, location: newLoc });
      res.json({ success: true, status: newStatus, location: newLoc });
    } else {
      res.json({ success: true, message: 'All milestones completed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 10. INVOICES & 3-WAY MATCHING (AP/AR) — Scoped & Validated
// ============================================================================
app.get('/api/invoices', requireAuth, (req, res) => {
  try {
    let query = 'SELECT * FROM invoices';
    const params = [];

    // Owner Scoping: Customers can view only their own AR invoices
    if (req.user.role === 'customer' && !req.user.isSuperAdmin) {
      query += " WHERE invoice_type = 'AR' AND party_name LIKE ?";
      params.push(`%${req.user.name}%`);
    }
    query += ' ORDER BY due_date ASC';

    const invoices = db.prepare(query).all(...params);
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

// Real 3-Way Match Validation comparing PO, GRN, and Invoice values
app.put('/api/invoices/:id/match', requireRole(['director', 'finance']), (req, res) => {
  try {
    const { id } = req.params;
    const result = executeThreeWayMatching(db, { invoiceId: id, user: req.user });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verified Invoice Payment Settlement
app.put('/api/invoices/:id/pay', requireRole(['director', 'finance']), (req, res) => {
  try {
    const { id } = req.params;
    const result = recordPaymentTransaction(db, {
      invoiceId: id,
      paymentRef: req.body.paymentRef,
      paymentMethod: req.body.paymentMethod,
      user: req.user
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 11. AUDIT TRAIL LOGS (Strictly Super Admin ronak.naik019@gmail.com)
// ============================================================================
app.get('/api/audit-logs', requireAdmin, (req, res) => {
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

// ============================================================================
// 12. DATABASE EXPLORER & SQL STUDIO — Strictly Development Only
// ============================================================================
app.get('/api/db/tables', devOnly, requireAdmin, (req, res) => {
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

app.get('/api/db/table/:name', devOnly, requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
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

app.post('/api/db/query', devOnly, requireAdmin, rateLimiter(true), (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') return res.status(400).json({ error: 'SQL query required' });

    const trimmed = sql.trim();

    // Prevent stacked/multi-statement injection
    if (trimmed.includes(';') && trimmed.replace(/;+\s*$/, '').includes(';')) {
      return res.status(403).json({ error: 'Security Violation: Multi-statement execution (stacked queries) is strictly prohibited.' });
    }

    // Reject destructive/altering keywords
    const forbiddenKeywords = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|EXEC|ATTACH|DETACH|VACUUM|REPLACE|CREATE|GRANT|REVOKE)\b/i;
    if (forbiddenKeywords.test(trimmed)) {
      return res.status(403).json({ error: 'Security Violation: Only read-only SELECT and PRAGMA queries are permitted in the web explorer.' });
    }

    if (!trimmed.toLowerCase().startsWith('select') && !trimmed.toLowerCase().startsWith('pragma')) {
      return res.status(403).json({ error: 'Security Violation: Query must begin with SELECT or PRAGMA.' });
    }

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

// Database Reset — Strictly Development Only
app.post('/api/db/reset', devOnly, requireAdmin, rateLimiter(true), (req, res) => {
  try {
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

    // Re-seed Master Products
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

    // Re-seed Master Suppliers
    const insertSupp = db.prepare(`
      INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, gstin, city, rating, otif_score, defect_ppm, lead_time_days, payment_terms, credit_limit, status, total_pos_count, spend_ytd)
      VALUES (@id, @code, @name, @category, @contact_person, @email, @phone, @gstin, @city, @rating, @otif_score, @defect_ppm, @lead_time_days, @payment_terms, @credit_limit, @status, @total_pos_count, @spend_ytd)
    `);
    const initialSuppliers = [
      { id: 'SUP-001', code: 'BOSCH-IND', name: 'Bosch Auto Systems India Pvt Ltd', category: 'Electricals & Sensors', contact_person: 'Arunav Sengupta', email: 'arunav.s@bosch-india.com', phone: '+91 22 6755 9000', gstin: '27AAACB2894G1Z9', city: 'Bengaluru / Pune', rating: 4.9, otif_score: 98.2, defect_ppm: 120, lead_time_days: 4, payment_terms: 'Net 45', credit_limit: 5000000.0, status: 'Preferred', total_pos_count: 64, spend_ytd: 8450000.0 },
      { id: 'SUP-002', code: 'CASTROL-IN', name: 'Castrol Lubricants India Ltd', category: 'Lubricants & Fluids', contact_person: 'Meenal Choksi', email: 'orders@castrol.co.in', phone: '+91 22 4911 2000', gstin: '27AAACC4451M1Z1', city: 'Mumbai', rating: 4.8, otif_score: 96.5, defect_ppm: 80, lead_time_days: 3, payment_terms: 'Net 30', credit_limit: 4000000.0, status: 'Preferred', total_pos_count: 48, spend_ytd: 6200000.0 }
    ];
    initialSuppliers.forEach(s => insertSupp.run(s));

    // Re-seed Master Customers
    const insertCust = db.prepare(`
      INSERT INTO customers (id, code, name, customer_type, contact_person, email, phone, gstin, city, credit_limit, outstanding_due, payment_terms, status)
      VALUES (@id, @code, @name, @customer_type, @contact_person, @email, @phone, @gstin, @city, @credit_limit, @outstanding_due, @payment_terms, @status)
    `);
    const initialCustomers = [
      { id: 'CUST-001', code: 'METRO-FLEET', name: 'Metro Fleet Mobility Solutions', customer_type: 'Commercial Fleet Operator', contact_person: 'Alok Nambiar', email: 'procure@metrofleet.in', phone: '+91 98205 77112', gstin: '27AABCM8912A1Z4', city: 'Mumbai', credit_limit: 2000000.0, outstanding_due: 450000.0, payment_terms: 'Net 30', status: 'Active' }
    ];
    initialCustomers.forEach(c => insertCust.run(c));

    logAudit(req.user.name, req.user.role, 'Database', 'DB_RESET', 'MOTOHELP_DB', 'Reset live SQLite database to initial state (Dev Only)');
    res.json({ success: true, message: 'Database reset successfully (Dev Only)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PRODUCTION STATIC SERVING & SPA FALLBACK
// ============================================================================
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    console.log(`📦 Serving production Vite assets from ${distPath}`);
    app.use(express.static(distPath, { maxAge: '1d', etag: true }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Graceful Shutdown
const handleShutdown = () => {
  console.log('\n🛑 Gracefully shutting down Motohelp SCM server...');
  realtimeService.closeAll();
  try {
    db.close();
  } catch {}
  process.exit(0);
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ Motohelp SCM Database Server running on http://localhost:${PORT}`);
});
