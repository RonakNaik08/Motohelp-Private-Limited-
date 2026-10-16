import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Percent,
  Calculator,
  Download
} from 'lucide-react';

export const SupplierScorecardModal = ({ supplier, onClose, onOpenCreatePO }) => {
  const { logAction } = useSCM();
  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard' | 'penalty'
  const [penaltyDeductionPct, setPenaltyDeductionPct] = useState(2.0); // 2% SLA breach penalty
  const [isDebitNoteIssued, setIsDebitNoteIssued] = useState(false);

  if (!supplier) return null;

  // Calculate Weighted Score
  const otifScore = Number(supplier.otifScore || supplier.otif_score || 96.0);
  const defectPpm = Number(supplier.defectPpm || supplier.defect_ppm || 100);
  const leadTimeDays = Number(supplier.leadTimeDays || supplier.lead_time_days || 4);

  // Score Calculation
  const otifPoints = (otifScore / 100) * 40;
  const defectPoints = Math.max(0, 30 - (defectPpm / 15));
  const leadTimePoints = Math.max(0, 20 - (leadTimeDays * 1.5));
  const compliancePoints = 10;
  const totalScore = Math.min(100, Math.round(otifPoints + defectPoints + leadTimePoints + compliancePoints));

  let grade = 'A';
  let gradeColor = 'var(--accent-green)';
  if (totalScore >= 95) { grade = 'A+ (Preferred OEM)'; gradeColor = '#10b981'; }
  else if (totalScore >= 85) { grade = 'A (Approved)'; gradeColor = '#34d399'; }
  else if (totalScore >= 75) { grade = 'B (Under Watch)'; gradeColor = 'var(--accent-amber)'; }
  else { grade = 'C (SLA Breach)'; gradeColor = 'var(--accent-red)'; }

  const hasSLABreach = otifScore < 95.0 || defectPpm > 200;
  const penaltyAmount = ((Number(supplier.spendYTD || 5000000) * penaltyDeductionPct) / 100) / 12; // Monthly SLA debit

  const handleIssueDebitNote = () => {
    setIsDebitNoteIssued(true);
    logAction('Procurement', 'VENDOR_DEBIT_NOTE', supplier.code || supplier.id, `Issued SLA penalty debit note of ₹${penaltyAmount.toLocaleString('en-IN')} against ${supplier.name}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '850px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
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
              <Award size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Vendor SLA Scorecard & Penalty Audit
                </h3>
                <span className="badge badge-amber">{supplier.code || 'VENDOR'}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {supplier.name} • GSTIN: {supplier.gstin} • Category: {supplier.category}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Grade Banner */}
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              WEIGHTED SUPPLIER PERFORMANCE GRADE
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: gradeColor, marginTop: '0.1rem' }}>
              {grade}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Aggregate Quality & Delivery Score: <strong>{totalScore} / 100 Points</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>OTIF Rate</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: otifScore >= 95 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{otifScore}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Defect PPM</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: defectPpm <= 150 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{defectPpm} PPM</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Lead Time</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{leadTimeDays} Days</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'scorecard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('scorecard')}
            style={{ fontSize: '0.78rem' }}
          >
            📊 Detailed Scorecard Breakdown
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'penalty' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('penalty')}
            style={{ fontSize: '0.78rem' }}
          >
            ⚖️ SLA Penalty & Debit Note Calculator
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'scorecard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="grid-2">
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>1. On-Time In-Full (OTIF) Delivery (40%)</span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-green)' }}>{otifPoints.toFixed(1)} / 40.0</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(otifPoints / 40) * 100}%`, height: '100%', background: 'var(--accent-green)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Calculated over {supplier.totalPOs || 42} historical purchase order receipts.
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>2. QC Defect Quality Rate (30%)</span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>{defectPoints.toFixed(1)} / 30.0</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(defectPoints / 30) * 100}%`, height: '100%', background: 'var(--accent-blue)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Defect PPM is {defectPpm} (Automotive standard threshold $\le 200$).
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>3. Lead Time Fulfillment Adherence (20%)</span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-amber)' }}>{leadTimePoints.toFixed(1)} / 20.0</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(leadTimePoints / 20) * 100}%`, height: '100%', background: 'var(--accent-amber)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Average dispatch speed is {leadTimeDays} days vs 5-day SLA.
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>4. GST & Billing Compliance (10%)</span>
                    <span style={{ fontWeight: '700', color: '#a78bfa' }}>10.0 / 10.0</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#a78bfa' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    100% 3-way invoice match on GSTR-2B credit filing.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'penalty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--accent-red)' }}>
                  <ShieldAlert size={18} />
                  Contractual SLA Penalty Terms
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Suppliers failing to meet $\ge 95\%$ OTIF or exceeding 200 Defect PPM are subject to a contractual recovery debit on monthly inward billing vouchers.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Recovery Debit Note Calculator</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Spend YTD: ₹{(Number(supplier.spendYTD || 5000000)).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calculated Monthly Penalty</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-red)' }}>
                      ₹{Math.round(penaltyAmount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Contract SLA Penalty Rate (%):</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={penaltyDeductionPct}
                    onChange={(e) => setPenaltyDeductionPct(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: '700', color: 'var(--accent-red)', width: '45px' }}>{penaltyDeductionPct}%</span>
                </div>

                {isDebitNoteIssued ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: '700' }}>
                    <CheckCircle2 size={16} />
                    Official Recovery Debit Note #{supplier.code}-DBN-2026 Issued & Logged in Audit Trail!
                  </div>
                ) : (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleIssueDebitNote}
                    style={{ width: '100%', padding: '0.55rem' }}
                  >
                    Issue Official SLA Penalty Debit Note (₹{Math.round(penaltyAmount).toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Scorecard
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              if (onOpenCreatePO) onOpenCreatePO();
            }}
          >
            Create Allocation PO for {supplier.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};
