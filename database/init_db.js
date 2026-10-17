import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'motohelp_scm.db');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log('🚀 Initializing Motohelp SCM Database...');
console.log(`📁 Target Database File: ${dbPath}`);

// Initialize SQLite database instance with WAL mode for high concurrency
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Execute DDL Schema
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);
console.log('✅ Schema tables, indexes, and views created successfully.');

// 2. Populate Seed Master Data
const seedMasterData = db.transaction(() => {
  // Clear existing rows to allow clean re-seeding
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
    DELETE FROM product_categories;
    DELETE FROM suppliers;
    DELETE FROM customers;
    DELETE FROM warehouse_bins;
    DELETE FROM users;
    DELETE FROM roles;
    DELETE FROM branches;
    DELETE FROM audit_logs;
    DELETE FROM notifications;
  `);

  // 1. Insert Branches
  const insertBranch = db.prepare(`
    INSERT INTO branches (id, code, name, city, state, address, capacity_sq_ft, utilization_rate, active_skus, manager_name, phone, branch_type)
    VALUES (@id, @code, @name, @city, @state, @address, @capacity_sq_ft, @utilization_rate, @active_skus, @manager_name, @phone, @branch_type)
  `);

  const branches = [
    { id: 'BR-MUM-01', code: 'BND-HQ', name: 'Bhandup Central Hub (HQ)', city: 'Mumbai', state: 'Maharashtra', address: 'C210, Neptune Eastern Business, Metro Mall, Bhandup (W), Mumbai - 400078', capacity_sq_ft: 25000, utilization_rate: 78.0, active_skus: 840, manager_name: 'Anita Deshmukh', phone: '+91 98201 44520', branch_type: 'Central Distribution Hub' },
    { id: 'BR-BHW-02', code: 'BHW-LOG', name: 'Bhiwandi Mega Logistics Depot', city: 'Thane', state: 'Maharashtra', address: 'Plot 44, Mankoli Naka, Bhiwandi, Thane - 421302', capacity_sq_ft: 60000, utilization_rate: 64.0, active_skus: 1250, manager_name: 'Mahesh Jadhav', phone: '+91 98202 88410', branch_type: 'Primary Inward / Bulk Fulfillment Center' },
    { id: 'BR-PUN-03', code: 'PUN-DEP', name: 'Pune Chakan Auto Depot', city: 'Pune', state: 'Maharashtra', address: 'Phase 2, MIDC Chakan, Pune - 410501', capacity_sq_ft: 20000, utilization_rate: 82.0, active_skus: 620, manager_name: 'Sachin Kadam', phone: '+91 98203 11928', branch_type: 'Regional Automotive Hub' },
    { id: 'BR-DEL-04', code: 'DEL-NCR', name: 'Delhi NCR Manesar Hub', city: 'Gurugram', state: 'Haryana', address: 'Sector 8, IMT Manesar, Gurugram - 122051', capacity_sq_ft: 35000, utilization_rate: 71.0, active_skus: 910, manager_name: 'Ramanjeet Singh', phone: '+91 98110 33419', branch_type: 'North Zone Distribution Center' }
  ];
  branches.forEach(b => insertBranch.run(b));

  // 2. Insert Roles & Users
  const insertRole = db.prepare(`INSERT INTO roles (id, role_key, name, security_tier, permissions) VALUES (?, ?, ?, ?, ?)`);
  insertRole.run('ROLE-DIR', 'director', 'Executive Director / VP', 'Tier 1 (Admin)', JSON.stringify(['ALL_ACCESS']));
  insertRole.run('ROLE-PROC', 'procurement', 'Procurement Manager', 'Tier 2 (Audit)', JSON.stringify(['PR_CREATE', 'PR_APPROVE', 'PO_CREATE', 'VENDOR_MANAGE']));
  insertRole.run('ROLE-WMS', 'warehouse', 'Warehouse Supervisor', 'Tier 3 (Operational)', JSON.stringify(['GRN_CREATE', 'STOCK_TRANSFER', 'BIN_MANAGE', 'INVENTORY_ADJUST']));
  insertRole.run('ROLE-LOG', 'logistics', 'Logistics Coordinator', 'Tier 3 (Operational)', JSON.stringify(['DISPATCH_CREATE', 'WAYBILL_MANAGE', 'FLEET_TRACK']));
  insertRole.run('ROLE-QC', 'quality', 'Quality Inspector', 'Tier 3 (Operational)', JSON.stringify(['QC_INSPECTION', 'DEFECT_LOG', 'GRN_ACCEPT']));
  insertRole.run('ROLE-FIN', 'finance', 'Finance Controller', 'Tier 2 (Audit)', JSON.stringify(['INVOICE_APPROVE', '3WAY_MATCH', 'PAYMENT_RECORD']));
  insertRole.run('ROLE-VEN', 'supplier', 'Supplier Portal', 'Tier 3 (Operational)', JSON.stringify(['VIEW_PO', 'SUBMIT_INVOICE']));

  // 3. Categories & Products
  const insertCat = db.prepare(`INSERT INTO product_categories (id, name, description, default_gst_rate) VALUES (?, ?, ?, ?)`);
  insertCat.run('CAT-01', 'Engine & Powertrain', 'Internal combustion components, fuel injection, and clutch systems', 18.0);
  insertCat.run('CAT-02', 'Braking & Suspension', 'Disc brakes, pads, calipers, shock struts and linkages', 18.0);
  insertCat.run('CAT-03', 'Electricals & Sensors', 'Alternators, starters, batteries, spark plugs and harness sensors', 28.0);
  insertCat.run('CAT-04', 'Lubricants & Fluids', 'Synthetic motor oils, gear oils, coolant fluids and brake fluids', 18.0);
  insertCat.run('CAT-05', 'Body & Consumables', 'Lighting clusters, wipers, filters and body fasteners', 18.0);

  const insertProd = db.prepare(`
    INSERT INTO products (id, sku, category_id, category_name, name, description, uom, hsn_code, cost_price, selling_price, gst_rate, safety_stock, reorder_point, max_stock, current_stock, reserved_stock, bin_location, primary_supplier_id, primary_supplier_name, abc_category, fsn_category, batch_tracking_enabled, weight_kg)
    VALUES (@id, @sku, @category_id, @category_name, @name, @description, @uom, @hsn_code, @cost_price, @selling_price, @gst_rate, @safety_stock, @reorder_point, @max_stock, @current_stock, @reserved_stock, @bin_location, @primary_supplier_id, @primary_supplier_name, @abc_category, @fsn_category, @batch_tracking_enabled, @weight_kg)
  `);

  const products = [
    { id: 'PRD-101', sku: 'MH-BRK-001', category_id: 'CAT-02', category_name: 'Braking & Suspension', name: 'Ceramic High-Performance Brake Pad Kit', description: 'High-friction ceramic disc brake pads engineered for passenger cars and light commercial fleets.', uom: 'Sets', hsn_code: '87083000', cost_price: 1450, selling_price: 2250, gst_rate: 18, safety_stock: 80, reorder_point: 120, max_stock: 500, current_stock: 340, reserved_stock: 45, bin_location: 'A-01-03', primary_supplier_id: 'SUP-004', primary_supplier_name: 'Brembo Brakes India', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 2.2 },
    { id: 'PRD-102', sku: 'MH-OIL-5W40', category_id: 'CAT-04', category_name: 'Lubricants & Fluids', name: 'Full Synthetic Engine Oil 5W-40 (4L Can)', description: 'API SN/CF premium fully synthetic automotive engine lubricant with advanced thermal stability.', uom: 'Cans', hsn_code: '27101981', cost_price: 1850, selling_price: 2750, gst_rate: 18, safety_stock: 150, reorder_point: 220, max_stock: 800, current_stock: 410, reserved_stock: 60, bin_location: 'C-02-01', primary_supplier_id: 'SUP-002', primary_supplier_name: 'Castrol Lubricants India Ltd', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 3.8 },
    { id: 'PRD-103', sku: 'MH-ALT-12V', category_id: 'CAT-03', category_name: 'Electricals & Sensors', name: 'Heavy Duty 12V 90A Alternator Assembly', description: 'High-output alternator for multi-utility vehicles and heavy fleet applications.', uom: 'Pcs', hsn_code: '85115000', cost_price: 4200, selling_price: 6500, gst_rate: 28, safety_stock: 25, reorder_point: 40, max_stock: 150, current_stock: 28, reserved_stock: 10, bin_location: 'B-03-02', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'A', fsn_category: 'S', batch_tracking_enabled: 1, weight_kg: 5.6 },
    { id: 'PRD-104', sku: 'MH-INJ-CRDI', category_id: 'CAT-01', category_name: 'Engine & Powertrain', name: 'CRDi Common Rail Fuel Injector Kit', description: 'High-precision multi-hole piezoelectric diesel common rail fuel injector assembly.', uom: 'Sets', hsn_code: '84099941', cost_price: 6800, selling_price: 10200, gst_rate: 18, safety_stock: 30, reorder_point: 50, max_stock: 180, current_stock: 88, reserved_stock: 12, bin_location: 'A-02-01', primary_supplier_id: 'SUP-003', primary_supplier_name: 'Denso Automotive India Pvt Ltd', abc_category: 'A', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 1.5 },
    { id: 'PRD-105', sku: 'MH-FIL-OIL08', category_id: 'CAT-01', category_name: 'Engine & Powertrain', name: 'High-Flow Spin-On Oil Filter Element', description: 'Micron-rated pleated synthetic media oil filter for passenger cars.', uom: 'Pcs', hsn_code: '84212300', cost_price: 220, selling_price: 380, gst_rate: 18, safety_stock: 200, reorder_point: 350, max_stock: 1200, current_stock: 680, reserved_stock: 110, bin_location: 'A-03-04', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'C', fsn_category: 'F', batch_tracking_enabled: 0, weight_kg: 0.35 },
    { id: 'PRD-106', sku: 'MH-BAT-65AH', category_id: 'CAT-03', category_name: 'Electricals & Sensors', name: 'Sealed Maintenance Free 12V 65Ah Battery', description: 'Heavy duty calcium-alloy automotive starter battery with high cranking amps.', uom: 'Pcs', hsn_code: '85071000', cost_price: 4800, selling_price: 6900, gst_rate: 28, safety_stock: 40, reorder_point: 70, max_stock: 250, current_stock: 115, reserved_stock: 20, bin_location: 'B-01-01', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'B', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 15.8 },
    { id: 'PRD-107', sku: 'MH-LMP-LED01', category_id: 'CAT-05', category_name: 'Body & Consumables', name: 'Bi-LED Projector Headlamp Assembly (Pair)', description: 'High-intensity dual LED projector unit with integrated dynamic turn signals.', uom: 'Pairs', hsn_code: '85122010', cost_price: 5500, selling_price: 8400, gst_rate: 18, safety_stock: 20, reorder_point: 35, max_stock: 120, current_stock: 42, reserved_stock: 8, bin_location: 'D-02-03', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'B', fsn_category: 'S', batch_tracking_enabled: 1, weight_kg: 4.2 },
    { id: 'PRD-108', sku: 'MH-CLT-PLT', category_id: 'CAT-01', category_name: 'Engine & Powertrain', name: 'Heavy Duty Diaphragm Clutch Plate (240mm)', description: 'Organic facing clutch plate assembly for smooth engagement and high thermal capacity.', uom: 'Pcs', hsn_code: '87089300', cost_price: 2800, selling_price: 4100, gst_rate: 18, safety_stock: 45, reorder_point: 75, max_stock: 300, current_stock: 140, reserved_stock: 25, bin_location: 'A-01-02', primary_supplier_id: 'SUP-003', primary_supplier_name: 'Denso Automotive India Pvt Ltd', abc_category: 'B', fsn_category: 'F', batch_tracking_enabled: 1, weight_kg: 3.4 },
    { id: 'PRD-109', sku: 'MH-STR-FRNT', category_id: 'CAT-02', category_name: 'Braking & Suspension', name: 'Gas-Charged Front Shock Absorber Strut', description: 'Twin-tube nitrogen pressurized shock absorber for enhanced ride handling and comfort.', uom: 'Pcs', hsn_code: '87088000', cost_price: 2100, selling_price: 3200, gst_rate: 18, safety_stock: 35, reorder_point: 60, max_stock: 200, current_stock: 74, reserved_stock: 14, bin_location: 'B-02-04', primary_supplier_id: 'SUP-004', primary_supplier_name: 'Brembo Brakes India', abc_category: 'B', fsn_category: 'S', batch_tracking_enabled: 1, weight_kg: 4.8 },
    { id: 'PRD-110', sku: 'MH-SPK-IRID', category_id: 'CAT-03', category_name: 'Electricals & Sensors', name: 'Iridium Tough Spark Plug Set (Pack of 4)', description: 'Laser-welded 0.4mm iridium center electrode spark plugs for maximum ignition efficiency.', uom: 'Packs', hsn_code: '85111000', cost_price: 950, selling_price: 1550, gst_rate: 18, safety_stock: 100, reorder_point: 160, max_stock: 600, current_stock: 380, reserved_stock: 50, bin_location: 'A-03-01', primary_supplier_id: 'SUP-001', primary_supplier_name: 'Bosch Auto Systems India Pvt Ltd', abc_category: 'C', fsn_category: 'F', batch_tracking_enabled: 0, weight_kg: 0.28 }
  ];
  products.forEach(p => insertProd.run(p));

  // 4. Suppliers
  const insertSupp = db.prepare(`
    INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, gstin, city, rating, otif_score, defect_ppm, lead_time_days, payment_terms, credit_limit, status, total_pos_count, spend_ytd)
    VALUES (@id, @code, @name, @category, @contact_person, @email, @phone, @gstin, @city, @rating, @otif_score, @defect_ppm, @lead_time_days, @payment_terms, @credit_limit, @status, @total_pos_count, @spend_ytd)
  `);

  const suppliers = [
    { id: 'SUP-001', code: 'BOSCH-IND', name: 'Bosch Auto Systems India Pvt Ltd', category: 'Electricals & Sensors', contact_person: 'Arunav Sengupta', email: 'arunav.s@bosch-india.com', phone: '+91 22 6755 9000', gstin: '27AAACB2894G1Z9', city: 'Bengaluru / Pune', rating: 4.9, otif_score: 98.2, defect_ppm: 120, lead_time_days: 4, payment_terms: 'Net 45', credit_limit: 5000000.0, status: 'Preferred', total_pos_count: 64, spend_ytd: 8450000.0 },
    { id: 'SUP-002', code: 'CASTROL-IN', name: 'Castrol Lubricants India Ltd', category: 'Lubricants & Fluids', contact_person: 'Meenal Choksi', email: 'orders@castrol.co.in', phone: '+91 22 4911 2000', gstin: '27AAACC4451M1Z1', city: 'Mumbai', rating: 4.8, otif_score: 96.5, defect_ppm: 80, lead_time_days: 3, payment_terms: 'Net 30', credit_limit: 4000000.0, status: 'Preferred', total_pos_count: 48, spend_ytd: 6200000.0 },
    { id: 'SUP-003', code: 'DENSO-IND', name: 'Denso Automotive India Pvt Ltd', category: 'Engine & Powertrain', contact_person: 'Karan Mehra', email: 'karan.m@denso-india.com', phone: '+91 124 492 8800', gstin: '06AAACD5512N1ZY', city: 'Gurugram', rating: 4.7, otif_score: 94.8, defect_ppm: 240, lead_time_days: 6, payment_terms: 'Net 45', credit_limit: 4500000.0, status: 'Active', total_pos_count: 38, spend_ytd: 5400000.0 },
    { id: 'SUP-004', code: 'BREMBO-IN', name: 'Brembo Brakes India Pvt Ltd', category: 'Braking & Suspension', contact_person: 'David Fernandez', email: 'supply@brembo.in', phone: '+91 2135 667 000', gstin: '27AAACB9014J1ZV', city: 'Pune', rating: 4.8, otif_score: 97.1, defect_ppm: 150, lead_time_days: 5, payment_terms: 'Net 30', credit_limit: 3500000.0, status: 'Preferred', total_pos_count: 42, spend_ytd: 4900000.0 }
  ];
  suppliers.forEach(s => insertSupp.run(s));

  // 5. Customers
  const insertCust = db.prepare(`
    INSERT INTO customers (id, code, name, customer_type, contact_person, email, phone, gstin, city, credit_limit, outstanding_due, payment_terms, status)
    VALUES (@id, @code, @name, @customer_type, @contact_person, @email, @phone, @gstin, @city, @credit_limit, @outstanding_due, @payment_terms, @status)
  `);

  const customers = [
    { id: 'CUST-001', code: 'METRO-FLEET', name: 'Metro Fleet Mobility Solutions', customer_type: 'Commercial Fleet Operator (1,200+ Cabs)', contact_person: 'Alok Nambiar', email: 'procure@metrofleet.in', phone: '+91 98205 77112', gstin: '27AABCM8912A1Z4', city: 'Mumbai', credit_limit: 2000000.0, outstanding_due: 450000.0, payment_terms: 'Net 30', status: 'Active' },
    { id: 'CUST-002', code: 'ROYAL-AUTO', name: 'Royal Multi-Brand Automotive Works', customer_type: 'Authorized Service Center Chain (8 Locations)', contact_person: 'Girish Shinde', email: 'service@royalauto.co.in', phone: '+91 98206 99401', gstin: '27AABCR4410K1ZT', city: 'Pune', credit_limit: 1500000.0, outstanding_due: 180000.0, payment_terms: 'Net 15', status: 'Active' }
  ];
  customers.forEach(c => insertCust.run(c));

  // 6. Purchase Orders
  const insertPO = db.prepare(`
    INSERT INTO purchase_orders (id, po_number, pr_id, vendor_id, vendor_name, branch_id, branch_name, order_date, expected_delivery_date, subtotal, tax_amount, grand_total, payment_terms, approval_status, approved_by, status, notes, has_grn, grn_id)
    VALUES (@id, @po_number, @pr_id, @vendor_id, @vendor_name, @branch_id, @branch_name, @order_date, @expected_delivery_date, @subtotal, @tax_amount, @grand_total, @payment_terms, @approval_status, @approved_by, @status, @notes, @has_grn, @grn_id)
  `);

  insertPO.run({
    id: 'PO-2026-0840', po_number: 'PO-2026-0840', pr_id: 'PR-2026-0501', vendor_id: 'SUP-002', vendor_name: 'Castrol Lubricants India Ltd',
    branch_id: 'BR-MUM-01', branch_name: 'Bhandup Central Hub (HQ)', order_date: '2026-09-02', expected_delivery_date: '2026-09-08',
    subtotal: 277500, tax_amount: 49950, grand_total: 327450, payment_terms: 'Net 30', approval_status: 'Approved', approved_by: 'Rajesh Verma (Director)',
    status: 'Received', notes: 'Monthly synthetic engine oil stock replenishment for Bhandup Hub.', has_grn: 1, grn_id: 'GRN-2026-0419'
  });

  insertPO.run({
    id: 'PO-2026-0841', po_number: 'PO-2026-0841', pr_id: 'PR-2026-0512', vendor_id: 'SUP-001', vendor_name: 'Bosch Auto Systems India Pvt Ltd',
    branch_id: 'BR-MUM-01', branch_name: 'Bhandup Central Hub (HQ)', order_date: '2026-09-10', expected_delivery_date: '2026-09-17',
    subtotal: 170000, tax_amount: 43200, grand_total: 213200, payment_terms: 'Net 45', approval_status: 'Approved', approved_by: 'Rajesh Verma (Director)',
    status: 'Approved', notes: 'Urgent delivery required to replenish Bhandup central safety stock buffer.', has_grn: 0, grn_id: null
  });

  const insertPOItem = db.prepare(`
    INSERT INTO purchase_order_items (po_id, product_id, sku, product_name, quantity, unit_price, gst_rate, item_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPOItem.run('PO-2026-0840', 'PRD-102', 'MH-OIL-5W40', 'Full Synthetic Engine Oil 5W-40 (4L Can)', 150, 1850, 18, 327450);
  insertPOItem.run('PO-2026-0841', 'PRD-103', 'MH-ALT-12V', 'Heavy Duty 12V 90A Alternator Assembly', 20, 4200, 28, 107520);
  insertPOItem.run('PO-2026-0841', 'PRD-105', 'MH-FIL-OIL08', 'High-Flow Spin-On Oil Filter Element', 300, 220, 18, 77880);

  // 7. Goods Receipt Notes (GRN)
  const insertGRN = db.prepare(`
    INSERT INTO goods_receipt_notes (id, grn_number, po_id, po_number, vendor_name, branch_id, branch_name, received_date, received_by, supplier_invoice_number, gate_pass_number, batch_lot_number, bin_allocated, qc_status, inspected_by, total_received_qty, total_accepted_qty, total_rejected_qty, rejection_reason, stock_updated)
    VALUES (@id, @grn_number, @po_id, @po_number, @vendor_name, @branch_id, @branch_name, @received_date, @received_by, @supplier_invoice_number, @gate_pass_number, @batch_lot_number, @bin_allocated, @qc_status, @inspected_by, @total_received_qty, @total_accepted_qty, @total_rejected_qty, @rejection_reason, @stock_updated)
  `);
  insertGRN.run({
    id: 'GRN-2026-0419', grn_number: 'GRN-2026-0419', po_id: 'PO-2026-0840', po_number: 'PO-2026-0840', vendor_name: 'Castrol Lubricants India Ltd',
    branch_id: 'BR-MUM-01', branch_name: 'Bhandup Central Hub (HQ)', received_date: '2026-09-08', received_by: 'Suresh More (Store Officer)',
    supplier_invoice_number: 'INV-CAS-88192', gate_pass_number: 'GP-BND-2026-092', batch_lot_number: 'LOT-CAS-202609', bin_allocated: 'C-02-01',
    qc_status: 'Passed', inspected_by: 'Priya Sharma (QC Officer)', total_received_qty: 150, total_accepted_qty: 150, total_rejected_qty: 0,
    rejection_reason: '', stock_updated: 1
  });

  // 8. Sales Orders (SO)
  const insertSO = db.prepare(`
    INSERT INTO sales_orders (id, so_number, customer_id, customer_name, branch_id, branch_name, order_date, delivery_due_date, priority, shipping_address, subtotal, tax_amount, grand_total, status, payment_status, payment_terms, shipment_id)
    VALUES (@id, @so_number, @customer_id, @customer_name, @branch_id, @branch_name, @order_date, @delivery_due_date, @priority, @shipping_address, @subtotal, @tax_amount, @grand_total, @status, @payment_status, @payment_terms, @shipment_id)
  `);
  insertSO.run({
    id: 'SO-2026-1191', so_number: 'SO-2026-1191', customer_id: 'CUST-001', customer_name: 'Metro Fleet Mobility Solutions',
    branch_id: 'BR-MUM-01', branch_name: 'Bhandup Central Hub (HQ)', order_date: '2026-09-12', delivery_due_date: '2026-09-15',
    priority: 'High Priority (Fleet SLA)', shipping_address: 'Metro Fleet Depot #4, Kurla Industrial Estate, Mumbai - 400070',
    subtotal: 135000, tax_amount: 24300, grand_total: 159300, status: 'In Transit', payment_status: 'Partially Paid', payment_terms: 'Net 30', shipment_id: 'SHP-2026-0551'
  });

  const insertSOItem = db.prepare(`
    INSERT INTO sales_order_items (so_id, product_id, sku, product_name, quantity, unit_price, gst_rate, item_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSOItem.run('SO-2026-1191', 'PRD-101', 'MH-BRK-001', 'Ceramic High-Performance Brake Pad Kit', 40, 2250, 18, 106200);
  insertSOItem.run('SO-2026-1191', 'PRD-102', 'MH-OIL-5W40', 'Full Synthetic Engine Oil 5W-40 (4L Can)', 15, 2750, 18, 48675);

  // 9. Shipments & Milestones
  const insertShp = db.prepare(`
    INSERT INTO shipments (id, waybill_number, so_id, so_number, customer_name, origin, destination, carrier_name, tracking_number, vehicle_number, driver_name, driver_phone, dispatched_at, estimated_delivery, current_location, status)
    VALUES (@id, @waybill_number, @so_id, @so_number, @customer_name, @origin, @destination, @carrier_name, @tracking_number, @vehicle_number, @driver_name, @driver_phone, @dispatched_at, @estimated_delivery, @current_location, @status)
  `);
  insertShp.run({
    id: 'SHP-2026-0551', waybill_number: 'MOTO-WB-994101', so_id: 'SO-2026-1191', so_number: 'SO-2026-1191',
    customer_name: 'Metro Fleet Mobility Solutions', origin: 'Bhandup Central Hub (HQ)', destination: 'Kurla Industrial Estate, Mumbai',
    carrier_name: 'Motohelp Dedicated Express Fleet', tracking_number: 'MH-EXP-88901', vehicle_number: 'MH-03-TR-8812',
    driver_name: 'Santosh Gaikwad', driver_phone: '+91 98201 99312', dispatched_at: '2026-09-13 10:30:00', estimated_delivery: '2026-09-14 16:00:00',
    current_location: 'Eastern Express Highway Checkpoint', status: 'In Transit'
  });

  const insertMilestone = db.prepare(`
    INSERT INTO shipment_milestones (shipment_id, step_order, title, timestamp_text, is_completed)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMilestone.run('SHP-2026-0551', 1, 'Manifest Generated & Security Seal Affixed', '10:30 AM', 1);
  insertMilestone.run('SHP-2026-0551', 2, 'Dispatched from Bhandup Central Dock #3', '11:15 AM', 1);
  insertMilestone.run('SHP-2026-0551', 3, 'In Transit - Eastern Express Highway (Toll Verified)', '01:45 PM', 1);
  insertMilestone.run('SHP-2026-0551', 4, 'Out for Delivery (Kurla Hub Sector)', 'Pending', 0);
  insertMilestone.run('SHP-2026-0551', 5, 'Delivered & Digital POD Signed', 'Pending', 0);

  // 10. Invoices
  const insertInv = db.prepare(`
    INSERT INTO invoices (id, invoice_type, invoice_number, party_name, po_id, po_number, grn_id, grn_number, amount, due_date, status, match_status, match_details)
    VALUES (@id, @invoice_type, @invoice_number, @party_name, @po_id, @po_number, @grn_id, @grn_number, @amount, @due_date, @status, @match_status, @match_details)
  `);

  insertInv.run({
    id: 'INV-2026-0901', invoice_type: 'AP', invoice_number: 'INV-CAS-88192', party_name: 'Castrol Lubricants India Ltd',
    po_id: 'PO-2026-0840', po_number: 'PO-2026-0840', grn_id: 'GRN-2026-0419', grn_number: 'GRN-2026-0419',
    amount: 327450, due_date: '2026-10-10', status: 'Approved for Payment', match_status: '3-Way Matched',
    match_details: 'Qty (150 Cans) and Unit Rate (₹1,850) match PO-2026-0840 and GRN-2026-0419.'
  });

  // 11. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_name, role_key, module_name, action_code, entity_id, description, ip_address)
    VALUES (@id, @user_name, @role_key, @module_name, @action_code, @entity_id, @description, @ip_address)
  `);

  insertAudit.run({
    id: 'AUD-991', user_name: 'Rajesh Verma', role_key: 'DIRECTOR', module_name: 'Procurement',
    action_code: 'PO_APPROVAL', entity_id: 'PO-2026-0841',
    description: 'Approved Purchase Order for Bosch Alternators & Oil Filters (Value: ₹2,13,200)', ip_address: '192.168.1.102'
  });
});

// Guard: Check if business records already exist
let existingRecords = 0;
try {
  const row = db.prepare("SELECT count(*) as count FROM products").get();
  existingRecords = row ? row.count : 0;
} catch {}

const isForce = process.argv.includes('--force');
const isProd = process.env.NODE_ENV === 'production';

if (existingRecords > 0 && !isForce) {
  console.log(`ℹ️  Existing database records detected (${existingRecords} products). Preserving business data without resetting.`);
  console.log('💡 Note: To explicitly reset database tables for dev, run: node database/init_db.js --force');
} else {
  if (isProd && !isForce) {
    console.log('🔒 Production mode: destructive database wipe skipped.');
  } else {
    console.log('🔄 Seeding initial master records into database...');
    seedMasterData();
    console.log('🎉 Motohelp SCM Database master data seeded successfully!');
  }
}

db.close();

