import React, { useState, useEffect, useRef } from 'react';
import { CartItem, MarcaInfo } from '../types/food';
import { sendOrderToFood, uploadComprobanteTransferencia } from '../services/api';
import { launchConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  Upload,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onOrderSuccess: (orderNumber: number, whatsappUrl: string, paymentMethod?: any, pedidoId?: number) => void;
  marca?: MarcaInfo;
}

const BANCOS_TRANSFERENCIA = [
  { nombre: 'Prex', logo: '/banks/prex.svg', url: 'https://www.prexcard.com/login' },
  { nombre: 'BROU', logo: '/banks/brou.png', url: 'https://ebanking.brou.com.uy/frontend/loginStep1' },
  { nombre: 'Itaú', logo: '/banks/itau.png', url: 'https://www.itau.com.uy/inst/' },
  { nombre: 'Santander', logo: '/banks/santander.png', url: 'https://www.santander.com.uy/' },
  { nombre: 'BBVA', logo: '/banks/bbva.png', url: 'https://bbvanet.bbva.com.uy/NetApp/Home/Index' },
  { nombre: 'Scotiabank', logo: '/banks/scotiabank.png', url: 'https://www1.scotiabank.com.uy/scotiaenlinea/' },
];

export function normalizeUYPhone(raw: string): string {
  if (!raw) return '';
  let s = String(raw).trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('+598')) s = s.slice(4);
  else if (s.startsWith('598') && s.length >= 11) s = s.slice(3);
  const digits = s.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('0')) return digits;
  if (digits.length === 8 && /^9[1-9]/.test(digits)) return '0' + digits;
  return digits || String(raw).trim();
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  onClose,
  onOrderSuccess,
  marca,
}) => {
  const savedCustomer = (() => {
    try {
      const s = localStorage.getItem('burguerama_customer_profile');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  // ── Historial de Direcciones (máx. 5) ─────────────────────────────────────
  interface DireccionGuardada {
    id: string;
    alias?: string;
    direccion: string;
    apartamento?: string;
    referencia?: string;
    ultimo_uso: string;
  }

  const loadDirecciones = (): DireccionGuardada[] => {
    try {
      const raw = localStorage.getItem('burguerama_direcciones_guardadas');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const saveDireccion = (dir: Omit<DireccionGuardada, 'id' | 'ultimo_uso'>) => {
    try {
      const existing = loadDirecciones();
      const sinDupl = existing.filter(
        d => d.direccion.toLowerCase().trim() !== dir.direccion.toLowerCase().trim()
      );
      const nueva: DireccionGuardada = {
        id: Date.now().toString(36),
        ...dir,
        ultimo_uso: new Date().toISOString(),
      };
      localStorage.setItem('burguerama_direcciones_guardadas', JSON.stringify([nueva, ...sinDupl].slice(0, 5)));
    } catch {}
  };

  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'takeaway'>('delivery');
  const [nombre, setNombre] = useState(savedCustomer?.nombre || '');
  const [telefono, setTelefono] = useState(() => normalizeUYPhone(savedCustomer?.telefono || ''));
  const [direccion, setDireccion] = useState(savedCustomer?.direccion || '');
  const [apartamento, setApartamento] = useState(savedCustomer?.apartamento || '');
  const [referencia, setReferencia] = useState(savedCustomer?.referencia || '');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [pagaCon, setPagaCon] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [direccionesGuardadas, setDireccionesGuardadas] = useState<DireccionGuardada[]>(() => loadDirecciones());

  // Subida opcional de comprobante
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0);
  const costoEnvio = tipoEntrega === 'delivery' ? (marca?.costo_delivery ?? 0) : 0;
  const total = subtotal + costoEnvio;

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    const cuenta = marca?.numero_cuenta || '1472492';
    navigator.clipboard.writeText(cuenta);
    setCopiedAccount(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprobanteFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setComprobantePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErrorMsg('');

    const nombreLimpio = nombre.trim();
    const telLimpio = normalizeUYPhone(telefono);

    if (!nombreLimpio) {
      setErrorMsg('Por favor indica tu nombre.');
      return;
    }
    if (!telLimpio || telLimpio.replace(/\D/g, '').length < 8) {
      setErrorMsg('Ingresa un número de celular / WhatsApp válido (ej: 099 123 456).');
      return;
    }
    if (tipoEntrega === 'delivery' && !direccion.trim()) {
      setErrorMsg('Por favor ingresa tu dirección para el delivery en Tacuarembó.');
      return;
    }

    setEnviando(true);
    triggerHaptic('medium');

    try {
      // Guardar perfil para futuros pedidos
      try {
        localStorage.setItem(
          'burguerama_customer_profile',
          JSON.stringify({
            nombre: nombreLimpio,
            telefono: telLimpio,
            direccion: direccion.trim(),
            apartamento: apartamento.trim(),
            referencia: referencia.trim(),
          })
        );
        // Guardar en historial de direcciones si es delivery
        if (tipoEntrega === 'delivery' && direccion.trim()) {
          saveDireccion({
            direccion: direccion.trim(),
            apartamento: apartamento.trim() || undefined,
            referencia: referencia.trim() || undefined,
          });
          setDireccionesGuardadas(loadDirecciones());
        }
      } catch {}

      const resolvedAddress = `${direccion.trim()}${apartamento.trim() ? ` (${apartamento.trim()})` : ''}${referencia.trim() ? ` - Ref: ${referencia.trim()}` : ''}`;

      const payload = {
        tenant_id: 9,
        marca_id: 8,
        tipo_pedido: tipoEntrega,
        canal: tipoEntrega === 'delivery' ? 'delivery' : 'take_away',
        nombre_cliente_rapido: nombreLimpio,
        cliente_nombre: nombreLimpio,
        cliente_telefono: telLimpio,
        direccion_entrega: tipoEntrega === 'delivery' ? resolvedAddress : undefined,
        datos_delivery: {
          nombre: nombreLimpio,
          telefono: telLimpio,
          direccion: resolvedAddress,
          costo_envio: costoEnvio,
          metodo_pago: metodoPago,
          paga_con: pagaCon.trim(),
        },
        metodo_pago: metodoPago,
        paga_con: metodoPago === 'efectivo' && pagaCon.trim() ? Number(pagaCon.trim()) : undefined,
        costo_delivery: costoEnvio,
        total: total,
        notas: notas.trim() || undefined,
        items: items.map((it) => {
          const precioBaseItem = Number(it.precio_unitario);
          return {
            tipo_item: it.tipo,
            producto_elaborado_id: it.tipo === 'elaborado' ? it.producto_id : null,
            producto_reventa_id: it.tipo === 'reventa' ? it.producto_id : null,
            nombre_producto: it.nombre,
            producto_id: it.producto_id,
            tipo: it.tipo,
            nombre: it.nombre,
            cantidad: it.cantidad,
            precio_base: precioBaseItem,
            precio_unitario: precioBaseItem,
            subtotal: precioBaseItem * it.cantidad,
            notas_cocina: it.notas || undefined,
            notas: it.notas || undefined,
            modificadores: it.modificadores || [],
          };
        }),
      };

      const result = await sendOrderToFood(payload);

      if (result.success && result.numero_orden) {
        launchConfetti(1800);

        // Si subió comprobante y es transferencia, subirlo al backend
        if (comprobantePreview && result.pedido_id) {
          uploadComprobanteTransferencia(result.pedido_id, comprobantePreview).catch(console.warn);
        }

        // Armar mensaje para WhatsApp oficial Burguerama
        const lineas = items
          .map((it) => `• *${it.cantidad}x ${it.nombre}* ($${it.precio_unitario * it.cantidad})${it.notas ? `\n   ↳ _${it.notas}_` : ''}`)
          .join('\n');

        const textoWa = `🍔 *PEDIDO BURGUERAMA #${result.numero_orden}*\n` +
          `👤 *Cliente:* ${nombreLimpio}\n` +
          `📱 *Teléfono:* ${telLimpio}\n` +
          `🛵 *Modalidad:* ${tipoEntrega === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Local (Sarandí 312 Bis)'}\n` +
          (tipoEntrega === 'delivery' ? `📍 *Dirección:* ${resolvedAddress}\n` : '') +
          `💳 *Pago:* ${metodoPago.toUpperCase()}${metodoPago === 'efectivo' && pagaCon ? ` (Paga con $${pagaCon})` : ''}\n\n` +
          `*DETALLE DEL PEDIDO:*\n${lineas}\n\n` +
          (costoEnvio > 0 ? `🛵 *Envío:* $${costoEnvio}\n` : '') +
          `💰 *TOTAL:* $${total} UYU\n` +
          (notas ? `📝 *Notas:* ${notas}\n` : '') +
          `\n✅ _Pedido registrado en cocina con éxito._`;

        const burgueramaWa = ((marca as any)?.telefono || '091797279').replace(/\D/g, '');
        const waUrl = `https://wa.me/598${burgueramaWa.startsWith('0') ? burgueramaWa.slice(1) : burgueramaWa}?text=${encodeURIComponent(textoWa)}`;

        // Guardar en active orders para tracking en la web
        const nuevoRegistro = {
          pedido_id: result.pedido_id || result.numero_orden,
          numero_orden: result.numero_orden,
          tipo_pedido: tipoEntrega,
          estado: 'en_cocina',
          created_at: new Date().toISOString(),
          metodo_pago: metodoPago,
          telefono: telLimpio,
          nombre: nombreLimpio,
          total: total,
        };

        try {
          const raw = localStorage.getItem('burguerama_recent_orders');
          const list = raw ? JSON.parse(raw) : [];
          localStorage.setItem('burguerama_recent_orders', JSON.stringify([nuevoRegistro, ...list.slice(0, 5)]));
        } catch {}

        window.dispatchEvent(new CustomEvent('burguerama:order_status_updated', { detail: nuevoRegistro }));

        onOrderSuccess(result.numero_orden, waUrl, metodoPago, result.pedido_id);
      } else {
        setErrorMsg(result.error || 'No se pudo registrar el pedido. Intenta nuevamente o contacta por WhatsApp.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con la cocina central.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#13131b] rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#181824]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider font-display">
                FINALIZAR PEDIDO
              </h2>
              <p className="text-xs text-gray-400">
                {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu pedido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Delivery / Takeaway Switch */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Modalidad de Entrega
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setTipoEntrega('delivery');
                }}
                className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  tipoEntrega === 'delivery'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-[#181822] text-gray-300 border-white/10 hover:bg-[#20202d]'
                }`}
              >
                <span>🛵 Envío a Domicilio</span>
                <span className="text-[11px] font-mono opacity-80">({Number(marca?.costo_delivery) === 0 ? 'Envío Gratis' : `+$${marca?.costo_delivery ?? 0}`})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setTipoEntrega('takeaway');
                }}
                className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  tipoEntrega === 'takeaway'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-[#181822] text-gray-300 border-white/10 hover:bg-[#20202d]'
                }`}
              >
                <span>🏪 Retiro en Local</span>
                <span className="text-[11px] font-mono opacity-80">(Gratis)</span>
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Tu Nombre *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y Apellido"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b26] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Celular / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="099 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b26] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Delivery Specific Fields */}
          {tipoEntrega === 'delivery' && (
            <div className="space-y-3 p-4 rounded-2xl bg-[#181824] border border-white/10">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Dirección en Tacuarembó *
                </label>

                {/* Chips de direcciones guardadas */}
                {direccionesGuardadas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {direccionesGuardadas.map((d) => {
                      const isSelected = direccion.trim().toLowerCase() === d.direccion.toLowerCase().trim();
                      return (
                        <button
                          key={d.id}
                          type="button"
                          title={`${d.direccion}${d.apartamento ? ` (${d.apartamento})` : ''}`}
                          onClick={() => {
                            setDireccion(d.direccion);
                            setApartamento(d.apartamento || '');
                            setReferencia(d.referencia || '');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                              : 'border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-gray-200'
                          }`}
                        >
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="max-w-[160px] truncate">{d.alias || d.direccion}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle y Número (ej: 18 de Julio 245)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1f2e] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400">Apto / Casa / Timbre</label>
                  <input
                    type="text"
                    value={apartamento}
                    onChange={(e) => setApartamento(e.target.value)}
                    placeholder="Ej: Apto 2B / Casa fondo"
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f2e] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400">Punto de Referencia</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: Entre Flores y 25 de Agosto"
                    className="w-full px-3 py-2 rounded-xl bg-[#1f1f2e] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMetodoPago('efectivo');
                }}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  metodoPago === 'efectivo'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#181822] text-gray-300 border-white/10 hover:bg-[#20202d]'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMetodoPago('tarjeta');
                }}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  metodoPago === 'tarjeta'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#181822] text-gray-300 border-white/10 hover:bg-[#20202d]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>POS / Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMetodoPago('transferencia');
                }}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  metodoPago === 'transferencia'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#181822] text-gray-300 border-white/10 hover:bg-[#20202d]'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* Cash change field */}
          {metodoPago === 'efectivo' && (
            <div className="p-3.5 rounded-2xl bg-[#181824] border border-white/10 space-y-1">
              <label className="text-xs font-medium text-gray-300">¿Con cuánto pagas? (Para preparar cambio)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={pagaCon}
                  onChange={(e) => setPagaCon(e.target.value)}
                  placeholder={`Ej: ${Math.ceil(total / 100) * 100 + 500}`}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-[#1f1f2e] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Bank Transfer Details & Upload */}
          {metodoPago === 'transferencia' && (
            <div className="p-4 rounded-2xl bg-[#181824] border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Datos para Transferir ({marca?.banco_nombre || 'Prex'})
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Cuenta: <span className="font-mono font-bold text-white text-sm">{marca?.numero_cuenta || '1472492'}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-colors"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Bank logos shortcuts */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-gray-400 block mb-1.5">Abrir tu app bancaria:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {BANCOS_TRANSFERENCIA.map((b) => (
                    <a
                      key={b.nombre}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1f1f2e] hover:bg-[#27273a] border border-white/5 text-[11px] text-gray-200 transition-colors shrink-0"
                    >
                      <img src={b.logo} alt={b.nombre} className="w-4 h-4 object-contain" />
                      <span>{b.nombre}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Upload Comprobante */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Adjuntar Comprobante (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:brightness-110 cursor-pointer"
                />
                {comprobantePreview && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40">
                    <img src={comprobantePreview} alt="Comprobante" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Notas adicionales (Opcional)</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Timbre no funciona, dejar en recepción..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b26] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-[#15151f] border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal productos</span>
              <span className="font-mono text-white font-bold">${subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Envío</span>
              <span className="font-mono text-white font-bold">
                {tipoEntrega === 'delivery' ? `$${costoEnvio}` : 'Gratis'}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
              <span>Total a Pagar</span>
              <span className="font-mono text-xl font-black text-amber-400">${total} UYU</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando a Cocina...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Confirmar Pedido · ${total}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
