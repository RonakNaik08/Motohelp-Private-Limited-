import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Database,
  RefreshCw,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';

const SAMPLE_CSV_PRODUCTS = `sku,name,category,hsn,costPrice,sellingPrice,gstRate,currentStock,safetyStock,reorderPoint,maxStock,binLocation,primarySupplier
MH-BRK-DISC01,Ventilated Front Brake Rotor Disc (280mm),Braking & Suspension,87083000,1850,2950,18,65,30,50,250,A-01-02,Brembo Brakes India
MH-SPK-IRIDIUM,Iridium Platinum Tough Spark Plug Set (Pack of 4),Electricals & Sensors,85111000,1200,1950,28,140,50,80,400,B-02-01,Bosch Auto Systems
MH-CLT-PLATE,Heavy Duty Clutch Pressure Plate & Friction Disc Kit,Engine & Powertrain,87089300,4200,6800,18,32,15,25,120,A-02-04,Valeo Automotive India
MH-RAD-COOLANT,Concentrated Long-Life Glycol Coolant (5L Canister),Lubricants & Fluids,38200000,650,1050,18,210,80,120,600,C-01-03,Castrol Lubricants India Ltd
MH-WPR-HYBRID,Aerodynamic Hybrid Wiper Blade Pair (24in + 18in),Body & Consumables,85124000,480,850,18,180,60,100,500,B-03-04,Bosch Auto Systems
MH-STR-MTR12V,High-Torque Reduction Starter Motor Assembly 12V 1.4kW,Electricals & Sensors,85114000,3600,5800,28,45,20,35,160,B-01-02,Denso Automotive India`;

export const CSVDataImporterModal = ({ isOpen, onClose }) => {
  const { bulkImportProducts, addProduct, fetchLiveState } = useSCM();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'file' | 'templates'
  const [dataType, setDataType] = useState('products'); // 'products' | 'suppliers' | 'customers'
  const [rawText, setRawText] = useState(SAMPLE_CSV_PRODUCTS);
  const [parsedItems, setParsedItems] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  if (!isOpen) return null;

  // Parse CSV text
  const handleParse = (textToParse = rawText) => {
    setParseError(null);
    setImportSuccess(null);
    try {
      const lines = textToParse.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setParseError('CSV must contain a header row and at least one data row.');
        setParsedItems([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length < 2) continue;

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        // Normalize Product Fields
        items.push({
          id: `PRD-LIVE-${Date.now().toString().slice(-4)}-${i}`,
          sku: row.sku || `MH-IMP-${Math.floor(100 + Math.random() * 900)}`,
          name: row.name || 'Unnamed Automotive Component',
          category: row.category || 'General Auto Parts',
          hsn: row.hsn || '87082900',
          costPrice: Number(row.costPrice || row.cost || 100),
          sellingPrice: Number(row.sellingPrice || row.price || 150),
          gstRate: Number(row.gstRate || row.gst || 18),
          currentStock: Number(row.currentStock || row.stock || 50),
          safetyStock: Number(row.safetyStock || 20),
          reorderPoint: Number(row.reorderPoint || 40),
          maxStock: Number(row.maxStock || 200),
          binLocation: row.binLocation || 'A-01-01',
          primarySupplier: row.primarySupplier || 'Bosch Auto Systems',
          abcCategory: Number(row.costPrice || 100) > 2000 ? 'A' : (Number(row.costPrice || 100) > 800 ? 'B' : 'C'),
          fsnCategory: 'F',
          batchTracking: true
        });
      }

      setParsedItems(items);
    } catch (err) {
      setParseError(`Parse error: ${err.message}`);
      setParsedItems([]);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setRawText(content);
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  // Submit to Live SQLite Database
  const handleImportToDatabase = async () => {
    if (parsedItems.length === 0) return;
    setIsImporting(true);
    setParseError(null);
    try {
      const res = await bulkImportProducts(parsedItems);
      setImportSuccess(`Successfully imported ${parsedItems.length} live records directly into the SQLite database!`);
      setTimeout(() => {
        fetchLiveState();
      }, 500);
    } catch (err) {
      setParseError(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Live Data Ingestion & CSV Importer
                </h3>
                <span className="badge badge-amber">SQLite 3 Direct</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Import real company auto parts, vendor catalogues, opening stock balances into <span style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>database/motohelp_scm.db</span>
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Action Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('paste'); handleParse(rawText); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileSpreadsheet size={15} /> Paste CSV / Text Data
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'file' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('file')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Upload size={15} /> Upload CSV File
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('templates');
              setRawText(SAMPLE_CSV_PRODUCTS);
              handleParse(SAMPLE_CSV_PRODUCTS);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={15} /> Auto Parts Template
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '280px' }}>
          {activeTab === 'file' ? (
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem',
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer'
            }}>
              <Upload size={36} style={{ color: 'var(--accent-amber)', margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Select CSV or Excel-Exported File</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Supports standard comma-separated automotive inventory lists (.csv)</div>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  CSV Payload (Header row + Comma-separated fields)
                </label>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => handleParse(rawText)}
                >
                  <RefreshCw size={12} /> Validate & Preview Rows
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => { setRawText(e.target.value); handleParse(e.target.value); }}
                rows={7}
                className="form-control"
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  lineHeight: '1.4',
                  background: 'var(--bg-input)',
                  resize: 'vertical'
                }}
                placeholder="sku,name,category,hsn,costPrice,sellingPrice,gstRate,currentStock,binLocation..."
              />
            </div>
          )}

          {/* Validation Feedback */}
          {parseError && (
            <div className="badge badge-red" style={{ padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <AlertTriangle size={16} />
              <span>{parseError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="badge badge-green" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>
                  Parsed Preview ({parsedItems.length} Live Items Ready)
                </span>
                <span className="badge badge-blue">Ready for Commit</span>
              </div>
              <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Part Name</th>
                      <th>Category</th>
                      <th>Cost (₹)</th>
                      <th>Selling (₹)</th>
                      <th>Opening Qty</th>
                      <th>Bin Location</th>
                      <th>Primary Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700', color: 'var(--accent-amber)' }}>{it.sku}</td>
                        <td>{it.name}</td>
                        <td>{it.category}</td>
                        <td>₹{it.costPrice?.toLocaleString('en-IN')}</td>
                        <td>₹{it.sellingPrice?.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>{it.currentStock} Units</td>
                        <td><span className="badge badge-neutral">{it.binLocation}</span></td>
                        <td>{it.primarySupplier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              disabled={parsedItems.length === 0 || isImporting}
              onClick={handleImportToDatabase}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px', justifyContent: 'center' }}
            >
              {isImporting ? (
                <>
                  <RefreshCw size={16} className="spin" /> Writing to SQLite Database...
                </>
              ) : (
                <>
                  <Database size={16} /> Import {parsedItems.length} SKUs to Live DB
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
