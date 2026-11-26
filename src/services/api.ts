import { ProductoElaborado, ProductoReventa, GrupoOpciones, TenantInfo, MarcaInfo } from '../types/food';
import realData from './burguerama_catalog.json';

export const TENANT_INFO: TenantInfo = {
  tenant_id: realData.tenant?.tenant_id || 9,
  nombre: realData.tenant?.nombre || 'Burguerama',
  rut: realData.tenant?.rut || '219988770014',
  direccion: realData.tenant?.direccion || 'Sarandí 312 Bis',
  telefono: '091797279',
  google_maps_url: (realData.tenant as any)?.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271',
  email: realData.tenant?.email || 'contacto@burguerama.uy',
};

export const MARCA_INFO: MarcaInfo = {
  marca_id: realData.marca?.marca_id || 8,
  nombre: realData.marca?.nombre || 'Burguerama',
  color_primario: realData.marca?.color_primario || '#f59e0b',
  dias_atencion: realData.marca?.dias_atencion || 'Martes a Domingo',
  horario_atencion: 'Desde las 20:00 hs',
  permite_salon: Boolean(realData.marca?.permite_salon ?? true),
  permite_delivery: realData.marca?.permite_delivery !== false,
  permite_takeaway: realData.marca?.permite_takeaway !== false,
  permite_efectivo: (realData.marca as any)?.permite_efectivo !== false,
  permite_tarjeta: (realData.marca as any)?.permite_tarjeta !== false,
  permite_transferencia: (realData.marca as any)?.permite_transferencia !== false,
  costo_delivery: realData.marca?.costo_delivery !== undefined ? Number(realData.marca.costo_delivery) : 0,
  tiempo_espera_delivery: (realData.marca as any)?.tiempo_espera_delivery || '25–30 min',
  logo_url: realData.marca?.logo_url || '/Burguerama_logo.png',
  numero_cuenta: realData.marca?.numero_cuenta || '1472492',
  banco_nombre: realData.marca?.banco_nombre || 'Prex',
  banco_titular: realData.marca?.titular_cuenta || undefined,
};

// Imagen fallback para platos sin foto
const FALLBACK_PLATO_IMG = '/Hamburguesa_transparente.png';

function parseTenantFromBackend(t: any): TenantInfo {
  if (!t) return TENANT_INFO;
  return {
    tenant_id: Number(t.tenant_id) || TENANT_INFO.tenant_id,
    nombre: t.nombre || TENANT_INFO.nombre,
    rut: t.rut || TENANT_INFO.rut,
    direccion: t.direccion || TENANT_INFO.direccion,
    telefono: t.telefono || TENANT_INFO.telefono,
    google_maps_url: t.google_maps_url || TENANT_INFO.google_maps_url,
    email: t.email || TENANT_INFO.email,
  };
}

function parseMarcaFromBackend(m: any, estadoAtencion?: any): MarcaInfo {
  if (!m) return MARCA_INFO;
  return {
    marca_id: Number(m.marca_id) || MARCA_INFO.marca_id,
    nombre: m.nombre || MARCA_INFO.nombre,
    color_primario: m.color_primario || MARCA_INFO.color_primario,
    dias_atencion: m.dias_atencion || MARCA_INFO.dias_atencion,
    horario_atencion: m.horario_atencion || MARCA_INFO.horario_atencion,
    permite_salon: Boolean(m.permite_salon ?? true),
    permite_delivery: m.permite_delivery !== false,
    permite_takeaway: m.permite_takeaway !== false,
    permite_efectivo: m.permite_efectivo !== false,
    permite_tarjeta: m.permite_tarjeta !== false,
    permite_transferencia: m.permite_transferencia !== false,
    costo_delivery: m.costo_delivery !== undefined ? Number(m.costo_delivery) : 0,
    tiempo_espera_delivery: m.tiempo_espera_delivery || '25–30 min',
    logo_url: m.logo_url || MARCA_INFO.logo_url,
    numero_cuenta: m.numero_cuenta || MARCA_INFO.numero_cuenta,
    banco_nombre: m.banco_nombre || MARCA_INFO.banco_nombre,
    banco_titular: m.titular_cuenta || m.banco_titular || MARCA_INFO.banco_titular,
    estado_atencion: estadoAtencion || m.estado_atencion,
  };
}

