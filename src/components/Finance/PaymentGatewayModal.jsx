import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight,
  Smartphone,
  X,
  Sparkles,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentGatewayModal = ({
  isOpen,
  onClose,
  amount = 26550,
  orderNumber = 'SO-2026-1198',
  customerName = 'Anita Deshmukh',
  shippingAddress = 'Metro Fleet Workshop, Andheri East, Mumbai',
  onPaymentSuccess = () => {}
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'credit'
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'processing' | 'verifying' | 'success'
  const [upiId, setUpiId] = useState('fleetops@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardHolder, setCardHolder] = useState(customerName.toUpperCase());
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [otpValue, setOtpValue] = useState('489201');
  const [countdown, setCountdown] = useState(299); // 5 min QR timer
  const [generatedTxnId, setGeneratedTxnId] = useState('');

  // Auto-detect Card Brand
  const getCardBrand = (num) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { brand: 'VISA', color: '#1a1f71' };
    if (clean.startsWith('5')) return { brand: 'Mastercard', color: '#eb001b' };
    if (clean.startsWith('60') || clean.startsWith('65') || clean.startsWith('81') || clean.startsWith('82')) return { brand: 'RuPay', color: '#097939' };
    if (clean.startsWith('37')) return { brand: 'AMEX', color: '#006fcf' };
    return { brand: 'Corporate Card', color: '#2563eb' };
  };

  const cardBrandInfo = getCardBrand(cardNumber);

  // QR countdown
  useEffect(() => {
    if (paymentMethod !== 'upi') return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentMethod]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const executePayment = () => {
    setProcessingState('processing');

    const txn = `pay_razor_${Math.floor(100000000 + Math.random() * 900000000)}`;
    setGeneratedTxnId(txn);

    setTimeout(() => {
      setProcessingState('verifying');
    }, 1200);

    setTimeout(() => {
      setProcessingState('success');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        onPaymentSuccess({
          transactionId: txn,
          paymentMode: paymentMethod === 'upi' ? 'UPI (Google Pay / QR)' : paymentMethod === 'card' ? `Credit Card (${cardBrandInfo.brand})` : paymentMethod === 'netbanking' ? `NetBanking (${selectedBank})` : 'B2B Fleet Credit (Net 30 Days)',
          amount,
          paidAt: new Date().toISOString(),
          status: 'Paid',
          bankRef: `HDFC-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }, 1500);
    }, 2500);
  };

  const POPULAR_BANKS = [
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'State Bank of India', code: 'SBIN' },
    { name: 'Axis Bank', code: 'UTIB' },
    { name: 'Kotak Mahindra', code: 'KKBK' },
    { name: 'Punjab National Bank', code: 'PUNB' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content glass-card animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          width: '740px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Gateway Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  SCM Pro Secure Payments
                </h3>
                <span className="badge badge-green" style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                  <Lock size={10} /> 256-bit SSL
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.15rem 0 0 0' }}>
                Order #{orderNumber} • Consignee: {customerName}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Total Amount</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#34d399' }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Processing State Screens */}
        {processingState !== 'idle' ? (
          <div
            style={{
              padding: '3.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.25rem',
              background: 'var(--bg-card)',
              minHeight: '380px'
            }}
          >
            {processingState === 'processing' && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Connecting to Banking Network...
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Authorizing payment of <strong>₹{amount.toLocaleString('en-IN')}</strong> via {paymentMethod.toUpperCase()}
                  </p>
                </div>
              </>
            )}

            {processingState === 'verifying' && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={36} className="pulse" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Verifying NPCI / Bank Handshake...
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Transaction ID: <span className="code-tag">{generatedTxnId}</span>
                  </p>
                </div>
              </>
            )}

            {processingState === 'success' && (
              <>
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)' }}>
                  <CheckCircle2 size={42} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#10b981' }}>
                    Payment Successful & Settled!
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Reference ID: <strong>{generatedTxnId}</strong> • Amount: <strong>₹{amount.toLocaleString('en-IN')}</strong>
                  </p>
                  <span className="badge badge-green" style={{ marginTop: '0.6rem', fontSize: '0.75rem' }}>
                    Consignment Manifest Auto-Dispatched
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Main Payment Mode Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '380px', background: 'var(--bg-card)' }}>
            {/* Left Column: Payment Method Tabs */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRight: '1px solid var(--border-subtle)',
                padding: '1rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 0.5rem 0.4rem' }}>
                Payment Options
              </div>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: paymentMethod === 'upi' ? '#2563eb' : 'transparent',
                  color: paymentMethod === 'upi' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <Smartphone size={17} />
                <div style={{ flex: 1 }}>
                  <div>Instant UPI / QR</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>GPay, PhonePe, Paytm</div>
                </div>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: paymentMethod === 'card' ? '#2563eb' : 'transparent',
                  color: paymentMethod === 'card' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <CreditCard size={17} />
                <div style={{ flex: 1 }}>
                  <div>Cards</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Visa, RuPay, Master</div>
                </div>
              </button>

              {/* NetBanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: paymentMethod === 'netbanking' ? '#2563eb' : 'transparent',
                  color: paymentMethod === 'netbanking' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <Building2 size={17} />
                <div style={{ flex: 1 }}>
                  <div>Net Banking</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>30+ Indian Banks</div>
                </div>
              </button>

              {/* Corporate Credit */}
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: paymentMethod === 'credit' ? '#2563eb' : 'transparent',
                  color: paymentMethod === 'credit' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <FileText size={17} />
                <div style={{ flex: 1 }}>
                  <div>B2B Fleet Credit</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Net 30 Days (0% Fee)</div>
                </div>
              </button>

              <div style={{ marginTop: 'auto', padding: '0.65rem 0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#10b981" /> Powered by Razorpay & NPCI
              </div>
            </div>

            {/* Right Column: Tab Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* TAB 1: UPI & QR CODE */}
              {paymentMethod === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Scan & Pay with any UPI App
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                        Google Pay, PhonePe, Paytm, BHIM or Cred
                      </p>
                    </div>

                    <span className="badge badge-amber" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={11} /> Expires in: {formatTime(countdown)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1.25rem', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    {/* Simulated Dynamic UPI QR Code */}
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={110} color="#0f172a" />
                      <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                        UPI QR: ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: '700', marginBottom: 0 }}>
                        Or Enter Fleet VPA / UPI ID:
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: '7px' }}
                      />

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {['gpay', 'phonepe', 'paytm', 'bhim'].map(app => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            className={`badge ${selectedUpiApp === app ? 'badge-blue' : 'badge-neutral'}`}
                            style={{ cursor: 'pointer', fontSize: '0.68rem', padding: '0.2rem 0.5rem', textTransform: 'uppercase' }}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={executePayment}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      background: '#16a34a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Approve & Pay ₹{amount.toLocaleString('en-IN')} via UPI
                  </button>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARDS */}
              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Corporate Fleet or Credit Card
                    </h4>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      {cardBrandInfo.brand}
                    </span>
                  </div>

                  {/* Card Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: '700' }}>Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4532 8901 2345 6789"
                        style={{ fontSize: '0.84rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                      />
                    </div>

                    <div className="grid-2" style={{ gap: '0.65rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: '700' }}>Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="08/29"
                          style={{ fontSize: '0.84rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: '700' }}>CVV / CVC</label>
                        <input
                          type="password"
                          className="form-input"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          style={{ fontSize: '0.84rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: '700' }}>Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value)}
                        style={{ fontSize: '0.84rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={executePayment}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      background: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Lock size={15} />
                    Authorize & Pay ₹{amount.toLocaleString('en-IN')}
                  </button>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {paymentMethod === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Popular Indian Banks
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {POPULAR_BANKS.map(bank => {
                      const isSel = selectedBank === bank.name;
                      return (
                        <button
                          key={bank.name}
                          type="button"
                          onClick={() => setSelectedBank(bank.name)}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: isSel ? '2px solid #2563eb' : '1px solid var(--border-subtle)',
                            background: isSel ? '#eff6ff' : 'var(--bg-tertiary)',
                            color: isSel ? '#1e40af' : 'var(--text-primary)',
                            fontWeight: isSel ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{bank.name}</span>
                          {isSel && <Check size={14} color="#2563eb" />}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.65rem', borderRadius: '7px' }}>
                    You will be redirected to <strong>{selectedBank} Corporate Gateway</strong> for 2-Factor Authentication.
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={executePayment}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      background: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    Proceed with {selectedBank} (₹{amount.toLocaleString('en-IN')})
                  </button>
                </div>
              )}

              {/* TAB 4: B2B FLEET CREDIT */}
              {paymentMethod === 'credit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Pre-Approved B2B Fleet Credit
                    </h4>
                    <span className="badge badge-green">0% Interest (30 Days)</span>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Approved Credit Facility:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹50,00,000</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Available Credit Limit:</span>
                      <strong style={{ color: '#16a34a' }}>₹42,80,000</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Settlement Due Date:</span>
                      <strong style={{ color: '#2563eb' }}>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: '#64748b' }}>
                    <ShieldCheck size={14} color="#10b981" /> Validated against Customer GSTIN & Corporate Master Agreement
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={executePayment}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      background: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    Confirm PO via Net 30 Credit (₹{amount.toLocaleString('en-IN')})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
