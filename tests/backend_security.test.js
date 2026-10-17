// Automated Security, RBAC & Transaction Integrity Test Suite
// Verifies backend fixes for Clerk authentication, route scoping, and atomic inventory transactions

import assert from 'node:assert';

const API_BASE = 'http://localhost:5050/api';

const runTest = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
};

const main = async () => {
  console.log('\n🔒 Starting Motohelp SCM Backend Security & Transaction Tests...\n');

  // Test 1: Forged Header Rejection
  await runTest('P0-1: Request with forged X-User-Role: admin header is rejected (401)', async () => {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: {
        'X-User-Role': 'admin',
        'X-User-Email': 'ronak.naik019@gmail.com'
      }
    });
    assert.strictEqual(res.status, 401, `Expected 401 Unauthorized, got ${res.status}`);
  });

  // Test 2: Unauthenticated Protected Route
  await runTest('P0-3: Unauthenticated access to purchase-orders returns 401', async () => {
    const res = await fetch(`${API_BASE}/purchase-orders`);
    assert.strictEqual(res.status, 401, `Expected 401 Unauthorized, got ${res.status}`);
  });

  // Test 3: Customer Role Forbidden on Staff Routes
  await runTest('P0-3: Customer token cannot access purchase orders (403)', async () => {
    const res = await fetch(`${API_BASE}/purchase-orders`, {
      headers: {
        'Authorization': 'Bearer SCM-DEMO-customer%40fleet.com-customer'
      }
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // Test 4: Forged Admin Token with Non-SuperAdmin Email
  await runTest('P0-1: Forged admin role with non-superadmin email is blocked (403)', async () => {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: {
        'Authorization': 'Bearer SCM-DEMO-intruder%40test.com-admin'
      }
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // Test 5: Super Admin Access
  await runTest('P0-1: Authorized Super Admin (ronak.naik019@gmail.com) can access audit logs', async () => {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: {
        'Authorization': 'Bearer SCM-DEMO-ronak.naik019%40gmail.com-admin'
      }
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected array of audit logs');
  });

  // Test 6: Overselling Rejection
  await runTest('P0-2: Sales order exceeding available stock is rejected atomically (400)', async () => {
    const res = await fetch(`${API_BASE}/sales-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-customer%40fleet.com-customer'
      },
      body: JSON.stringify({
        customerName: 'Metro Fleet Mobility Solutions',
        grandTotal: 9999999,
        items: [{ productId: 'PRD-103', sku: 'MH-ALT-12V', quantity: 99999, unitPrice: 6500 }]
      })
    });
    assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes('Insufficient stock'), 'Expected error message to mention insufficient stock');
  });

  // Test 7: Real Calculated KPIs
  await runTest('P1-4: KPIs endpoint returns authentic computed figures and null for unavailable', async () => {
    const res = await fetch(`${API_BASE}/kpis`, {
      headers: {
        'Authorization': 'Bearer SCM-DEMO-ronak.naik019%40gmail.com-admin'
      }
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(typeof data.inventoryValuation, 'number', 'Expected numeric inventoryValuation');
    assert.strictEqual(data.inventoryTurnover, null, 'Expected inventoryTurnover to be null instead of fabricated');
    assert.strictEqual(data.stockAccuracyRate, null, 'Expected stockAccuracyRate to be null instead of fabricated');
  });

  // Test 8: Unverified Payment Rejection
  await runTest('P1-5: Payment before 3-way match approval is rejected (400)', async () => {
    // 0. Create a fresh PO for clean inwarding
    const testPoNumber = `PO-TEST-${Date.now()}`;
    const poRes = await fetch(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-ronak.naik019%40gmail.com-admin'
      },
      body: JSON.stringify({
        poNumber: testPoNumber,
        vendorName: 'Bosch Auto Systems India Pvt Ltd',
        grandTotal: 1850,
        items: [{ productId: 'PRD-101', sku: 'MH-BRK-PAD-01', name: 'Brake Pad', quantity: 1, unitPrice: 1850 }]
      })
    });
    const poData = await poRes.json();
    assert.strictEqual(poRes.status, 201, 'Expected 201 Created for test PO');

    // 1. Inward a test GRN against the fresh PO to get a pending invoice
    const grnRes = await fetch(`${API_BASE}/grns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-warehouse.admin%40motohelp.com-warehouse'
      },
      body: JSON.stringify({
        poId: poData.id,
        poNumber: testPoNumber,
        vendorName: 'Bosch Auto Systems India Pvt Ltd',
        totalAcceptedQty: 1,
        totalReceivedQty: 1,
        qcStatus: 'Passed'
      })
    });
    const grnData = await grnRes.json();
    assert(grnData.invoiceId, 'Expected GRN to return invoiceId');

    // 2. Attempt to pay before matching
    const payRes = await fetch(`${API_BASE}/invoices/${grnData.invoiceId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-finance.lead%40motohelp.com-finance'
      },
      body: JSON.stringify({ paymentRef: 'EARLY-PAY-TXN' })
    });
    assert.strictEqual(payRes.status, 400, `Expected 400 Bad Request, got ${payRes.status}`);

    // 3. Match invoice
    const matchRes = await fetch(`${API_BASE}/invoices/${grnData.invoiceId}/match`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer SCM-DEMO-finance.lead%40motohelp.com-finance'
      }
    });
    assert.strictEqual(matchRes.status, 200, `Expected 200 OK for match, got ${matchRes.status}`);

    // 4. Now pay
    const validPayRes = await fetch(`${API_BASE}/invoices/${grnData.invoiceId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-finance.lead%40motohelp.com-finance'
      },
      body: JSON.stringify({ paymentRef: 'VERIFIED-TXN-1001' })
    });
    assert.strictEqual(validPayRes.status, 200, `Expected 200 OK for payment, got ${validPayRes.status}`);
  });

  // Test 9: Customer Isolation on Supplier and Customer Directories
  await runTest('Customer Isolation: Customer cannot view supplier directory (403)', async () => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      headers: {
        'Authorization': 'Bearer SCM-DEMO-customer%40fleet.com-customer'
      }
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // Test 10: Customer cannot access database execution tool
  await runTest('Database Protection: Customer cannot execute arbitrary SQL queries (403)', async () => {
    const res = await fetch(`${API_BASE}/db/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SCM-DEMO-customer%40fleet.com-customer'
      },
      body: JSON.stringify({ query: 'SELECT * FROM users' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  console.log('\n🎉 All 10 Security, RBAC, Customer Isolation & Transaction Tests Passed Successfully!\n');
};

main().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