export const REAL_PLATOS: ProductoElaborado[] = ((realData.elaborados || []) as any[]).map(p => ({
  producto_elaborado_id: p.producto_elaborado_id,
  tenant_id: p.tenant_id || 9,
  marca_id: p.marca_id || 8,
  nombre: p.nombre,
  categoria: p.categoria || 'BURGERS CLÁSICAS',
  descripcion: p.descripcion,
  precio_venta: Number(p.precio_venta),
  es_personalizable: Boolean(p.es_personalizable),
  formato_venta: 'unidad',
  imagen_url: p.imagen_url || FALLBACK_PLATO_IMG,
  activo: p.activo !== false && (p as any).is_active !== false,
  insumos_receta: (p.insumos_receta || []).map((i: any) => ({
    insumo_id: Number(i.insumo_id),
    nombre: i.nombre,
    cantidad: Number(i.cantidad ?? i.cantidad_receta ?? 0),
    unidad: i.unidad || 'kg',
    costo_unitario: Number(i.costo_unitario || 0),
    imagen_url: i.imagen_url || null,
  })),
}));

export const REAL_REVENTA: ProductoReventa[] = ((realData.reventa || []) as any[]).map(r => ({
  producto_reventa_id: r.producto_reventa_id,
  tenant_id: r.tenant_id || 9,
  marca_id: r.marca_id || 8,
  nombre: r.nombre,
  categoria: r.categoria || 'Bebidas',
  descripcion: r.descripcion,
  precio_venta: Number(r.precio_venta),
  stock_actual: r.stock_actual || 24,
  imagen_url: r.imagen_url || null,
  activo: r.activo !== false && (r as any).is_active !== false,
}));

export const REAL_GRUPOS: GrupoOpciones[] = ((realData.gruposOpciones || []) as any[]).map(g => ({
  grupo_id: g.grupo_id,
  producto_elaborado_id: g.producto_elaborado_id,
  nombre: g.nombre,
  paso_orden: g.paso_orden,
  min_opciones: g.min_opciones,
  max_opciones: g.max_opciones,
  opciones: (g.opciones || []).map((o: any) => ({
    opcion_id: o.opcion_id,
    nombre: o.nombre,
    precio_extra: Number(o.precio_extra || 0),
    imagen_url: o.imagen_url || null,
  })),
}));

// Base URL del backend de Food
export const FOOD_BACKEND_URL = (() => {
  try {
    const host = window.location.hostname;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return '';
    }
  } catch {}
  return 'https://food--studio-4748759464-52942.us-east4.hosted.app';
})();

const LOCAL_STORAGE_CATALOG_KEY = 'burguerama_cached_catalog_v2';
const MEMORY_CACHE_KEY = 'burguerama_catalogo_cache_v1';
const CACHE_TTL_MS = 15 * 1000;

export function getInitialCatalog() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.elaborados && parsed.elaborados.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return getStaticCatalog();
}

export function getStaticCatalog() {
  return {
    elaborados: REAL_PLATOS,
    reventa: REAL_REVENTA,
    gruposOpciones: REAL_GRUPOS,
    tenant: TENANT_INFO,
    marca: MARCA_INFO,
  };
}

