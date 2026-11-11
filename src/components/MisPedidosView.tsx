import React, { useState, useEffect } from 'react';
import {
  ChefHat, Bike, CheckCircle2, Package, Clock, Plus,
  Paperclip, Loader2, AlertCircle, MessageCircle, ChevronDown, ChevronUp,
  Utensils
} from 'lucide-react';
import { PedidoDetalle, fetchPedidoDetalle, uploadComprobanteTransferencia } from '../services/api';
import { triggerHaptic } from '../utils/haptics';

export type EstadoPedido = 'esperando_confirmacion' | 'en_cocina' | 'listo' | 'en_camino' | 'abierto' | 'entregado' | 'despachado';

export interface PedidoActivo {
  pedido_id: number;
  numero_orden: number;
  tipo_pedido: 'delivery' | 'takeaway';
  estado: string;
  created_at: string;
  enviado_cocina_at?: string | null;
  listo_cocina_at?: string | null;
  metodo_pago?: string;
  pagado?: boolean;
  comprobante_url?: string | null;
  total?: number;
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

interface MisPedidosViewProps {
  pedidos: PedidoActivo[];
  telefono?: string | null;
  email?: string | null;
  onArmarNuevoPedido: () => void;
}

const ESTADOS_CONFIG: Record<
  string,
  { label: string; sublabel: string; icon: React.ReactNode; color: string; step: number }
> = {
  esperando_confirmacion: {
    label: 'Esperando confirmación ⏳',
    sublabel: 'Tu orden fue enviada. Esperando ingreso a cocina…',
    icon: <Clock className="w-4 h-4 text-amber-400 animate-spin" />,
    color: '#F59E0B',
    step: 0,
  },
  abierto: {
    label: 'Pedido recibido 📦',
    sublabel: 'Estamos procesando tu orden e ingresándola a la comanda.',
    icon: <Package className="w-4 h-4 text-sky-400" />,
    color: '#0284C7',
    step: 0,
  },
  recibido: {
    label: 'Pedido recibido 📦',
    sublabel: 'Estamos procesando tu orden e ingresándola a la comanda.',
    icon: <Package className="w-4 h-4 text-sky-400" />,
    color: '#0284C7',
    step: 0,
  },
  en_cocina: {
    label: 'En cocina 🔥',
    sublabel: 'Nuestros parrilleros están smashando tus burgers a fuego vivo.',
    icon: <ChefHat className="w-4 h-4 text-amber-400 animate-bounce" />,
    color: '#F59E0B',
    step: 1,
  },
  preparando: {
    label: 'En cocina 🔥',
    sublabel: 'Nuestros parrilleros están smashando tus burgers a fuego vivo.',
    icon: <ChefHat className="w-4 h-4 text-amber-400 animate-bounce" />,
    color: '#F59E0B',
    step: 1,
  },
  listo: {
    label: '¡Listo! 🎉',
    sublabel: 'Tu pedido está empacado con cuidado, crujiente y caliente.',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: '#10B981',
    step: 2,
  },
  en_camino: {
    label: 'En camino 🛵',
    sublabel: 'El cadete va hacia tu dirección con tu pedido caliente.',
    icon: <Bike className="w-4 h-4 text-purple-400 animate-pulse" />,
    color: '#8B5CF6',
    step: 3,
  },
  despachado: {
    label: 'En camino 🛵',
    sublabel: 'El cadete va hacia tu dirección con tu pedido caliente.',
    icon: <Bike className="w-4 h-4 text-purple-400 animate-pulse" />,
    color: '#8B5CF6',
    step: 3,
  },
  entregado: {
    label: 'Entregado ✅',
    sublabel: '¡Que disfrutes tu smash burger artesanal!',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: '#10B981',
    step: 4,
  },
  completado: {
    label: 'Completado ✅',
    sublabel: '¡Que disfrutes tu smash burger artesanal!',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: '#10B981',
    step: 4,
  },
};

export const MisPedidosView: React.FC<MisPedidosViewProps> = ({
  pedidos,
  telefono,
  email,
  onArmarNuevoPedido,
}) => {
  const [detallesMap, setDetallesMap] = useState<Record<number, PedidoDetalle>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [expandedId, setExpandedId] = useState<number | null>(pedidos[0]?.pedido_id || null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Cargar detalles de cada pedido activo
  useEffect(() => {
    if (pedidos.length === 0) return;

    pedidos.forEach(async (p) => {
      if (detallesMap[p.pedido_id] || loadingMap[p.pedido_id]) return;

      setLoadingMap((prev) => ({ ...prev, [p.pedido_id]: true }));
      try {
        const detalle = await fetchPedidoDetalle(p.pedido_id, email || undefined, telefono || undefined);
        if (detalle) {
          setDetallesMap((prev) => ({ ...prev, [p.pedido_id]: detalle }));
        }
      } catch (err) {
        console.warn('Error cargando detalle de pedido:', err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [p.pedido_id]: false }));
      }
    });
  }, [pedidos, email, telefono]);

  // Si cambia la lista de pedidos y no hay ninguno expandido, expandir el primero
  useEffect(() => {
    if (pedidos.length > 0 && (!expandedId || !pedidos.some((p) => p.pedido_id === expandedId))) {
      setExpandedId(pedidos[0].pedido_id);
    }
  }, [pedidos, expandedId]);

