import { useEffect } from 'react';
import { ProductoElaborado, ProductoReventa, TenantInfo, MarcaInfo } from '../types/food';

interface StructuredDataOptions {
  tenant: TenantInfo;
  marca: MarcaInfo;
  platos: ProductoElaborado[];
  reventa: ProductoReventa[];
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://burguerama.uy';
const CURRENCY = 'UYU';

function parseHorario(horarioStr: string): { opens: string; closes: string } | null {
  const match = horarioStr.match(/(\d{1,2}:\d{2})\s*(?:a|-|–)\s*(\d{1,2}:\d{2})/i);
  if (!match) return null;
  return { opens: match[1], closes: match[2] };
}

function parseDiasAtencion(diasStr: string): string[] {
  const lower = diasStr.toLowerCase();

  const diasMap: Record<string, string> = {
    lunes: 'Monday', martes: 'Tuesday', miércoles: 'Wednesday',
    miercoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday',
    sábado: 'Saturday', sabado: 'Saturday', domingo: 'Sunday',
  };

  const rangoMatch = lower.match(/(\w+)\s+a\s+(\w+)/);
  if (rangoMatch) {
    const orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const desde = rangoMatch[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasta = rangoMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const idxDesde = orden.indexOf(desde);
    const idxHasta = orden.indexOf(hasta);
    if (idxDesde !== -1 && idxHasta !== -1) {
      return orden.slice(idxDesde, idxHasta + 1)
        .map(d => diasMap[d] || d);
    }
  }

  return lower.split(/[,y]+/)
    .map(d => d.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    .map(d => diasMap[d])
    .filter(Boolean);
}

function buildMenuItems(platos: ProductoElaborado[]) {
  return platos
    .filter(p => p.activo)
    .map(p => ({
      '@type': 'MenuItem',
      name: p.nombre,
      description: p.descripcion || undefined,
      offers: {
        '@type': 'Offer',
        price: Number(p.precio_venta).toFixed(2),
        priceCurrency: CURRENCY,
        availability: 'https://schema.org/InStock',
      },
    }));
}

export function useStructuredData({ tenant, marca, platos }: StructuredDataOptions) {
  useEffect(() => {
    const horarioParsed = parseHorario(marca.horario_atencion || '19:30 a 00:30 hs');
    const diasParsed = parseDiasAtencion(marca.dias_atencion || 'Martes a Domingo');

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Restaurant', 'FastFoodRestaurant'],
          '@id': `${SITE_URL}/#restaurant`,
          name: marca.nombre || tenant.nombre || 'Burguerama',
          description: 'Burguerama - Pioneros en smash burgers en Tacuarembó. Sarandí 312 Bis.',
          url: SITE_URL,
          telephone: tenant.telefono || '099275502',
          priceRange: '$$',
          servesCuisine: ['Smash Burgers', 'American Burgers', 'Papas Fritas', 'Fast Food Gourmet'],
          address: {
            '@type': 'PostalAddress',
            streetAddress: tenant.direccion || 'Sarandí 312 Bis',
            addressLocality: 'Tacuarembó',
            addressRegion: 'Tacuarembó',
            addressCountry: 'UY',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -31.7158226,
            longitude: -55.9782710,
          },
          openingHoursSpecification: horarioParsed
            ? [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: diasParsed.length > 0 ? diasParsed : ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  opens: horarioParsed.opens,
                  closes: horarioParsed.closes,
                },
              ]
            : undefined,
          hasMenu: {
            '@type': 'Menu',
            name: 'Menú Burguerama Smash Burgers',
            hasMenuItem: buildMenuItems(platos),
          },
        },
      ],
    };

    let scriptTag = document.getElementById('structured-data-burguerama') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data-burguerama';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById('structured-data-burguerama');
      if (el) el.remove();
    };
  }, [tenant, marca, platos]);
}

