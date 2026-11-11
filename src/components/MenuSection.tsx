import React, { useState, useMemo } from 'react';
import { ProductoElaborado, ProductoReventa, CartItem } from '../types/food';
import { Search, Plus, Minus, Flame, Sparkles, X, ChevronRight, Info } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface MenuSectionProps {
  platos: ProductoElaborado[];
  reventa: ProductoReventa[];
  cart: CartItem[];
  onAddToCart: (item: ProductoElaborado | ProductoReventa, tipo: 'elaborado' | 'reventa') => void;
  onUpdateCartQuantity: (cartItemId: string, delta: number) => void;
  onOpenDishDetail: (dish: ProductoElaborado) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  platos,
  reventa,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenDishDetail,
  selectedCategory = 'TODAS',
  onSelectCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>(selectedCategory);

  // Sync prop changes
  React.useEffect(() => {
    if (selectedCategory) setActiveTab(selectedCategory);
  }, [selectedCategory]);

  // Extract all categories dynamically from catalog
  const categories = useMemo(() => {
    const set = new Set<string>();
    platos.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    if (reventa.length > 0) {
      set.add('BEBIDAS');
    }
    return ['TODAS', ...Array.from(set)];
  }, [platos, reventa]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    const isItemActivo = (item: any) => {
      if (!item) return false;
      if (item.activo === false || item.activo === 'false' || item.activo === 0) return false;
      if (item.is_active === false || item.is_active === 'false' || item.is_active === 0) return false;
      return true;
    };

    const matchedPlatos = platos.filter((p) => {
      const matchCat = activeTab === 'TODAS' || p.categoria?.toUpperCase() === activeTab.toUpperCase();
      const matchSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
        (p.insumos_receta && p.insumos_receta.some((i) => i.nombre.toLowerCase().includes(q)));
      return isItemActivo(p) && matchCat && matchSearch;
    });

    const matchedReventa = (activeTab === 'TODAS' || activeTab.toUpperCase() === 'BEBIDAS' || activeTab.toUpperCase() === 'FRITAS Y COCA')
      ? reventa.filter((r) => {
          const matchSearch = !q || r.nombre.toLowerCase().includes(q);
          return isItemActivo(r) && matchSearch;
        })
      : [];

    return { platos: matchedPlatos, reventa: matchedReventa };
  }, [platos, reventa, activeTab, searchTerm]);

  // Helper to find quantity in cart
  const getItemQuantityInCart = (id: number, tipo: 'elaborado' | 'reventa') => {
    const found = cart.find((item) => item.producto_id === id && item.tipo === tipo);
    return found ? { quantity: found.cantidad, cartItemId: found.id } : null;
  };

  return (
    <section id="menu-section" className="py-12 bg-[#0c0c10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 mb-3">
            <Flame className="w-3.5 h-3.5" />
            Carta Oficial Burguerama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            NUESTRO MENÚ SMASH
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Preparadas al momento en plancha de hierro fundido a máxima temperatura para lograr la costra crocante perfecta.
          </p>
        </div>

        {/* Search & Categories Navigation */}
        <div className="space-y-4 mb-10">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ingrediente (ej: cheddar, bacon)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#16161f] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Horizontal Pills with scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {categories.map((cat) => {
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab(cat);
                    onSelectCategory?.(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all select-none ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-[#20202d] border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid with System Tenant 9 Framing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.platos.map((plato) => {
            const inCart = getItemQuantityInCart(plato.producto_elaborado_id, 'elaborado');

            return (
              <div
                key={plato.producto_elaborado_id}
                onClick={() => onOpenDishDetail(plato)}
                className="group relative bg-[#15151c] rounded-3xl border border-white/10 overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Area — STRICT ENCUADRE TENANT 9 SYSTEM REPLICATION */}
                <div className="relative h-48 sm:h-52 rounded-t-3xl overflow-hidden bg-[#121216] flex items-center justify-center">
                  {plato.imagen_url ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Ambient blurred backdrop */}
                      <img
                        src={plato.imagen_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                      />
                      {/* Product image cleanly fitted */}
                      <img
                        src={plato.imagen_url}
                        alt={plato.nombre}
                        className="relative z-0 max-w-full max-h-full object-contain p-2 transition-transform duration-300 group-hover:scale-108"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Hamburguesa_transparente.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src="/Hamburguesa_transparente.png"
                        alt={plato.nombre}
                        className="max-w-full max-h-full object-contain p-4 opacity-75"
                      />
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                    {plato.categoria}
                  </span>

                  {/* Quick Detail Indicator on Hover */}
                  <div className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Info className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wide uppercase font-display group-hover:text-amber-400 transition-colors">
                      {plato.nombre}
                    </h3>
                    {plato.descripcion && (
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
                        {plato.descripcion}
                      </p>
                    )}

                    {/* Recipe Insumos / Ingredients Chips (Hidden on Mobile) */}
                    {plato.insumos_receta && plato.insumos_receta.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1.5 mt-2.5">
                        {plato.insumos_receta.slice(0, 4).map((ins) => (
                          <span
                            key={ins.insumo_id}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-300 font-medium"
                          >
                            {ins.nombre.replace("Pan Brioche Gorilla'z", 'Brioche Gorilla').replace('Carne Smash Vacuno', 'Carne Smash')}
                          </span>
                        ))}
                        {plato.insumos_receta.length > 4 && (
                          <span className="text-[10px] text-amber-400 font-bold self-center">
                            +{plato.insumos_receta.length - 4} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Action Bottom Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Precio</span>
                      <span className="font-mono text-2xl font-black text-amber-400">
                        ${Number(plato.precio_venta).toFixed(0)}
                      </span>
                    </div>

                    {/* Cart Controls */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-[#20202c] border border-amber-500/40 rounded-xl px-2 py-1 shadow-md">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onUpdateCartQuantity(inCart.cartItemId, -1);
                            }}
                            className="p-1 rounded-lg text-amber-400 hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-black text-white px-1">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onUpdateCartQuantity(inCart.cartItemId, 1);
                            }}
                            className="p-1 rounded-lg text-amber-400 hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onAddToCart(plato, 'elaborado');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reventa (Bebidas / Acompañamientos) */}
          {filteredItems.reventa.map((rev) => {
            const inCart = getItemQuantityInCart(rev.producto_reventa_id, 'reventa');

            return (
              <div
                key={rev.producto_reventa_id}
                className="group relative bg-[#15151c] rounded-3xl border border-white/10 overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative h-48 sm:h-52 rounded-t-3xl overflow-hidden bg-[#121216] flex items-center justify-center">
                  {rev.imagen_url ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src={rev.imagen_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                      />
                      <img
                        src={rev.imagen_url}
                        alt={rev.nombre}
                        className="relative z-0 max-w-full max-h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span className="text-xs uppercase font-bold">Bebida fría</span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                    {rev.categoria || 'Bebidas'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wide uppercase font-display group-hover:text-amber-400 transition-colors">
                      {rev.nombre}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Botella / Lata bien fría para acompañar tu smash burger.</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Precio</span>
                      <span className="font-mono text-2xl font-black text-amber-400">
                        ${Number(rev.precio_venta).toFixed(0)}
                      </span>
                    </div>

                    <div>
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-[#20202c] border border-amber-500/40 rounded-xl px-2 py-1 shadow-md">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onUpdateCartQuantity(inCart.cartItemId, -1);
                            }}
                            className="p-1 rounded-lg text-amber-400 hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-black text-white px-1">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onUpdateCartQuantity(inCart.cartItemId, 1);
                            }}
                            className="p-1 rounded-lg text-amber-400 hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onAddToCart(rev, 'reventa');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Fallback */}
        {filteredItems.platos.length === 0 && filteredItems.reventa.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#14141c] rounded-3xl border border-white/5 my-6">
            <span className="text-4xl">🍔</span>
            <h3 className="text-lg font-bold text-white mt-3">No encontramos resultados para "{searchTerm}"</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Prueba con otra palabra o revisa todas las categorías.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveTab('TODAS');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
            >
              Ver Carta Completa
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

