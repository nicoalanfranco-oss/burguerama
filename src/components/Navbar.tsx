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
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/5 border border-amber-500/30 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-400 transition-all">
              <img
                src={marca.logo_url || '/Burguerama_logo.png'}
                alt={marca.nombre || 'Burguerama'}
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Burguerama logo.jpg';
                }}
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
                <span>{isDeliveryOpen ? 'Abierto · Envíos activos' : 'Horario: 19:30 a 00:30'}</span>
              </div>
            </div>
          </div>

          {/* Center Info Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-5 text-xs text-gray-300">
            <a
              href={tenant.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{tenant.direccion || 'Sarandí 312 Bis'}</span>
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{marca.dias_atencion || 'Mar a Dom'} · {marca.horario_atencion || '19:30 a 00:30'}</span>
            </div>
            <a
              href={`https://wa.me/598${(tenant.telefono || '099275502').replace(/\D/g, '')}?text=Hola%20Burguerama!%20Quería%20hacer%20una%20consulta`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>099 275 502</span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
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

