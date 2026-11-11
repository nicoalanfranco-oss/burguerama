import { ProductoElaborado, ProductoReventa, GrupoOpciones, TenantInfo, MarcaInfo } from '../types/food';
import realData from './burguerama_catalog.json';

export const TENANT_INFO: TenantInfo = {
  tenant_id: realData.tenant?.tenant_id || 9,
  nombre: realData.tenant?.nombre || 'Burguerama',
  rut: realData.tenant?.rut || '219988770014',
  direccion: realData.tenant?.direccion || 'Sarandí 312 Bis',
  telefono: realData.tenant?.telefono || '099275502',
  google_maps_url: (realData.tenant as any)?.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271',
  email: realData.tenant?.email || 'contacto@burguerama.uy',
};

export const MARCA_INFO: MarcaInfo = {
  marca_id: realData.marca?.marca_id || 8,
  nombre: realData.marca?.nombre || 'Burguerama',
  color_primario: realData.marca?.color_primario || '#f59e0b',
  dias_atencion: realData.marca?.dias_atencion || 'Martes a Domingo',
  horario_atencion: realData.marca?.horario_atencion || '19:30 a 00:30 hs',
  permite_salon: Boolean(realData.marca?.permite_salon ?? true),
  permite_delivery: realData.marca?.permite_delivery !== false,
  permite_takeaway: realData.marca?.permite_takeaway !== false,
  permite_efectivo: (realData.marca as any)?.permite_efectivo !== false,
  permite_tarjeta: (realData.marca as any)?.permite_tarjeta !== false,
  permite_transferencia: (realData.marca as any)?.permite_transferencia !== false,
  costo_delivery: realData.marca?.costo_delivery !== undefined ? Number(realData.marca.costo_delivery) : 50,
  tiempo_espera_delivery: (realData.marca as any)?.tiempo_espera_delivery || '35–50 min',
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
    costo_delivery: m.costo_delivery !== undefined ? Number(m.costo_delivery) : 50,
    tiempo_espera_delivery: m.tiempo_espera_delivery || '35–50 min',
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
  activo: Boolean(p.activo),
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
  activo: Boolean(r.activo),
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

const MEMORY_CACHE_KEY = 'burguerama_catalogo_cache_v1';
const CACHE_TTL_MS = 60 * 1000;

export function getStaticCatalog() {
  return {
    elaborados: REAL_PLATOS,
    reventa: REAL_REVENTA,
    gruposOpciones: REAL_GRUPOS,
    tenant: TENANT_INFO,
    marca: MARCA_INFO,
  };
}

export async function fetchBurgueramaCatalogo(): Promise<{
  elaborados: ProductoElaborado[];
  reventa: ProductoReventa[];
  gruposOpciones: GrupoOpciones[];
  tenant: TenantInfo;
  marca: MarcaInfo;
}> {
  // 1. Revisar caché de sesión
  try {
    const rawCache = sessionStorage.getItem(MEMORY_CACHE_KEY);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {}

  // 2. Llamada directa a la API en vivo
  try {
    const url = `${FOOD_BACKEND_URL}/api/public/catalogo?tenant_id=9&marca_id=8`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const elaboradosBD = (data.elaborados || []).filter((p: any) => p.tenant_id === 9 || p.marca_id === 8);

      const finalCatalog = {
        elaborados: elaboradosBD.length > 0
          ? elaboradosBD.map((p: any) => ({
              ...p,
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
      } catch {}

      return finalCatalog;
    }
  } catch (error) {
    console.warn('[Burguerama] Usando catálogo de respaldo local:', error);
  }

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

  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 35000;
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

export async function uploadComprobanteTransferencia(pedidoId: number, base64Image: string): Promise<string> {
  const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos/${pedidoId}/comprobante`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comprobante_base64: base64Image }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Error al subir comprobante');
  }
  const data = await res.json();
  return data.comprobante_url;
}

export async function fetchPedidoEstado(pedidoId: number): Promise<{
  estado: string;
  tiempo_estimado?: string;
  repartidor?: { nombre: string; telefono?: string };
}> {
  try {
    const res = await fetch(`${FOOD_BACKEND_URL}/api/public/pedidos/${pedidoId}/estado`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { estado: 'recibido' };
}

