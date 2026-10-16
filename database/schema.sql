-- ============================================================================
-- MOTOHELP PRIVATE LIMITED — SUPPLY CHAIN MANAGEMENT (SCM) DATABASE SCHEMA
-- Address: C210, Neptune Eastern Business, Metro Mall, Bhandup (W), Mumbai - 400078
-- Engine: SQL / SQLite / PostgreSQL Compatible (3NF Normalized)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. MASTER MANAGEMENT & BRANCH REGISTRY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,                       -- e.g. 'BR-MUM-01'
    code TEXT NOT NULL UNIQUE,                -- e.g. 'BND-HQ'
    name TEXT NOT NULL,                       -- e.g. 'Bhandup Central Hub (HQ)'
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    capacity_sq_ft INTEGER NOT NULL,
    utilization_rate REAL DEFAULT 0.0,
    active_skus INTEGER DEFAULT 0,
    manager_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    branch_type TEXT NOT NULL,                -- 'Central Distribution Hub', 'Regional Depot'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. USER ROLES & ACCESS CONTROL (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,                       -- e.g. 'ROLE-DIR'
    role_key TEXT NOT NULL UNIQUE,            -- e.g. 'director', 'procurement', 'warehouse'
    name TEXT NOT NULL,
    security_tier TEXT NOT NULL,               -- 'Tier 1 (Admin)', 'Tier 2 (Audit)', 'Tier 3 (Operational)'
    permissions JSON NOT NULL,                 -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- e.g. 'USR-001'
    role_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL DEFAULT 'pbkdf2_sha256_mock_hash',
    status TEXT NOT NULL DEFAULT 'Active',     -- 'Active', 'Inactive', 'Suspended'
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ----------------------------------------------------------------------------
-- 3. PRODUCT CATEGORIES & ITEM MASTER (SKU CATALOG)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,                 -- 'Engine & Powertrain', 'Braking & Suspension', etc.
    description TEXT,
    default_gst_rate REAL DEFAULT 18.0
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,                       -- e.g. 'PRD-101'
    sku TEXT NOT NULL UNIQUE,                 -- e.g. 'MH-BRK-001'
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    name TEXT NOT NULL,                       -- e.g. 'Ceramic High-Performance Brake Pad Kit'
    description TEXT,
    uom TEXT NOT NULL,                        -- 'Sets', 'Pcs', 'Cans', 'Packs', 'Liters'
    hsn_code TEXT NOT NULL,                   -- e.g. '87083000'
    cost_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    gst_rate REAL NOT NULL DEFAULT 18.0,
    safety_stock INTEGER NOT NULL DEFAULT 20,
    reorder_point INTEGER NOT NULL DEFAULT 40,
    max_stock INTEGER NOT NULL DEFAULT 300,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    bin_location TEXT NOT NULL DEFAULT 'A-01-01',
    primary_supplier_id TEXT,
    primary_supplier_name TEXT,
    abc_category TEXT CHECK (abc_category IN ('A', 'B', 'C')) DEFAULT 'B',
    fsn_category TEXT CHECK (fsn_category IN ('F', 'S', 'N')) DEFAULT 'F', -- Fast, Slow, Non-moving
    batch_tracking_enabled INTEGER DEFAULT 1,  -- Boolean (1 or 0)
    weight_kg REAL DEFAULT 1.0,
    dimensions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- ----------------------------------------------------------------------------
-- 4. SUPPLIERS & VENDOR PERFORMANCE (OTIF & KPIS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,                       -- e.g. 'SUP-001'
    code TEXT NOT NULL UNIQUE,                -- e.g. 'BOSCH-IND'
    name TEXT NOT NULL,                       -- e.g. 'Bosch Auto Systems India Pvt Ltd'
    category TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    gstin TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    rating REAL DEFAULT 5.0,                  -- 1.0 to 5.0
    otif_score REAL DEFAULT 95.0,             -- On-Time In-Full percentage
    defect_ppm INTEGER DEFAULT 100,           -- Parts per Million defect rate
    lead_time_days INTEGER DEFAULT 5,
    payment_terms TEXT DEFAULT 'Net 30',      -- 'Net 30', 'Net 45', 'Net 60'
    credit_limit REAL DEFAULT 1000000.0,
    status TEXT DEFAULT 'Active',             -- 'Preferred', 'Active', 'On Probation'
    total_pos_count INTEGER DEFAULT 0,
    spend_ytd REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. CUSTOMERS & FLEET PARTNERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,                       -- e.g. 'CUST-001'
    code TEXT NOT NULL UNIQUE,                -- e.g. 'METRO-FLEET'
    name TEXT NOT NULL,                       -- e.g. 'Metro Fleet Mobility Solutions'
    customer_type TEXT NOT NULL,              -- 'Commercial Fleet Operator', 'Authorized Service Chain'
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    gstin TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    credit_limit REAL DEFAULT 1000000.0,
    outstanding_due REAL DEFAULT 0.0,
    payment_terms TEXT DEFAULT 'Net 30',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. PURCHASE REQUISITIONS (PR) & PURCHASE ORDERS (PO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_requisitions (
    id TEXT PRIMARY KEY,                       -- e.g. 'PR-2026-0512'
    branch_id TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requisition_date DATE NOT NULL,
    priority TEXT DEFAULT 'Normal',           -- 'Normal', 'Urgent', 'Stock-Out Alert'
    status TEXT DEFAULT 'Pending Approval',   -- 'Pending Approval', 'Approved', 'Converted to PO', 'Rejected'
    approved_by TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,                       -- e.g. 'PO-2026-0841'
    po_number TEXT NOT NULL UNIQUE,
    pr_id TEXT,
    vendor_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    subtotal REAL NOT NULL,
    tax_amount REAL NOT NULL,
    grand_total REAL NOT NULL,
    payment_terms TEXT NOT NULL,
    approval_status TEXT DEFAULT 'Pending',   -- 'Pending', 'Approved', 'Rejected'
    approved_by TEXT,
    status TEXT DEFAULT 'Approved',           -- 'Draft', 'Approved', 'Received', 'Cancelled'
    notes TEXT,
    has_grn INTEGER DEFAULT 0,
    grn_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES suppliers(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    gst_rate REAL NOT NULL,
    item_total REAL NOT NULL,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ----------------------------------------------------------------------------
-- 7. GOODS RECEIPT NOTES (GRN) & QC INSPECTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id TEXT PRIMARY KEY,                       -- e.g. 'GRN-2026-0419'
    grn_number TEXT NOT NULL UNIQUE,
    po_id TEXT NOT NULL,
    po_number TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    received_date DATE NOT NULL,
    received_by TEXT NOT NULL,
    supplier_invoice_number TEXT NOT NULL,
    gate_pass_number TEXT NOT NULL,
    batch_lot_number TEXT NOT NULL,
    bin_allocated TEXT NOT NULL,
    qc_status TEXT NOT NULL,                  -- 'Passed', 'Passed with Minor Variance', 'Rejected'
    inspected_by TEXT NOT NULL,
    total_received_qty INTEGER NOT NULL,
    total_accepted_qty INTEGER NOT NULL,
    total_rejected_qty INTEGER NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    stock_updated INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ----------------------------------------------------------------------------
-- 8. WAREHOUSE MANAGEMENT SYSTEM (WMS) & BIN SLOTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_bins (
    id TEXT PRIMARY KEY,                       -- e.g. 'BIN-BND-A0101'
    branch_id TEXT NOT NULL,
    bin_code TEXT NOT NULL,                   -- e.g. 'A-01-01'
    zone_name TEXT NOT NULL,                  -- 'Zone A - Powertrain', 'Zone B - Braking', etc.
    rack_type TEXT NOT NULL,                  -- 'High Density Rack', 'Spill-Contained Pallet'
    occupancy_percent REAL DEFAULT 0.0,
    max_weight_kg REAL NOT NULL DEFAULT 1000.0,
    sku_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS stock_transfers (
    id TEXT PRIMARY KEY,                       -- e.g. 'XFER-2026-091'
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    from_branch_id TEXT NOT NULL,
    from_branch_name TEXT NOT NULL,
    to_branch_id TEXT NOT NULL,
    to_branch_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    gate_pass_number TEXT NOT NULL,
    transfer_reason TEXT NOT NULL,
    status TEXT DEFAULT 'In Transit',         -- 'Initiated', 'In Transit', 'Completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (from_branch_id) REFERENCES branches(id),
    FOREIGN KEY (to_branch_id) REFERENCES branches(id)
);

-- ----------------------------------------------------------------------------
-- 9. SALES ORDERS & FLEET FULFILLMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_orders (
    id TEXT PRIMARY KEY,                       -- e.g. 'SO-2026-1190'
    so_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    delivery_due_date DATE NOT NULL,
    priority TEXT DEFAULT 'Standard',         -- 'Standard', 'Express', 'Emergency Fleet'
    shipping_address TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax_amount REAL NOT NULL,
    grand_total REAL NOT NULL,
    status TEXT DEFAULT 'Ready for Dispatch', -- 'Order Booked', 'Ready for Dispatch', 'In Transit', 'Delivered'
    payment_status TEXT DEFAULT 'Unpaid',     -- 'Unpaid', 'Partial', 'Paid'
    payment_terms TEXT DEFAULT 'Net 30',
    shipment_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    so_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    gst_rate REAL NOT NULL,
    item_total REAL NOT NULL,
    FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ----------------------------------------------------------------------------
-- 10. 3PL LOGISTICS, DISPATCH & LIVE TRACKING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,                       -- e.g. 'SHP-2026-0551'
    waybill_number TEXT NOT NULL UNIQUE,      -- e.g. 'MOTO-WB-994102'
    so_id TEXT,
    so_number TEXT,
    customer_name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    carrier_name TEXT NOT NULL,               -- 'Delhivery Express Logistics', 'BlueDart', 'Motohelp Fleet'
    tracking_number TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    dispatched_at TIMESTAMP,
    estimated_delivery TIMESTAMP,
    current_location TEXT NOT NULL,
    status TEXT DEFAULT 'In Transit',         -- 'Manifest Created', 'In Transit', 'Out for Delivery', 'Delivered'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (so_id) REFERENCES sales_orders(id)
);

CREATE TABLE IF NOT EXISTS shipment_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    timestamp_text TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 11. FINANCE, 3-WAY MATCH & INVOICING (AP / AR)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,                       -- e.g. 'INV-2026-0901'
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('AP', 'AR')),
    invoice_number TEXT NOT NULL UNIQUE,
    party_name TEXT NOT NULL,                 -- Supplier or Customer Name
    po_id TEXT,
    po_number TEXT,
    grn_id TEXT,
    grn_number TEXT,
    amount REAL NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL,                     -- 'Approved for Payment', 'Pending Verification', 'Unpaid', 'Paid in Full'
    match_status TEXT NOT NULL,               -- '3-Way Matched', 'Discrepancy Reconciled', 'Dispatched', 'Delivered'
    match_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 12. AUDIT TRAIL, SYSTEM EVENTS & ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,                       -- e.g. 'AUD-991'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name TEXT NOT NULL,
    role_key TEXT NOT NULL,
    module_name TEXT NOT NULL,                -- 'Procurement', 'Warehouse', 'Logistics', 'Finance'
    action_code TEXT NOT NULL,                -- 'PO_APPROVAL', 'STOCK_INWARD_GRN', '3WAY_MATCH_SUCCESS'
    entity_id TEXT NOT NULL,                  -- 'PO-2026-0841', 'GRN-2026-0419'
    description TEXT NOT NULL,
    ip_address TEXT DEFAULT '192.168.1.108'
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    notification_type TEXT NOT NULL,          -- 'warning', 'info', 'success', 'primary'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_module TEXT,
    action_label TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. ANALYTIC SQL VIEWS FOR EXECUTIVE KPIS & MIS REPORTING
-- ============================================================================

-- View: Supplier OTIF & Quality Performance
CREATE VIEW IF NOT EXISTS view_supplier_otif_kpi AS
SELECT 
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.category,
    s.otif_score,
    s.defect_ppm,
    s.rating,
    s.lead_time_days,
    COUNT(po.id) AS total_pos_issued,
    COALESCE(SUM(po.grand_total), 0) AS total_po_value
FROM suppliers s
LEFT JOIN purchase_orders po ON po.vendor_id = s.id
GROUP BY s.id, s.name, s.category, s.otif_score, s.defect_ppm, s.rating, s.lead_time_days;

-- View: Warehouse Inventory Health & Velocity
CREATE VIEW IF NOT EXISTS view_inventory_health AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.category_name,
    p.current_stock,
    p.safety_stock,
    p.reorder_point,
    p.cost_price,
    (p.current_stock * p.cost_price) AS total_valuation,
    p.fsn_category,
    p.abc_category,
    CASE 
        WHEN p.current_stock <= p.reorder_point THEN 'CRITICAL_REORDER'
        WHEN p.current_stock >= p.max_stock THEN 'OVERSTOCKED'
        ELSE 'OPTIMAL'
    END AS stock_health_status
FROM products p;

-- View: 3-Way Match Reconciled Financials
CREATE VIEW IF NOT EXISTS view_three_way_match_audit AS
SELECT
    inv.id AS invoice_id,
    inv.invoice_number,
    inv.invoice_type,
    inv.party_name,
    inv.amount AS invoice_amount,
    po.po_number,
    po.grand_total AS po_amount,
    grn.grn_number,
    grn.total_accepted_qty,
    inv.match_status,
    inv.status AS payment_status
FROM invoices inv
LEFT JOIN purchase_orders po ON po.po_number = inv.po_number
LEFT JOIN goods_receipt_notes grn ON grn.grn_number = inv.grn_number;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
