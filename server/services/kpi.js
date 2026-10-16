// Motohelp SCM — Real Calculated Business KPIs Service
// Removes fabricated static numbers and computes authentic metrics from persisted SQLite records

export const calculateLiveKPIs = (db) => {
  // 1. Inventory Valuation & Physical Stock
  const invStats = db.prepare(`
    SELECT
      COALESCE(SUM(current_stock * cost_price), 0) AS totalValue,
      COALESCE(SUM(current_stock), 0) AS totalUnits,
      COALESCE(SUM(reserved_stock), 0) AS totalReserved
    FROM products
  `).get();

  // 2. Low Stock & Reorder Alerts
  const lowStock = db.prepare(`
    SELECT COUNT(*) AS count
    FROM products
    WHERE current_stock <= reorder_point
  `).get();

  // 3. Procurement Volume & Total Spend
  const poStats = db.prepare(`
    SELECT
      COUNT(*) AS totalPOs,
      COALESCE(SUM(grand_total), 0) AS totalSpend,
      COUNT(CASE WHEN status = 'Received' THEN 1 END) AS receivedPOs
    FROM purchase_orders
  `).get();

  // 4. Sales Orders & Total Revenue
  const soStats = db.prepare(`
    SELECT
      COUNT(*) AS totalSOs,
      COALESCE(SUM(grand_total), 0) AS totalRevenue,
      COUNT(CASE WHEN status = 'Delivered' THEN 1 END) AS deliveredSOs
    FROM sales_orders
  `).get();

  // 5. Supplier OTIF (On-Time In-Full) Real Average
  const supplierStats = db.prepare(`
    SELECT
      COUNT(*) AS count,
      AVG(otif_score) AS avgOTIF,
      AVG(rating) AS avgRating
    FROM suppliers
    WHERE status != 'Inactive'
  `).get();

  // 6. Fulfillment Cycle Time (Real average in hours for completed shipments)
  const cycleTimeStats = db.prepare(`
    SELECT
      AVG((julianday(COALESCE(estimated_delivery, CURRENT_TIMESTAMP)) - julianday(created_at)) * 24.0) AS avgHours
    FROM shipments
    WHERE status = 'Delivered'
  `).get();

  // 7. Perfect Order Rate (Delivered orders / Total completed orders)
  let perfectOrderRate = null;
  if (soStats.totalSOs > 0) {
    perfectOrderRate = Number(((soStats.deliveredSOs / soStats.totalSOs) * 100).toFixed(1));
  }

  // 8. Financial Outstanding
  const invoiceStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN invoice_type = 'AP' AND status != 'Paid in Full' THEN amount ELSE 0 END), 0) AS apOutstanding,
      COALESCE(SUM(CASE WHEN invoice_type = 'AR' AND status != 'Paid in Full' THEN amount ELSE 0 END), 0) AS arOutstanding
    FROM invoices
  `).get();

  return {
    inventoryValuation: Math.round(invStats.totalValue),
    totalUnitsInStock: invStats.totalUnits,
    totalReservedStock: invStats.totalReserved,
    lowStockAlerts: lowStock.count,
    totalProcurementSpend: Math.round(poStats.totalSpend),
    totalPOsCount: poStats.totalPOs,
    totalSalesRevenue: Math.round(soStats.totalRevenue),
    totalSOsCount: soStats.totalSOs,
    supplierOTIF: supplierStats.avgOTIF ? Number(supplierStats.avgOTIF.toFixed(1)) : null,
    supplierCount: supplierStats.count,
    fulfillmentCycleTimeHours: cycleTimeStats.avgHours ? Number(cycleTimeStats.avgHours.toFixed(1)) : null,
    perfectOrderRate,
    // Metrics that cannot yet be calculated without 90-day historical ledger are explicitly null
    inventoryTurnover: null,
    stockAccuracyRate: null,
    accountsPayableOutstanding: Math.round(invoiceStats.apOutstanding),
    accountsReceivableOutstanding: Math.round(invoiceStats.arOutstanding),
    metricsStatus: 'REAL_CALCULATED_SQLITE'
  };
};
