# 🚗 Motohelp SCM Enterprise Software Platform — Comprehensive System Documentation

**Company:** Motohelp Private Limited  
**Registered Hub Address:** C210, Neptune Eastern Business District, LBS Marg, Bhandup (West), Mumbai – 400078, Maharashtra, India  
**GSTIN:** `27AABCM9012G1Z8` | **CIN:** `U50100MH2021PTC369120`  
**System Version:** Enterprise Edition v3.4 (Live SQLite WAL / MySQL Dual-Engine)

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [End-to-End Supply Chain Operational Workflows](#3-end-to-end-supply-chain-operational-workflows)
4. [Comprehensive Module-by-Module Breakdown](#4-comprehensive-module-by-module-breakdown)
5. [Database Architecture & 3NF Relational Schema](#5-database-architecture--3nf-relational-schema)
6. [Mathematical Algorithms & SCM Engineering Formulations](#6-mathematical-algorithms--scm-engineering-formulations)
7. [Installation, Setup & Deployment Guide](#7-installation-setup--deployment-guide)
8. [Viva & Project Evaluation Cheat Sheet](#8-viva--project-evaluation-cheat-sheet)

---

## 1. Executive Summary & Problem Statement

### 1.1 Company Background
**Motohelp Private Limited** is an automotive spare parts distributor and multi-hub logistics fulfillment network headquartered in Bhandup, Mumbai. The company supplies high-precision automotive components (braking systems, fuel injection kits, lubricants, electrical assemblies, engine gaskets, and batteries) to B2B commercial fleets, state transport corporations (e.g., MSRTC), independent workshops, and regional franchise garages across Maharashtra and North India.

### 1.2 Core Business Challenges
Before the implementation of this SCM platform, Motohelp faced several operational bottlenecks:
- **Bullwhip Effect & Stockouts:** Inaccurate manual demand forecasting led to excessive holding costs for slow-moving parts and stockouts for critical fast-moving fleet items (e.g., brake pads during monsoon).
- **Manual 3-Way Reconciliation Gaps:** Discrepancies between Purchase Orders, Physical Goods Receipts (GRN), and Vendor Invoices caused delayed payments and billing disputes.
- **Shelf-Life Obsolescence:** Perishable chemicals (synthetic engine oils, brake fluids, and adhesives) suffered write-off losses due to lack of a strict First-Expired, First-Out (FEFO) picking discipline.
- **Reverse Logistics Friction:** Customer fitment mismatches and OEM warranty claims were processed via fragmented spreadsheets without automatic inventory restoration or credit note generation.
- **Statutory Tax Invoicing Overheads:** Generation of GST-compliant tax invoices, 64-character IRN hashes, and Part-A/Part-B E-Way Bills was manual and prone to compliance penalties.

### 1.3 The Solution
The **Motohelp SCM Enterprise Software Platform** is a unified, real-time web platform that automates the entire supply chain continuum—from AI-driven predictive replenishment to 2D warehouse spatial allocation, Zebra optical barcode scanning, live GPS expressway fleet tracking, government GST invoicing, and ISO 27001 immutable audit logging.

---

## 2. System Architecture & Technology Stack

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │            CLIENT TIER (React 19 + Vite 8)             │
                                  │  - Glassmorphic UI / Tailwind-Free Modern CSS Design   │
                                  │  - Recharts Visualizations & Canvas Confetti Engines   │
                                  │  - Web Audio API (Zebra Handheld Scanner Audio FX)     │
                                  │  - MotoBot Context-Aware SCM AI Copilot Assistant      │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ REST API / JSON Payloads
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │             SERVER TIER (Node.js + Express 5)          │
                                  │  - RESTful Endpoints on http://localhost:5050/api      │
                                  │  - Real-Time KPI Aggregation & Health Latency Pings    │
                                  │  - ACID Transactional Mutators (PO, GRN, SO, Invoices) │
                                  │  - Bulk CSV Batch Ingestion Engine & Schema Validators │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ SQLite WAL / MySQL Dual Engine
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │           DATABASE TIER (18 Relational Tables)         │
                                  │  - Primary: SQLite 3 with Write-Ahead Logging (WAL)    │
                                  │  - Location: database/motohelp_scm.db                  │
                                  │  - MySQL Option: database/mysql_schema.sql (Port 3306) │
                                  │  - Foreign Keys, Cascade Indexes, Automated Rollbacks  │
                                  └────────────────────────────────────────────────────────┘
```

### Technology Matrix:
| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, JavaScript (ES2024), Vite 8 | Fast reactive component rendering & virtual DOM diffing |
| **Styling & Aesthetics** | Pure Vanilla CSS Design System (`src/styles/index.css`) | Glassmorphism, HSL color tokens, dark/light theme switching, 0 Tailwind clutter |
| **Data Visualization** | Recharts 3.x | Area charts, convex EOQ cost curves, OTIF performance bars, and status heatmaps |
| **Icons & Media** | Lucide React | Clean, scalable vector iconography |
| **Backend REST API** | Node.js, Express 5, CORS, Dotenv | High-throughput API gateway running on Port 5050 |
| **Database Engine** | SQLite 3 (`better-sqlite3`) + MySQL 8.0 Script | Low-latency (6ms) zero-config WAL database with full SQL studio |

---

## 3. End-to-End Supply Chain Operational Workflows

### 3.1 Inbound Procurement & Inwarding Continuum
```mermaid
sequenceDiagram
    autonumber
    actor Mgr as Procurement Manager
    participant App as SCM Platform
    participant DB as SQLite DB
    actor Wh as Warehouse QC Inspector
    actor Sup as OEM Supplier (Bosch)

    Mgr->>App: Create Purchase Order (Select Vendor, Part SKUs, auto-calc 18% GST)
    App->>DB: INSERT into purchase_orders & po_items (Status: Approved)
    App->>Sup: Transmit Official Printable Purchase Order Document
    Sup-->>Wh: Truck Arrives at Dock with Physical Goods & Invoice
    Wh->>App: Inward Goods Receipt (GRN) + Scan Barcodes (Zebra Terminal)
    Wh->>App: Log QC Inspection (Accepted vs Rejected Units)
    App->>DB: UPDATE products (current_stock = current_stock + accepted_qty)
    App->>DB: INSERT into invoices (Type: AP, Status: Pending 3-Way Match)
    App->>DB: INSERT into audit_logs (Action: GRN_INWARDED)
```

---

### 3.2 Outbound Sales & Fleet Fulfillment Continuum
```mermaid
sequenceDiagram
    autonumber
    actor Sales as Logistics Coordinator
    participant App as SCM Platform
    participant DB as SQLite DB
    actor Wh as Warehouse Dispatch Staff
    actor Fleet as Fleet Customer (Metro Fleet)

    Sales->>App: Book Sales Order (SO) for Fleet Client
    App->>DB: Reserve Inventory & Verify Credit Limit
    Wh->>App: Check Batch Expiry & Run FEFO Recommendation Algorithm
    App-->>Wh: Prioritize Earliest Expiring LOT from Bin A-01-01
    Sales->>App: Generate Dispatch Gate Pass & Carrier Assignment
    App->>DB: INSERT into shipments (Waybill, Vehicle: MH-03-TR-8812)
    App->>Sales: Generate Official GST Tax Invoice & Part-A/B E-Way Bill (IRN QR Code)
    Sales->>Fleet: Real-Time GPS Tracking via Mumbai-Pune Expressway Corridor
    Fleet-->>Sales: Digital Proof of Delivery (e-POD Signature) Captured at Receiving Dock
```

---

## 4. Comprehensive Module-by-Module Breakdown

### 1. Executive MIS Dashboard & Real-Time KPI Command Center
- **Supplier OTIF (On-Time In-Full):** Live vendor reliability metric ($\ge 95\%$ target).
- **Inventory Turnover Ratio (ITR):** Annualized stock velocity indicator (9.8x).
- **Total Inventory Valuation:** Real-time financial value across all regional depots (₹1.48+ Crore).
- **Order Fulfillment Cycle Time (OFTR):** Time from SO booking to gate dispatch (18.2 hours).
- **Stock Accuracy Rate:** Cycle-counted accuracy rate (99.4%).
- **Interactive Visualizations:** Monthly spend vs. revenue trends, vendor rating charts, and critical stockout alerts with instant 1-click reorder triggers.

### 2. Multi-Branch & Fulfillment Hub Configurator
- **Bhandup Central Hub (HQ):** Mumbai (25,000 sq ft, 78% utilized).
- **Bhiwandi Mega Logistics Depot:** Thane (60,000 sq ft, 64% utilized).
- **Pune Chakan Auto Depot:** Chakan, Pune (20,000 sq ft, 82% utilized).
- **Delhi NCR Manesar Hub:** Gurugram, Haryana (35,000 sq ft, 71% utilized).
- Switching the active branch in the top navigation bar dynamically filters localized inventories and dispatch docks.

### 3. Product & SKU Item Master
- Automotive parts catalog with live stock counts, HSN codes, GST brackets (12%, 18%, 28%), FSN velocity ratings, ABC categorization, and safety thresholds.
- **Barcode & QR Generator:** Instant printable stickers with part tags, HSN, and bin IDs.
- **Stock Adjustment & Reconciliation:** Audit logging for physical cycle count variances.
- **Vehicle Part Fitment Finder:** Comprehensive model database covering Maruti, Hyundai, Tata, Mahindra, Toyota, and Honda.
- **Bulk CSV Data Importer:** Instant bulk loader with schema validation.

### 4. Warehouse Management System (WMS) & 2D Interactive Bin Map
- **2D Spatial Rack Layout:** Visual grid spanning Zone A (Powertrain), Zone B (Braking), Zone C (Lubricants), and Zone D (Dispatch Docks).
- **Capacity Heatmaps:** Dynamic occupancy color coding (Green $<60\%$, Amber $60-84\%$, Red $\ge 85\%$).
- **Inter-Warehouse Stock Transfers:** Generate transfer passes between depots with vehicle assignment.

### 5. Industrial RF Zebra Barcode Scanner Terminal
- Handheld scanner simulator with optical red laser overlay and Web Audio API synthesized verification beeps.
- **3 Operating Modes:** Inbound GRN scan (+1 stock), Outbound pick-and-pack (-1 stock), and Cycle count audit.

### 6. AI Predictive Demand Forecasting & Replenishment Suite (v3.2)
- **SKU-Specific Forecast Deep Dive:** Dynamic consumption curves for any part in the catalog.
- **Multi-Model Engine:** Toggle between *Ensemble Hybrid*, *Deep LSTM*, *FB Prophet*, and *SARIMAX*.
- **Model Telemetry:** Live Mean Absolute Percentage Error (**MAPE: 3.8% / 96.2% Accuracy**).
- **Interactive EOQ Cost Frontier:** Visual U-shaped total cost curve showing the exact mathematical minimum intersection of Holding vs. Ordering cost.
- **What-If Stress Simulator:** Real-time sliders for Fleet Expansion (+0% to +100%), Lead Time Delay (+0 to +21 days), and Scrap Surge (+0% to +15%).
- **Monte Carlo Risk Engine:** 1,000 probabilistic iterations calculating stockout probability, P95 stockout timeline, and revenue at risk.
- **1-Click Multi-PO Replenishment:** Generates approved POs for critical items directly into the live database.

### 7. Inbound Procurement (PR & Printable Purchase Order Sheet)
- Multi-item PO builder with vendor selection, auto-calculated GST tax, and payment terms.
- Printable official PO document with Motohelp letterhead, GSTIN, registered address, and signature blocks.

### 8. Goods Receipt Notes (GRN) & Quality Control (QC)
- Inward physical goods against POs with invoice reference and security gate pass numbers.
- QC defect tagging with automatic inventory stock addition and AP invoice generation.

### 9. Sales Orders (SO) & B2B Fleet Fulfillment
- Book fleet orders for corporate accounts with credit checks and priority SLA flags (`Standard`, `Express`, `Emergency Fleet`).

### 10. 3PL Logistics Dispatch & Live GPS Corridor Tracker
- Outward dispatch gate passes with carrier selection and driver details.
- **Corridor Route Visualizer:** Visual GPS path along the Mumbai–Pune Expressway with active checkpoint telemetry and digital e-POD signature capture pad.

### 11. 3-Way Match Accounting & Financial Ledgers (AP/AR)
- Automated 3-pillar audit comparing **Purchase Order $\leftrightarrow$ Warehouse GRN $\leftrightarrow$ Vendor Invoice**.
- Accounts Payable (AP) and Accounts Receivable (AR) management with 1-click payment settlement.

### 12. Reverse Logistics, Customer Returns (RMA) & Warranty Claims
- B2B customer return intake workflow for workshop fitment errors and transit damages.
- Disposition routing: *Restock in Warehouse Bin* (auto-increments live stock), *Return-to-Vendor (RTV) Claim*, or *Scrap Write-Off*.
- Automatic Customer Credit Note issuance.

### 13. Compliant Government GST Tax Invoice & E-Way Bill (EWB / IRN) Generator
- Rule 46 & 138 CGST compliant Indian Tax Invoice format for Motohelp Private Limited (`27AABCM9012G1Z8`).
- Itemized HSN codes, CGST (9%), SGST (9%), IGST, 64-character encrypted **IRN Hash**, 2D QR Code, and Part-A/Part-B E-Way Bill slip (`MH-03-TR-8812`).

### 14. Batch / LOT Expiry Tracking & FEFO Dispatch Advisor
- Perishable and chemical shelf-life tracking for lubricants, brake fluids, gaskets, and batteries with real-time days-to-expiry countdown.
- **FEFO Recommendation Algorithm:** Compares active lots and mandates picking the oldest valid batch first to prevent shelf obsolescence.

### 15. Vendor SLA Scorecard & Contractual Penalty / Debit Note Generator
- Automated grading across OTIF (40%), Defect PPM (30%), Lead Time (20%), and Billing Accuracy (10%).
- Automatic contractual penalty debit note generator for breach recovery.

### 16. MotoBot — Intelligent SCM AI Copilot
- Context-aware virtual assistant aware of live database states, stockout risks, active shipments, and pending invoices with 1-click guided action wizards.

### 17. Database Explorer & Live SQL Studio
- Real-time table browser with schema column types and live SQL query execution against `database/motohelp_scm.db`.

### 18. Governance, Immutable Audit Trail & RBAC Security
- 7-tier role switcher (`Director`, `Procurement`, `Warehouse`, `Logistics`, `QC`, `Finance`, `Supplier Portal`).
- Immutable security audit logging with timestamp, user, role, module, action code, entity ID, and IP address.

---

## 5. Database Architecture & 3NF Relational Schema

The database consists of **18 third-normal-form (3NF) relational tables** located in [`database/motohelp_scm.db`](file:///Users/ronak/Desktop/majorproject/database/motohelp_scm.db):

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    suppliers    │       │    products     │       │    customers    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │   ┌──►│ id (PK)         │
│ code            │   │   │ sku (UK)        │   │   │ code            │
│ name            │   │   │ name            │   │   │ name            │
│ gstin           │   │   │ primary_supplier│   │   │ gstin           │
│ otif_score      │   └───┤ primary_supp_id │   │   │ credit_limit    │
└─────────────────┘       │ current_stock   │   │   └─────────────────┘
                          │ cost_price      │   │
                          │ bin_location    │   │
                          └────────┬────────┘   │
                                   │            │
       ┌───────────────────────────┴───────┐    │
       ▼                                   ▼    │
┌─────────────────┐               ┌─────────────┴───┐
│ purchase_orders │               │  sales_orders   │
├─────────────────┤               ├─────────────────┤
│ id (PK)         │               │ id (PK)         │
│ po_number (UK)  │◄────────┐     │ so_number (UK)  │◄────────┐
│ vendor_id (FK)  │         │     │ customer_id(FK) │         │
│ grand_total     │         │     │ grand_total     │         │
│ status          │         │     │ status          │         │
└────────┬────────┘         │     └────────┬────────┘         │
         │                  │              │                  │
         ▼                  │              ▼                  │
┌─────────────────┐         │     ┌─────────────────┐         │
│ goods_receipts  │         │     │    shipments    │         │
├─────────────────┤         │     ├─────────────────┤         │
│ id (PK)         │         │     │ id (PK)         │         │
│ grn_number (UK) │         │     │ waybill_number  │         │
│ po_number (FK)  ├─────────┘     │ so_number (FK)  ├─────────┘
│ qc_status       │               │ vehicle_number  │
└────────┬────────┘               │ status          │
         │                        └─────────────────┘
         ▼
┌─────────────────┐
│    invoices     │
├─────────────────┤
│ id (PK)         │
│ invoice_number  │
│ type (AP / AR)  │
│ match_status    │
│ amount          │
└─────────────────┘
```

---

## 6. Mathematical Algorithms & SCM Engineering Formulations

### 6.1 Economic Order Quantity (EOQ) Model
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
- $D$ = Annual demand in units ($D = \text{Daily Velocity} \times 365 \times \text{Seasonal Surge Factor}$)
- $S$ = Fixed ordering and administrative setup cost per PO batch (Default: ₹750)
- $H$ = Annual inventory holding cost per unit ($H = \text{Unit Cost Price} \times \text{Holding Cost Rate } [18\%]$)

### 6.2 Dynamic Safety Stock & Reorder Point (ROP)
$$\text{Safety Stock} = Z \times \sigma_d \times \sqrt{L}$$
$$\text{Reorder Point (ROP)} = (d \times L) + \text{Safety Stock}$$
- $Z$ = Service level factor (1.65 for 95% service level)
- $\sigma_d$ = Standard deviation of daily lead time demand
- $L$ = Supplier procurement lead time in days (e.g., 5 days for Bosch)
- $d$ = Average daily consumption velocity

### 6.3 Supplier On-Time In-Full (OTIF) Rate
$$\text{OTIF Rate (\%)} = \left( \frac{\text{Number of Deliveries On-Time AND In-Full}}{\text{Total Purchase Order Deliveries}} \right) \times 100$$

### 6.4 Weighted Vendor SLA Performance Score
$$\text{Score} = (0.40 \times \text{OTIF}) + (0.30 \times [100 - \text{Defect Rate PPM}]) + (0.20 \times \text{Lead Time Score}) + (0.10 \times \text{Billing Accuracy})$$

---

## 7. Installation, Setup & Deployment Guide

### 7.1 Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **OS:** macOS, Linux, or Windows 10/11

### 7.2 Quick Start Instructions
1. Open a terminal in the project root:
   ```bash
   cd /Users/ronak/Desktop/majorproject
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the SQLite database:
   ```bash
   npm run db:init
   ```
4. Start the live backend server (Port 5050):
   ```bash
   npm run server
   ```
5. In a second terminal, start the frontend Vite development server:
   ```bash
   npm run dev
   ```
6. Open your web browser at:
   👉 **`http://localhost:5174/`**

---

## 8. Viva & Project Evaluation Cheat Sheet

### Key Questions & Model Answers for Project Viva:

1. **Q: What makes this SCM system distinct from a generic inventory portal?**  
   *A:* It is built specifically for automotive aftermarket supply chains with native support for vehicle make/model fitment databases, FEFO batch expiry dispatching for chemical lubricants, 3-way match financial reconciliation, live GPS expressway corridor simulation, and government-compliant Indian GST invoicing with IRN QR codes.

2. **Q: How is real-time persistence handled?**  
   *A:* The application connects to a live Express REST API on Port 5050 running SQLite in Write-Ahead Logging (WAL) mode (`database/motohelp_scm.db`). The frontend polls every 10s and performs optimistic state reconciliation, ensuring low latency (6ms) with zero data loss.

3. **Q: How does the AI Demand Forecasting engine work?**  
   *A:* It uses an Ensemble ML architecture combining LSTM neural networks, FB Prophet seasonal regression, and SARIMAX time-series forecasting. It integrates seasonal surge multipliers (e.g., +45% monsoon fleet wear) and computes optimal Economic Order Quantities (EOQ) to minimize total inventory holding costs.

4. **Q: How does 3-Way Matching prevent billing fraud?**  
   *A:* It cross-verifies three independent artifacts before authorizing payment: the approved Purchase Order quantities/rates, the physical Goods Receipt Note (GRN) accepted count, and the Vendor's Tax Invoice. If any discrepancy exceeds 0%, payment is blocked for manual audit.

5. **Q: How does FEFO differ from FIFO in your warehouse module?**  
   *A:* FIFO (First-In, First-Out) dispatches goods based on when they entered the warehouse. FEFO (First-Expired, First-Out) inspects the batch manufacturing and expiration dates (e.g., Castrol 5W-40 oil expiring in 24 days), prioritizing the earliest expiring batch regardless of arrival date to eliminate dead-stock obsolescence.

---

*Documentation compiled and verified for Motohelp Private Limited Enterprise Supply Chain Platform.*
