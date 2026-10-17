import React, { useState } from 'react';
import './App.css';
import { SCMProvider, useSCM } from './context/SCMContext';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { QuickSearchModal } from './components/Layout/QuickSearchModal';

// Admin Modules
import { MISDashboard } from './components/Dashboard/MISDashboard';
import { ItemMaster } from './components/Inventory/ItemMaster';
import { WarehouseMap } from './components/Warehouse/WarehouseMap';
import { PurchaseOrders } from './components/Procurement/PurchaseOrders';
import { GoodsReceipts } from './components/Procurement/GoodsReceipts';
import { SalesOrders } from './components/SalesLogistics/SalesOrders';
import { LogisticsTracker } from './components/SalesLogistics/LogisticsTracker';
import { SupplierManagement } from './components/Partners/SupplierManagement';
import { SupplierPortalView } from './components/Partners/SupplierPortalView';
import { CustomerManagement } from './components/Partners/CustomerManagement';
import { InvoicesAPAR } from './components/Finance/InvoicesAPAR';
import { MISReports } from './components/Reports/MISReports';
import { AuditTrail } from './components/Governance/AuditTrail';
import { BranchMaster } from './components/Governance/BranchMaster';
import { DatabaseExplorer } from './components/Database/DatabaseExplorer';
import { DemandForecasting } from './components/Analytics/DemandForecasting';
import { SystemInfrastructureCenter } from './components/Governance/SystemInfrastructureCenter';

// Normal User Portal Module
import { CustomerOrdersHub } from './components/UserPortal/CustomerOrdersHub';

// Modals
import { CreatePOModal } from './components/Procurement/CreatePOModal';
import { GoodsReceiptModal } from './components/Procurement/GoodsReceiptModal';
import { CreateSOModal } from './components/SalesLogistics/CreateSOModal';
import { StockTransferModal } from './components/Warehouse/StockTransferModal';
import { AIAssistantBot } from './components/AI/AIAssistantBot';
import { LoginPage } from './components/Auth/LoginPage';

const MainApp = () => {
  const { activeModule, activePortal, isAuthenticated, isAdmin, isSuperAdmin } = useSCM();

  // If user is not logged in, render the clean login portal
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Search & Global Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showInwardGRN, setShowInwardGRN] = useState(false);
  const [grnDefaultPO, setGrnDefaultPO] = useState(null);
  const [showCreateSO, setShowCreateSO] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const handleOpenInwardGRN = (po = null) => {
    setGrnDefaultPO(po);
    setShowInwardGRN(true);
  };

  const renderActiveModule = () => {
    // -------------------------------------------------------------
    // STRICT SECURITY: Non-Superadmins have access to Customer Portal ONLY
    // -------------------------------------------------------------
    if (!isSuperAdmin) {
      return <CustomerOrdersHub />;
    }

    // -------------------------------------------------------------
    // PHASE 1: CUSTOMER PORTAL
    // -------------------------------------------------------------
    if (activePortal === 'customer') {
      return <CustomerOrdersHub />;
    }

    // -------------------------------------------------------------
    // PHASE 5: SUPPLIER PORTAL
    // -------------------------------------------------------------
    if (activePortal === 'supplier') {
      return <SupplierPortalView />;
    }

    // -------------------------------------------------------------
    // ADMIN / EXECUTIVE VIEW:
    // Full ERP Suite, Governance, Infrastructure, Forecasting & Warehouse
    // -------------------------------------------------------------
    switch (activeModule) {
      case 'dashboard':
      case 'customer_dashboard':
        return (
          <MISDashboard
            onOpenCreatePO={() => setShowCreatePO(true)}
            onOpenInwardGRN={() => handleOpenInwardGRN(null)}
            onOpenCreateSO={() => setShowCreateSO(true)}
            onOpenTransfer={() => setShowTransfer(true)}
          />
        );
      case 'forecasting':
        return <DemandForecasting onOpenCreatePO={() => setShowCreatePO(true)} />;
      case 'inventory':
      case 'products':
      case 'customer_products':
      case 'catalog':
      case 'stock_mgmt':
      case 'adjustments':
        return <ItemMaster onOpenCreatePO={() => setShowCreatePO(true)} />;
      case 'warehouse':
      case 'storage_bins':
      case 'receiving_picking':
        return <WarehouseMap />;
      case 'procurement':
      case 'procurement_req':
        return <PurchaseOrders onOpenInwardGRN={handleOpenInwardGRN} />;
      case 'grn':
        return <GoodsReceipts />;
      case 'sales':
      case 'orders':
      case 'customer_orders':
      case 'dispatch_delivery':
      case 'deliveries':
        return <SalesOrders />;
      case 'logistics':
      case 'track':
      case 'customer_track':
      case 'shipments_list':
        return <LogisticsTracker />;
      case 'suppliers':
        return <SupplierManagement onOpenCreatePO={() => setShowCreatePO(true)} />;
      case 'supplier_perf':
      case 'supplier_portal':
        return <SupplierPortalView />;
      case 'customers':
        return <CustomerManagement onOpenCreateSO={() => setShowCreateSO(true)} />;
      case 'invoices':
      case 'customer_invoices':
      case 'payments':
      case 'customer_payments':
        return <InvoicesAPAR />;
      case 'reports':
        return <MISReports />;
      case 'audit':
        return <AuditTrail />;
      case 'database':
        return <DatabaseExplorer />;
      case 'infrastructure':
        return <SystemInfrastructureCenter />;
      case 'settings':
      case 'customer_settings':
      case 'profile':
      case 'customer_profile':
        return <BranchMaster />;
      default:
        return (
          <MISDashboard
            onOpenCreatePO={() => setShowCreatePO(true)}
            onOpenInwardGRN={() => handleOpenInwardGRN(null)}
            onOpenCreateSO={() => setShowCreateSO(true)}
            onOpenTransfer={() => setShowTransfer(true)}
          />
        );
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', minHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
        <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
        <main className="page-body" style={{ flex: 1, padding: '1.5rem 1.75rem', maxWidth: '1600px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Operational ERP Modals & AI Assistant - Exclusively for Super Admin */}
      {isSuperAdmin && isAdmin && (
        <>
          {showCreatePO && <CreatePOModal isOpen={showCreatePO} onClose={() => setShowCreatePO(false)} />}
          {showInwardGRN && <GoodsReceiptModal isOpen={showInwardGRN} onClose={() => { setShowInwardGRN(false); setGrnDefaultPO(null); }} defaultPO={grnDefaultPO} />}
          {showCreateSO && <CreateSOModal isOpen={showCreateSO} onClose={() => setShowCreateSO(false)} />}
          {showTransfer && <StockTransferModal isOpen={showTransfer} onClose={() => setShowTransfer(false)} />}
          <AIAssistantBot
            onOpenCreatePO={() => setShowCreatePO(true)}
            onOpenInwardGRN={() => handleOpenInwardGRN(null)}
            onOpenCreateSO={() => setShowCreateSO(true)}
            onOpenTransfer={() => setShowTransfer(true)}
          />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <SCMProvider>
      <MainApp />
    </SCMProvider>
  );
}
