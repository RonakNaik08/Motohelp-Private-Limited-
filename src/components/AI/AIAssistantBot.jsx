import React, { useState, useEffect, useRef } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  Bot,
  Sparkles,
  X,
  Send,
  ArrowRight,
  Package,
  ShoppingCart,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Boxes,
  Maximize2,
  Minimize2,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

export const AIAssistantBot = ({ onOpenCreatePO, onOpenInwardGRN, onOpenCreateSO, onOpenTransfer }) => {
  const {
    products,
    purchaseOrders,
    salesOrders,
    shipments,
    suppliers,
    invoices,
    selectedBranch,
    activeRole,
    setActiveModule
  } = useSCM();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${activeRole.name}! I am **MotoBot**, your AI Supply Chain Copilot for **Motohelp Private Limited**.\n\nI can help you navigate workflows, check live inventory alerts, inspect supplier OTIF metrics, track active fleet shipments, and guide you through procurement or 3-way match invoicing.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '📦 What items are low on stock?',
        '🚚 Track active fleet shipments',
        '🛒 Guide: How to create a Purchase Order',
        '⭐ Which suppliers have the highest OTIF?',
        '💰 Check pending invoices & 3-way match',
        '🏭 How does the 2D Warehouse Bin Map work?'
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // AI Response Engine with Live Data Awareness
  const generateAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase();

    // 1. Low Stock / Inventory
    if (q.includes('low stock') || q.includes('reorder') || q.includes('stock level') || q.includes('inventory')) {
      const lowStock = products.filter(p => p.currentStock <= p.reorderPoint);
      if (lowStock.length > 0) {
        const itemsList = lowStock.map(p => `• **${p.name}** (${p.sku}): Current stock is **${p.currentStock} ${p.uom}** (Reorder Threshold: ${p.reorderPoint})`).join('\n');
        return {
          text: `⚠️ **Critical Stock Alerts Found:**\n\nThere are **${lowStock.length} SKU(s)** currently operating at or below safety reorder levels in **${selectedBranch.name}**:\n\n${itemsList}\n\nWould you like me to take you to the Item Master or create a Purchase Order right now?`,
          action: {
            label: 'View Item Master',
            module: 'inventory',
            secondaryAction: { label: 'Create PO', trigger: 'po' }
          }
        };
      } else {
        return {
          text: `✅ **Inventory Health is Optimal!**\n\nAll ${products.length} automotive SKUs in **${selectedBranch.name}** are stocked well above their safety thresholds. Total stock valuation is ₹${(products.reduce((a, b) => a + b.currentStock * b.costPrice, 0) / 100000).toFixed(2)} Lakhs.`,
          action: { label: 'Open Item Master', module: 'inventory' }
        };
      }
    }

    // 2. Shipments & Logistics Tracking
    if (q.includes('shipment') || q.includes('track') || q.includes('delivery') || q.includes('logistics') || q.includes('carrier') || q.includes('waybill')) {
      const activeShipments = shipments.filter(s => s.status !== 'Delivered');
      if (activeShipments.length > 0) {
        const shpList = activeShipments.map(s => `• **Waybill ${s.waybillNumber}** (${s.carrier}): Destination **${s.destination}** • Status: **${s.status}** (📍 ${s.currentLocation})`).join('\n');
        return {
          text: `🚚 **Active Dispatched Shipments (${activeShipments.length}):**\n\n${shpList}\n\nYou can click on any consignment in the Logistics module to inspect live GPS milestones or simulate real-time route progress.`,
          action: { label: 'Open Logistics Tracker', module: 'logistics' }
        };
      } else {
        return {
          text: `All consignments have been successfully delivered with digital Proof of Delivery (POD) signed!`,
          action: { label: 'View Logistics Waybills', module: 'logistics' }
        };
      }
    }

    // 3. Purchase Orders & Procurement Guide
    if (q.includes('create po') || q.includes('purchase order') || q.includes('procurement') || q.includes('how to create')) {
      return {
        text: `🛒 **Guide: Purchase Order (PO) Lifecycle**\n\n1. **Requisition (PR):** Department raises PR for required automotive parts.\n2. **Approval:** Director / Procurement Manager authorizes the order.\n3. **PO Issuance:** Dynamic line items compute subtotal, GST (18%/28%), and vendor payment terms.\n4. **Official PO Sheet:** You can view/print the official Motohelp letterhead with authorized signatures.\n5. **Material Inward:** Once received, click **Receive GRN** to inspect and increment physical warehouse stock.`,
        action: {
          label: 'Create Purchase Order Now',
          trigger: 'po',
          secondaryAction: { label: 'View All POs', module: 'procurement' }
        }
      };
    }

    // 4. Inwarding & QC (GRN)
    if (q.includes('grn') || q.includes('inward') || q.includes('qc') || q.includes('quality') || q.includes('inspect')) {
      return {
        text: `📥 **Goods Receipt Note (GRN) & QC Process:**\n\nWhen a supplier shipment arrives at **${selectedBranch.name}**:\n• Match with the authorized Purchase Order (PO).\n• Enter the Security Gate Pass and Supplier Invoice number.\n• Record Manufacturing Batch/Lot number for traceability.\n• Conduct QC Inspection (verify received vs accepted vs rejected quantities).\n• Approving the GRN **automatically updates physical bin stock** and triggers 3-way match invoice clearance!`,
        action: {
          label: 'Inward Material (New GRN)',
          trigger: 'grn',
          secondaryAction: { label: 'View GRN Registry', module: 'grn' }
        }
      };
    }

    // 5. Supplier OTIF & Performance
    if (q.includes('supplier') || q.includes('vendor') || q.includes('otif') || q.includes('bosch') || q.includes('castrol') || q.includes('ppm') || q.includes('rating')) {
      const topSuppliers = [...suppliers].sort((a, b) => b.otifScore - a.otifScore);
      const topList = topSuppliers.map((s, idx) => `${idx + 1}. **${s.name}** — OTIF: **${s.otifScore}%** | Defect: **${s.defectPpm} PPM** | Rating: ★ ${s.rating}`).join('\n');
      return {
        text: `⭐ **Supplier Performance & OTIF Scorecard:**\n\n${topList}\n\n• **Target OTIF Benchmark:** ≥ 95.0%\n• **Defect PPM Benchmark:** < 500 PPM\n\nClick below to inspect full vendor commercial credit profiles and YTD spends.`,
        action: { label: 'Open Vendor Scorecards', module: 'suppliers' }
      };
    }

    // 6. 3-Way Match & Invoicing (AP/AR)
    if (q.includes('3-way') || q.includes('invoice') || q.includes('match') || q.includes('billing') || q.includes('finance') || q.includes('pay')) {
      const pendingInvoices = invoices.filter(i => !i.status.includes('Paid'));
      return {
        text: `💰 **3-Way Match Accounting Engine:**\n\nThe system validates 3 critical pillars before authorizing payments:\n1. **Authorized Purchase Order (PO)** — Unit prices & quantities.\n2. **Warehouse Goods Receipt (GRN)** — Physical QC accepted count.\n3. **Supplier Tax Invoice** — GST calculations and billed amount.\n\nCurrently, there are **${pendingInvoices.length} pending invoices** ready for verification or settlement.`,
        action: { label: 'Open 3-Way Match & Billing', module: 'invoices' }
      };
    }

    // 7. Warehouse 2D Bins & Spatial Layout
    if (q.includes('warehouse') || q.includes('bin') || q.includes('zone') || q.includes('transfer') || q.includes('wms')) {
      return {
        text: `🏭 **Interactive 2D Warehouse Floor Map:**\n\n• **Zone A:** High-Density Engine & Fast-Moving Racks (Aisle A)\n• **Zone B:** Heavy Braking & Suspension Pallets (Aisle B)\n• **Zone C:** Lubricants & Chemical Hazmat Spill Pallets (Aisle C)\n• **Zone D:** Staging & Dispatch Loading Docks (Aisle D)\n\n• **Capacity Heatmap:** Green (<60%), Amber (60-84%), Red (≥85%).\n• Click on any bin slot to inspect allocated SKUs or initiate inter-hub stock transfers with automated gate passes!`,
        action: {
          label: 'View 2D Warehouse Map',
          module: 'warehouse',
          secondaryAction: { label: 'Inter-Hub Transfer', trigger: 'transfer' }
        }
      };
    }

    // 8. Database Explorer & SQL
    if (q.includes('database') || q.includes('sql') || q.includes('table') || q.includes('sqlite')) {
      return {
        text: `🗄️ **Database & Live SQL Studio:**\n\nThe entire Motohelp SCM system is powered by an ANSI SQL / SQLite 3 database (` + '`motohelp_scm.db`' + `) with 18 normalized tables.\n\nYou can browse tables, inspect schemas, and run live custom SQL queries in real-time in the **Database Explorer**!`,
        action: { label: 'Open Database Explorer', module: 'database' }
      };
    }

    // Default fallback guidance
    return {
      text: `I understand you're asking about "${userQuery}".\n\nHere are some of the key operations I can assist you with right now:\n• **Procurement:** Issue Purchase Orders (PO) & Requisitions (PR)\n• **Inwarding:** Goods Receipt Notes (GRN) with QC pass/fail logging\n• **Warehouse:** 2D Bin Visualizer & Inter-warehouse transfers\n• **Sales & Logistics:** B2B Fleet Orders, E-Way bills & Live GPS tracking\n• **Finance:** 3-Way Match auditing (PO ↔ GRN ↔ Invoice)\n• **Database:** Live SQL Query Studio & table explorer`,
      suggestions: [
        '📦 What items are low on stock?',
        '🛒 Guide: How to create a Purchase Order',
        '🚚 Track active fleet shipments',
        '⭐ Check supplier OTIF rankings'
      ]
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responseData = generateAIResponse(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseData.text,
        action: responseData.action,
        suggestions: responseData.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleActionClick = (action) => {
    if (action.module) {
      setActiveModule(action.module);
    }
    if (action.trigger === 'po') {
      onOpenCreatePO && onOpenCreatePO();
    } else if (action.trigger === 'grn') {
      onOpenInwardGRN && onOpenInwardGRN();
    } else if (action.trigger === 'so') {
      onOpenCreateSO && onOpenCreateSO();
    } else if (action.trigger === 'transfer') {
      onOpenTransfer && onOpenTransfer();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating AI Bot Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--gradient-brand)',
            color: '#090d16',
            padding: '0.75rem 1.25rem',
            borderRadius: '9999px',
            border: 'none',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4), 0 0 15px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '0.88rem',
            zIndex: 999,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-amber)'
          }}>
            <Bot size={17} />
          </div>
          <span>Ask SCM Copilot</span>
          <span className="pulse-dot" style={{ width: '8px', height: '8px' }} />
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          height: '620px',
          maxHeight: 'calc(100vh - 48px)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#090d16'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    MotoBot AI Copilot
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Motohelp SCM Virtual Intelligence
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                className="btn-icon"
                style={{ padding: '0.35rem' }}
                title="Reset Conversation"
                onClick={() => setMessages([messages[0]])}
              >
                <RotateCcw size={14} />
              </button>
              <button
                className="btn-icon"
                style={{ padding: '0.35rem' }}
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'var(--bg-primary)'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.35rem'
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user' ? 'var(--gradient-brand)' : 'var(--bg-card)',
                  color: msg.sender === 'user' ? '#090d16' : 'var(--text-primary)',
                  fontWeight: msg.sender === 'user' ? '700' : '400',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}

                  {/* Interactive Action Buttons */}
                  {msg.action && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                        onClick={() => handleActionClick(msg.action)}
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight size={13} />
                      </button>

                      {msg.action.secondaryAction && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                          onClick={() => handleActionClick(msg.action.secondaryAction)}
                        >
                          {msg.action.secondaryAction.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 0.4rem' }}>
                  {msg.timestamp}
                </span>

                {/* Quick Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem', width: '100%' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Suggested Questions:
                    </div>
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.45rem 0.75rem',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-amber)';
                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>MotoBot is searching SCM records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Ask about inventory, POs, GRN, tracking, suppliers..."
              className="form-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                fontSize: '0.82rem',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-full)'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: inputMessage.trim() ? 'var(--gradient-brand)' : 'var(--bg-tertiary)',
                color: inputMessage.trim() ? '#090d16' : 'var(--text-muted)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                transition: 'var(--transition)'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