export async function fetchBurgueramaCatalogo(forceRefresh = false): Promise<{
  elaborados: ProductoElaborado[];
  reventa: ProductoReventa[];
  gruposOpciones: GrupoOpciones[];
  tenant: TenantInfo;
  marca: MarcaInfo;
}> {
  // 1. Revisar caché de memoria si no se forzó refresh
  if (!forceRefresh) {
    try {
      const rawCache = sessionStorage.getItem(MEMORY_CACHE_KEY);
      if (rawCache) {
        const parsed = JSON.parse(rawCache);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch {}
  }

  // 2. Llamada directa a la API en vivo con timestamp anti-caché
  try {
    const timestamp = Date.now();
    const url = `${FOOD_BACKEND_URL}/api/public/catalogo?tenant_id=9&marca_id=8&_t=${timestamp}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const elaboradosBD = (data.elaborados || []).filter((p: any) => p.tenant_id === 9 || p.marca_id === 8);

      const finalCatalog = {
        elaborados: elaboradosBD.length > 0
          ? elaboradosBD.map((p: any) => ({
              ...p,
              activo: p.activo !== false && p.is_active !== false,
              precio_venta: Number(p.precio_venta),
              imagen_url: p.imagen_url || FALLBACK_PLATO_IMG,
              insumos_receta: (p.insumos_receta || []).map((i: any) => ({
                insumo_id: Number(i.insumo_id),
                nombre: i.nombre,
                cantidad: Number(i.cantidad ?? i.cantidad_receta ?? 0),
                unidad: i.unidad || 'kg',
                costo_unitario: Number(i.costo_unitario || 0),
                imagen_url: i.imagen_url || null,
              })),
            }))
          : REAL_PLATOS,
        reventa: (data.reventa && data.reventa.length > 0)
          ? data.reventa.map((r: any) => ({
              ...r,
              activo: r.activo !== false && r.is_active !== false,
              precio_venta: Number(r.precio_venta),
              imagen_url: r.imagen_url || null,
            }))
          : REAL_REVENTA,
        gruposOpciones: (data.gruposOpciones && data.gruposOpciones.length > 0)
          ? (data.gruposOpciones as any[]).map(g => ({
              grupo_id: g.grupo_id,
              producto_elaborado_id: g.producto_elaborado_id,
              nombre: g.nombre,
              paso_orden: g.paso_orden,
              min_opciones: g.min_opciones,
              max_opciones: g.max_opciones,
              opciones: (g.opciones || []).map((o: any) => ({
                opcion_id: o.opcion_id,
                nombre: o.nombre,
                precio_extra: Number(o.precio_extra || 0),
                imagen_url: o.imagen_url || null,
              })),
            }))
          : REAL_GRUPOS,
        tenant: parseTenantFromBackend(data.tenant),
        marca: parseMarcaFromBackend(data.marca, data.estado_atencion),
      };

      try {
        sessionStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: finalCatalog }));
        localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(finalCatalog));
      } catch {}

      return finalCatalog;
    }
  } catch (error) {
    console.warn('No se pudo conectar al backend en vivo, intentando recuperar último catálogo guardado:', error);
  }

  // 3. Fallback inteligente
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.elaborados && parsed.elaborados.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // 4. Último fallback estático
  return getStaticCatalog();
}

export async function sendOrderToFood(orderPayload: any): Promise<{
  success: boolean;
  numero_orden?: number;
  pedido_id?: number;
  error?: string;
  error_ref?: string;
}> {
  const payloadConCocina = {
    ...orderPayload,
    tenant_id: 9,
    marca_id: 8,
    enviar_a_cocina: true,
  };

  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 25000;
  let lastErrorDetail = '';
  let lastErrorRef = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadConCocina),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          numero_orden: data.numero_orden,
          pedido_id: data.pedido_id,
        };
      } else {
        const errJson = await res.json().catch(() => null);
        const errText = !errJson ? await res.text().catch(() => '') : '';
        lastErrorDetail = errJson?.error || errJson?.mensaje_ayuda || errText || `Error HTTP ${res.status}`;
        lastErrorRef = errJson?.error_ref || '';
        if (res.status >= 400 && res.status < 500) break;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError';
      lastErrorDetail = isTimeout ? 'Tiempo de espera agotado' : (err?.message || 'Error de conexión');
    }

    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }

  const finalErrorRef = lastErrorRef || ('BURG-' + Math.random().toString(36).substring(2, 7).toUpperCase());
  return {
    success: false,
    error: lastErrorDetail || 'Error al conectar con la cocina central',
    error_ref: finalErrorRef,
  };
}

export interface PedidoDetalle {
  pedido_id: number;
  numero_orden: number;
  tipo_pedido: string;
  estado: string;
  created_at: string;
  enviado_cocina_at?: string | null;
  listo_cocina_at?: string | null;
  metodo_pago: string;
  total: number;
  costo_delivery?: number;
  direccion?: string;
  telefono?: string;
  nombre?: string;
  comprobante_url?: string | null;
  items?: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
    modificadores?: Array<{ nombre: string; precio_extra?: number }>;
  }>;
}

export async function uploadComprobanteTransferencia(
  pedidoId: number,
  fileOrBase64: File | string
): Promise<{ success: boolean; comprobante_url?: string; error?: string }> {
  try {
    let base64: string;
    let filename = 'comprobante.jpg';
    let mimeType = 'image/jpeg';

    if (typeof fileOrBase64 === 'string') {
      base64 = fileOrBase64;
    } else {
      // Comprimir imagen antes de enviar (máx 1600px, 82% calidad)
      const { procesarComprobante } = await import('../utils/imageCompressor');
      const processed = await procesarComprobante(fileOrBase64);
      filename = processed.filename;
      mimeType = processed.mimeType;
      base64 = processed.base64;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos/${pedidoId}/comprobante`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        comprobante_base64: base64,
        filename,
        mimeType,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error subiendo comprobante' };
    }

    const data = await res.json();
    return { success: true, comprobante_url: data.comprobante_url };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'La subida tardó demasiado. Intentá con una foto más chica.' };
    }
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

export async function fetchPedidoDetalle(
  pedidoId: number,
  email?: string,
  telefono?: string
): Promise<PedidoDetalle | null> {
  try {
    const params = new URLSearchParams({
      pedido_id: String(pedidoId),
      tenant_id: '9',
    });
    if (email) params.set('email', email);
    if (telefono) params.set('telefono', telefono);

    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedido-detalle?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Geocodificación de Direcciones ────────────────────────────────────────────

export interface AddressSuggestion {
  display_name: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  latitud: number;
  longitud: number;
  google_maps_url: string;
}

// Clave de Google Maps Platform (Places New & Geocoding oficial)
const GOOGLE_MAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

export async function searchAddress(query: string, tenantId = 9, ciudadBias = 'Tacuarembó'): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  const cleanQ = query.trim();

  // Limpieza inteligente de prefijos pegados (Av.Torres -> Av. Torres)
  const normalizada = cleanQ.replace(/\b([Aa]v|[Bb]var|[Gg]ral|[Cc]nel)\.([^\s])/g, '$1. $2').replace(/\s{2,}/g, ' ');
  const sinParentesis = normalizada.replace(/\(.*?\)/g, '').trim();

  const trailingMatch = sinParentesis.match(/^(.*?)\s+(\d{1,5}(?:\s*(?:bis|a|b|c))?)$/i);
  const streetOnly = trailingMatch ? trailingMatch[1].trim() : '';
  const userDoorNumber = trailingMatch ? trailingMatch[2].trim() : '';

  // 1. Intentar endpoint backend de Food (conectado a Google Maps Platform)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const params = new URLSearchParams({
      q: sinParentesis || cleanQ,
      tenant_id: String(tenantId),
      ciudad: ciudadBias,
    });

    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/geocode?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: AddressSuggestion) => {
          let dirFinal = item.direccion;
          if (userDoorNumber && !new RegExp(`\\b${userDoorNumber}$`, 'i').test(dirFinal)) {
            dirFinal = `${dirFinal} ${userDoorNumber}`;
          }
          const mapsUrl = (item.latitud && item.longitud)
            ? `https://www.google.com/maps/search/?api=1&query=${item.latitud},${item.longitud}`
            : (item.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dirFinal}, ${item.ciudad || ciudadBias}, Uruguay`)}`);

          return {
            ...item,
            direccion: dirFinal,
            display_name: item.display_name || `${dirFinal}, ${item.ciudad || ciudadBias}, ${item.pais || 'Uruguay'}`,
            google_maps_url: mapsUrl,
          };
        });
      }
    }
  } catch {
    // Continuar a fallback directo de Google Geocoding
  }

  // 2. Fallback directo a Google Geocoding API (cliente web con CORS oficial)
  if (GOOGLE_MAPS_KEY) {
    try {
      const gController = new AbortController();
      const gTimeout = setTimeout(() => gController.abort(), 2500);

      const queryParaGoogle = `${sinParentesis || cleanQ}, ${ciudadBias}, Uruguay`;
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(queryParaGoogle)}&key=${GOOGLE_MAPS_KEY}&region=uy&language=es`;
      const gRes = await fetch(gUrl, { signal: gController.signal });
      clearTimeout(gTimeout);

      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
          const list: AddressSuggestion[] = [];
          for (const r of gData.results) {
            const lat = r.geometry?.location?.lat;
            const lng = r.geometry?.location?.lng;
            if (lat == null || lng == null) continue;

            const components = r.address_components || [];
            const getComp = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || '';

            const streetNumber = getComp('street_number') || userDoorNumber;
            const route = getComp('route');
            const direccion = [route, streetNumber].filter(Boolean).join(' ') || r.formatted_address.split(',')[0];
            const ciudad = getComp('locality') || getComp('sublocality') || ciudadBias;
            const departamento = getComp('administrative_area_level_1') || ciudadBias;
            const pais = getComp('country') || 'Uruguay';

            list.push({
              display_name: r.formatted_address,
              direccion,
              ciudad,
              departamento,
              pais,
              latitud: lat,
              longitud: lng,
              google_maps_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            });
          }
          if (list.length > 0) return list.slice(0, 5);
        }
      }
    } catch (gErr) {
      console.warn('Error en fallback directo Google Geocoding:', gErr);
    }
  }

  // 3. Fallback resiliente con Photon (OpenStreetMap)
  try {
    const queriesToTry = [cleanQ];
    if (streetOnly && streetOnly !== cleanQ && streetOnly.length >= 2) {
      queriesToTry.push(streetOnly);
    }

    const allFeatures: any[] = [];
    for (const q of queriesToTry) {
      try {
        const pController = new AbortController();
        const pTimeout = setTimeout(() => pController.abort(), 2000);

        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=-31.71&lon=-55.98&limit=6`;
        const pRes = await fetch(photonUrl, { signal: pController.signal });
        clearTimeout(pTimeout);

        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.features && pData.features.length > 0) {
            allFeatures.push(...pData.features);
          }
        }
      } catch {}
    }

    if (allFeatures.length > 0) {
      const list: AddressSuggestion[] = [];
      const seen = new Set<string>();

      for (const f of allFeatures) {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const lon = coords[0];
        const lat = coords[1];
        if (!lat || !lon) continue;

        const isUy = !p.countrycode || p.countrycode.toUpperCase() === 'UY';
        const isCity = [p.city, p.town, p.state, p.county, p.district]
          .filter(Boolean)
          .some((s: string) => s.toLowerCase().includes(ciudadBias.toLowerCase()));

        if (!isUy && !isCity) continue;

        const streetName = p.street || p.name || streetOnly || cleanQ;
        const finalDoorNumber = p.housenumber || userDoorNumber;
        let direccion = streetName;
        if (finalDoorNumber) {
          const endsWithNum = new RegExp(`\\b${finalDoorNumber}$`, 'i').test(streetName);
          if (!endsWithNum) direccion = `${streetName} ${finalDoorNumber}`;
        }

        const itemCity = p.city || p.town || ciudadBias;
        const itemState = p.state || ciudadBias;
        const itemCountry = p.country || 'Uruguay';

        const key = `${direccion}|${itemCity}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        list.push({
          display_name: [direccion, itemCity, itemState, itemCountry].filter(Boolean).join(', '),
          direccion,
          ciudad: itemCity,
          departamento: itemState,
          pais: itemCountry,
          latitud: lat,
          longitud: lon,
          google_maps_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
        });
      }

      if (list.length > 0) return list.slice(0, 5);
    }
  } catch (err) {
    console.warn('Error en fallback de búsqueda de dirección OSM:', err);
  }

  return [];
}

export async function fetchPedidoEstado(
  arg: number | { email?: string; telefono?: string; tenantId?: number }
): Promise<{
  estado: string;
  tiempo_estimado?: string;
  repartidor?: { nombre: string; telefono?: string };
  pedido?: any;
  pedidos?: any[];
}> {
  try {
    if (typeof arg === 'number') {
      const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos/${arg}/estado`);
      if (res.ok) {
        return await res.json();
      }
    } else {
      const params = new URLSearchParams({
        tenant_id: String(arg.tenantId || 9),
      });
      if (arg.email) params.set('email', arg.email.trim());
      if (arg.telefono) params.set('telefono', arg.telefono.trim());

      const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedido-estado?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}
  return { estado: 'recibido' };
}

