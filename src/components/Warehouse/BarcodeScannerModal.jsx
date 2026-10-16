import React, { useState, useEffect, useRef } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  QrCode,
  Scan,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export const BarcodeScannerModal = ({ isOpen, onClose, onVerified }) => {
  const { products, adjustStock, logAction } = useSCM();

  const [scanMode, setScanMode] = useState('inbound'); // 'inbound' | 'outbound' | 'audit'
  const [manualInput, setManualInput] = useState('');
  const [scannedHistory, setScannedHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedProduct, setLastScannedProduct] = useState(null);

  const audioCtxRef = useRef(null);

  // Play synthetic barcode beep sound using Web Audio API
  const playBeep = (isError = false) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isError) {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // Audio context fallback
    }
  };

  if (!isOpen) return null;

  // Process a scanned SKU or barcode string
  const handleProcessScan = (skuString) => {
    const trimmed = skuString.trim().toUpperCase();
    if (!trimmed) return;

    const matched = products.find(p => p.sku.toUpperCase() === trimmed || p.id.toUpperCase() === trimmed || p.hsn === trimmed);

    if (matched) {
      playBeep(false);
      setLastScannedProduct(matched);

      const scanEntry = {
        id: `SCN-${Date.now().toString().slice(-4)}`,
        sku: matched.sku,
        name: matched.name,
        binLocation: matched.binLocation,
        timestamp: new Date().toLocaleTimeString(),
        mode: scanMode,
        status: 'VERIFIED',
        quantity: 1
      };

      setScannedHistory(prev => [scanEntry, ...prev]);

      // Stock auto-adjustment if in audit / rapid inbound mode
      if (scanMode === 'inbound') {
        adjustStock(matched.id, 1, 'Scanner Auto-Inward Verification');
      } else if (scanMode === 'outbound') {
        adjustStock(matched.id, -1, 'Scanner Outbound Pick-to-Dispatch');
      }

      logAction('Warehouse', 'BARCODE_SCAN', matched.sku, `Handheld terminal scanned SKU ${matched.sku} (Mode: ${scanMode})`);
      setManualInput('');
    } else {
      playBeep(true);
      alert(`⚠️ Unknown Barcode: "${trimmed}". No matching SKU found in Item Master.`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
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
              <Scan size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Zebra RF Handheld Barcode Scanner Terminal
                </h3>
                <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Radio size={10} className="spin" /> Handheld v4.2
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                High-speed Optical SKU Verification, Bin Check & Digital Pick/Pack Inwarding
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className="btn-icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Beep Tone' : 'Enable Audio Beep'}
            >
              {soundEnabled ? <Volume2 size={16} style={{ color: 'var(--accent-green)' }} /> : <VolumeX size={16} />}
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scan Mode Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          {[
            { key: 'inbound', label: '📥 Inbound GRN Inward Scan (+1 Stock)' },
            { key: 'outbound', label: '📦 Outbound Dispatch Pick Scan (-1 Stock)' },
            { key: 'audit', label: '🔍 Physical Cycle Count Audit (Verify Only)' }
          ].map(m => (
            <button
              key={m.key}
              className={`btn btn-sm ${scanMode === m.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setScanMode(m.key)}
              style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Scanner Terminal Visual HUD */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1, minHeight: '320px', overflow: 'hidden' }}>
          {/* Left: Terminal Laser Viewfinder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              background: '#0a0e17',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              padding: '1.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {/* Animated Red Laser Line */}
              <div style={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                height: '2px',
                background: '#ef4444',
                boxShadow: '0 0 12px #ef4444, 0 0 4px #fff',
                top: '50%',
                animation: 'pulse 1.5s infinite'
              }} />

              <QrCode size={64} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '0.5rem' }} />
              <div style={{ color: '#fbbf24', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.05em' }}>
                LASER VIEWFINDER ACTIVE
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '0.2rem' }}>
                Ready to parse 1D Code-128 & 2D DataMatrix
              </div>
            </div>

            {/* Manual Key / Barcode Wand Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleProcessScan(manualInput); }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Scan or Type SKU (e.g. MH-BRK-001)..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1rem' }}>
                Scan SKU
              </button>
            </form>

            {/* Quick-Scan Palette */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
                Quick Click-to-Scan Simulator
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {products.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => handleProcessScan(p.sku)}
                  >
                    {p.sku}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Real-time Scan Stream & Item Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            {lastScannedProduct ? (
              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-green">Scan Verified</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Bin: {lastScannedProduct.binLocation}</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                  {lastScannedProduct.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  SKU: <strong>{lastScannedProduct.sku}</strong> • Updated Stock: <strong>{lastScannedProduct.currentStock} Units</strong>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Scan a barcode or click any quick SKU to begin verification.
              </div>
            )}

            {/* Scan History Stream */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Session Scan Log ({scannedHistory.length} Scans)
              </div>
              {scannedHistory.map((h, i) => (
                <div
                  key={h.id + i}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.76rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--accent-amber)' }}>{h.sku}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{h.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>{h.status}</span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{h.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Verified Scans: <strong>{scannedHistory.length} items</strong>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
