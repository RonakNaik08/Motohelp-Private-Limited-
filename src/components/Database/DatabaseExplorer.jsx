import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Play,
  Search,
  RefreshCw,
  Layers,
  Key,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DatabaseExplorer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('products');
  const [tableData, setTableData] = useState({ rows: [], columns: [] });
  const [loading, setLoading] = useState(false);
  const [customSQL, setCustomSQL] = useState('SELECT * FROM products WHERE current_stock <= reorder_point');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [activeTab, setActiveTab] = useState('BROWSE'); // 'BROWSE', 'SQL'

  // Fetch tables metadata
  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/db/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (e) {
      console.log('API not reachable, using fallback');
    }
  };

  // Fetch selected table rows
  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5050/api/db/table/${tableName}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (e) {
      console.log('Error loading table data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  // Execute custom query
  const handleExecuteQuery = async () => {
    setQueryError('');
    setQueryResult(null);
    try {
      const res = await fetch('http://localhost:5050/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: customSQL })
      });
      const data = await res.json();
      if (!res.ok) {
        setQueryError(data.error || 'Failed to execute query');
      } else {
        setQueryResult(data);
      }
    } catch (e) {
      setQueryError('Backend server on port 5050 not responding');
    }
  };

  const sampleQueries = [
    { label: 'Low Stock Alerts', sql: 'SELECT sku, name, current_stock, reorder_point, primary_supplier_name FROM products WHERE current_stock <= reorder_point' },
    { label: 'Supplier OTIF Scorecard', sql: 'SELECT code, name, otif_score, defect_ppm, rating, payment_terms FROM suppliers ORDER BY otif_score DESC' },
    { label: 'All Branches & Capacity', sql: 'SELECT code, name, city, capacity_sq_ft, utilization_rate, manager_name FROM branches' },
    { label: 'Purchase Orders Summary', sql: 'SELECT po_number, vendor_name, order_date, grand_total, status FROM purchase_orders' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={22} style={{ color: 'var(--accent-amber)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Motohelp SCM Database Explorer & SQL Studio</h2>
            <span className="badge badge-green">SQLite 3 (WAL Mode)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            File Location: <code>/Users/ronak/Desktop/majorproject/database/motohelp_scm.db</code> • Live Table Browsing & Real-time Query Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'BROWSE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('BROWSE')}
          >
            <Table size={15} />
            Table Browser
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'SQL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('SQL')}
          >
            <Terminal size={15} />
            SQL Query Studio
          </button>
        </div>
      </div>

      {activeTab === 'BROWSE' ? (
        /* Table Browser View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '240px minmax(0, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0
        }}>
          {/* Tables Sidebar */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '240px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Database Tables ({tables.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '520px', overflowY: 'auto' }}>
              {tables.map(t => (
                <div
                  key={t.tableName}
                  onClick={() => setSelectedTable(t.tableName)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedTable === t.tableName ? 'var(--gradient-brand)' : 'transparent',
                    color: selectedTable === t.tableName ? '#090d16' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: selectedTable === t.tableName ? '800' : '500',
                    fontSize: '0.8rem',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => { if (selectedTable !== t.tableName) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (selectedTable !== t.tableName) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Table size={14} style={{ minWidth: '14px' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tableName}</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem', background: selectedTable === t.tableName ? 'rgba(0,0,0,0.15)' : undefined, color: selectedTable === t.tableName ? '#000' : undefined }}>
                    {t.rowCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table Data View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Table</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                  {selectedTable} ({tableData.rows.length} rows loaded)
                </h3>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => fetchTableData(selectedTable)}>
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* Table Rows with Horizontal Scroll Container */}
            <div className="table-container" style={{ maxHeight: '480px', overflowY: 'auto', overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
              <table className="data-table" style={{ width: '100%', minWidth: tableData.columns.length > 5 ? `${tableData.columns.length * 150}px` : '100%' }}>
                <thead>
                  <tr>
                    {tableData.columns.map(c => (
                      <th key={c.name} style={{ whiteSpace: 'nowrap', padding: '0.75rem 0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {Boolean(c.pk) && <Key size={12} style={{ color: 'var(--accent-amber)' }} />}
                          <span style={{ fontWeight: '700' }}>{c.name}</span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '400' }}>({c.type})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={tableData.columns.length || 1} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                        No records currently stored in table <code>{selectedTable}</code>.
                      </td>
                    </tr>
                  ) : (
                    tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {tableData.columns.map(c => (
                          <td key={c.name} style={{ fontFamily: typeof row[c.name] === 'number' ? 'var(--font-mono)' : 'inherit', fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0.75rem 0.9rem' }}>
                            {row[c.name] === null ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span> : String(row[c.name])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SQL Query Studio View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0 }}>
          {/* Sample Query Buttons */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Presets:
            </span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setCustomSQL(sq.sql)}
              >
                {sq.label}
              </button>
            ))}
          </div>

          {/* SQL Editor Area */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Enter SQL Query (SELECT statements against SQLite DB)
              </label>
              <button className="btn btn-primary btn-sm" onClick={handleExecuteQuery}>
                <Play size={14} />
                Execute Query
              </button>
            </div>

            <textarea
              className="form-textarea"
              rows={4}
              value={customSQL}
              onChange={e => setCustomSQL(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', background: '#0b0f19', color: '#38bdf8' }}
            />

            {queryError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                ⚠️ {queryError}
              </div>
            )}
          </div>

          {/* Custom Query Result Table */}
          {queryResult && (
            <div className="glass-card" style={{ padding: '1.25rem', width: '100%', maxWidth: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#34d399' }}>
                  ✓ Query Executed: {queryResult.rowCount} rows returned
                </span>
              </div>

              <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
                <table className="data-table" style={{ width: '100%', minWidth: queryResult.rows.length > 0 && Object.keys(queryResult.rows[0]).length > 5 ? `${Object.keys(queryResult.rows[0]).length * 150}px` : '100%' }}>
                  <thead>
                    <tr>
                      {queryResult.rows.length > 0 && Object.keys(queryResult.rows[0]).map(k => (
                        <th key={k} style={{ whiteSpace: 'nowrap', padding: '0.75rem 0.9rem' }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, vIdx) => (
                          <td key={vIdx} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0.75rem 0.9rem' }}>
                            {val === null ? 'NULL' : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
