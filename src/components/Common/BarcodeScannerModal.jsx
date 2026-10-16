import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Package,
  Truck
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onScanResult,
  title = 'Enterprise Barcode & QR Scanner'
}) => {
  const { products, shipments, salesOrders } = useSCM();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedValue, setScannedValue] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simulatedMatch, setSimulatedMatch] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    if (isOpen) {
      setScannedValue(null);
      setSimulatedMatch(null);
      setCameraError(null);

      // Attempt to access user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
          })
          .catch((err) => {
            console.warn('Camera access error (running in simulated scanner mode):', err);
            setCameraError('Camera access unavailable or blocked. Using simulated optical scanner engine.');
            setCameraActive(false);
          });
      } else {
        setCameraError('Camera API not supported on this browser context. Running simulated optical scanner.');
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {}
  };

  const handleProcessScan = (code) => {
    const cleanCode = String(code).trim();
    if (!cleanCode) return;

    playBeep();
    setScannedValue(cleanCode);

    // Look for product match
    const matchedProduct = products.find(
      (p) => p.sku.toLowerCase() === cleanCode.toLowerCase() || p.id.toLowerCase() === cleanCode.toLowerCase()
    );

    // Look for shipment match
    const matchedShipment = shipments.find(
      (s) =>
        s.waybillNumber?.toLowerCase() === cleanCode.toLowerCase() ||
        s.id.toLowerCase() === cleanCode.toLowerCase() ||
        s.trackingNumber?.toLowerCase() === cleanCode.toLowerCase()
    );

    // Look for sales order match
    const matchedSO = salesOrders.find(
      (so) => so.soNumber?.toLowerCase() === cleanCode.toLowerCase() || so.id.toLowerCase() === cleanCode.toLowerCase()
    );

    const matchInfo = {
      code: cleanCode,
      product: matchedProduct,
      shipment: matchedShipment,
      salesOrder: matchedSO,
      type: matchedProduct ? 'Product SKU' : matchedShipment ? 'Logistics Waybill' : matchedSO ? 'Sales Order PO' : 'General Barcode'
    };

    setSimulatedMatch(matchInfo);

    if (onScanResult) {
      onScanResult(matchInfo);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
      setManualInput('');
    }
  };

  // Sample quick scan presets for testing
  const samplePresets = [
    { label: 'Brake Pad Kit (BRK-PAD-001)', code: 'BRK-PAD-001', type: 'Product' },
    { label: 'Waybill #994102 (FastTrack)', code: 'MOTO-WB-994102', type: 'Shipment' },
    { label: 'Synthetic Engine Oil (LUB-ENG-5W40)', code: 'LUB-ENG-5W40', type: 'Product' },
    { label: 'Purchase Order #SO-2026-1190', code: 'SO-2026-1190', type: 'Order' },
    { label: 'Gate Security OTP #8421', code: '8421', type: 'Security OTP' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: 'var(--radius-panel)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-table)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scan size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Scan warehouse SKUs, 3PL waybills, and gate verification QR codes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Beep' : 'Unmute Beep'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            background: '#0B132B',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {cameraActive ? (
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              playsInline
              muted
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#94A3B8', textAlign: 'center', padding: '16px' }}>
              <Camera size={32} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>
                {cameraError || 'Optical Scanning Camera Ready'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', maxWidth: '320px' }}>
                Position physical barcode in front of camera or select a fast-test barcode preset below.
              </span>
            </div>
          )}

          {/* Target Reticle Overlay */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '140px',
              border: '2px solid var(--brand-primary)',
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none'
            }}
          >
            {/* Animated Laser Scan Line */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
                boxShadow: '0 0 8px #10B981',
                animation: 'pulse 1.5s infinite'
              }}
            />
          </div>

          <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: '#FFFFFF' }}>
            ● AI Scanner Active
          </div>
        </div>

        {/* Scan Result Card */}
        {simulatedMatch && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: 'var(--radius-input)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--semantic-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Barcode Decoded: {simulatedMatch.type}
              </span>
              <span className="code-tag" style={{ fontSize: '11px' }}>{simulatedMatch.code}</span>
            </div>

            {simulatedMatch.product && (
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                <strong>{simulatedMatch.product.name}</strong> • Stock: {simulatedMatch.product.currentStock} units • ₹{simulatedMatch.product.sellingPrice}
              </div>
            )}

            {simulatedMatch.shipment && (
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                Consignment: <strong>{simulatedMatch.shipment.carrier}</strong> ({simulatedMatch.shipment.vehicleNumber}) • Status: {simulatedMatch.shipment.status}
              </div>
            )}

            {simulatedMatch.salesOrder && (
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                Order #{simulatedMatch.salesOrder.soNumber} • Value: ₹{simulatedMatch.salesOrder.grandTotal?.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        )}

        {/* Manual Barcode Input */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '6px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Or type SKU / Waybill code directly..."
              className="form-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Scan Code
          </button>
        </form>

        {/* Fast Test Presets */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Instant Simulator Presets:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleProcessScan(preset.code)}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
