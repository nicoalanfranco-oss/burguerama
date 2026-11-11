import React, { useState } from 'react';
import { ProductoElaborado } from '../types/food';
import { X, Plus, Minus, Flame, Check, Sparkles, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface DishDetailModalProps {
  dish: ProductoElaborado | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: ProductoElaborado, cantidad: number, notas?: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !dish) return null;

  const handleAdd = () => {
    triggerHaptic('medium');
    onAddToCart(dish, quantity, notes.trim() || undefined);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  const totalPrice = Number(dish.precio_venta) * quantity;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#14141c] rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Area with Tenant 9 Backdrop */}
        <div className="relative h-60 sm:h-72 w-full bg-[#0e0e14] overflow-hidden flex items-center justify-center">
          {dish.imagen_url ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={dish.imagen_url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
              />
              <img
                src={dish.imagen_url}
                alt={dish.nombre}
                className="relative z-0 max-w-full max-h-full object-contain p-4 drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                }}
              />
            </div>
          ) : (
            <img
              src="/Hamburguesa_transparente.png"
              alt={dish.nombre}
              className="max-w-full max-h-full object-contain p-6"
            />
          )}

          <span className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
            {dish.categoria}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                {dish.nombre}
              </h2>
              <span className="font-mono text-2xl font-black text-amber-400 shrink-0">
                ${Number(dish.precio_venta).toFixed(0)}
              </span>
            </div>

            {dish.descripcion && (
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                {dish.descripcion}
              </p>
            )}
          </div>

          {/* Recipe Ingredients Breakdown */}
          {dish.insumos_receta && dish.insumos_receta.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#1b1b24] border border-white/5 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Ingredientes en la Receta
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                {dish.insumos_receta.map((ins) => (
                  <div key={ins.insumo_id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{ins.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes / Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              ¿Alguna preferencia para la cocina? (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, salsa aparte, bien tostada..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#111117] flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-[#1d1d28] border border-white/10 rounded-2xl px-3 py-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setQuantity((prev) => Math.max(1, prev - 1));
              }}
              className="p-1 rounded-lg text-amber-400 hover:bg-white/10"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono text-base font-black text-white px-2">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setQuantity((prev) => prev + 1);
              }}
              className="p-1 rounded-lg text-amber-400 hover:bg-white/10"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Agregar al Pedido</span>
            <span className="font-mono font-black border-l border-black/20 pl-2">
              ${totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

