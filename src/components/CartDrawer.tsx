import React from 'react';
import { CartItem } from '../types/food';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const total = items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121218] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#161622]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider font-display">
                TU PEDIDO ({items.reduce((acc, it) => acc + it.cantidad, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                  🍔
                </div>
                <h3 className="text-base font-bold text-white">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Agrega tus smash burgers favoritas, papas y bebidas para armar tu pedido.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#171722] border border-white/10 flex gap-3.5 items-center relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-[#0e0e14] border border-white/5 overflow-hidden relative shrink-0 flex items-center justify-center">
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                        }}
                      />
                    ) : (
                      <span className="text-xl">🍔</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white uppercase truncate font-display">
                      {item.nombre}
                    </h4>
                    <span className="font-mono text-sm font-black text-amber-400 block mt-0.5">
                      ${item.precio_unitario * item.cantidad}
                    </span>
                    {item.notas && (
                      <span className="text-[10px] text-gray-400 italic block truncate mt-0.5">
                        "{item.notas}"
                      </span>
                    )}

                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 bg-[#20202d] border border-white/10 rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQuantity(item.id, -1);
                          }}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white px-1">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQuantity(item.id, 1);
                          }}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          onRemoveItem(item.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors ml-auto"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#161622] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total parcial:</span>
                <span className="font-mono text-2xl font-black text-amber-400">${total}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Continuar a Finalizar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

