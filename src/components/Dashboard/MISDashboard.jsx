import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  FileText,
  Boxes,
  Truck,
  Users,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Laptop,
  Armchair,
  Mouse,
  Monitor,
  Keyboard,
  Building2,
  Navigation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const MISDashboard = ({ onOpenCreatePO, onOpenCreateSO, onOpenInwardGRN, onOpenTransfer }) => {
  const {
    products,
    purchaseOrders,
    salesOrders,
    shipments,
    suppliers,
    setActiveModule
  } = useSCM();

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [chartPeriod, setChartPeriod] = useState('Monthly');

  // 1. Enterprise Revenue & Procurement Comparison Chart Data
  const financialTrendData = [
    { month: 'Jan', sales: 14.2, procurement: 10.1, target: 13.0 },
    { month: 'Feb', sales: 15.6, procurement: 11.4, target: 14.0 },
    { month: 'Mar', sales: 18.9, procurement: 13.8, target: 16.5 },
    { month: 'Apr', sales: 16.4, procurement: 12.0, target: 15.5 },
    { month: 'May', sales: 17.8, procurement: 11.9, target: 17.0 },
    { month: 'Jun', sales: 18.7, procurement: 12.4, target: 18.0 }
  ];

  // 2. Inventory Health Breakdown (Clean enterprise donut)
  const inventoryHealthData = [
    { name: 'Optimal Stock', value: 3420, percent: '68%', color: '#1E3A5F' },
    { name: 'Adequate', value: 980, percent: '19%', color: '#5B8FA8' },
    { name: 'Low Stock Alert', value: 420, percent: '8%', color: '#B7791F' },
    { name: 'Critical / Out', value: 240, percent: '5%', color: '#C53D3D' }
  ];

  // 3. Operational Order Status Distribution
  const orderFulfillmentData = [
    { stage: 'PO Raised', count: 184, value: 4.2 },
    { stage: 'GRN Verified', count: 152, value: 3.8 },
    { stage: 'Warehouse Staged', count: 210, value: 5.1 },
    { stage: 'Dispatched', count: 178, value: 4.6 },
    { stage: 'Delivered', count: 480, value: 12.8 }
  ];

  // 4. Low Stock Items (Enterprise high density)
  const lowStockTableData = [
    { id: 1, name: 'Wireless Barcode Scanner WH-2048', sku: 'WBS-2048', icon: Laptop, category: 'Warehouse Scanning', currentStock: 4, reorderLevel: 20, leadTime: '3 Days', status: 'Critical', statusClass: 'badge-danger' },
    { id: 2, name: 'Industrial Safety Helmet SAF-1024', sku: 'SAF-1024', icon: Armchair, category: 'Safety & PPE Gear', currentStock: 8, reorderLevel: 25, leadTime: '2 Days', status: 'Low Stock', statusClass: 'badge-warning' },
    { id: 3, name: 'Thermal Label Printer PR-3012', sku: 'PR-3012', icon: Mouse, category: 'Packaging & Labelling', currentStock: 12, reorderLevel: 50, leadTime: '5 Days', status: 'Low Stock', statusClass: 'badge-warning' },
    { id: 4, name: 'Heavy-Duty Strapping Tool ST-900', sku: 'ST-900', icon: Monitor, category: 'Packaging & Labelling', currentStock: 3, reorderLevel: 15, leadTime: '4 Days', status: 'Critical', statusClass: 'badge-danger' },
    { id: 5, name: 'RFID Asset Tracking Tags (1000pk)', sku: 'RFID-1000', icon: Keyboard, category: 'Warehouse Scanning', currentStock: 10, reorderLevel: 30, leadTime: '2 Days', status: 'Low Stock', statusClass: 'badge-warning' }
  ];

  // 5. Recent Enterprise Orders
  const recentOrdersData = [
    { orderNo: 'PO-10234', type: 'Purchase Order', date: '26 Nov 2024', partner: 'ABC Industrial Supplies Ltd.', items: '18 SKUs', status: 'Pending Approval', amount: '₹ 45,00,000', statusClass: 'badge-warning' },
    { orderNo: 'SO-10235', type: 'Sales Order', date: '25 Nov 2024', partner: 'XYZ Automotive Pvt. Ltd.', items: '12 SKUs', status: 'In Transit', amount: '₹ 32,00,000', statusClass: 'badge-info' },
    { orderNo: 'PO-10233', type: 'Purchase Order', date: '25 Nov 2024', partner: 'Tech Solutions India', items: '24 SKUs', status: 'Delivered', amount: '₹ 78,00,000', statusClass: 'badge-success' },
    { orderNo: 'SO-10232', type: 'Sales Order', date: '24 Nov 2024', partner: 'Global Distribution Enterprises', items: '40 SKUs', status: 'Dispatched', amount: '₹ 56,00,000', statusClass: 'badge-info' },
    { orderNo: 'PO-10231', type: 'Purchase Order', date: '24 Nov 2024', partner: 'Apex Hardware & Tools', items: '8 SKUs', status: 'Under Inspection', amount: '₹ 21,00,000', statusClass: 'badge-warning' }
  ];

  // 6. Supplier SLA & Performance
  const supplierPerformanceData = [
    { name: 'ABC Industrial Supplies Ltd.', code: 'SUP-101', onTime: '96.4%', qualityScore: '98.2%', totalOrders: 48, spend: '₹3.4 Cr', status: 'Preferred', statusClass: 'badge-success' },
    { name: 'Tech Solutions India', code: 'SUP-102', onTime: '91.8%', qualityScore: '94.5%', totalOrders: 36, spend: '₹2.8 Cr', status: 'Compliant', statusClass: 'badge-info' },
    { name: 'Apex Hardware & Tools', code: 'SUP-103', onTime: '94.2%', qualityScore: '96.0%', totalOrders: 42, spend: '₹2.1 Cr', status: 'Compliant', statusClass: 'badge-info' },
    { name: 'Global Logistics Traders', code: 'SUP-104', onTime: '84.5%', qualityScore: '89.2%', totalOrders: 28, spend: '₹1.5 Cr', status: 'Watchlist', statusClass: 'badge-warning' },
    { name: 'Prime Manufacturing Corp', code: 'SUP-105', onTime: '79.0%', qualityScore: '82.5%', totalOrders: 25, spend: '₹1.2 Cr', status: 'Under Review', statusClass: 'badge-danger' }
  ];

  // 7. Active Freight Consignments
  const shipmentStatusData = [
    { id: 'SH-1001', vehicle: 'MH-12-AB-4521', carrier: 'FastTrack Logistics', route: 'Mumbai HQ → Pune Hub', eta: '2h 14m', status: 'In Transit', statusClass: 'badge-info' },
    { id: 'SH-1002', vehicle: 'MH-04-CD-8921', carrier: 'Delhivery Freight', route: 'Nashik DC → Mumbai WH-1', eta: '48 mins', status: 'In Transit', statusClass: 'badge-info' },
    { id: 'SH-1003', vehicle: 'GJ-01-EF-3345', carrier: 'BlueDart Apex', route: 'Surat Depot → Ahmedabad Central', eta: '3h 20m (Delayed)', status: 'Delayed', statusClass: 'badge-danger' },
    { id: 'SH-1004', vehicle: 'MH-14-GH-7788', carrier: 'Gati KWE', route: 'Pune MIDC → Nagpur Hub', eta: '5h 10m', status: 'In Transit', statusClass: 'badge-info' },
    { id: 'SH-1005', vehicle: 'KA-05-IJ-9900', carrier: 'Safexpress Direct', route: 'Bengaluru EC → Chennai Port', eta: 'Delivered (09:40 AM)', status: 'Delivered', statusClass: 'badge-success' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '2.5rem' }}>
      {/* 1. Page Header with Title & Operational Date Range Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Enterprise Operations & SCM Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Consolidated overview of procurement, inventory health, sales fulfillment, and logistics telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-input)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            <Calendar size={14} style={{ color: 'var(--brand-primary)' }} />
            <span>Operational Cycle: <strong>Q4 2026</strong></span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>10:24 AM IST</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: 'var(--radius-input)' }}>
            {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'YTD'].map(period => (
              <button
                key={period}
                type="button"
                onClick={() => setDateRange(period)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: dateRange === period ? '600' : '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: dateRange === period ? '#FFFFFF' : 'transparent',
                  color: dateRange === period ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  boxShadow: dateRange === period ? 'var(--shadow-sm)' : 'none',
                  transition: 'var(--transition)'
                }}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveModule('reports')}
          >
            <FileText size={13} /> Export Operational MIS
          </button>
        </div>
      </div>

      {/* 2. Critical Action Required Strip (Professional Operational Alert) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'var(--semantic-warning-bg)',
          border: '1px solid var(--semantic-warning-border)',
          borderRadius: 'var(--radius-card)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={16} style={{ color: 'var(--semantic-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            <strong>Operational Attention Required:</strong> 42 SKUs have breached safety reorder thresholds, and 3 regional consignments report transit delays.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('inventory')}
            style={{ fontSize: '12px', height: '28px', padding: '0 10px', borderColor: 'var(--semantic-warning-border)' }}
          >
            Review Low Stock (42)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('logistics')}
            style={{ fontSize: '12px', height: '28px', padding: '0 10px', borderColor: 'var(--semantic-warning-border)' }}
          >
            View Delayed Freight (3)
          </button>
        </div>
      </div>

      {/* 3. Six Standardized Enterprise KPI Cards (All Uniform White Surface) */}
      <div className="grid-6">
        {/* KPI 1: Total Sales */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Total Sales
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DollarSign size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              ₹18.7 Cr
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} /> 12.4%
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Purchase Value */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Purchase Value
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              ₹12.4 Cr
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} /> 8.2%
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Inventory Value */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Inventory Value
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Boxes size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              ₹8.2 Cr
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDown size={12} /> 2.1%
              </span>
              <span style={{ color: 'var(--text-muted)' }}>inventory turn rate: 5.4x</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Orders */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Pending Orders
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              126
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-info)', fontWeight: '600' }}>
                ● 38 Awaiting Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* KPI 5: Low Stock Items */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Low Stock Items
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--semantic-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              42
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-warning)', fontWeight: '600' }}>
                ↑ 6 items require PO
              </span>
            </div>
          </div>
        </div>

        {/* KPI 6: Delayed Shipments */}
        <div
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '118px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Delayed Shipments
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                color: 'var(--semantic-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Truck size={16} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              18
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ color: 'var(--semantic-success)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDown size={12} /> 2 from yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Analytics Row: Financial Revenue Trend & Inventory Health Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Chart 1: Sales vs Procurement Monthly Trend */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Sales Revenue vs. Procurement Spend (₹ Cr)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Comparison of top-line commercial turnover against raw material purchase spend
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1E3A5F' }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Sales Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#5B8FA8' }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Procurement Spend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '2px', background: '#16845B' }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Target Baseline</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '230px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-table)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 22]} ticks={[0, 5, 10, 15, 20]} />
                <Tooltip
                  cursor={{ fill: 'rgba(30, 58, 95, 0.04)' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  formatter={(value) => [`₹ ${value} Cr`, '']}
                />
                <Bar dataKey="sales" fill="#1E3A5F" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="procurement" fill="#5B8FA8" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Status & Health Breakdown */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Inventory Stock Health
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                5,060 Total active SKUs across 4 warehouses
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '220px' }}>
            {/* Donut Chart with Center Text */}
            <div style={{ position: 'relative', width: '150px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryHealthData}
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {inventoryHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.1 }}>5,060</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Active SKUs</div>
              </div>
            </div>

            {/* Custom Right Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingLeft: '16px' }}>
              {inventoryHealthData.map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.value}</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', minWidth: '32px', textAlign: 'right' }}>{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Dense Operational Tables: Low Stock Items & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Table 1: Low Stock Alert Watchlist */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Low Stock Threshold Watchlist
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Critical SKUs requiring immediate purchase order replenishment
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModule('inventory')}
            >
              View Inventory <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product & Description</th>
                  <th>SKU Code</th>
                  <th style={{ textAlign: 'center' }}>Current</th>
                  <th style={{ textAlign: 'center' }}>Reorder Level</th>
                  <th style={{ textAlign: 'center' }}>Lead Time</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockTableData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.category}</div>
                    </td>
                    <td>
                      <span className="code-tag">{item.sku}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: item.status === 'Critical' ? 'var(--semantic-danger)' : 'var(--text-primary)' }}>
                      {item.currentStock}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {item.reorderLevel}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {item.leadTime}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Purchase & Sales Orders */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Recent SCM Transactions
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Latest purchase orders and commercial sales releases
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModule('procurement')}
            >
              All Orders <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Type</th>
                  <th>Partner</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersData.map((order, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                        {order.orderNo}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.date}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {order.type}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                        {order.partner}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.items}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${order.statusClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {order.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Bottom Row: Supplier Performance Directory & Live Logistics Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Table 3: Supplier Performance Matrix */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Supplier SLA & Performance Index
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Vendor adherence to on-time delivery (OTD) and quality audit ratings
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModule('suppliers')}
            >
              Directory <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier Organization</th>
                  <th style={{ textAlign: 'center' }}>On-Time Rate</th>
                  <th style={{ textAlign: 'center' }}>Quality</th>
                  <th style={{ textAlign: 'center' }}>Total Spend</th>
                  <th style={{ textAlign: 'right' }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierPerformanceData.map((sup, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{sup.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sup.code}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {sup.onTime}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {sup.qualityScore}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {sup.spend}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${sup.statusClass}`}>
                        {sup.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Active Fleet Shipments & ETA */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Active Freight & Logistics Status
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Live transit monitoring on interstate corridor routes
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModule('logistics')}
            >
              Live GPS Map <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Vehicle & Carrier</th>
                  <th>Corridor Route</th>
                  <th style={{ textAlign: 'center' }}>ETA</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shipmentStatusData.map((shp, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                        {shp.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{shp.vehicle}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{shp.carrier}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {shp.route}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: shp.status === 'Delayed' ? 'var(--semantic-danger)' : 'var(--text-primary)' }}>
                      {shp.eta}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${shp.statusClass}`}>
                        {shp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
