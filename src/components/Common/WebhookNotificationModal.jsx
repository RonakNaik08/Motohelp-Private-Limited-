import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  Smartphone,
  Bell,
  ShieldCheck,
  Truck,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSCM } from '../../context/SCMContext';

export const WebhookNotificationModal = ({
  isOpen,
  onClose,
  shipment = null,
  salesOrder = null
}) => {
  const { shipments, salesOrders, currentUser } = useSCM();

  const activeShipment = shipment || shipments[0];
  const activeSO = salesOrder || salesOrders[0];

  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'sms' | 'webhook'
  const [templateType, setTemplateType] = useState('dispatch'); // 'dispatch' | 'otp' | 'delivered' | 'invoice'
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState('+91 98200 12345');

  if (!isOpen) return null;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate dynamic message content based on template
  const getMessageContent = () => {
    if (templateType === 'dispatch') {
      return {
        title: '🚚 Consignment Dispatched Alert',
        body: `Hello ${activeSO?.customerName || 'Customer'},\n\nYour Motohelp B2B consignment for PO #${activeSO?.soNumber || 'SO-2026-1190'} is now *IN TRANSIT*.\n\n• Carrier: ${activeShipment?.carrier || 'FastTrack Logistics'}\n• Vehicle: ${activeShipment?.vehicleNumber || 'MH-03-TR-8812'}\n• Driver: ${activeShipment?.driverName || 'Santosh Gaikwad'} (${activeShipment?.driverPhone || '+91 98201 99312'})\n• Expected Delivery: Tomorrow, 4:00 PM IST\n\nLive GPS Track: https://motohelp.scm/track/${activeShipment?.waybillNumber || 'MOTO-WB-994102'}`
      };
    }
    if (templateType === 'otp') {
      return {
        title: '🔐 Gate Security Verification OTP',
        body: `MOTOHELP SECURITY GATE PASS\n\nYour 4-digit unloading dock clearance OTP for Waybill #${activeShipment?.waybillNumber || 'MOTO-WB-994102'} is:\n\n👉 *${(activeShipment?.id.slice(-4) || '8421').replace(/\D/g, '7')}*\n\nPlease share this OTP with the driver upon physical box verification.`
      };
    }
    if (templateType === 'delivered') {
      return {
        title: '✅ Consignment Delivered & Signed',
        body: `Dear ${activeSO?.customerName || 'Customer'},\n\nConsignment #${activeShipment?.waybillNumber || 'MOTO-WB-994102'} (PO #${activeSO?.soNumber || 'SO-2026-1190'}) has been *SUCCESSFULLY DELIVERED* and verified by gate security.\n\ne-POD Digital Signature: Signed & Logged\nThank you for choosing Motohelp OEM SCM.`
      };
    }
    return {
      title: '📄 GST Tax Invoice Ready',
      body: `MOTOHELP TAX INVOICE\n\nInvoice #INV-2026-${activeSO?.soNumber?.slice(-4) || '1190'} for amount ₹${(activeSO?.grandTotal || 48500).toLocaleString('en-IN')} has been generated.\n\nInput Tax Credit (18% GST): Verified\nDownload PDF: https://motohelp.scm/invoices/${activeSO?.soNumber || 'SO-2026'}`
    };
  };

  const msg = getMessageContent();

  const handleSendWebhook = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    }, 800);
  };

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
          maxWidth: '560px',
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
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Multi-Channel Dispatch Alerts & Webhooks
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Automated customer WhatsApp, SMS, and ERP webhook payload triggers
              </p>
            </div>
          </div>

          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Channel & Template Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'whatsapp', label: 'WhatsApp Business API' },
              { key: 'sms', label: 'Fast2SMS Gateway' },
              { key: 'webhook', label: 'ERP Webhook JSON' }
            ].map((ch) => (
              <button
                key={ch.key}
                type="button"
                className={`btn btn-sm ${channel === ch.key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChannel(ch.key)}
                style={{ flex: 1, fontSize: '11px' }}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'dispatch', label: 'Dispatch Alert' },
              { key: 'otp', label: 'Security OTP' },
              { key: 'delivered', label: 'Delivered Notice' },
              { key: 'invoice', label: 'Tax Invoice' }
            ].map((tp) => (
              <button
                key={tp.key}
                type="button"
                className={`btn btn-sm ${templateType === tp.key ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setTemplateType(tp.key)}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  background: templateType === tp.key ? 'var(--bg-tertiary)' : 'transparent',
                  border: templateType === tp.key ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  color: templateType === tp.key ? 'var(--brand-primary)' : 'var(--text-secondary)'
                }}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Phone Input */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Verified Consignee Mobile Number:
          </label>
          <input
            type="text"
            className="form-input"
            value={recipientNumber}
            onChange={(e) => setRecipientNumber(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
        </div>

        {/* WhatsApp Message Preview UI */}
        {channel === 'whatsapp' && (
          <div
            style={{
              background: '#E5DDD5',
              padding: '16px',
              borderRadius: '8px',
              position: 'relative'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '12px 14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                maxWidth: '92%',
                position: 'relative',
                fontSize: '12px',
                color: '#111827',
                lineHeight: '1.45',
                whiteSpace: 'pre-wrap'
              }}
            >
              <div style={{ fontWeight: '700', color: '#075E54', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Motohelp SCM Logistics Verified 🟢
              </div>
              {msg.body}
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#9CA3AF', marginTop: '6px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '3px' }}>
                {nowTime} <CheckCheck size={13} color="#34B7F1" />
              </div>
            </div>
          </div>
        )}

        {/* SMS Preview UI */}
        {channel === 'sms' && (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-primary)', marginBottom: '4px' }}>
              SMS SENDER: MOTOHELP-SCM
            </div>
            {msg.body.replace(/\*/g, '')}
          </div>
        )}

        {/* Webhook JSON Preview UI */}
        {channel === 'webhook' && (
          <div
            style={{
              background: '#0B132B',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#10B981',
              maxHeight: '160px',
              overflowY: 'auto'
            }}
          >
            <pre style={{ margin: 0 }}>
              {JSON.stringify(
                {
                  event: `logistics.${templateType}`,
                  timestamp: new Date().toISOString(),
                  recipient: recipientNumber,
                  payload: {
                    waybill: activeShipment?.waybillNumber || 'MOTO-WB-994102',
                    soNumber: activeSO?.soNumber || 'SO-2026-1190',
                    customer: activeSO?.customerName || 'Customer',
                    carrier: activeShipment?.carrier || 'FastTrack',
                    vehicle: activeShipment?.vehicleNumber || 'MH-03-TR-8812',
                    driver: activeShipment?.driverName || 'Santosh Gaikwad',
                    status: activeShipment?.status || 'In Transit',
                    eta: 'Tomorrow, 4:00 PM IST'
                  }
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendWebhook}
            disabled={isSending}
            style={{ flex: 2, background: sentSuccess ? 'var(--semantic-success)' : undefined }}
          >
            {sentSuccess ? (
              <>
                <Check size={14} /> Alert Dispatched Successfully
              </>
            ) : isSending ? (
              'Dispatching Notification...'
            ) : (
              <>
                <Send size={14} /> Trigger Live Alert ({channel.toUpperCase()})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
