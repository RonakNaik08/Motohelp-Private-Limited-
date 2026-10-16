-- ============================================================================
-- MOTOHELP SCM ENTERPRISE PLATFORM - MYSQL DATABASE SCHEMA
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, phpMyAdmin & Workbench
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `motohelp_scm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `motohelp_scm`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Branches / Regional Warehouses
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(20) UNIQUE NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `gstin` VARCHAR(30) NOT NULL,
  `capacity_sqft` INT DEFAULT 0,
  `current_utilization` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Suppliers / OEM Vendors
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `gstin` VARCHAR(30) NOT NULL,
  `rating` DECIMAL(3,1) DEFAULT 4.5,
  `otif_score` DECIMAL(4,1) DEFAULT 95.0,
  `lead_time_days` INT DEFAULT 5,
  `payment_terms` VARCHAR(50) DEFAULT 'Net 30',
  `contact_person` VARCHAR(100),
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `status` VARCHAR(30) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customers / Fleet Clients
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `gstin` VARCHAR(30) NOT NULL,
  `credit_limit` DECIMAL(12,2) DEFAULT 500000.00,
  `credit_days` INT DEFAULT 30,
  `outstanding_balance` DECIMAL(12,2) DEFAULT 0.00,
  `contact_person` VARCHAR(100),
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Products / Item Master
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `sku` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `hsn` VARCHAR(20) NOT NULL,
  `uom` VARCHAR(20) NOT NULL,
  `cost_price` DECIMAL(10,2) NOT NULL,
  `selling_price` DECIMAL(10,2) NOT NULL,
  `current_stock` INT DEFAULT 0,
  `min_stock` INT DEFAULT 10,
  `max_stock` INT DEFAULT 200,
  `reorder_point` INT DEFAULT 30,
  `safety_stock` INT DEFAULT 15,
  `bin_location` VARCHAR(50) DEFAULT 'A-01-01',
  `primary_supplier_id` VARCHAR(50),
  `primary_supplier` VARCHAR(255),
  `gst_rate` DECIMAL(4,1) DEFAULT 18.0,
  `fsn_category` VARCHAR(5) DEFAULT 'F',
  `abc_category` VARCHAR(5) DEFAULT 'A',
  `weight_kg` DECIMAL(8,2) DEFAULT 1.0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Purchase Orders (Inbound Procurement)
DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `po_number` VARCHAR(100) UNIQUE NOT NULL,
  `vendor_id` VARCHAR(50) NOT NULL,
  `vendor_name` VARCHAR(255) NOT NULL,
  `branch_id` VARCHAR(50) NOT NULL,
  `branch_name` VARCHAR(255) NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery` DATE NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `tax_amount` DECIMAL(12,2) NOT NULL,
  `grand_total` DECIMAL(12,2) NOT NULL,
  `payment_terms` VARCHAR(50) DEFAULT 'Net 30',
  `status` VARCHAR(50) DEFAULT 'Approved',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Purchase Order Line Items
DROP TABLE IF EXISTS `po_items`;
CREATE TABLE `po_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `received_quantity` INT DEFAULT 0,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `gst_rate` DECIMAL(4,1) DEFAULT 18.0,
  `total` DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Goods Receipt Notes (GRN & QC)
DROP TABLE IF EXISTS `goods_receipts`;
CREATE TABLE `goods_receipts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `grn_number` VARCHAR(100) UNIQUE NOT NULL,
  `po_number` VARCHAR(100) NOT NULL,
  `vendor_name` VARCHAR(255) NOT NULL,
  `branch_name` VARCHAR(255) NOT NULL,
  `receipt_date` DATE NOT NULL,
  `invoice_number` VARCHAR(100),
  `invoice_date` DATE,
  `gate_pass_number` VARCHAR(100),
  `vehicle_number` VARCHAR(50),
  `qc_status` VARCHAR(50) DEFAULT 'Accepted',
  `total_received_qty` INT DEFAULT 0,
  `total_accepted_qty` INT DEFAULT 0,
  `total_rejected_qty` INT DEFAULT 0,
  `qc_inspector` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Sales Orders (B2B Fleet Fulfillment)
DROP TABLE IF EXISTS `sales_orders`;
CREATE TABLE `sales_orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `so_number` VARCHAR(100) UNIQUE NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `branch_id` VARCHAR(50) NOT NULL,
  `branch_name` VARCHAR(255) NOT NULL,
  `order_date` DATE NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `tax_amount` DECIMAL(12,2) NOT NULL,
  `grand_total` DECIMAL(12,2) NOT NULL,
  `priority` VARCHAR(50) DEFAULT 'Standard',
  `shipping_address` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Ready for Dispatch',
  `payment_status` VARCHAR(50) DEFAULT 'Unpaid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Invoices & 3-Way Matching (AP & AR)
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` VARCHAR(50) PRIMARY KEY,
  `invoice_number` VARCHAR(100) UNIQUE NOT NULL,
  `type` VARCHAR(10) NOT NULL, -- 'AP' or 'AR'
  `po_number` VARCHAR(100),
  `grn_number` VARCHAR(100),
  `so_number` VARCHAR(100),
  `vendor_or_customer` VARCHAR(255) NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending Payment',
  `match_status` VARCHAR(50) DEFAULT '3-Way Matched (100% Pass)',
  `eway_bill_no` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Immutable Audit Trail
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `user_name` VARCHAR(100) NOT NULL,
  `role_key` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(50) NOT NULL,
  `action_code` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SEED INITIAL MOTOHELP ENTERPRISE DATA
