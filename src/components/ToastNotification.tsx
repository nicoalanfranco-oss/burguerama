import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onOpenCart,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      onClick={onOpenCart}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#161622]/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-all animate-in slide-in-from-bottom duration-300"
      role="status"
    >
      <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center">
        {toast.image ? (
          <img src={toast.image} alt={toast.title} className="w-full h-full object-contain p-0.5" />
        ) : (
          <ShoppingBag className="w-5 h-5 text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
          ¡Agregado al Carrito!
        </span>
        <h4 className="text-xs font-black text-white uppercase truncate font-display">
          {toast.title}
        </h4>
        {toast.price != null && (
          <span className="text-[11px] font-mono text-gray-300 font-bold">
            ${toast.price}
          </span>
        )}
      </div>

      <button
        type="button"
        className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-xs font-bold flex items-center gap-1 shrink-0"
      >
        <span>Ver</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

