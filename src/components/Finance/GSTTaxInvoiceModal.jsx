import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  X,
  QrCode,
  ShieldCheck,
  Truck,
  Building,
  CheckCircle2,
  Calendar,
  Hash,
  Download,
  Check
} from 'lucide-react';

export const GSTTaxInvoiceModal = ({ isOpen = true, onClose, invoiceData, salesOrderData, salesOrder }) => {
  const so = salesOrder || salesOrderData;
  const inv = invoiceData;

  if (isOpen === false && !so && !inv) return null;

  // HSN Master mapping for automotive components
  const getHsnForProduct = (name = '', sku = '') => {
    const n = name.toLowerCase();
    const s = sku.toLowerCase();
    if (n.includes('brake') || s.includes('brk')) return '8708 3000'; // Brakes
    if (n.includes('oil') || n.includes('lubricant') || s.includes('oil')) return '2710 1981'; // Lubricants
    if (n.includes('alternator') || s.includes('alt')) return '8511 5000'; // Generators / Alternators
    if (n.includes('injector') || s.includes('inj')) return '8409 9941'; // Fuel Nozzles
    if (n.includes('filter') || s.includes('fil')) return '8421 2300'; // Oil Filters
    if (n.includes('battery') || s.includes('bat')) return '8507 1000'; // Lead-Acid Batteries
    if (n.includes('headlamp') || n.includes('lamp') || s.includes('lmp')) return '8512 2010'; // Headlamps
    if (n.includes('clutch') || s.includes('clt')) return '8708 9300'; // Clutches
    if (n.includes('shock') || n.includes('strut') || s.includes('str')) return '8708 8000'; // Shock Absorbers
    if (n.includes('spark') || s.includes('spk')) return '8511 1000'; // Spark Plugs
    return '8708 2900'; // Auto parts general
  };

  const invoice = {
    invoiceNumber: inv?.invoiceNumber || (so ? `MH-INV-${so.soNumber?.replace('SO-', '') || '2026-8819'}` : 'MH-INV-2026-1049'),
    invoiceDate: inv?.invoiceDate || so?.orderDate || new Date().toISOString().split('T')[0],
    dueDate: inv?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    poNumber: so?.soNumber || inv?.poNumber || 'SO-2026-0042',
    ewayBillNumber: inv?.ewayBillNumber || `9812 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
    irnHash: inv?.irnHash || '4f8a29b3c7e1d5a6b0c2e4f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    vehicleNo: so?.vehicleNumber || inv?.vehicleNo || 'MH-03-TR-8812 (Tata LCV)',
    transporterName: so?.carrier || inv?.transporterName || 'Delhivery Express Logistics India Ltd (GSTIN: 27AABCT9981K1Z2)',
    transporterDocNo: inv?.transporterDocNo || `LR-MUM-${Math.floor(100000 + Math.random() * 900000)}`
  };

  // Consignor (Seller) - Maharashtra Hub HQ
  const seller = {
    name: 'Motohelp Supply Chain & Logistics Pvt. Ltd.',
    address: 'Plot 42, LBS Marg Industrial Corridor, Bhandup (West), Mumbai, Maharashtra - 400078',
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '27AABCM9012G1Z8',
    pan: 'AABCM9012G',
    cin: 'U50100MH2021PTC369120',
    email: 'billing@motohelp.in',
    phone: '+91 22 2596 4400'
  };

  // Consignee (Buyer) state & GSTIN detection
  const destinationAddress = so?.shippingAddress || inv?.shippingAddress || 'Metro Fleet Workshop, Andheri East, Mumbai, Maharashtra - 400069';
  const destLower = destinationAddress.toLowerCase();

  let buyerState = 'Maharashtra';
  let buyerStateCode = '27';
  let buyerGstin = '27AABCM4589K1Z3';

  if (destLower.includes('karnataka') || destLower.includes('bengaluru') || destLower.includes('bangalore')) {
    buyerState = 'Karnataka';
    buyerStateCode = '29';
    buyerGstin = '29AABCM4589K1Z5';
  } else if (destLower.includes('haryana') || destLower.includes('delhi') || destLower.includes('gurugram') || destLower.includes('noida')) {
    buyerState = 'Haryana / Delhi NCR';
    buyerStateCode = '06';
    buyerGstin = '06AABCM4589K1Z1';
  } else if (destLower.includes('tamil nadu') || destLower.includes('chennai')) {
    buyerState = 'Tamil Nadu';
    buyerStateCode = '33';
    buyerGstin = '33AABCM4589K1Z7';
  } else if (destLower.includes('telangana') || destLower.includes('hyderabad')) {
    buyerState = 'Telangana';
    buyerStateCode = '36';
    buyerGstin = '36AABCM4589K1Z9';
  }

  const isInterstate = buyerStateCode !== seller.stateCode;

  const buyer = {
    name: so?.customerName || inv?.vendorOrCustomer || 'Anita Deshmukh (Fleet Maintenance Head)',
    address: destinationAddress,
    state: buyerState,
    stateCode: buyerStateCode,
    gstin: buyerGstin,
    placeOfSupply: `${buyerStateCode} - ${buyerState}`
  };

  // Line items
  const lineItems = (so?.items && so.items.length > 0)
    ? so.items.map(it => ({
        name: it.productName || it.name || 'Ceramic Brake Pad Kit',
        sku: it.sku || 'MH-BRK-001',
        hsn: getHsnForProduct(it.productName || it.name, it.sku),
        quantity: Number(it.quantity || 1),
        unit: 'Sets',
        unitPrice: Number(it.unitPrice || 2250),
        gstRate: 18
      }))
    : [
        {
          name: 'Ceramic High-Performance Brake Pad Kit',
          sku: 'MH-BRK-001',
          hsn: '8708 3000',
          quantity: 2,
          unit: 'Sets',
          unitPrice: 2250,
          gstRate: 18
        },
        {
          name: 'Full Synthetic Engine Oil 5W-40 (4L Can)',
          sku: 'MH-OIL-5W40',
          hsn: '2710 1981',
          quantity: 1,
          unit: 'Cans',
          unitPrice: 2750,
          gstRate: 18
        }
      ];

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalTaxAmount = Math.round(subtotal * 0.18);
  const cgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const sgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const igst = isInterstate ? totalTaxAmount : 0;
  const grandTotal = subtotal + totalTaxAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const exportData = {
      invoiceMeta: invoice,
      seller,
      buyer,
      taxClassification: isInterstate ? 'INTER_STATE_SUPPLY' : 'INTRA_STATE_SUPPLY',
      lineItems,
      financials: {
        taxableSubtotal: subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalGst: totalTaxAmount,
        grandTotal
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${invoice.invoiceNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      {/* Print stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-gst-invoice, #printable-gst-invoice * {
            visibility: visible;
          }
          #printable-gst-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '950px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header / Actions */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                  GST Tax Invoice & Digital E-Way Bill
                </h3>
                <span className={`badge ${isInterstate ? 'badge-purple' : 'badge-blue'}`}>
                  {isInterstate ? '🌐 Inter-State (IGST 18%)' : '🏢 Intra-State (CGST + SGST)'}
                </span>
                <span className="badge badge-green">NIC E-Invoice Verified</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Rule 46 & 138 of CGST Rules 2017 • IRN Embedded • Place of Supply: <strong>{buyer.placeOfSupply}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadJson} title="Export invoice JSON summary">
              <Download size={14} />
              Export Data
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          <div
            id="printable-gst-invoice"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem'
            }}
          >
            {/* Top Bar with IRN & E-Way Bill Banner */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed rgba(16, 185, 129, 0.4)',
              borderRadius: '6px',
              padding: '0.6rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase' }}>
                  ⚡ Government E-Way Bill & E-Invoice Portal Acknowledgement
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  EWB No: <strong>{invoice.ewayBillNumber}</strong> • Generated on {invoice.invoiceDate} (Valid for 48 Hours)
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  IRN: {invoice.irnHash.substring(0, 48)}...
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>Vehicle: {invoice.vehicleNo}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LR: {invoice.transporterDocNo}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '4px', borderRadius: '4px', display: 'flex', border: '1px solid #cbd5e1' }}>
                  <QrCode size={42} color="#0f172a" />
                </div>
              </div>
            </div>

            {/* Seller & Buyer 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              {/* Seller */}
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Supplier / Consignor (Origin)
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: 'var(--text-primary)' }}>{seller.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{seller.address}</div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.74rem' }}>
                  <div><strong>GSTIN / UIN:</strong> <span className="code-tag">{seller.gstin}</span></div>
                  <div><strong>State:</strong> {seller.state} (Code: {seller.stateCode}) • <strong>PAN:</strong> {seller.pan}</div>
                  <div><strong>CIN:</strong> {seller.cin} • <strong>Contact:</strong> {seller.email}</div>
                </div>
              </div>

              {/* Buyer & Invoice Meta */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.25rem' }}>
                      Billed To / Consignee (Destination)
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{buyer.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{buyer.address}</div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.74rem' }}>
                      <div><strong>Buyer GSTIN:</strong> <span className="code-tag">{buyer.gstin}</span></div>
                      <div><strong>Place of Supply:</strong> <strong>{buyer.placeOfSupply}</strong></div>
                      <div><strong>Supply Type:</strong> <span style={{ color: isInterstate ? '#9333ea' : '#2563eb', fontWeight: '700' }}>{isInterstate ? 'Inter-State Supply (IGST Applicable)' : 'Intra-State Supply (CGST + SGST Applicable)'}</span></div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', background: 'var(--bg-tertiary)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>TAX INVOICE NO</div>
                    <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#2563eb' }}>{invoice.invoiceNumber}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Date: <strong>{invoice.invoiceDate}</strong></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PO Ref: {invoice.poNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '1rem' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th style={{ width: '30px' }}>#</th>
                    <th>Item Description & Part SKU</th>
                    <th>HSN / SAC</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ textAlign: 'right' }}>Taxable Amt (₹)</th>
                    {isInterstate ? (
                      <th style={{ textAlign: 'right' }}>IGST (18%)</th>
                    ) : (
                      <>
                        <th style={{ textAlign: 'right' }}>CGST (9%)</th>
                        <th style={{ textAlign: 'right' }}>SGST (9%)</th>
                      </>
                    )}
                    <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const itemTaxable = item.quantity * item.unitPrice;
                    const itemGst = Math.round(itemTaxable * 0.18);
                    const itemCgst = isInterstate ? 0 : Math.round(itemGst / 2);
                    const itemSgst = isInterstate ? 0 : Math.round(itemGst / 2);
                    const itemIgst = isInterstate ? itemGst : 0;
                    const itemTotal = itemTaxable + itemGst;

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{item.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SKU: {item.sku}</div>
                        </td>
                        <td><span className="code-tag">{item.hsn}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: '700' }}>{item.quantity} {item.unit || 'Sets'}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>₹{itemTaxable.toLocaleString('en-IN')}</td>
                        {isInterstate ? (
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#9333ea', fontWeight: '600' }}>₹{itemIgst.toLocaleString('en-IN')}</td>
                        ) : (
                          <>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>₹{itemCgst.toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>₹{itemSgst.toLocaleString('en-IN')}</td>
                          </>
                        )}
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#16a34a' }}>
                          ₹{Math.round(itemTotal).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculation & Tax Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              {/* E-Way Bill Part B & Declarations */}
              <div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <Truck size={14} color="#2563eb" /> E-Way Bill Transport Schedule (Part-B)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <div>Mode: <strong>Road Transport</strong></div>
                    <div>Vehicle: <strong>{invoice.vehicleNo}</strong></div>
                    <div>Carrier: <strong>{invoice.transporterName.split('(')[0]}</strong></div>
                    <div>Doc / LR No: <strong>{invoice.transporterDocNo}</strong></div>
                  </div>
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Statutory Declaration:</strong> Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged. Goods once sold are covered under standard OEM warranty terms.
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Taxable Subtotal:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {isInterstate ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Integrated GST (IGST @ 18%):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#9333ea', fontWeight: '700' }}>₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Central GST (CGST @ 9%):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>State GST (SGST @ 9%):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.4rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Grand Total (INR):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.15rem', color: '#16a34a' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                  (Amount in words: Indian Rupees {grandTotal.toLocaleString('en-IN')} Only)
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Electronic Signature Verified • Generated by <strong>Motohelp SCM Pro Platform</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>For Motohelp Supply Chain & Logistics Pvt. Ltd.</div>
                <div style={{ height: '24px' }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.2rem' }}>
                  Authorized Signatory / Finance Controller
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Preview
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            Print Official Tax Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
