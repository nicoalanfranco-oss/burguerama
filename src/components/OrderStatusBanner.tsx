import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock, ChefHat, Bike, CheckCircle2, Package, X,
  Paperclip, Loader2, ChevronRight, MessageCircle
} from 'lucide-react';
import { PedidoActivo } from './MisPedidosView';
import { fetchPedidoEstado, uploadComprobanteTransferencia } from '../services/api';
import { triggerHaptic } from '../utils/haptics';

export type { PedidoActivo };

interface OrderStatusBannerProps {
  onOpenMisPedidos?: () => void;
  onPedidosChange?: (pedidos: PedidoActivo[]) => void;
}

const ESTADOS_CONFIG: Record<
  string,
  { label: string; shortLabel: string; sublabel: string; icon: React.ReactNode; color: string; step: number }
> = {
  esperando_confirmacion: {
    label: 'Esperando confirmación ⏳',
    shortLabel: 'Procesando ⏳',
    sublabel: 'Tu orden fue enviada. Esperando ingreso a cocina…',
    icon: <Clock className="w-4 h-4 text-amber-400 animate-spin" />,
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/15',
    step: 0,
  },
  abierto: {
    label: 'Pedido recibido 📦',
    shortLabel: 'Recibido 📦',
    sublabel: 'Estamos preparando tu comanda…',
    icon: <Package className="w-4 h-4 text-sky-400" />,
    color: 'text-sky-400 border-sky-500/40 bg-sky-500/15',
    step: 0,
  },
  recibido: {
    label: 'Pedido recibido 📦',
    shortLabel: 'Recibido 📦',
    sublabel: 'Estamos preparando tu comanda…',
    icon: <Package className="w-4 h-4 text-sky-400" />,
    color: 'text-sky-400 border-sky-500/40 bg-sky-500/15',
    step: 0,
  },
  en_cocina: {
    label: 'En cocina 🔥',
    shortLabel: 'Cocina 🔥',
    sublabel: 'Parrilleros smashando tus burgers a fuego vivo',
    icon: <ChefHat className="w-4 h-4 text-amber-400 animate-bounce" />,
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/15',
    step: 1,
  },
  preparando: {
    label: 'En cocina 🔥',
    shortLabel: 'Cocina 🔥',
    sublabel: 'Parrilleros smashando tus burgers a fuego vivo',
    icon: <ChefHat className="w-4 h-4 text-amber-400 animate-bounce" />,
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/15',
    step: 1,
  },
  listo: {
    label: '¡Tu pedido está listo! 🎉',
    shortLabel: 'Listo 🎉',
    sublabel: 'Tu orden está terminada y empacada con cuidado.',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15',
    step: 2,
  },
  en_camino: {
    label: '¡Tu pedido está en camino! 🛵',
    shortLabel: 'En camino 🛵',
    sublabel: 'El cadete va hacia tu dirección con las smash calientes.',
    icon: <Bike className="w-4 h-4 text-purple-400 animate-pulse" />,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/15',
    step: 3,
  },
  despachado: {
    label: '¡Tu pedido está en camino! 🛵',
    shortLabel: 'En camino 🛵',
    sublabel: 'El cadete va hacia tu dirección con las smash calientes.',
    icon: <Bike className="w-4 h-4 text-purple-400 animate-pulse" />,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/15',
    step: 3,
  },
};

function getCachedOrders(): PedidoActivo[] {
  try {
    const raw = localStorage.getItem('burguerama_recent_orders');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list: PedidoActivo[] = Array.isArray(parsed) ? parsed : [parsed];
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    return list.filter((item) => {
      if (!item || !item.numero_orden) return false;
      const createdAt = item.created_at ? new Date(item.created_at).getTime() : now;
      return now - createdAt < threeHours && item.estado !== 'entregado' && item.estado !== 'cancelado';
    });
  } catch {
    return [];
  }
}

