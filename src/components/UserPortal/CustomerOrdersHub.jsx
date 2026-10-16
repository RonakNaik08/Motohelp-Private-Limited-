import React, { useState, useEffect } from 'react';
import { useSCM } from '../../context/SCMContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  Truck,
  FileText,
  CreditCard,
  Heart,
  Headphones,
  User,
  Settings,
  Search,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Scan,
  MessageSquare
} from 'lucide-react';
import { CustomerHomeDashboard } from './CustomerHomeDashboard';
import { CustomerOrdersView } from './CustomerOrdersView';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { WishlistView } from './WishlistView';
import { MyntraCartView } from './MyntraCartView';
import { EnhancedTrackingView } from './EnhancedTrackingView';
import { CustomerInvoicesView } from './CustomerInvoicesView';
import { CustomerPaymentsView } from './CustomerPaymentsView';
import { CustomerSupportView } from './CustomerSupportView';
import { CustomerProfileView } from './CustomerProfileView';
import { CustomerReturnsView } from './CustomerReturnsView';
import { CustomerCheckoutModal } from './CustomerCheckoutModal';
import { GSTTaxInvoiceModal } from '../Finance/GSTTaxInvoiceModal';
import { BarcodeScannerModal } from '../Common/BarcodeScannerModal';
import { WebhookNotificationModal } from '../Common/WebhookNotificationModal';
import { INITIAL_PRODUCTS } from '../../data/mockData';

