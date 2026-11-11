import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, ProductoElaborado, ProductoReventa, MarcaInfo } from '../types/food';
import { PedidoActivo, MisPedidosView } from './MisPedidosView';
import {
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight,
  Clock, Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  platos?: ProductoElaborado[];
  reventa?: ProductoReventa[];
  marca?: MarcaInfo;
  activeOrders?: PedidoActivo[];
  initialTab?: 'carrito' | 'pedidos';
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onQuickAdd?: (plato: ProductoElaborado) => void;
  onQuickAddReventa?: (reventa: ProductoReventa) => void;
  onOpenDishDetail?: (dish: ProductoElaborado) => void;
  onProceedToCheckout: () => void;
}

/** Emojis por categoría para el catálogo */
const CATEGORY_EMOJIS: Record<string, string> = {
  'BURGERS CLÁSICAS': '🍔',
  'BURGERS': '🍔',
  'SPECIALS': '⭐',
  'ALTAGAMA': '👑',
  'CRUNCH CLUB': '🍗',
  'FRITAS Y COCA': '🍟',
  'FRITAS': '🍟',
  'BEBIDAS': '🥤',
  'Bebidas': '🥤',
  'NIÑXS': '👶',
  'MENÚ SECRETO': '🤫',
  'POSTRES': '🍨',
  'COMBOS': '✨',
  'todos': '✨',
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  platos = [],
  reventa = [],
  marca,
  activeOrders = [],
  initialTab = 'carrito',
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onQuickAdd,
  onQuickAddReventa,
  onOpenDishDetail,
  onProceedToCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'carrito' | 'pedidos'>(initialTab);
  /** Desktop: categoría activa en el panel izquierdo de menú */
  const [categoria, setCategoria] = useState('todos');
  /** Mobile: Menú vs Pedido */
  const [mobileTab, setMobileTab] = useState<'menu' | 'pedido'>('pedido');

  // Sincronizar pestaña inicial al abrir
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // En móvil: si está vacío va a menú, si tiene items va a pedido
  useEffect(() => {
    if (isOpen) {
      setMobileTab(items.length === 0 ? 'menu' : 'pedido');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0),
    [items]
  );
  const cartCount = useMemo(
    () => items.reduce((acc, it) => acc + it.cantidad, 0),
    [items]
  );

  // Categorías únicas del menú para el panel de catálogo desktop
  const categorias = useMemo(() => {
    const list = Array.from(new Set(platos.map(p => p.categoria || 'BURGERS')));
    if (reventa.length > 0 && !list.includes('BEBIDAS')) list.push('BEBIDAS');
    return ['todos', ...list];
  }, [platos, reventa]);

  // Productos filtrados por categoría
  const platosFiltrados = useMemo(() => {
    if (categoria === 'todos') return platos;
    if (categoria === 'BEBIDAS') return [];
    return platos.filter(p => p.categoria === categoria);
  }, [platos, categoria]);

  const reventaFiltrada = useMemo(() => {
    return (categoria === 'todos' || categoria === 'BEBIDAS') ? reventa : [];
  }, [reventa, categoria]);

  // Items para el carrusel horizontal upsell en móvil
  const suggestedPlatos = useMemo(() => platos.slice(0, 8), [platos]);
  const suggestedReventa = useMemo(() => reventa.slice(0, 6), [reventa]);

  if (!isOpen) return null;

  /* ─────────────────────────────────────────────────────────────
     Bloque móvil: Panel de ítems del carrito + resumen + upsell
     ───────────────────────────────────────────────────────────── */
  const MobileCartItemsPanel = (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="p-4 space-y-4 flex-1">
        {/* Cart Items List */}
        {items.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-3 bg-[#161622]/50 rounded-2xl border border-white/5">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-3xl mx-auto flex items-center justify-center">
              🍔
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Tu pedido está vacío
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Elegí tus smash burgers y acompañamientos del menú ←
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                PRODUCTOS AÑADIDOS ({cartCount})
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  items.forEach((it) => onRemoveItem(it.id));
                }}
                className="text-[10px] font-bold text-gray-400 hover:text-red-400 uppercase tracking-wider"
              >
                Vaciar
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#171724] border border-white/10 flex gap-3 items-center group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-[#0e0e14] border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
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
                    <h4 className="text-xs font-black text-white uppercase truncate font-display">
                      {item.nombre}
                    </h4>
                    <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                      ${(item.precio_unitario * item.cantidad).toLocaleString()}
                    </span>
                    {item.notas && (
                      <span className="text-[10px] text-gray-400 italic block truncate">
                        "{item.notas}"
                      </span>
                    )}

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 bg-[#20202e] border border-white/10 rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQuantity(item.id, -1);
                          }}
                          className="p-0.5 text-gray-400 hover:text-white"
                          aria-label="Disminuir"
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
                          aria-label="Aumentar"
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
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UPSELL HORIZONTAL SCROLLER (Móvil) ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ¿Querés agregar algo más?
            </span>
            <span className="text-[10px] text-gray-400 font-bold">Deslizá →</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
            {suggestedPlatos.map((plato) => (
              <div
                key={`upsell_${plato.producto_elaborado_id}`}
                className="w-36 shrink-0 bg-[#161622] rounded-2xl border border-white/10 p-2.5 flex flex-col justify-between snap-start hover:border-amber-500/40 transition-all shadow-md group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    triggerHaptic('light');
                    if (onOpenDishDetail) onOpenDishDetail(plato);
                    else if (onQuickAdd) onQuickAdd(plato);
                  }}
                >
                  <div className="w-full h-20 rounded-xl bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-1.5 relative">
                    {plato.imagen_url ? (
                      <img
                        src={plato.imagen_url}
                        alt={plato.nombre}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🍔</span>
                    )}
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/80 text-amber-400 border border-amber-500/30">
                      {plato.categoria}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase truncate font-display">
                    {plato.nombre}
                  </h4>
                  <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                    ${Number(plato.precio_venta).toFixed(0)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (onQuickAdd) onQuickAdd(plato);
                  }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Agregar</span>
                </button>
              </div>
            ))}

            {suggestedReventa.map((rev) => (
              <div
                key={`upsell_rev_${rev.producto_reventa_id}`}
                className="w-32 shrink-0 bg-[#161622] rounded-2xl border border-white/10 p-2.5 flex flex-col justify-between snap-start hover:border-amber-500/40 transition-all shadow-md group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    triggerHaptic('light');
                    if (onQuickAddReventa) onQuickAddReventa(rev);
                  }}
                >
                  <div className="w-full h-20 rounded-xl bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-1.5 relative">
                    {rev.imagen_url ? (
                      <img
                        src={rev.imagen_url}
                        alt={rev.nombre}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-2xl">🥤</span>
                    )}
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/80 text-sky-400 border border-sky-500/30">
                      Bebidas
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase truncate font-display">
                    {rev.nombre}
                  </h4>
                  <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                    ${Number(rev.precio_venta).toFixed(0)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (onQuickAddReventa) onQuickAddReventa(rev);
                  }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Agregar</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen del Pedido Móvil */}
        {items.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#171724] border border-white/10 space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              Resumen del Pedido
            </span>
            <div className="flex items-center justify-between text-gray-300">
              <span>Subtotal ({cartCount} {cartCount === 1 ? 'ítem' : 'ítems'})</span>
              <span className="font-mono font-bold">${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400 text-[11px]">
              <span>Envío (Delivery)</span>
              <span>{marca?.costo_delivery !== undefined ? (Number(marca.costo_delivery) === 0 ? 'Gratis' : `+$${marca.costo_delivery}`) : 'Gratis'}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-white font-bold">
              <span className="text-sm">Total estimado</span>
              <span className="font-mono text-base font-black text-amber-400">
                ${total.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 italic pt-1">
              Podrás elegir delivery o retiro en mostrador y forma de pago en el siguiente paso.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Checkout CTA Móvil */}
      {items.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-[#161622] space-y-2 mt-auto">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-400 uppercase font-bold">Total a pagar:</span>
            <span className="font-mono text-xl font-black text-amber-400">${total.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onProceedToCheckout();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Continuar al Checkout</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop con click para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP (md:flex) — MODAL AMPLIO Y CENTRADO FORMATO NALÚ POS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed inset-0 items-center justify-center p-4 lg:p-6 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-[1240px] h-[90vh] max-h-[860px] bg-[#111117] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Header Único Unificado Superior (Abarca todo el ancho) */}
          <div className="px-6 py-4 border-b border-white/10 bg-[#161622] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <img
                src={marca?.logo_url || '/Burguerama_logo.png'}
                alt={marca?.nombre || 'Burguerama'}
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                }}
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider font-display">
                    Tu Pedido
                  </h2>
                  {cartCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Entrega en Tacuarembó · {marca?.tiempo_espera_delivery || '35–50 min'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Badge de Abierto ahora */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Abierto ahora</span>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all ml-1"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Barra de Navegación de Pestañas Unificada (Abarca todo el ancho) */}
          <div className="px-6 py-2.5 bg-[#13131c] border-b border-white/10 shrink-0">
            <div className="flex p-1 bg-[#0b0b10] rounded-2xl border border-white/10 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('carrito');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'carrito'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Carrito {cartCount > 0 ? `(${cartCount})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('pedidos');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative ${
                  activeTab === 'pedidos'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Mis Pedidos {activeOrders.length > 0 ? `(${activeOrders.length})` : ''}</span>
                {activeOrders.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2 right-4" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Contenido Principal Desktop */}
          {activeTab === 'pedidos' ? (
            /* Vista Mis Pedidos a pantalla completa dentro del modal */
            <div className="flex-1 overflow-y-auto p-6 bg-[#0d0d14]">
              <div className="max-w-2xl mx-auto">
                <MisPedidosView
                  pedidos={activeOrders}
                  onArmarNuevoPedido={() => {
                    triggerHaptic('light');
                    setActiveTab('carrito');
                  }}
                />
              </div>
            </div>
          ) : (
            /* Vista Dual: Catálogo a la izquierda + Carrito a la derecha */
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Panel Izquierdo: Catálogo y Categorías (62%) */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#0d0d14]">
                {/* Category Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto px-5 py-3 border-b border-white/5 scrollbar-none shrink-0 bg-[#111117]/60">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        triggerHaptic('light');
                        setCategoria(cat);
                      }}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoria === cat
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{CATEGORY_EMOJIS[cat] || '🍽️'}</span>
                      <span>{cat === 'todos' ? 'Todos' : cat}</span>
                    </button>
                  ))}
                </div>

                {/* Grilla de Productos */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-5">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {/* Platos elaborados */}
                    {platosFiltrados.map((plato) => (
                      <div
                        key={plato.producto_elaborado_id}
                        onClick={() => {
                          triggerHaptic('light');
                          if (plato.es_personalizable && onOpenDishDetail) {
                            onOpenDishDetail(plato);
                          } else if (onQuickAdd) {
                            onQuickAdd(plato);
                          }
                        }}
                        className="bg-[#161622] rounded-2xl border border-white/10 p-3 flex flex-col justify-between hover:border-amber-500/40 hover:-translate-y-1 transition-all cursor-pointer group shadow-md"
                      >
                        <div>
                          <div className="relative w-full h-28 rounded-xl bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-2.5">
                            {plato.imagen_url ? (
                              <img
                                src={plato.imagen_url}
                                alt={plato.nombre}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                                }}
                              />
                            ) : (
                              <span className="text-3xl">🍔</span>
                            )}
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
                              {CATEGORY_EMOJIS[plato.categoria] || '🍔'} {plato.categoria}
                            </span>
                            {plato.es_personalizable && (
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Armar</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-white uppercase truncate font-display">
                            {plato.nombre}
                          </h4>
                          <p className="font-mono text-xs font-black text-amber-400 mt-1">
                            ${Number(plato.precio_venta).toFixed(0)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('light');
                            if (plato.es_personalizable && onOpenDishDetail) {
                              onOpenDishDetail(plato);
                            } else if (onQuickAdd) {
                              onQuickAdd(plato);
                            }
                          }}
                          className="mt-2.5 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        >
                          {plato.es_personalizable ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Armar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Bebidas / Reventa */}
                    {reventaFiltrada.map((rev) => (
                      <div
                        key={`rev_${rev.producto_reventa_id}`}
                        onClick={() => {
                          triggerHaptic('light');
                          if (onQuickAddReventa) onQuickAddReventa(rev);
                        }}
                        className="bg-[#161622] rounded-2xl border border-white/10 p-3 flex flex-col justify-between hover:border-sky-500/40 hover:-translate-y-1 transition-all cursor-pointer group shadow-md"
                      >
                        <div>
                          <div className="relative w-full h-28 rounded-xl bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-2.5">
                            {rev.imagen_url ? (
                              <img
                                src={rev.imagen_url}
                                alt={rev.nombre}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="text-3xl">🥤</span>
                            )}
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-black/80 text-sky-400 border border-sky-500/30 backdrop-blur-sm">
                              🥤 Bebidas
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white uppercase truncate font-display">
                            {rev.nombre}
                          </h4>
                          <p className="font-mono text-xs font-black text-amber-400 mt-1">
                            ${Number(rev.precio_venta).toFixed(0)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('light');
                            if (onQuickAddReventa) onQuickAddReventa(rev);
                          }}
                          className="mt-2.5 w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Carrito Desktop (38%) */}
              <div className="w-[360px] lg:w-[400px] shrink-0 flex flex-col bg-[#111117]">
                {/* Header de columna Carrito estilo Nalú */}
                <div className="px-5 py-3.5 border-b border-white/10 bg-[#161622] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src={marca?.logo_url || '/Burguerama_logo.png'}
                      alt="Burguerama"
                      className="h-5 w-auto object-contain"
                    />
                    <span className="text-xs font-black text-white uppercase tracking-wider font-display">
                      Tu Pedido
                    </span>
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                      {cartCount}
                    </span>
                  )}
                </div>

                {/* Lista de productos en carrito */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-3xl flex items-center justify-center">
                        🍔
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">
                          Tu pedido está vacío
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                          Elegí tus smash burgers y acompañamientos a la izquierda ←
                        </p>
                      </div>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#171724] border border-white/10 flex gap-3 items-center group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#0e0e14] border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
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
                            <span className="text-lg">🍔</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-black text-white uppercase truncate font-display">
                            {item.nombre}
                          </h5>
                          <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                            ${(item.precio_unitario * item.cantidad).toLocaleString()}
                          </span>
                          {item.notas && (
                            <span className="text-[10px] text-gray-400 italic block truncate">
                              "{item.notas}"
                            </span>
                          )}

                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1.5 bg-[#20202e] border border-white/10 rounded-lg px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic('light');
                                  onUpdateQuantity(item.id, -1);
                                }}
                                className="p-0.5 text-gray-400 hover:text-white"
                                aria-label="Disminuir"
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
                                aria-label="Aumentar"
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
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Sticky de Carrito Desktop: Total + Botón Confirmar */}
                {items.length > 0 && (
                  <div className="p-5 border-t border-white/10 bg-[#161622] space-y-3.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total</span>
                      <strong className="font-mono text-2xl font-black text-white">
                        ${total.toLocaleString()}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        onProceedToCheckout();
                      }}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Confirmar Pedido</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE (md:hidden) — DRAWER DERECHO IDÉNTICO AL QUE QUEDÓ BIEN
          ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed inset-y-0 right-0 max-w-full flex">
        <div
          className="w-screen max-w-md bg-[#111117] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Móvil */}
          <div className="px-5 py-4 border-b border-white/10 bg-[#161622] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white uppercase tracking-wider font-display">
                    TU PEDIDO
                  </h2>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Entrega en Tacuarembó · {marca?.tiempo_espera_delivery || '35-50 min'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Móvil: Carrito vs Mis Pedidos */}
          <div className="flex border-b border-white/10 bg-[#13131c] shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('carrito');
              }}
              className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'carrito'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Carrito {cartCount > 0 ? `(${cartCount})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('pedidos');
              }}
              className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all relative ${
                activeTab === 'pedidos'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Mis Pedidos {activeOrders.length > 0 ? `(${activeOrders.length})` : ''}</span>
              {activeOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-2 right-4" />
              )}
            </button>
          </div>

          {/* Mobile: Menú / Pedido switcher (visible dentro del tab Carrito) */}
          {activeTab === 'carrito' && (
            <div className="flex border-b border-white/10 bg-[#0f0f17] shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('menu')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  mobileTab === 'menu'
                    ? 'text-amber-400 bg-amber-500/5 border-b-2 border-amber-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🍔 Menú
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('pedido')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  mobileTab === 'pedido'
                    ? 'text-amber-400 bg-amber-500/5 border-b-2 border-amber-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🛒 Pedido{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
            </div>
          )}

          {/* View Body Móvil */}
          {activeTab === 'pedidos' ? (
            <div className="flex-1 overflow-y-auto">
              <MisPedidosView
                pedidos={activeOrders}
                onArmarNuevoPedido={() => {
                  triggerHaptic('light');
                  setActiveTab('carrito');
                }}
              />
            </div>
          ) : mobileTab === 'menu' ? (
            /* Panel de menú rápido en móvil */
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none border-b border-white/5 shrink-0">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                      categoria === cat
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {CATEGORY_EMOJIS[cat] || '🍽️'} {cat === 'todos' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
              {/* Product list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {platosFiltrados.map((plato) => (
                  <div
                    key={plato.producto_elaborado_id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#171724] border border-white/10 hover:border-amber-500/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#0f0f15] overflow-hidden shrink-0">
                      {plato.imagen_url ? (
                        <img
                          src={plato.imagen_url}
                          alt={plato.nombre}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                          }}
                        />
                      ) : (
                        <span className="text-xl flex items-center justify-center h-full">🍔</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white uppercase truncate font-display">
                        {plato.nombre}
                      </p>
                      <p className="font-mono text-xs font-black text-amber-400">
                        ${Number(plato.precio_venta).toFixed(0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        if (onQuickAdd) onQuickAdd(plato);
                        setMobileTab('pedido');
                      }}
                      className="shrink-0 w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center active:scale-95 transition-all shadow"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ))}
                {reventaFiltrada.map((rev) => (
                  <div
                    key={`rev_${rev.producto_reventa_id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#171724] border border-white/10 hover:border-sky-500/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#0f0f15] overflow-hidden shrink-0">
                      {rev.imagen_url ? (
                        <img
                          src={rev.imagen_url}
                          alt={rev.nombre}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-xl flex items-center justify-center h-full">🥤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white uppercase truncate font-display">
                        {rev.nombre}
                      </p>
                      <p className="font-mono text-xs font-black text-amber-400">
                        ${Number(rev.precio_venta).toFixed(0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        if (onQuickAddReventa) onQuickAddReventa(rev);
                        setMobileTab('pedido');
                      }}
                      className="shrink-0 w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-black flex items-center justify-center active:scale-95 transition-all shadow"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            MobileCartItemsPanel
          )}
        </div>
      </div>
    </div>
  );
};
