import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, ProductoElaborado, ProductoReventa, MarcaInfo } from '../types/food';
import { PedidoActivo, MisPedidosView } from './MisPedidosView';
import {
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight,
  Clock, Sparkles, Search
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

/** Emojis y etiquetas breves por categoría para filtros y badges */
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
  'NIÑOS': '👶',
  'NIÑXS': '👶',
  'MENÚ SECRETO': '🤫',
  'POSTRES': '🍨',
  'COMBOS': '✨',
  'todos': '✨',
};

/** Título corto para pills en móvil */
const CATEGORY_SHORT_NAMES: Record<string, string> = {
  'BURGERS CLÁSICAS': 'Clásicas',
  'SPECIALS': 'Specials',
  'ALTAGAMA': 'Altagama',
  'CRUNCH CLUB': 'Crunch',
  'FRITAS Y COCA': 'Fritas',
  'BEBIDAS': 'Bebidas',
  'Bebidas': 'Bebidas',
  'NIÑOS': 'Niños',
  'NIÑXS': 'Niños',
  'MENÚ SECRETO': 'Secreto',
  'todos': 'Todos',
};

/** Fórmula ultra-robusta de producto activo */
const isItemActivo = (item: any): boolean => {
  if (!item) return false;
  if (item.activo === false || item.activo === 'false' || item.activo === 0) return false;
  if (item.is_active === false || item.is_active === 'false' || item.is_active === 0) return false;
  return true;
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
  const [categoriaDesktop, setCategoriaDesktop] = useState('todos');

  /** Mobile: Filtro rápido por categoría y búsqueda en carrusel de agregar más */
  const [mobileSearch, setMobileSearch] = useState<string>('');
  const [mobileFilterCat, setMobileFilterCat] = useState<string>('todos');

  // Sincronizar pestaña inicial al abrir
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Limpiar búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setMobileSearch('');
      setMobileFilterCat('todos');
    }
  }, [isOpen]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0),
    [items]
  );
  const cartCount = useMemo(
    () => items.reduce((acc, it) => acc + it.cantidad, 0),
    [items]
  );

  // Filtrado de platos y bebidas activos con fórmula segura
  const platosActivos = useMemo(() => {
    return (platos || []).filter(isItemActivo);
  }, [platos]);

  const reventaActiva = useMemo(() => {
    return (reventa || []).filter(isItemActivo);
  }, [reventa]);

  // Conteo de platos por categoría para los filtros de resumen móvil
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: platosActivos.length + reventaActiva.length,
    };
    platosActivos.forEach((p) => {
      const cat = p.categoria || 'BURGERS CLÁSICAS';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    if (reventaActiva.length > 0) {
      counts['BEBIDAS'] = reventaActiva.length;
    }
    return counts;
  }, [platosActivos, reventaActiva]);

  // Lista ordenada de categorías únicas
  const categorias = useMemo(() => {
    const list = Array.from(new Set(platosActivos.map(p => p.categoria || 'BURGERS CLÁSICAS')));
    if (reventaActiva.length > 0 && !list.some(c => c.toUpperCase() === 'BEBIDAS')) {
      list.push('BEBIDAS');
    }
    return ['todos', ...list];
  }, [platosActivos, reventaActiva]);

  // Desktop: productos filtrados por categoría seleccionada
  const platosFiltradosDesktop = useMemo(() => {
    if (categoriaDesktop === 'todos') return platosActivos;
    if (categoriaDesktop.toUpperCase() === 'BEBIDAS') return [];
    return platosActivos.filter(p => p.categoria?.trim().toUpperCase() === categoriaDesktop.trim().toUpperCase());
  }, [platosActivos, categoriaDesktop]);

  const reventaFiltradaDesktop = useMemo(() => {
    return (categoriaDesktop === 'todos' || categoriaDesktop.toUpperCase() === 'BEBIDAS') ? reventaActiva : [];
  }, [reventaActiva, categoriaDesktop]);

  // Mobile: lista filtrada para el carrusel de agregado rápido con búsqueda y categorías
  const mobileFilteredItems = useMemo(() => {
    const q = mobileSearch.trim().toLowerCase();

    // 1. Filtrar elaborados
    let filteredP = platosActivos;
    if (mobileFilterCat !== 'todos') {
      if (mobileFilterCat.toUpperCase() === 'BEBIDAS') {
        filteredP = [];
      } else {
        filteredP = filteredP.filter(
          p => p.categoria?.trim().toUpperCase() === mobileFilterCat.trim().toUpperCase()
        );
      }
    }
    if (q) {
      filteredP = filteredP.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
        (p.categoria && p.categoria.toLowerCase().includes(q))
      );
    }

    // 2. Filtrar reventa
    let filteredR = reventaActiva;
    if (mobileFilterCat !== 'todos' && mobileFilterCat.toUpperCase() !== 'BEBIDAS') {
      filteredR = [];
    }
    if (q) {
      filteredR = filteredR.filter(r =>
        r.nombre.toLowerCase().includes(q) ||
        (r.categoria && r.categoria.toLowerCase().includes(q))
      );
    }

    return { platos: filteredP, reventa: filteredR };
  }, [platosActivos, reventaActiva, mobileFilterCat, mobileSearch]);

  const totalMobileMatches = mobileFilteredItems.platos.length + mobileFilteredItems.reventa.length;

  // Toggle rápido de categoría móvil (tocar la activa desfiltra a 'todos')
  const handleToggleMobileCat = (cat: string) => {
    triggerHaptic('light');
    if (mobileFilterCat === cat || cat === 'todos') {
      setMobileFilterCat('todos');
    } else {
      setMobileFilterCat(cat);
    }
  };

  // Helper para vincular un ítem del carrito con su producto elaborado completo (para ver ingredientes y descripción)
  const findDishForItem = (item: CartItem): ProductoElaborado | undefined => {
    if (item.tipo !== 'elaborado') return undefined;
    return platosActivos.find(
      (p) => p.producto_elaborado_id === item.producto_id ||
             p.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop con click para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP (md:flex) — MODAL AMPLIO Y COMPLETO FORMATO NALÚ POS
          Mismas dimensiones que Nalú: 100% de alto (h-full/h-screen),
          ancho espacioso max-w-[1200px], panel de carrito compacto (300px)
          y grilla fluida auto-fill para 5 columnas de platos.
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed inset-0 items-stretch justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-[1200px] h-full h-screen max-h-screen bg-[#111117] md:border-x md:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Header Único Unificado Superior (Abarca todo el ancho) */}
          <div className="px-5 py-3 border-b border-white/10 bg-[#161622] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={marca?.logo_url || '/Burguerama_logo.png'}
                alt={marca?.nombre || 'Burguerama'}
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white uppercase tracking-wider font-display">
                    Tu Pedido
                  </h2>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-black">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Entrega en Tacuarembó · {marca?.tiempo_espera_delivery || '35–50 min'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Badge de Abierto ahora */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Abierto ahora</span>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all ml-1"
                aria-label="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Barra de Navegación de Pestañas Unificada (Abarca todo el ancho) */}
          <div className="px-5 py-2 bg-[#13131c] border-b border-white/10 shrink-0">
            <div className="flex p-1 bg-[#0b0b10] rounded-xl border border-white/10 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('carrito');
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'carrito'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
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
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative ${
                  activeTab === 'pedidos'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
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
            /* Vista Dual: Catálogo espacioso a la izquierda + Carrito compacto a la derecha (estilo Nalú) */
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Panel Izquierdo: Catálogo y Categorías (espacioso) */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#0d0d14]">
                {/* Category Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-white/5 scrollbar-none shrink-0 bg-[#111117]/60">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        triggerHaptic('light');
                        setCategoriaDesktop(cat);
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoriaDesktop === cat
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{CATEGORY_EMOJIS[cat] || '🍽️'}</span>
                      <span>{cat === 'todos' ? 'Todos' : cat}</span>
                    </button>
                  ))}
                </div>

                {/* Grilla de Productos con auto-fill idéntica a Nalú (entran 4-5 productos por fila) */}
                <div className="flex-1 overflow-y-auto p-3.5">
                  <div className="grid [grid-template-columns:repeat(auto-fill,minmax(145px,1fr))] gap-2.5">
                    {/* Platos elaborados */}
                    {platosFiltradosDesktop.map((plato) => (
                      <div
                        key={plato.producto_elaborado_id}
                        onClick={() => {
                          triggerHaptic('light');
                          if (onOpenDishDetail) {
                            onOpenDishDetail(plato);
                          }
                        }}
                        className="bg-[#161622] rounded-xl border border-white/10 p-2 flex flex-col justify-between hover:border-amber-500/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
                        title="Ver ingredientes y descripción completa"
                      >
                        <div>
                          <div className="relative w-full h-24 rounded-lg bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-1.5">
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
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
                              {plato.categoria}
                            </span>
                            {plato.es_personalizable && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Armar</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-[11px] font-black text-white uppercase truncate font-display leading-tight group-hover:text-amber-400 transition-colors">
                            {plato.nombre}
                          </h4>
                          {plato.descripcion && (
                            <p className="text-[9.5px] text-gray-400 line-clamp-1 mt-0.5 leading-snug">
                              {plato.descripcion}
                            </p>
                          )}
                          <p className="font-mono text-xs font-black text-amber-400 mt-0.5">
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
                          className="mt-2 w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        >
                          {plato.es_personalizable ? (
                            <>
                              <Sparkles className="w-3 h-3 stroke-[2.5]" />
                              <span>Armar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Bebidas / Reventa */}
                    {reventaFiltradaDesktop.map((rev) => (
                      <div
                        key={`rev_${rev.producto_reventa_id}`}
                        onClick={() => {
                          triggerHaptic('light');
                          if (onQuickAddReventa) onQuickAddReventa(rev);
                        }}
                        className="bg-[#161622] rounded-xl border border-white/10 p-2 flex flex-col justify-between hover:border-sky-500/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
                      >
                        <div>
                          <div className="relative w-full h-24 rounded-lg bg-[#0f0f15] overflow-hidden flex items-center justify-center mb-1.5">
                            {rev.imagen_url ? (
                              <img
                                src={rev.imagen_url}
                                alt={rev.nombre}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="text-2xl">🥤</span>
                            )}
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/80 text-sky-400 border border-sky-500/30 backdrop-blur-sm">
                              🥤 Bebidas
                            </span>
                          </div>
                          <h4 className="text-[11px] font-black text-white uppercase truncate font-display leading-tight">
                            {rev.nombre}
                          </h4>
                          <p className="font-mono text-xs font-black text-amber-400 mt-0.5">
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
                          className="mt-2 w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Carrito Desktop compacto (300px, idéntico a Nalú) */}
              <div className="w-[300px] shrink-0 flex flex-col bg-[#111117]">
                {/* Header de columna Carrito estilo Nalú */}
                <div className="px-4 py-3 border-b border-white/10 bg-[#161622] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src={marca?.logo_url || '/Burguerama_logo.png'}
                      alt="Burguerama"
                      className="h-4 w-auto object-contain"
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
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-2xl flex items-center justify-center">
                        🍔
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
                          Tu pedido está vacío
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1 max-w-[180px]">
                          Elegí tus smash burgers y acompañamientos del menú ←
                        </p>
                      </div>
                    </div>
                  ) : (
                    items.map((item) => {
                      const relatedDish = findDishForItem(item);
                      return (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-[#171724] border border-white/10 flex gap-2.5 items-center group transition-colors hover:border-amber-500/30"
                        >
                          {/* Thumbnail clickeable para abrir ingredientes */}
                          <div
                            onClick={() => {
                              if (relatedDish && onOpenDishDetail) {
                                triggerHaptic('light');
                                onOpenDishDetail(relatedDish);
                              }
                            }}
                            className={`w-10 h-10 rounded-lg bg-[#0e0e14] border border-white/5 overflow-hidden shrink-0 flex items-center justify-center ${relatedDish ? 'cursor-pointer hover:border-amber-500/50 hover:scale-105 transition-all' : ''}`}
                            title={relatedDish ? 'Ver ingredientes y descripción completa' : undefined}
                          >
                            {item.imagen_url ? (
                              <img
                                src={item.imagen_url}
                                alt={item.nombre}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                                }}
                              />
                            ) : (
                              <span className="text-base">🍔</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Título y notas clickeables */}
                            <div
                              onClick={() => {
                                if (relatedDish && onOpenDishDetail) {
                                  triggerHaptic('light');
                                  onOpenDishDetail(relatedDish);
                                }
                              }}
                              className={relatedDish ? 'cursor-pointer' : ''}
                              title={relatedDish ? 'Ver ingredientes y descripción completa' : undefined}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-[11px] font-black text-white uppercase truncate font-display group-hover:text-amber-400 transition-colors">
                                  {item.nombre}
                                </h5>
                                {relatedDish && (
                                  <span className="text-[9px] text-amber-400/80 font-bold shrink-0">
                                    Receta ↗
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                                ${(item.precio_unitario * item.cantidad).toLocaleString()}
                              </span>
                              {item.notas && (
                                <span className="text-[9px] text-gray-400 italic block truncate">
                                  "{item.notas}"
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1 bg-[#20202e] border border-white/10 rounded-md px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic('light');
                                    onUpdateQuantity(item.id, -1);
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-white"
                                  aria-label="Disminuir"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="font-mono text-[11px] font-bold text-white px-0.5">
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
                                  <Plus className="w-2.5 h-2.5" />
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
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Sticky de Carrito Desktop: Total + Botón Confirmar */}
                {items.length > 0 && (
                  <div className="p-3.5 border-t border-white/10 bg-[#161622] space-y-2.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                      <strong className="font-mono text-xl font-black text-white">
                        ${total.toLocaleString()}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        onProceedToCheckout();
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Confirmar Pedido</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE (md:hidden) — EXACTAMENTE IGUAL A NALÚ
          + Buscador por nombre y Filtros rápidos de resumen por categoría
          ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed inset-0 flex flex-col bg-[#111117] overflow-hidden">
        {/* Header Móvil estilo Nalú (Logo + Tu Pedido + Abierto + Cerrar X) */}
        <div className="px-4 py-3 bg-[#161622] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={marca?.logo_url || '/Burguerama_logo.png'}
              alt={marca?.nombre || 'Burguerama'}
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">
                  Tu Pedido
                </h2>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Entrega en Tacuarembó · {marca?.tiempo_espera_delivery || '35–50 min'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Abierto ahora</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación Móvil Idénticas a Nalú (SOLO Carrito y Mis Pedidos) */}
        <div className="px-4 py-2.5 bg-[#13131c] border-b border-white/10 shrink-0">
          <div className="flex p-1 bg-[#0b0b10] rounded-xl border border-white/10 gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('carrito');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'carrito'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Carrito {cartCount > 0 ? `(${cartCount})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('pedidos');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative ${
                activeTab === 'pedidos'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mis Pedidos {activeOrders.length > 0 ? `(${activeOrders.length})` : ''}</span>
              {activeOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1.5 right-3" />
              )}
            </button>
          </div>
        </div>

        {/* Cuerpo Scrollable Móvil */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {activeTab === 'pedidos' ? (
            /* Vista Mis Pedidos en móvil */
            <div className="flex-1 p-4">
              <MisPedidosView
                pedidos={activeOrders}
                onArmarNuevoPedido={() => {
                  triggerHaptic('light');
                  setActiveTab('carrito');
                }}
              />
            </div>
          ) : (
            /* Vista Carrito idéntica a Nalú */
            <div className="p-4 space-y-4 flex-1">
              {/* 1. Lista de productos o Empty State idéntico a Nalú */}
              {items.length === 0 ? (
                <div className="py-6 px-4 text-center space-y-2 bg-[#161622]/40 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                      Tu pedido está vacío
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Elegí tus platos favoritos de abajo ↓
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

                  <div className="space-y-2">
                    {items.map((item) => {
                      const relatedDish = findDishForItem(item);
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-[#171724] border border-white/10 flex gap-3 items-center group transition-colors hover:border-amber-500/30"
                        >
                          {/* Thumbnail clickeable para abrir ingredientes */}
                          <div
                            onClick={() => {
                              if (relatedDish && onOpenDishDetail) {
                                triggerHaptic('light');
                                onOpenDishDetail(relatedDish);
                              }
                            }}
                            className={`w-12 h-12 rounded-xl bg-[#0e0e14] border border-white/5 overflow-hidden shrink-0 flex items-center justify-center ${relatedDish ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                            title={relatedDish ? 'Ver ingredientes y descripción completa' : undefined}
                          >
                            {item.imagen_url ? (
                              <img
                                src={item.imagen_url}
                                alt={item.nombre}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                                }}
                              />
                            ) : (
                              <span className="text-xl">🍔</span>
                            )}
                          </div>

                          {/* Details clickeables */}
                          <div className="flex-1 min-w-0">
                            <div
                              onClick={() => {
                                if (relatedDish && onOpenDishDetail) {
                                  triggerHaptic('light');
                                  onOpenDishDetail(relatedDish);
                                }
                              }}
                              className={relatedDish ? 'cursor-pointer' : ''}
                              title={relatedDish ? 'Ver ingredientes y descripción completa' : undefined}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-black text-white uppercase truncate font-display group-hover:text-amber-400 transition-colors">
                                  {item.nombre}
                                </h4>
                                {relatedDish && (
                                  <span className="text-[10px] text-amber-400/90 font-bold shrink-0">
                                    Ver receta ↗
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                                ${(item.precio_unitario * item.cantidad).toLocaleString()}
                              </span>
                              {item.notas && (
                                <span className="text-[10px] text-gray-400 italic block truncate">
                                  "{item.notas}"
                                </span>
                              )}
                            </div>

                            {/* Qty Controls con aislamiento de click */}
                            <div className="flex items-center gap-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Sección "¿Querés agregar algo más?" Idéntica a Nalú + Filtros y Buscador */}
              <div className="pt-2 space-y-2.5">
                {/* Header de la sección */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ¿Querés agregar algo más?
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">Deslizá →</span>
                </div>

                {/* 🔍 Buscador rápido por nombre exclusivo móvil */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="Buscar burger, papas, bebida..."
                    className="w-full bg-[#161622] border border-white/10 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  {mobileSearch && (
                    <button
                      type="button"
                      onClick={() => setMobileSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 🏷️ Pequeños filtros de resumen por título para filtrar o desfiltrar rápido */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {categorias.map((cat) => {
                    const isSelected = mobileFilterCat === cat;
                    const count = categoryCounts[cat] || 0;
                    const shortName = CATEGORY_SHORT_NAMES[cat] || cat;
                    const emoji = CATEGORY_EMOJIS[cat] || '🍽️';

                    return (
                      <button
                        key={`m_filter_${cat}`}
                        type="button"
                        onClick={() => handleToggleMobileCat(cat)}
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 shadow-sm shadow-amber-500/20'
                            : 'bg-[#161622] text-gray-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs">{emoji}</span>
                        <span>{shortName}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded-full font-mono font-black ${
                            isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Carrusel Horizontal de Productos (Idéntico formato visual a Nalú) */}
                {totalMobileMatches === 0 ? (
                  <div className="py-6 text-center space-y-2 bg-[#161622]/40 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 font-medium">
                      No encontramos productos para "{mobileSearch}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSearch('');
                        setMobileFilterCat('todos');
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold"
                    >
                      Ver todos
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
                    {/* Burgers elaboradas */}
                    {mobileFilteredItems.platos.map((plato) => (
                      <div
                        key={`upsell_${plato.producto_elaborado_id}`}
                        className="w-36 shrink-0 bg-[#161622] rounded-2xl border border-white/10 p-2.5 flex flex-col justify-between snap-start hover:border-amber-500/40 transition-all shadow-md group"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            triggerHaptic('light');
                            if (onOpenDishDetail) {
                              onOpenDishDetail(plato);
                            }
                          }}
                          title="Ver ingredientes y descripción completa"
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
                            {plato.es_personalizable && (
                              <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[7px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                ✨ Armar
                              </span>
                            )}
                          </div>
                          <h4 className="text-[11px] font-black text-white uppercase truncate font-display group-hover:text-amber-400 transition-colors">
                            {plato.nombre}
                          </h4>
                          <span className="font-mono text-xs font-black text-amber-400 block mt-0.5">
                            ${Number(plato.precio_venta).toFixed(0)}
                          </span>
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
                          className="mt-2 w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        >
                          {plato.es_personalizable ? (
                            <>
                              <Sparkles className="w-3 h-3 stroke-[2.5]" />
                              <span>Armar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Bebidas */}
                    {mobileFilteredItems.reventa.map((rev) => (
                      <div
                        key={`upsell_rev_${rev.producto_reventa_id}`}
                        className="w-32 shrink-0 bg-[#161622] rounded-2xl border border-white/10 p-2.5 flex flex-col justify-between snap-start hover:border-sky-500/40 transition-all shadow-md group"
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
                )}
              </div>

              {/* 3. Resumen del Pedido Móvil */}
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
                </div>
              )}

              {/* Mensaje de notas/instrucciones especiales idéntico a Nalú (visible con o sin items) */}
              <p className="text-center text-[11px] text-gray-400 italic py-2 px-4 leading-relaxed">
                Podrás agregar notas o instrucciones especiales en el siguiente paso.
              </p>

              {/* Espaciador para no tapar contenido con el botón sticky */}
              <div style={{ height: items.length > 0 ? 100 : 24 }} />
            </div>
          )}
        </div>

        {/* Footer Fijo Checkout Móvil (solo si hay items y está en Carrito) */}
        {activeTab === 'carrito' && items.length > 0 && (
          <div className="p-3.5 border-t border-white/10 bg-[#161622] space-y-2 shrink-0">
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
    </div>
  );
};