  const handleUploadComprobante = async (pedidoId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(pedidoId);
      triggerHaptic('medium');
      const res = await uploadComprobanteTransferencia(pedidoId, file);
      if (res.success && res.comprobante_url) {
        setDetallesMap((prev) => {
          const current = prev[pedidoId];
          if (!current) return prev;
          return {
            ...current,
            comprobante_url: res.comprobante_url,
          };
        });
      }
    } catch (err) {
      console.warn('Error subiendo comprobante:', err);
    } finally {
      setUploadingId(null);
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className="py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-3xl mx-auto flex items-center justify-center">
          🍔
        </div>
        <h3 className="text-base font-black text-white uppercase tracking-wider font-display">
          No tienes pedidos en curso
        </h3>
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Cuando hagas un pedido vas a poder seguir su preparación en tiempo real y consultar exactamente qué pediste desde acá.
        </p>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onArmarNuevoPedido();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Utensils className="w-4 h-4" />
          <span>Explorar la carta y pedir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Banner explicativo de pedido en curso */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 text-xs">
          <p className="font-bold text-amber-300">Tu pedido ya está en marcha</p>
          <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
            Nuestra cocina está preparando tu orden. Si querés sumar algo más, podés armar un nuevo pedido en cualquier momento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onArmarNuevoPedido();
          }}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-3">
        {pedidos.map((pedido) => {
          const cfg = ESTADOS_CONFIG[pedido.estado] || ESTADOS_CONFIG.recibido;
          const detalle = detallesMap[pedido.pedido_id];
          const isLoadingDetalle = loadingMap[pedido.pedido_id];
          const isExpanded = expandedId === pedido.pedido_id;

          const createdDate = pedido.created_at ? new Date(pedido.created_at) : new Date();
          const horaStr = createdDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
          const isDelivery = pedido.tipo_pedido === 'delivery';
          const steps = isDelivery
            ? ['Recibido', 'En cocina', 'Listo', 'En viaje']
            : ['Recibido', 'En cocina', 'Listo', 'Mostrador'];
          const currentStep = Math.min(cfg.step, 3);

          return (
            <div
              key={pedido.pedido_id}
              className="bg-[#171724] rounded-2xl border border-white/10 overflow-hidden shadow-xl transition-all"
            >
              {/* Header de la tarjeta */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setExpandedId(isExpanded ? null : pedido.pedido_id);
                }}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                    #{pedido.numero_orden}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase">
                        {isDelivery ? '🛵 Delivery' : '🛍️ Retiro en local'}
                      </span>
                      <span className="text-[10px] text-gray-400">· {horaStr} hs</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5" style={{ color: cfg.color }}>
                      {cfg.icon}
                      <span className="text-xs font-black">{cfg.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-black text-white">
                    ${(detalle?.total || pedido.total || 0).toLocaleString()}
                  </span>
                  <div className="p-1 rounded-lg text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3.5">
                  {/* Step Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      {steps.map((label, idx) => {
                        const isDone = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={label} className="flex flex-col items-center flex-1 text-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-black'
                                  : isCurrent
                                  ? 'bg-amber-500 text-black animate-pulse shadow-md shadow-amber-500/40'
                                  : 'bg-white/10 text-gray-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] uppercase font-bold mt-1 tracking-wider ${
                                isCurrent ? 'text-amber-400' : isDone ? 'text-gray-300' : 'text-gray-500'
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mt-2 italic">
                      {cfg.sublabel}
                    </p>
                  </div>

                  {/* Items del pedido */}
                  <div className="bg-[#12121b] rounded-xl p-3 border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Detalle de Productos
                    </span>

                    {isLoadingDetalle ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Cargando detalle del pedido...</span>
                      </div>
                    ) : detalle?.items && detalle.items.length > 0 ? (
                      <div className="space-y-1.5 divide-y divide-white/5">
                        {detalle.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between text-xs">
                            <div>
                              <span className="font-bold text-white">
                                {it.cantidad}x {it.nombre}
                              </span>
                              {it.notas && (
                                <p className="text-[10px] text-gray-400 italic">"{it.notas}"</p>
                              )}
                              {it.modificadores && it.modificadores.length > 0 && (
                                <p className="text-[10px] text-amber-400/90">
                                  {it.modificadores.map((m) => m.nombre).join(', ')}
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-gray-300 font-semibold ml-2">
                              ${(it.precio_unitario * it.cantidad).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300">
                        Pedido de smash burgers y acompañamientos registrado en cocina.
                      </p>
                    )}
                  </div>

                  {/* Comprobante de transferencia si aplica */}
                  {pedido.metodo_pago === 'transferencia' && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-white block">Pago por Transferencia</span>
                        <span className="text-[11px] text-gray-400">
                          {detalle?.comprobante_url || pedido.comprobante_url ? 'Comprobante adjuntado ✓' : 'Podés adjuntar tu captura'}
                        </span>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all">
                        {uploadingId === pedido.pedido_id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{detalle?.comprobante_url || pedido.comprobante_url ? 'Cambiar' : 'Adjuntar'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleUploadComprobante(pedido.pedido_id, e)}
                        />
                      </label>
                    </div>
                  )}

                  {/* WhatsApp Support Button */}
                  <a
                    href={`https://wa.me/59891797279?text=Hola%20Burguerama!%20Consulto%20por%20mi%20pedido%20%23${pedido.numero_orden}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic('light')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Consultar a Burguerama por WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