export const CustomerOrdersHub = () => {
  const {
    currentUser,
    salesOrders,
    shipments,
    products,
    selectedBranch,
    activeModule,
    setActiveModule,
    cart,
    addToCart,
    clearCart,
    cartItemsCount,
    wishlist,
    wishlistCount,
    returns = []
  } = useSCM();

  // Robust normalization of activeModule to customer tabs
  const getInitialTab = () => {
    const mod = String(activeModule || '').trim().toLowerCase();
    
    // Explicit exact matches first
    if (mod === 'customer_products' || mod === 'products' || mod === 'catalog' || mod === 'create_order' || mod === 'new_order' || mod === 'marketplace' || mod === 'shop' || mod === 'inventory') {
      return 'products';
    }
    if (mod === 'customer_cart' || mod === 'cart' || mod === 'bag' || mod === 'checkout') {
      return 'cart';
    }
    if (mod === 'customer_orders' || mod === 'orders' || mod === 'my_orders' || mod === 'sales' || mod === 'order_history') {
      return 'orders';
    }
    if (mod === 'customer_track' || mod === 'track' || mod === 'tracking' || mod === 'shipments' || mod === 'logistics') {
      return 'track';
    }
    if (mod === 'customer_invoices' || mod === 'invoices' || mod === 'billing') {
      return 'invoices';
    }
    if (mod === 'customer_payments' || mod === 'payments' || mod === 'payment') {
      return 'payments';
    }
    if (mod === 'customer_favorites' || mod === 'favorites' || mod === 'wishlist' || mod === 'saved') {
      return 'favorites';
    }
    if (mod === 'customer_returns' || mod === 'returns' || mod === 'rma') {
      return 'returns';
    }
    if (mod === 'customer_support' || mod === 'support' || mod === 'help') {
      return 'support';
    }
    if (mod === 'customer_profile' || mod === 'profile' || mod === 'account') {
      return 'profile';
    }
    if (mod === 'customer_settings' || mod === 'settings' || mod === 'preferences') {
      return 'settings';
    }
    if (mod === 'customer_dashboard' || mod === 'dashboard' || mod === 'home') {
      return 'dashboard';
    }

    // Fuzzy matching fallback
    if (mod.includes('product') || mod.includes('catalog') || mod.includes('item') || mod.includes('sku')) return 'products';
    if (mod.includes('cart') || mod.includes('bag')) return 'cart';
    if (mod.includes('track') || mod.includes('ship')) return 'track';
    if (mod.includes('invoice') || mod.includes('bill')) return 'invoices';
    if (mod.includes('pay')) return 'payments';
    if (mod.includes('favor') || mod.includes('wish')) return 'favorites';
    if (mod.includes('return') || mod.includes('rma')) return 'returns';
    if (mod.includes('order')) return 'orders';
    if (mod.includes('dash')) return 'dashboard';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [activeModule]);

  const handleTabSwitch = (tab, moduleKey) => {
    setActiveTab(tab);
    setActiveModule(moduleKey || `customer_${tab}`);
  };

  // Modals state
  const [selectedPdpProduct, setSelectedPdpProduct] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [viewInvoiceSO, setViewInvoiceSO] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Catalog filtering and sorting
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Checkout address presets
  const [selectedCityPreset, setSelectedCityPreset] = useState('Mumbai, Maharashtra');
  const [customAddress, setCustomAddress] = useState('Metro Fleet Workshop, Andheri East, Mumbai, Maharashtra - 400069');
  const [priority, setPriority] = useState('Express');
  const [preferredCarrier, setPreferredCarrier] = useState('FastTrack Logistics');
  const [paymentTerms, setPaymentTerms] = useState('Prepaid (Verified)');

  const INDIAN_CITY_PRESETS = [
    { city: 'Mumbai, Maharashtra', address: 'Metro Fleet Workshop, Andheri East, Mumbai, Maharashtra - 400069' },
    { city: 'Bengaluru, Karnataka', address: 'Plot 44, Electronic City Phase 1, Hosur Road, Bengaluru - 560100' },
    { city: 'Delhi NCR, Haryana', address: 'Sector 18 Industrial Area, Udyog Vihar, Gurugram - 122015' },
    { city: 'Chennai, Tamil Nadu', address: 'Automotive Corridor Hub, Sriperumbudur Estate, Chennai - 602105' },
    { city: 'Pune, Maharashtra', address: 'Chakan MIDC Phase 2, Auto Cluster, Pune - 410501' }
  ];

  // Guaranteed fallback to INITIAL_PRODUCTS if products array is empty
  const catalogList = (products && products.length > 0) ? products : INITIAL_PRODUCTS;

  // Derive unique categories from active items
  const uniqueCategories = ['All', ...Array.from(new Set(catalogList.map(p => p.category).filter(Boolean)))];

  // Filter Catalog Products
  const filteredCatalogProducts = catalogList.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || (p.primarySupplier && p.primarySupplier.toLowerCase().includes(selectedBrand.toLowerCase()));
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()));
    return matchesCat && matchesBrand && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
    if (sortBy === 'price_high') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '2.5rem' }}>
      {/* Top Customer Navigation Tabs & Utility Buttons */}
      <div
        className="card"
        style={{
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            flex: 1
          }}
        >
          {[
            { key: 'dashboard', moduleKey: 'customer_dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { key: 'orders', moduleKey: 'customer_orders', label: 'My Orders', icon: Package, badge: `${salesOrders.length}` },
            { key: 'products', moduleKey: 'customer_products', label: 'Products', icon: ShoppingBag },
            { key: 'cart', moduleKey: 'customer_cart', label: 'Cart', icon: ShoppingCart, badge: cartItemsCount > 0 ? `${cartItemsCount}` : null },
            { key: 'track', moduleKey: 'customer_track', label: 'Track Delivery', icon: Truck, badge: 'Live' },
            { key: 'invoices', moduleKey: 'customer_invoices', label: 'Invoices', icon: FileText },
            { key: 'payments', moduleKey: 'customer_payments', label: 'Payments', icon: CreditCard },
            { key: 'returns', moduleKey: 'customer_returns', label: 'Returns & Claims', icon: RotateCcw, badge: returns.length > 0 ? `${returns.length}` : null },
            { key: 'favorites', moduleKey: 'customer_favorites', label: 'Favorites', icon: Heart, badge: wishlistCount > 0 ? `${wishlistCount}` : null },
            { key: 'support', moduleKey: 'customer_support', label: 'Support', icon: Headphones },
            { key: 'profile', moduleKey: 'customer_profile', label: 'Profile', icon: User }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isTab = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabSwitch(tab.key, tab.moduleKey)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isTab ? 'var(--brand-primary)' : 'transparent',
                  color: isTab ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isTab ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
              >
                <IconComp size={15} fill={tab.key === 'favorites' && isTab ? '#FFFFFF' : 'none'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    style={{
                      background: isTab ? '#FFFFFF' : 'var(--bg-tertiary)',
                      color: isTab ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      marginLeft: '2px',
                      border: isTab ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Tools: Barcode Scanner & WhatsApp Alerts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsScannerOpen(true)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <Scan size={13} /> Scan QR / SKU
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsWebhookModalOpen(true)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <MessageSquare size={13} style={{ color: '#25D366' }} /> WhatsApp Alerts
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CUSTOMER DASHBOARD (Home Dashboard) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <CustomerHomeDashboard
          onNavigateTab={(tab) => {
            if (tab === 'catalog') handleTabSwitch('products', 'customer_products');
            else if (tab === 'history') handleTabSwitch('orders', 'customer_orders');
            else if (tab === 'tracking') handleTabSwitch('track', 'customer_track');
            else if (tab === 'invoices') handleTabSwitch('invoices', 'customer_invoices');
            else if (tab === 'payments') handleTabSwitch('payments', 'customer_payments');
            else if (tab === 'support') handleTabSwitch('support', 'customer_support');
          }}
          onOpenQuickView={(p) => setSelectedPdpProduct(p)}
          onOpenOrderDetails={(so) => handleTabSwitch('orders', 'customer_orders')}
          onOpenInvoice={(so) => setViewInvoiceSO(so)}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. CUSTOMER MY ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <CustomerOrdersView
          onTrackOrder={(shp) => {
            setSelectedShipment(shp);
            handleTabSwitch('track', 'customer_track');
          }}
          onViewInvoice={(so) => setViewInvoiceSO(so)}
          onReorder={(so) => {
            (so.items || []).forEach(it => {
              const matchedProduct = products.find(p => p.id === it.productId || p.sku === it.sku) || products[0];
              addToCart(matchedProduct, it.quantity || 1);
            });
            handleTabSwitch('cart', 'customer_cart');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. CUSTOMER PRODUCTS (Product Catalog / Marketplace) */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Bar */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search catalog by SKU, name or category..."
                  className="form-input"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sort By:</span>
                <select
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ fontSize: '13px', width: 'auto' }}
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-table)', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {uniqueCategories.map(cat => {
                  const isCat = selectedCategory === cat;
                  const count = cat === 'All' ? catalogList.length : catalogList.filter(p => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: isCat ? '600' : '500',
                        border: isCat ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: isCat ? 'var(--brand-primary)' : '#FFFFFF',
                        color: isCat ? '#FFFFFF' : 'var(--text-secondary)',
                        transition: 'var(--transition)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>{cat}</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '10px',
                        background: isCat ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
                        color: isCat ? '#FFFFFF' : 'var(--text-muted)'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredCatalogProducts.length}</strong> of {catalogList.length} SKUs
              </span>
            </div>
          </div>

          {/* Products Grid or Empty State */}
          {filteredCatalogProducts.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Search size={22} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                No catalog items match your search
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                We couldn't find any OEM components matching "{productSearch || selectedCategory}". Try searching with another term or reset filters.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setProductSearch('');
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSortBy('featured');
                }}
                style={{ marginTop: '6px' }}
              >
                Reset Filters & Show All {catalogList.length} Products
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-md)'
              }}
            >
              {filteredCatalogProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => setSelectedPdpProduct(prod)}
                  onBuyNow={(prod) => {
                    addToCart(prod, 1);
                    handleTabSwitch('cart', 'customer_cart');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER CART (Shopping Cart & Multi-Step Checkout) */}
      {/* ========================================================================= */}
      {activeTab === 'cart' && (
        <MyntraCartView
          onInitiateCheckout={() => setIsCheckoutModalOpen(true)}
          onExploreCatalog={() => handleTabSwitch('products', 'customer_products')}
          selectedCityPreset={selectedCityPreset}
          setSelectedCityPreset={setSelectedCityPreset}
          customAddress={customAddress}
          setCustomAddress={setCustomAddress}
          priority={priority}
          setPriority={setPriority}
          preferredCarrier={preferredCarrier}
          setPreferredCarrier={setPreferredCarrier}
          paymentTerms={paymentTerms}
          setPaymentTerms={setPaymentTerms}
          indianCityPresets={INDIAN_CITY_PRESETS}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. CUSTOMER TRACK DELIVERY (Live Delivery Tracking) */}
      {/* ========================================================================= */}
      {activeTab === 'track' && (
        <EnhancedTrackingView
          shipments={shipments}
          salesOrders={salesOrders}
          selectedShipment={selectedShipment}
          setSelectedShipment={setSelectedShipment}
          onViewInvoice={(so) => setViewInvoiceSO(so)}
          onExploreCatalog={() => handleTabSwitch('products', 'customer_products')}
        />
      )}

      {/* ========================================================================= */}
      {/* 6. CUSTOMER INVOICES */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && <CustomerInvoicesView />}

      {/* ========================================================================= */}
      {/* 7. CUSTOMER PAYMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && <CustomerPaymentsView />}

      {/* ========================================================================= */}
      {/* 8. CUSTOMER RETURNS & WARRANTY CLAIMS */}
      {/* ========================================================================= */}
      {activeTab === 'returns' && (
        <CustomerReturnsView
          onExploreCatalog={() => handleTabSwitch('products', 'customer_products')}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. CUSTOMER FAVORITES (Wishlist) */}
      {/* ========================================================================= */}
      {activeTab === 'favorites' && (
        <WishlistView
          onExploreCatalog={() => handleTabSwitch('products', 'customer_products')}
          onOpenQuickView={(prod) => setSelectedPdpProduct(prod)}
        />
      )}

      {/* ========================================================================= */}
      {/* 10. CUSTOMER SUPPORT */}
      {/* ========================================================================= */}
      {activeTab === 'support' && <CustomerSupportView />}

      {/* ========================================================================= */}
      {/* 11 & 12. CUSTOMER PROFILE & SETTINGS */}
      {/* ========================================================================= */}
      {(activeTab === 'profile' || activeTab === 'settings') && <CustomerProfileView />}

      {/* ========================================================================= */}
      {/* Modals: Product Detail (PDP), Multi-Step Checkout, GST Tax Invoice */}
      {/* ========================================================================= */}
      {selectedPdpProduct && (
        <ProductDetailModal
          product={selectedPdpProduct}
          onClose={() => setSelectedPdpProduct(null)}
          onBuyNowDirect={(p, q) => {
            setSelectedPdpProduct(null);
            setIsCheckoutModalOpen(true);
          }}
        />
      )}

      {isCheckoutModalOpen && (
        <CustomerCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          onOrderSuccess={(order) => {
            if (order.shipment) setSelectedShipment(order.shipment);
            handleTabSwitch('track', 'customer_track');
          }}
        />
      )}

      {viewInvoiceSO && (
        <GSTTaxInvoiceModal
          salesOrder={viewInvoiceSO}
          onClose={() => setViewInvoiceSO(null)}
        />
      )}

      {/* Barcode & QR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={(res) => {
          if (res.product) {
            setSelectedPdpProduct(res.product);
            setIsScannerOpen(false);
          } else if (res.shipment) {
            setSelectedShipment(res.shipment);
            handleTabSwitch('track', 'customer_track');
            setIsScannerOpen(false);
          }
        }}
      />

      {/* Webhook & WhatsApp Alerts Modal */}
      <WebhookNotificationModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        shipment={selectedShipment || shipments[0]}
        salesOrder={salesOrders[0]}
      />
    </div>
  );
};
