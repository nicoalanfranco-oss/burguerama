import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { CulturaBurgueramaSection } from './components/CulturaBurgueramaSection';
import { DishDetailModal } from './components/DishDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderStatusBanner } from './components/OrderStatusBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { ProductoElaborado, ProductoReventa, CartItem, TenantInfo, MarcaInfo } from './types/food';
import {
  fetchBurgueramaCatalogo,
  TENANT_INFO,
  MARCA_INFO,
  REAL_PLATOS,
  REAL_REVENTA,
  REAL_GRUPOS,
} from './services/api';
import { useStructuredData } from './hooks/useStructuredData';
import { CheckCircle2, MessageCircle, ArrowRight, Sparkles, ShoppingBag, X } from 'lucide-react';
import { triggerHaptic } from './utils/haptics';

export const App: React.FC = () => {
  const [tenant, setTenant] = useState<TenantInfo>(TENANT_INFO);
  const [marca, setMarca] = useState<MarcaInfo>(MARCA_INFO);
  const [platos, setPlatos] = useState<ProductoElaborado[]>(REAL_PLATOS);
  const [reventa, setReventa] = useState<ProductoReventa[]>(REAL_REVENTA);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<ProductoElaborado | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Success Modal
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<number | null>(null);
  const [orderWhatsAppUrl, setOrderWhatsAppUrl] = useState<string>('');

  // Cart State (Persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('burguerama_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('burguerama_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Fetch Live Catalog on Mount
  useEffect(() => {
    fetchBurgueramaCatalogo()
      .then((data) => {
        if (data.tenant) setTenant(data.tenant);
        if (data.marca) setMarca(data.marca);
        if (data.elaborados && data.elaborados.length > 0) setPlatos(data.elaborados);
        if (data.reventa && data.reventa.length > 0) setReventa(data.reventa);
      })
      .finally(() => setLoading(false));
  }, []);

  // Inject SEO Structured Data
  useStructuredData({ tenant, marca, platos, reventa });

  // Add Item to Cart
  const handleAddToCart = (
    item: ProductoElaborado | ProductoReventa,
    tipo: 'elaborado' | 'reventa',
    cantidad = 1,
    notas?: string
  ) => {
    const id = tipo === 'elaborado' ? (item as ProductoElaborado).producto_elaborado_id : (item as ProductoReventa).producto_reventa_id;
    const cartItemId = `${tipo}-${id}-${notas || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((it) => it.id === cartItemId);
      if (existing) {
        return prev.map((it) =>
          it.id === cartItemId ? { ...it, cantidad: it.cantidad + cantidad } : it
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          producto_id: id,
          tipo,
          nombre: item.nombre,
          categoria: item.categoria,
          precio_base: Number(item.precio_venta),
          precio_unitario: Number(item.precio_venta),
          cantidad,
          imagen_url: item.imagen_url || null,
          modificadores: [],
          notas,
        },
      ];
    });

    setToast({
      id: String(Date.now()),
      title: item.nombre,
      image: item.imagen_url || undefined,
      price: Number(item.precio_venta) * cantidad,
    });
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === cartItemId) {
            const newQty = it.cantidad + delta;
            return newQty > 0 ? { ...it, cantidad: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((it) => it.id !== cartItemId));
  };

  // Scroll to Menu Section
  const handleScrollToMenu = (category?: string) => {
    if (category) setSelectedCategory(category);
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Order Success Handler
  const handleOrderSuccess = (orderNumber: number, waUrl: string) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setOrderSuccessNumber(orderNumber);
    setOrderWhatsAppUrl(waUrl);
  };

  const cartTotal = cart.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);
  const cartCount = cart.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[#0c0c10] text-gray-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Live Order Tracker Banner if any active order exists */}
      <OrderStatusBanner />

      {/* Main Navbar */}
      <Navbar
        tenant={tenant}
        marca={marca}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main>
        {/* Hero Section with 3D Burger Viewer */}
        <HeroSection
          onExploreMenu={() => handleScrollToMenu()}
          onFilterCategory={(cat) => handleScrollToMenu(cat)}
        />

        {/* Product Catalog Section with strict Tenant 9 framing */}
        <MenuSection
          platos={platos}
          reventa={reventa}
          cart={cart}
          onAddToCart={(item, tipo) => handleAddToCart(item, tipo, 1)}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onOpenDishDetail={(dish) => setSelectedDish(dish)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Cultura Smash, Emblema de Marca con Brillo y Rastreo Delivery */}
        <CulturaBurgueramaSection />
      </main>

      {/* Footer */}
      <Footer tenant={tenant} marca={marca} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        cartCount={cartCount}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateMenu={() => handleScrollToMenu()}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappUrl={tenant?.telefono ? `https://wa.me/598${tenant.telefono.replace(/\D/g, '')}?text=Hola%20Burguerama!%20Quiero%20hacer%20un%20pedido` : undefined}
      />

      {/* Dish Detail Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={Boolean(selectedDish)}
        onClose={() => setSelectedDish(null)}
        onAddToCart={(dish, qty, notes) => handleAddToCart(dish, 'elaborado', qty, notes)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        marca={marca}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Toast Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Order Success Popup */}
      {orderSuccessNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161622] rounded-3xl border border-amber-500/40 p-6 sm:p-8 text-center space-y-4 shadow-2xl shadow-black/80">
            <button
              type="button"
              onClick={() => setOrderSuccessNumber(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                ¡Pedido Confirmado!
              </span>
              <h2 className="text-3xl font-black text-white font-display">
                ORDEN #{orderSuccessNumber}
              </h2>
              <p className="text-xs text-gray-300">
                Tu pedido fue enviado directo a la plancha en la cocina de Burguerama.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              {orderWhatsAppUrl && (
                <a
                  href={orderWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('medium')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Detalle por WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setOrderSuccessNumber(null)}
                className="w-full py-2.5 rounded-xl text-xs text-gray-400 hover:text-white font-bold"
              >
                Volver a la carta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