export const OrderStatusBanner: React.FC<OrderStatusBannerProps> = ({
  onOpenMisPedidos,
  onPedidosChange,
}) => {
  const [orders, setOrders] = useState<PedidoActivo[]>(getCachedOrders);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(() => orders[0]?.pedido_id || null);
  const [dismissed, setDismissed] = useState(false);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent on initial load and changes
  useEffect(() => {
    onPedidosChange?.(orders);
  }, [orders, onPedidosChange]);

  // Sync with localStorage event
  useEffect(() => {
    const handleUpdate = () => {
      const updated = getCachedOrders();
      setOrders(updated);
      setDismissed(false);
      if (updated.length > 0 && (!selectedPedidoId || !updated.some((o) => o.pedido_id === selectedPedidoId))) {
        setSelectedPedidoId(updated[0].pedido_id);
      }
    };

    window.addEventListener('burguerama:order_status_updated', handleUpdate);
    return () => window.removeEventListener('burguerama:order_status_updated', handleUpdate);
  }, [selectedPedidoId]);

  // Polling backend status every 20 seconds
  const pollStatus = useCallback(async () => {
    if (orders.length === 0) return;

    try {
      const updated = await Promise.all(
        orders.map(async (o) => {
          if (o.estado === 'entregado' || o.estado === 'cancelado') return o;
          const res = await fetchPedidoEstado(o.pedido_id);
          return {
            ...o,
            estado: res.estado || o.estado,
          };
        })
      );

      setOrders(updated);
      try {
        localStorage.setItem('burguerama_recent_orders', JSON.stringify(updated));
      } catch {}
    } catch {}
  }, [orders]);

  useEffect(() => {
    if (orders.length === 0) return;
    const interval = setInterval(pollStatus, 20000);
    return () => clearInterval(interval);
  }, [orders, pollStatus]);

  if (dismissed || orders.length === 0) return null;

  const currentOrder = orders.find((o) => o.pedido_id === selectedPedidoId) || orders[0];
  const cfg = ESTADOS_CONFIG[currentOrder.estado] || ESTADOS_CONFIG.recibido;
  const isDelivery = currentOrder.tipo_pedido === 'delivery';
  const steps = isDelivery
    ? ['Recibido', 'En cocina', 'Listo', 'En viaje']
    : ['Recibido', 'En cocina', 'Listo', 'Mostrador'];
  const currentStep = Math.min(cfg.step, 3);

  const handleComprobanteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrder) return;

    try {
      setUploadingComprobante(true);
      triggerHaptic('medium');
      const res = await uploadComprobanteTransferencia(currentOrder.pedido_id, file);
      if (res.success && res.comprobante_url) {
        const nextOrders = orders.map((o) =>
          o.pedido_id === currentOrder.pedido_id ? { ...o, comprobante_url: res.comprobante_url } : o
        );
        setOrders(nextOrders);
        localStorage.setItem('burguerama_recent_orders', JSON.stringify(nextOrders));
      }
    } catch (err) {
      console.warn('Error subiendo comprobante:', err);
    } finally {
      setUploadingComprobante(false);
    }
  };

  return (
    <div className="relative z-30 bg-[#14141e] border-b border-amber-500/30 text-white shadow-xl shadow-black/40">
      {/* Selector de pedidos si hay más de 1 pedido activo */}
      {orders.length > 1 && (
        <div className="bg-[#0f0f17] border-b border-white/5 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Tus Pedidos:</span>
          {orders.map((ord) => {
            const pCfg = ESTADOS_CONFIG[ord.estado] || ESTADOS_CONFIG.recibido;
            const isSel = ord.pedido_id === currentOrder.pedido_id;
            return (
              <button
                key={ord.pedido_id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedPedidoId(ord.pedido_id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono transition-all ${
                  isSel
                    ? 'bg-amber-500 text-black border-amber-400 font-black shadow'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>#{ord.numero_orden}</span>
                <span className="text-[10px] font-sans font-medium opacity-80">({pCfg.shortLabel})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Icon, order info & status */}
          <div
            className="flex items-start sm:items-center gap-3 cursor-pointer group flex-1"
            onClick={() => {
              triggerHaptic('light');
              onOpenMisPedidos?.();
            }}
          >
            <div className="relative shrink-0 w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              {cfg.icon}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-black text-amber-400">
                  #{currentOrder.numero_orden}
                </span>
                <span className="text-[11px] font-bold text-gray-300 uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                  {isDelivery ? '🛵 Delivery' : '🛍️ Retiro en local'}
                </span>

                {/* Comprobante de transferencia rápido */}
                {currentOrder.metodo_pago === 'transferencia' && (
                  <div
                    className="inline-flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleComprobanteChange}
                    />
                    {uploadingComprobante ? (
                      <span className="text-[10px] text-amber-300 flex items-center gap-1 font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" /> Subiendo...
                      </span>
                    ) : currentOrder.comprobante_url ? (
                      <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                        Comprobante ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 active:scale-95 transition-all"
                        title="Adjuntar comprobante"
                      >
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>Adjuntar Comprobante</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                  {cfg.label}
                </span>
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  — {cfg.sublabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Step Progress Bar & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Steps mini bar */}
            <div className="hidden sm:flex flex-col gap-1 w-48">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-gray-400">
                {steps.map((st, i) => (
                  <span
                    key={st}
                    className={i === currentStep ? 'text-amber-400 font-black' : i < currentStep ? 'text-gray-300' : 'text-gray-600'}
                  >
                    {st}
                  </span>
                ))}
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Ver detalle CTA */}
            {onOpenMisPedidos && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenMisPedidos();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider transition-all"
              >
                <span>Ver seguimiento</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setDismissed(true);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Ocultar aviso"
              title="Ocultar cartel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