-- ============================================================================

INSERT INTO `branches` (`id`, `name`, `code`, `city`, `state`, `type`, `address`, `gstin`, `capacity_sqft`, `current_utilization`) VALUES
('BR-MUM-01', 'Bhandup Central Hub (HQ)', 'HUB-MUM', 'Mumbai', 'Maharashtra', 'Central Distribution Center', 'C210, Neptune Eastern Business District, LBS Marg, Bhandup (W), Mumbai - 400078', '27AABCM9012G1Z8', 25000, 78),
('BR-BHW-01', 'Bhiwandi Mega Logistics Depot', 'HUB-BHW', 'Thane / Bhiwandi', 'Maharashtra', 'Mega Buffer Warehouse', 'Building B4, Renaissance Industrial Park, Vashere, Bhiwandi - 421302', '27AABCM9012G1Z8', 60000, 64),
('BR-PUN-01', 'Pune Chakan Auto Depot', 'DEP-PUN', 'Pune', 'Maharashtra', 'Regional Fulfillment Depot', 'Plot A-14, Phase II, Chakan Industrial Area, MIDC, Pune - 410501', '27AABCM9012G1Z8', 20000, 82),
('BR-DEL-01', 'Delhi NCR Manesar Hub', 'HUB-DEL', 'Gurugram', 'Haryana', 'North India Regional Hub', 'Plot 88, Sector 8, IMT Manesar, Gurugram, Haryana - 122051', '06AABCM9012G1Z4', 35000, 71);

INSERT INTO `suppliers` (`id`, `name`, `code`, `category`, `city`, `state`, `gstin`, `rating`, `otif_score`, `lead_time_days`, `payment_terms`, `contact_person`, `phone`, `email`) VALUES
('SUP-001', 'Bosch Auto Systems India Pvt Ltd', 'VND-BOSCH', 'Braking & Fuel Injection', 'Bengaluru', 'Karnataka', '29AABCB1234F1Z5', 4.9, 98.2, 4, 'Net 45', 'Anand Kulkarni', '+91 80 6752 1111', 'orders@in.bosch.com'),
('SUP-002', 'Castrol India Limited', 'VND-CASTROL', 'Lubricants & Chemical Fluids', 'Mumbai', 'Maharashtra', '27AABCC5678G1Z1', 4.8, 96.5, 3, 'Net 30', 'Rohit Singhania', '+91 22 6698 4100', 'customercare@castrol.co.in'),
('SUP-003', 'Lumax Industries Limited', 'VND-LUMAX', 'Automotive Lighting & Electricals', 'Gurugram', 'Haryana', '06AABCL9012H1Z9', 4.7, 94.8, 6, 'Net 30', 'Deepak Verma', '+91 124 476 1000', 'oem.sales@lumaxauto.com'),
('SUP-004', 'Exide Industries Limited', 'VND-EXIDE', 'Battery & Storage Solutions', 'Kolkata', 'West Bengal', '19AABCE3456J1Z3', 4.8, 97.1, 5, 'Net 30', 'Sujit Banerjee', '+91 33 2283 2120', 'institutional@exide.co.in');

INSERT INTO `products` (`id`, `sku`, `name`, `category`, `hsn`, `uom`, `cost_price`, `selling_price`, `current_stock`, `min_stock`, `max_stock`, `reorder_point`, `safety_stock`, `bin_location`, `primary_supplier_id`, `primary_supplier`, `gst_rate`, `fsn_category`, `abc_category`) VALUES
('PROD-001', 'MH-BRK-001', 'Ceramic High-Performance Brake Pad Kit', 'Braking & Suspension', '87083000', 'Set', 1650.00, 2250.00, 48, 20, 250, 50, 25, 'A-01-01', 'SUP-001', 'Bosch Auto Systems India Pvt Ltd', 18.0, 'F', 'A'),
('PROD-002', 'MH-LUB-001', 'Castrol Edge 5W-40 Fully Synthetic Engine Oil (4L)', 'Lubricants & Fluids', '27101981', 'Can', 1850.00, 2450.00, 225, 40, 400, 60, 30, 'C-01-01', 'SUP-002', 'Castrol India Limited', 18.0, 'F', 'A'),
('PROD-003', 'MH-INJ-CRDI', 'CRDi Common Rail Fuel Injector Kit (Set of 4)', 'Engine & Powertrain', '84099990', 'Kit', 7200.00, 10200.00, 18, 10, 80, 25, 12, 'A-02-04', 'SUP-001', 'Bosch Auto Systems India Pvt Ltd', 28.0, 'F', 'A'),
('PROD-004', 'MH-ELE-001', 'Bi-LED Projector Headlamp Assembly (Pair)', 'Electricals & Sensors', '85122010', 'Pair', 4200.00, 5800.00, 65, 15, 120, 30, 15, 'B-01-01', 'SUP-003', 'Lumax Industries Limited', 18.0, 'F', 'B'),
('PROD-005', 'MH-BAT-001', 'Amaron Pro 12V 65Ah AGM Lead-Acid Battery', 'Electricals & Sensors', '85071000', 'Unit', 3900.00, 5100.00, 32, 10, 100, 25, 10, 'B-02-04', 'SUP-004', 'Exide Industries Limited', 28.0, 'F', 'A');
