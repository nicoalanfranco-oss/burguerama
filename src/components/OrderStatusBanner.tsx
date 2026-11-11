import React, { useState, useEffect } from 'react';
import { fetchPedidoEstado } from '../services/api';
import { Clock, ChefHat, Bike, CheckCircle2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface PedidoActivo {
  pedido_id: number;
  numero_orden: number;
  tipo_pedido: 'delivery' | 'takeaway';
  estado: string;
  created_at: string;
  total: number;
  nombre?: string;
  telefono?: string;
}

export const OrderStatusBanner: React.FC = () => {
  const [orders, setOrders] = useState<PedidoActivo[]>(() => {
    try {
      const raw = localStorage.getItem('burguerama_recent_orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [expanded, setExpanded] = useState<boolean>(true);

  // Sync on event
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem('burguerama_recent_orders');
        if (raw) setOrders(JSON.parse(raw));
      } catch {}
    };

    window.addEventListener('burguerama:order_status_updated', handleUpdate);
    return () => window.removeEventListener('burguerama:order_status_updated', handleUpdate);
  }, []);

  // Poll active orders status
  useEffect(() => {
    if (orders.length === 0) return;

    const interval = setInterval(async () => {
      const updated = await Promise.all(
        orders.map(async (o) => {
          if (o.estado === 'entregado' || o.estado === 'cancelado') return o;
          const res = await fetchPedidoEstado(o.pedido_id);
          return { ...o, estado: res.estado || o.estado };
        })
      );
      setOrders(updated);
      try {
        localStorage.setItem('burguerama_recent_orders', JSON.stringify(updated));
      } catch {}
    }, 25000);

    return () => clearInterval(interval);
  }, [orders]);

  const activeOrders = orders.filter((o) => o.estado !== 'cancelado').slice(0, 3);
  if (activeOrders.length === 0) return null;

  const getStatusBadge = (estado: string, tipo: string) => {
    switch (estado) {
      case 'en_cocina':
      case 'preparando':
        return {
          icon: <ChefHat className="w-4 h-4 text-amber-400 animate-bounce" />,
          label: 'En Cocina · Preparando tu Smash',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'en_camino':
      case 'despachado':
        return {
          icon: <Bike className="w-4 h-4 text-blue-400 animate-pulse" />,
          label: tipo === 'delivery' ? 'En Camino con Cadete' : 'Listo para Retirar en Mostrador',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      case 'entregado':
      case 'completado':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'Entregado · ¡Que lo disfrutes!',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          label: 'Pedido Recibido en Sistema',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
    }
  };

  return (
    <div className="bg-[#151522] border-b border-amber-500/30 px-4 py-2.5 sm:px-6 relative z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Seguimiento de Pedido Activo
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setExpanded((prev) => !prev);
            }}
            className="flex items-center gap-1 text-xs text-amber-400 font-bold hover:text-amber-300"
          >
            <span>{expanded ? 'Ocultar' : 'Ver detalle'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-2.5 space-y-2">
            {activeOrders.map((ord) => {
              const badge = getStatusBadge(ord.estado, ord.tipo_pedido);
              return (
                <div
                  key={ord.pedido_id}
                  className="p-3 rounded-2xl bg-[#1d1d2c] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      #{ord.numero_orden}
                    </span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${badge.color}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">${ord.total}</span>
                    <a
                      href={`https://wa.me/59899275502?text=Hola%20Burguerama!%20Consulto%20por%20mi%20pedido%20%23${ord.numero_orden}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

