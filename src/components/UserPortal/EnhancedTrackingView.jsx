import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Activity,
  Navigation,
  Copy,
  Check,
  FileText,
  Radio,
  Gauge,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  X,
  User,
  Clock,
  FastForward,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';
import { getProductImageUrl, handleImageError } from '../../utils/productImages';

export const EnhancedTrackingView = ({
  shipments = [],
  salesOrders = [],
  selectedShipment,
  setSelectedShipment,
  onViewInvoice,
  onExploreCatalog
}) => {
  const {
    advanceShipmentMilestone,
    setShipmentStage,
    toggleShipmentMilestone,
    addCustomShipmentMilestone,
    removeShipmentMilestone,
    resetShipmentTracking
  } = useSCM();

  const [copiedWaybill, setCopiedWaybill] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [isSimulatingLiveRoute, setIsSimulatingLiveRoute] = useState(false);
  const [simulatedEtaMinutes, setSimulatedEtaMinutes] = useState(34);
  const [expandedCheckpoints, setExpandedCheckpoints] = useState(true);
  const [otpCopied, setOtpCopied] = useState(false);

  // Modal for Adding Custom Delivery Step
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepSubtitle, setNewStepSubtitle] = useState('');
  const [newStepCompleted, setNewStepCompleted] = useState(true);

  // Active shipment selection
  const currentShipment =
    selectedShipment ||
    shipments.find(s => s.status !== 'Delivered') ||
    shipments[0];

  // Simulation timer for dynamic auto-progression through milestones
  useEffect(() => {
    let interval;
    if (isSimulatingLiveRoute && currentShipment) {
      interval = setInterval(() => {
        const milestones = currentShipment.milestones || [];
        const nextIdx = milestones.findIndex(m => !m.completed);
        if (nextIdx !== -1) {
          advanceShipmentMilestone(currentShipment.id);
        } else {
          setIsSimulatingLiveRoute(false);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulatingLiveRoute, currentShipment, advanceShipmentMilestone]);

  if (!currentShipment) {
    return (
      <div
        className="card"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Truck size={24} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          No Active Shipments Found
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px' }}>
          When you place orders from the Auto Parts Catalog, your consignment milestone progress, driver details, and delivery OTP will appear here in real-time.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onExploreCatalog}
        >
          Explore Product Catalog
        </button>
      </div>
    );
  }

  // Standard Milestone definitions
  const defaultMilestones = [
    { id: 'ordered', title: 'Order Confirmed', subtitle: 'Order verified & ERP manifest generated', timestamp: '09:15 AM', completed: true },
    { id: 'packed', title: 'Picked & Staged', subtitle: 'Passed 14-point OEM friction & seal inspection', timestamp: 'Pending', completed: false },
    { id: 'dispatched', title: 'Handed Over to Carrier', subtitle: `Manifested with ${currentShipment.carrier || 'FastTrack Logistics'} (${currentShipment.vehicleNumber || 'MH-03-TR-8812'})`, timestamp: 'Pending', completed: false },
    { id: 'in_transit', title: 'In Transit & Checkpoints', subtitle: currentShipment.currentLocation || 'Eastern Express Corridor / FASTag Verified', timestamp: 'Pending', completed: false },
    { id: 'out_for_delivery', title: 'Out for Final Delivery', subtitle: `Driver ${currentShipment.driverName || 'Santosh Gaikwad'} is on schedule`, timestamp: 'Pending', completed: false },
    { id: 'delivered', title: 'Delivered & e-POD Signed', subtitle: 'Digital proof of delivery signed by consignee', timestamp: 'Pending', completed: false }
  ];

  // Derive dynamic milestones strictly from currentShipment.milestones
  const activeMilestones = (currentShipment.milestones && currentShipment.milestones.length > 0)
    ? currentShipment.milestones
    : defaultMilestones;

  const stageIcons = [CheckCircle2, Layers, Truck, Activity, Navigation, ShieldCheck];

  const completedCount = activeMilestones.filter(m => m.completed).length;
  const totalCount = activeMilestones.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  const isDelivered = completedCount === totalCount || currentShipment.status === 'Delivered';

  const matchedSO = salesOrders.find(
    s => s.soNumber === currentShipment.soNumber || s.id === currentShipment.soId
  );

  const deliveryOtp = (currentShipment.id.slice(-4) || '8421').replace(/\D/g, '7') || '8421';

  const handleCopyWaybill = () => {
    navigator.clipboard?.writeText(currentShipment.waybillNumber || currentShipment.trackingNumber);
    setCopiedWaybill(true);
    setTimeout(() => setCopiedWaybill(false), 2000);
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(deliveryOtp);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const handleAddCustomStepSubmit = (e) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    addCustomShipmentMilestone(currentShipment.id, {
      title: newStepTitle.trim(),
      subtitle: newStepSubtitle.trim() || 'Manual Checkpoint Logged',
      completed: newStepCompleted,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setNewStepTitle('');
    setNewStepSubtitle('');
    setIsAddStepModalOpen(false);
  };

  // Dynamic Hero Status & Badge
  const getHeroStatusInfo = () => {
    if (isDelivered) {
      return {
        badgeClass: 'badge-success',
        badgeText: 'Delivered & e-POD Signed',
        title: `Order #${currentShipment.soNumber || 'SO-2026'} Successfully Delivered & Verified`,
        desc: `Consignment completed at ${currentShipment.destination}`
      };
    }
    if (completedCount <= 1) {
      return {
        badgeClass: 'badge-blue',
        badgeText: 'Stage 1: Order Confirmed',
        title: `Order Verified • Staging in Warehouse (Awaiting Dispatch)`,
        desc: `ERP Manifest generated. Awaiting manual handover or stage advance.`
      };
    }
    if (completedCount === 2) {
      return {
        badgeClass: 'badge-warning',
        badgeText: 'Stage 2: Picked & Staged',
        title: `Consignment Quality Inspected & Staged at Dock 4`,
        desc: `Passed 14-point OEM friction inspection. Ready for carrier pickup.`
      };
    }
    if (completedCount === 3) {
      return {
        badgeClass: 'badge-info',
        badgeText: 'Stage 3: Handed Over to Carrier',
        title: `Consignment Manifested with ${currentShipment.carrier || 'FastTrack Logistics'}`,
        desc: `Assigned Vehicle: ${currentShipment.vehicleNumber || 'MH-03-TR-8812'}`
      };
    }
    if (completedCount === 4) {
      return {
        badgeClass: 'badge-info',
        badgeText: 'Stage 4: In Transit',
        title: `Consignment In Transit • Expected Arrival by ${currentShipment.estimatedDelivery?.split(' ')[1] || '4:00 PM'}`,
        desc: `FASTag toll checkpoints verified. On-road speed: ${currentShipment.telemetry?.speed || 58} km/h.`
      };
    }
    if (completedCount === 5) {
      return {
        badgeClass: 'badge-warning',
        badgeText: 'Stage 5: Out for Final Delivery',
        title: `Consignment Out for Final Delivery • Driver Approaching Gate`,
        desc: `Driver Santosh Gaikwad arriving in ~${simulatedEtaMinutes} mins.`
      };
    }
    return {
      badgeClass: 'badge-info',
      badgeText: `Consignment In Progress (${completedCount}/${totalCount})`,
      title: `Consignment Journey Active (${completedCount} of ${totalCount} steps cleared)`,
      desc: `Origin: ${currentShipment.origin} ➔ Destination: ${currentShipment.destination}`
    };
  };

  const heroInfo = getHeroStatusInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Multi-Shipment Switcher Tab Bar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Active Consignments:
          </span>
          {shipments.map((shp) => {
            const isSelected = shp.id === currentShipment.id;
            const isShpDelivered = shp.status === 'Delivered';
            return (
              <button
                key={shp.id}
                type="button"
                onClick={() => setSelectedShipment(shp)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-tertiary)' : '#FFFFFF',
                  color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: isSelected ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isShpDelivered ? 'var(--semantic-success)' : 'var(--semantic-info)',
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)' }}>{shp.soNumber || shp.customerName}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({shp.status})
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-time Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--semantic-success)', fontWeight: '600' }}>
          <Radio size={13} /> Live Tracking Ready
        </div>
      </div>

      {/* 2. Manual Tracking Lifecycle Controls Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--brand-primary)' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Manual Delivery Tracking Controls
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Click individual step checkboxes to toggle, or manually add custom delivery milestones
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Direct Stage Selector Dropdown */}
          <select
            className="form-input"
            value={Math.max(0, Math.min(5, completedCount - 1))}
            onChange={(e) => setShipmentStage(currentShipment.id, Number(e.target.value))}
            style={{ fontSize: '12px', padding: '5px 8px', width: 'auto', background: '#FFFFFF' }}
          >
            <option value={0}>Stage 1: Order Confirmed (1/6)</option>
            <option value={1}>Stage 2: Picked & Staged (2/6)</option>
            <option value={2}>Stage 3: Handed Over to Carrier (3/6)</option>
            <option value={3}>Stage 4: In Transit (4/6)</option>
            <option value={4}>Stage 5: Out for Final Delivery (5/6)</option>
            <option value={5}>Stage 6: Delivered & e-POD Signed (6/6)</option>
          </select>

          {/* Advance Step Button */}
          {!isDelivered && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => advanceShipmentMilestone(currentShipment.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FastForward size={13} /> Advance Next Step ({completedCount + 1}/{totalCount})
            </button>
          )}

          {/* Add Custom Delivery Step Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAddStepModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF' }}
          >
            <Plus size={13} /> Add Custom Step
          </button>

          {/* Simulate Progression Toggle */}
          <button
            type="button"
            className={`btn ${isSimulatingLiveRoute ? 'btn-danger' : 'btn-secondary'} btn-sm`}
            onClick={() => setIsSimulatingLiveRoute(!isSimulatingLiveRoute)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isSimulatingLiveRoute ? undefined : '#FFFFFF' }}
          >
            {isSimulatingLiveRoute ? <Pause size={13} /> : <Play size={13} />}
            {isSimulatingLiveRoute ? 'Stop Simulation' : 'Auto Simulate'}
          </button>

          {/* Reset to Stage 1 */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => resetShipmentTracking(currentShipment.id)}
            title="Reset tracking strictly to Stage 1 (Order Confirmed only)"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF' }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* 3. Enterprise Delivery Status Hero Card with ETA, Live Pulse & OTP */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr',
          gap: '24px',
          alignItems: 'center',
          borderLeft: '4px solid var(--brand-primary)'
        }}
      >
        {/* Left Side: Order Hero Info, Live ETA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className={`badge ${heroInfo.badgeClass}`}>
              {heroInfo.badgeText}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Waybill Code:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {currentShipment.waybillNumber || currentShipment.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyWaybill}
                style={{ background: 'transparent', border: 'none', color: copiedWaybill ? 'var(--semantic-success)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                title="Copy tracking code"
              >
                {copiedWaybill ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {heroInfo.title}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {heroInfo.desc}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Origin: <strong>{currentShipment.origin}</strong> ➔ Destination: <strong>{currentShipment.destination}</strong>
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDriverModal(true)}
            >
              <Phone size={13} /> Contact Driver ({currentShipment.driverName?.split(' ')[0] || 'Santosh'})
            </button>

            {matchedSO && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onViewInvoice && onViewInvoice(matchedSO)}
              >
                <FileText size={13} /> Download Tax Invoice
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Security Delivery OTP Shield Card */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-input)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
            <ShieldCheck size={15} /> Gate Verification OTP
          </div>

          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '0.2em', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {deliveryOtp}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            Provide this 4-digit code to the delivery associate upon arrival at the unloading dock.
          </p>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyOtp}
            style={{ margin: '4px auto 0', padding: '3px 10px', fontSize: '11px' }}
          >
            {otpCopied ? <Check size={11} /> : <Copy size={11} />}
            {otpCopied ? 'OTP Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* 4. Interactive Timeline Stepper with Checkbox Nodes */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--brand-primary)' }} /> Consignment Journey & Milestone Checkpoints
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Click any milestone checkbox below to manually mark it completed or pending
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-primary)' }}>
              {completedCount} of {totalCount} Milestones Cleared ({progressPercentage}%)
            </span>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div style={{ position: 'relative', width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'var(--brand-primary)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Stepper Nodes (Clickable Checkboxes) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeMilestones.length}, minmax(120px, 1fr))`,
            gap: '10px',
            marginTop: '4px',
            overflowX: 'auto',
            paddingBottom: '6px'
          }}
        >
          {activeMilestones.map((stg, idx) => {
            const IconComp = stageIcons[idx % stageIcons.length] || CheckCircle2;
            return (
              <div
                key={stg.id || idx}
                onClick={() => toggleShipmentMilestone(currentShipment.id, idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  background: stg.completed ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                  border: stg.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                  transition: 'var(--transition)'
                }}
                title={`Click to ${stg.completed ? 'uncheck' : 'mark complete'} Step #${idx + 1}: ${stg.title}`}
              >
                {/* Node Circle with Check Indicator */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: stg.completed ? 'var(--semantic-success)' : 'var(--bg-tertiary)',
                    color: stg.completed ? '#FFFFFF' : 'var(--text-muted)',
                    border: stg.completed ? '2px solid var(--semantic-success)' : '1px solid var(--border-subtle)',
                    boxShadow: stg.completed ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none',
                    transition: 'var(--transition)'
                  }}
                >
                  {stg.completed ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: stg.completed ? '600' : '500', color: stg.completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {stg.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.2' }}>
                    {stg.subtitle}
                  </div>
                  <div style={{ fontSize: '11px', color: stg.completed ? 'var(--semantic-success)' : 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    {stg.timestamp && stg.timestamp !== 'Pending' ? stg.timestamp : (stg.completed ? 'Completed' : 'Pending')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Checkpoint Records with Direct Checkboxes */}
        <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border-table)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setExpandedCheckpoints(!expandedCheckpoints)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {expandedCheckpoints ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expandedCheckpoints ? 'Hide Checkpoint Log' : 'View Checkpoint FASTag Records'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddStepModalOpen(true)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              <Plus size={12} /> Add Milestone Step
            </button>
          </div>

          {expandedCheckpoints && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activeMilestones.map((ms, i) => (
                <div
                  key={ms.id || i}
                  style={{
                    padding: '8px 12px',
                    background: ms.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    border: ms.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      flex: 1,
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!ms.completed}
                      onChange={() => toggleShipmentMilestone(currentShipment.id, i)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--brand-primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <span style={{ fontWeight: ms.completed ? '600' : '500', color: ms.completed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {ms.title}
                      </span>
                      {ms.subtitle && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          — {ms.subtitle}
                        </span>
                      )}
                      {ms.isCustom && (
                        <span className="badge badge-neutral" style={{ fontSize: '10px', marginLeft: '6px' }}>Custom Step</span>
                      )}
                    </div>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: ms.completed ? 'var(--semantic-success)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: ms.completed ? '600' : '400' }}>
                      {ms.timestamp || (ms.completed ? 'Completed' : 'Pending')}
                    </span>

                    {ms.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeShipmentMilestone(currentShipment.id, i);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--semantic-danger)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        title="Delete custom step"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Driver Profile & Live Vehicle Telemetry HUD */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}
      >
        {/* Driver Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              color: 'var(--brand-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0
            }}
          >
            {(currentShipment.driverName || 'SG').split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentShipment.driverName || 'Santosh Gaikwad'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: '600' }}>
              ★ 4.9 Rating • 1,480+ Trips
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {currentShipment.driverPhone || '+91 98201 99312'}
            </div>
          </div>
        </div>

        {/* Truck & FASTag Clearance */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Vehicle & FASTag
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentShipment.vehicleNumber || 'MH-03-TR-8812'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span className={`badge ${completedCount >= 4 ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '11px' }}>
              {completedCount >= 4 ? '✓ FASTag Cleared (JVLR Plaza)' : 'Awaiting Gate Dispatch'}
            </span>
          </div>
        </div>

        {/* Real-Time Telemetry Speed & Temp */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Speed & Cargo Environment
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)' }}>
              <Gauge size={14} /> {completedCount >= 4 ? (currentShipment.telemetry?.speed || 58) : 0} km/h
            </div>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--semantic-success)' }}>
              <Thermometer size={14} /> {currentShipment.telemetry?.temperature || '22°C (Dry)'}
            </div>
          </div>
        </div>

        {/* Current Location Checkpoint */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Current Location
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} /> {currentShipment.currentLocation || 'Bhandup Central Hub (HQ)'}
          </div>
        </div>
      </div>

      {/* 6. Line Items inside Consignment */}
      {matchedSO && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} style={{ color: 'var(--brand-primary)' }} /> Package Items in this Consignment ({matchedSO.items?.length || 1} SKUs)
            </h3>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Invoice Value: <strong style={{ color: 'var(--text-primary)' }}>₹{(matchedSO.grandTotal || matchedSO.totalAmount || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {(matchedSO.items || []).map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-input)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={getProductImageUrl({ id: item.productId, name: item.productName || item.name })}
                    alt={item.productName || item.name || 'Ordered Part'}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => handleImageError(e, { id: item.productId, name: item.productName || item.name })}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.productName || item.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qty: {item.quantity || 1} • ₹{(item.unitPrice || 2250).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Custom Delivery Step Modal */}
      {isAddStepModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(23, 43, 58, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setIsAddStepModalOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-modal)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-table)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} style={{ color: 'var(--brand-primary)' }} /> Add Custom Delivery Step
              </h3>
              <button type="button" className="btn-icon" onClick={() => setIsAddStepModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomStepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Milestone / Checkpoint Title: *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared Thane Toll Plaza, Passed Quality Audit..."
                  className="form-input"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Location / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eastern Corridor Flyover Bay 4"
                  className="form-input"
                  value={newStepSubtitle}
                  onChange={(e) => setNewStepSubtitle(e.target.value)}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <input
                  type="checkbox"
                  checked={newStepCompleted}
                  onChange={(e) => setNewStepCompleted(e.target.checked)}
                  style={{ accentColor: 'var(--brand-primary)' }}
                />
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  Mark this checkpoint as completed immediately
                </span>
              </label>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddStepModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  <Plus size={14} /> Add Milestone Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Driver Contact Modal */}
      {showDriverModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(23, 43, 58, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setShowDriverModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-modal)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-table)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--brand-primary)' }} /> Contact Delivery Associate
              </h3>
              <button type="button" className="btn-icon" onClick={() => setShowDriverModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                {(currentShipment.driverName || 'SG').split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{currentShipment.driverName || 'Santosh Gaikwad'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Carrier: {currentShipment.carrier || 'FastTrack Logistics'}</div>
                <div style={{ fontSize: '12px', color: 'var(--semantic-success)', fontWeight: '600', marginTop: '2px' }}>Vehicle: {currentShipment.vehicleNumber || 'MH-03-TR-8812'}</div>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Direct Phone Number</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {currentShipment.driverPhone || '+91 98201 99312'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Operating hours: 08:00 AM – 08:00 PM IST
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`tel:${currentShipment.driverPhone || '+919820199312'}`}
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                <Phone size={14} /> Call Now
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDriverModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
