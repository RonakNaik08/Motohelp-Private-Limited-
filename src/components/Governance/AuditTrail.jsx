import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Download
} from 'lucide-react';

export const AuditTrail = () => {
  const { auditLogs, selectedBranch } = useSCM();

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
                          log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.entityId.toLowerCase().includes(search.toLowerCase()) ||
                          log.description.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const exportAuditCSV = () => {
    const headers = 'ID,Timestamp,User,Role,Module,Action,EntityID,Description,IP\n';
    const rows = auditLogs.map(l => `"${l.id}","${l.timestamp}","${l.user}","${l.role}","${l.module}","${l.action}","${l.entityId}","${l.description}","${l.ip}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOTOHELP_AUDIT_LOG_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Immutable Audit Trail & System Event History</h2>
            <span className="badge badge-green">ISO 27001 Security Logging</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Hub Node: <strong>{selectedBranch.name}</strong> • Comprehensive Traceability for Compliance, Procurement & Quality Inspections
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportAuditCSV}>
            <Download size={15} />
            Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search User, Action, Entity ID, or Description..."
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Procurement', 'Warehouse', 'Logistics', 'Sales', 'Finance'].map(m => (
            <button
              key={m}
              className={`btn btn-sm ${moduleFilter === m ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setModuleFilter(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User & Role</th>
              <th>Module</th>
              <th>Action Code</th>
              <th>Entity ID</th>
              <th>Transaction Details</th>
              <th>Origin IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No audit trail records match the search filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {log.timestamp}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{log.user}</div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{log.role}</span>
                  </td>

                  <td>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      {log.module}
                    </span>
                  </td>

                  <td>
                    <span className="code-tag">{log.action}</span>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
                      {log.entityId}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', maxWidth: '420px' }}>
                      {log.description}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {log.ip}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
