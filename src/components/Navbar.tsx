import React from 'react';
import { ShoppingBag, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { TenantInfo, MarcaInfo } from '../types/food';
import { triggerHaptic } from '../utils/haptics';

interface NavbarProps {
  tenant: TenantInfo;
  marca: MarcaInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onOpenOrders?: () => void;
  activeOrdersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  tenant,
  marca,
  cartCount,
  cartTotal,
  onOpenCart,
  onNavigateHome,
  onOpenOrders,
  activeOrdersCount = 0,
}) => {
  const isDeliveryOpen = marca.estado_atencion?.delivery_abierto_ahora ?? true;

  return (
    <header className="sticky top-0 z-40 bg-[#0d0d12]/90 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              triggerHaptic('light');
              onNavigateHome();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500/50 p-0 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:border-amber-400 group-hover:scale-105 transition-all bg-black">
              <img
                src="/Burguerama_logo.png"
                alt={marca.nombre || 'Burguerama'}
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-display">
                  BURGUERAMA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                  SMASH
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${isDeliveryOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isDeliveryOpen ? 'Abierto · Desde las 20:00 hs' : 'Horario: Mar a Dom desde 20:00'}</span>
              </div>
            </div>
          </div>

          {/* Center Info Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-300">
            <a
              href={tenant.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Sarandí 312 Bis</span>
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mar a Dom · Desde 20:00 hs</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Premium Instagram Button */}
            <a
              href="https://www.instagram.com/burgueramatbo/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 hover:from-[#f09433]/30 hover:via-[#dc2743]/30 hover:to-[#bc1888]/30 border border-pink-500/30 text-white transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/10 group"
              aria-label="Instagram Burguerama"
              title="Instagram @burgueramatbo"
            >
              <svg className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="hidden md:inline text-xs font-bold">Instagram</span>
            </a>

            {/* Premium WhatsApp Button */}
            <a
              href="https://wa.me/59891797279?text=Hola%20Burguerama!%20Quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/15 group"
              aria-label="WhatsApp Burguerama"
              title="Pedir por WhatsApp"
            >
              <svg className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden md:inline text-xs font-bold">WhatsApp</span>
            </a>
            {/* Active Orders Tracker Pill */}
            {activeOrdersCount > 0 && onOpenOrders && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenOrders();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse hover:bg-amber-500/25 transition-all"
              >
                <span>📦 {activeOrdersCount} {activeOrdersCount === 1 ? 'pedido' : 'pedidos'}</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenCart();
              }}
              className="relative flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
              aria-label={`Ver carrito (${cartCount} items)`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-black" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-amber-400 text-[11px] font-black rounded-full flex items-center justify-center border-2 border-amber-500">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Carrito</span>
              {cartTotal > 0 && (
                <span className="font-mono text-xs font-black bg-black/20 px-2 py-0.5 rounded-md">
                  ${cartTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

