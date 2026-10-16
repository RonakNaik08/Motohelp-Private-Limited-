import React from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  FileBarChart,
  Download,
  Printer,
  TrendingUp,
  Package,
  Building,
  CheckCircle2,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';

export const MISReports = () => {
  const { products, purchaseOrders, salesOrders, suppliers, selectedBranch, grns, invoices } = useSCM();

  const totalInventoryVal = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalPOSpend = purchaseOrders.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalSalesVal = salesOrders.reduce((acc, s) => acc + s.grandTotal, 0);

  const exportMasterCSV = () => {
    const headers = 'SKU,Name,Category,CurrentStock,UOM,CostPrice,SellingPrice,TotalValuation,BinLocation,PrimarySupplier\n';
    const rows = products.map(p => `"${p.sku}","${p.name}","${p.category}",${p.currentStock},"${p.uom}",${p.costPrice},${p.sellingPrice},${p.currentStock * p.costPrice},"${p.binLocation}","${p.primarySupplier}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOTOHELP_INVENTORY_REPORT_${Date.now()}.csv`;
    a.click();
  };

  const exportJSONBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      company: 'Motohelp Private Limited',
      branch: selectedBranch.name,
      products,
      purchaseOrders,
      salesOrders,
      suppliers,
      grns,
      invoices
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOTOHELP_SCM_FULL_BACKUP_${Date.now()}.json`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Executive MIS Reports & Data Analytics</h2>
            <span className="badge badge-green">Automated BI Engine</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Intelligence: <strong>{selectedBranch.name}</strong> • Management Information System & Regulatory Export Center
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportMasterCSV}>
            <FileSpreadsheet size={15} />
            Export Inventory (CSV)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportJSONBackup}>
            <Download size={15} />
            System Backup (JSON)
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            Print MIS Summary
          </button>
        </div>
      </div>

      {/* High-Level Executive Ledger */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem' }}>
          FY 2026-27 Supply Chain Operational Ledger
        </h3>

        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Active Stock Value</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
              ₹{(totalInventoryVal / 100000).toFixed(2)} Lakhs
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{products.length} Active Master SKUs</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Procurement YTD Commitment</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
              ₹{(totalPOSpend / 100000).toFixed(2)} Lakhs
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{purchaseOrders.length} Issued Purchase Orders</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Fulfillment Sales Bookings</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginTop: '0.2rem' }}>
              ₹{(totalSalesVal / 100000).toFixed(2)} Lakhs
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{salesOrders.length} B2B Fleet Orders</div>
          </div>
        </div>

        {/* Fast vs Slow Moving FSN Breakdown */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Inventory Velocity & FSN Classification Audit
          </h4>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classification</th>
                  <th>SKU Count</th>
                  <th>Category Coverage</th>
                  <th>Stock Valuation (₹)</th>
                  <th>Turnover Velocity</th>
                  <th>Replenishment Strategy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-green">Fast Moving (F)</span></td>
                  <td>{products.filter(p => p.fsnCategory === 'F').length} SKUs</td>
                  <td>Engine, Brakes, Lubricants</td>
                  <td><strong>₹{((totalInventoryVal * 0.68) / 100000).toFixed(2)} Lakhs</strong></td>
                  <td><span style={{ color: '#34d399', fontWeight: '700' }}>14.2x / Year</span></td>
                  <td>Weekly automated continuous replenishment</td>
                </tr>
                <tr>
                  <td><span className="badge badge-amber">Slow Moving (S)</span></td>
                  <td>{products.filter(p => p.fsnCategory === 'S').length} SKUs</td>
                  <td>Alternators, Struts, Lighting</td>
                  <td><strong>₹{((totalInventoryVal * 0.28) / 100000).toFixed(2)} Lakhs</strong></td>
                  <td><span style={{ color: '#fbbf24', fontWeight: '700' }}>5.4x / Year</span></td>
                  <td>Min/Max buffer reorder trigger on 40 units</td>
                </tr>
                <tr>
                  <td><span className="badge badge-red">Non-Moving (N)</span></td>
                  <td>1 SKU</td>
                  <td>Obsolete Assemblies</td>
                  <td><strong>₹{((totalInventoryVal * 0.04) / 100000).toFixed(2)} Lakhs</strong></td>
                  <td><span style={{ color: '#f87171', fontWeight: '700' }}>0.8x / Year</span></td>
                  <td>Scrap write-off or vendor buyback protocol</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
