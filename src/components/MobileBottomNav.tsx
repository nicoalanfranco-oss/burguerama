import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, MessageCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface MobileBottomNavProps {
  cartCount: number;
  activeOrdersCount?: number;
  onNavigateHome: () => void;
  onNavigateMenu: () => void;
  onOpenCart: (initialTab?: 'carrito' | 'pedidos') => void;
  whatsappUrl?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  activeOrdersCount = 0,
  onNavigateHome,
  onNavigateMenu,
  onOpenCart,
  whatsappUrl = 'https://wa.me/59891797279?text=Hola%20Burguerama!%20Quiero%20hacer%20un%20pedido',
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e0e14]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Inicio */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigateHome();
          }}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-gray-400 hover:text-amber-400 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
        </button>

        {/* Carta */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigateMenu();
          }}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-gray-400 hover:text-amber-400 transition-colors"
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">La Carta</span>
        </button>

        {/* WhatsApp directo */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">WhatsApp</span>
        </a>

        {/* Mi Pedido (Cart Drawer con Carrito o Pedidos Activos) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (cartCount === 0 && activeOrdersCount > 0) {
              onOpenCart('pedidos');
            } else {
              onOpenCart('carrito');
            }
          }}
          className="relative flex flex-col items-center justify-center gap-1 py-1 px-3 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                {cartCount}
              </span>
            ) : activeOrdersCount > 0 ? (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            {cartCount > 0 ? 'Pedido' : activeOrdersCount > 0 ? 'En cocina' : 'Carrito'}
          </span>
        </button>
      </div>
    </nav>
  );
};

