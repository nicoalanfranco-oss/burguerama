import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/Cd4jW4N6c2BNTujSA';

/**
 * Coordenadas oficiales de la ruta por las calles reales de Tacuarembó:
 * Desde calle General Fructuoso Rivera -> Artigas -> General Flores -> Sarandí -> Burguerama (Sarandí 312 Bis).
 */
const ROUTE_COORDS: [number, number][] = [
  [-31.711843, -55.981745], // Punto de partida (Rivera)
  [-31.711245, -55.981099], // Giro hacia Artigas
  [-31.711865, -55.980334],
  [-31.712472, -55.979567],
  [-31.713085, -55.978785], // Giro hacia General Flores
  [-31.713742, -55.979506],
  [-31.714392, -55.980195], // Giro hacia Sarandí
  [-31.714984, -55.979467],
  [-31.715607, -55.978666],
  [-31.7158226, -55.978271], // BURGUERAMA (Sarandí 312 Bis)
];

const STORE_COORDS: [number, number] = [-31.7158226, -55.978271];

// Cálculo de distancias acumuladas para interpolación geométrica exacta
function getDist(p1: [number, number], p2: [number, number]): number {
  const dLat = p1[0] - p2[0];
  const dLng = (p1[1] - p2[1]) * Math.cos((p1[0] * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

const segmentDistances: number[] = [];
let totalDistance = 0;
for (let i = 0; i < ROUTE_COORDS.length - 1; i++) {
  const d = getDist(ROUTE_COORDS[i], ROUTE_COORDS[i + 1]);
  segmentDistances.push(d);
  totalDistance += d;
}

function getPointAt(t: number): { latLng: [number, number]; segIndex: number } {
  if (t <= 0) return { latLng: ROUTE_COORDS[0], segIndex: 0 };
  if (t >= 1) return { latLng: ROUTE_COORDS[ROUTE_COORDS.length - 1], segIndex: ROUTE_COORDS.length - 2 };

  const targetDist = t * totalDistance;
  let accumulated = 0;
  for (let i = 0; i < segmentDistances.length; i++) {
    const nextAcc = accumulated + segmentDistances[i];
    if (targetDist <= nextAcc) {
      const segT = (targetDist - accumulated) / segmentDistances[i];
      const p1 = ROUTE_COORDS[i];
      const p2 = ROUTE_COORDS[i + 1];
      const lat = p1[0] + (p2[0] - p1[0]) * segT;
      const lng = p1[1] + (p2[1] - p1[1]) * segT;
      return { latLng: [lat, lng], segIndex: i };
    }
    accumulated = nextAcc;
  }
  return { latLng: ROUTE_COORDS[ROUTE_COORDS.length - 1], segIndex: ROUTE_COORDS.length - 2 };
}

// Icono HTML para la moto delivery con radar verde
function createMotoIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div class="cadete-pulse-ring cadete-pulse-ring-green"></div>
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #0f172a;
          border: 2.5px solid #10b981;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        ">
          🛵
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

// Icono para el local: Marcador rojo estilo Google Maps con animación + Cartel de Burguerama con Logo separado
function createStoreIcon(isArrived: boolean): L.DivIcon {
  if (!isArrived) {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: '<div style="display: none;"></div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 180px; height: 160px; pointer-events: auto; overflow: visible;">
        
        <!-- Cartel de Burguerama con Logo y Dirección -->
        <div class="store-card-pop-anim" style="
          position: absolute;
          bottom: 52px;
          left: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.7));
        ">
          <!-- Logo circular con borde ámbar (elevado arriba del cuadrito, sin superponerse) -->
          <div style="
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #0d0d14;
            border: 2.5px solid #f59e0b;
            padding: 2px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.7);
            margin-bottom: 6px;
            z-index: 2;
            position: relative;
          ">
            <img src="/Burguerama_logo.png" alt="Burguerama" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain;" />
          </div>

          <!-- Placa con nombre y dirección -->
          <div style="
            background: #0d0d14;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 6px 14px 7px 14px;
            text-align: center;
            white-space: nowrap;
          ">
            <div style="color: #f59e0b; font-size: 11px; font-weight: 900; letter-spacing: 0.8px; font-family: 'Plus Jakarta Sans', sans-serif;">BURGUERAMA</div>
            <div style="color: #f1f5f9; font-size: 10px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; margin-top: 2px;">Sarandí 312 Bis</div>
          </div>

          <!-- Puntero hacia abajo hacia el pin rojo -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #f59e0b;
            margin-top: -1px;
          "></div>
        </div>

        <!-- Marcador Rojo estilo Google Maps con animación de llegada y sombra en el suelo -->
        <div class="pin-drop-anim" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center;">
          <!-- Sombra elíptica en el pavimento -->
          <div style="
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 6px;
            background: rgba(0,0,0,0.35);
            border-radius: 50%;
            filter: blur(1px);
          "></div>

          <!-- SVG Pin Rojo Google Maps -->
          <svg width="34" height="46" viewBox="0 0 34 46" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="#EA4335"/>
            <path d="M17 1C8.16 1 1 8.16 1 17C1 29.2 16.5 44.5 17 45C17.5 44.5 33 29.2 33 17C33 8.16 25.84 1 17 1Z" stroke="#C5221F" stroke-width="1.5"/>
            <circle cx="17" cy="17" r="7" fill="white"/>
          </svg>
        </div>

      </div>
    `,
    iconSize: [180, 160],
    iconAnchor: [90, 160],
  });
}

export const DeliveryMapLive: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowPolylineRef = useRef<L.Polyline | null>(null);
  const motoMarkerRef = useRef<L.Marker | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa de Leaflet en Tacuarembó
    const map = L.map(mapContainerRef.current, {
      center: [-31.7138, -55.9799],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
    });

    // Capa de mapa real oficial OpenStreetMap (idéntica a la usada en Foods / sin API key requerida)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Ajustar límites de la ruta para encuadre óptimo
    const bounds = L.latLngBounds(ROUTE_COORDS);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

    // Polilínea exterior de brillo verde neón
    const routeGlow = L.polyline([], {
      color: '#10b981',
      weight: 9,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Polilínea interior brillante
    const routeMain = L.polyline([], {
      color: '#34d399',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routeGlowPolylineRef.current = routeGlow;
    routePolylineRef.current = routeMain;

    // Marcador de moto (inicialmente oculto)
    const motoMarker = L.marker(ROUTE_COORDS[0], {
      icon: createMotoIcon(),
      zIndexOffset: 1000,
      opacity: 0,
    }).addTo(map);
    motoMarkerRef.current = motoMarker;

    // Marcador del local (inicialmente oculto hasta la llegada)
    const storeMarker = L.marker(STORE_COORDS, {
      icon: createStoreIcon(false),
      zIndexOffset: 2000,
    }).addTo(map);
    storeMarkerRef.current = storeMarker;

    // Al hacer clic en cualquier parte del mapa o en los marcadores, abrir la ficha oficial de Burguerama en Google Maps
    const handleOpenGoogleMaps = () => {
      window.open(GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer');
    };

    map.on('click', handleOpenGoogleMaps);
    storeMarker.on('click', handleOpenGoogleMaps);
    motoMarker.on('click', handleOpenGoogleMaps);

    mapInstanceRef.current = map;

    // =========================================================================
    // LOOP DE ANIMACIÓN EXACTO Y CONTINUO (60 FPS)
    // Duración total: 11 segundos por ciclo
    // 0.0s - 3.0s:  Se traza el camino por las calles reales de Tacuarembó
    // 3.0s - 7.5s:  La moto avanza por el trazo y lo que va pasando se borra
    // 7.5s - 10.2s: Llega la moto -> Entrada con drop del pin rojo + pop del cartel
    // 10.2s - 11.0s: Fade out suave y reinicio
    // =========================================================================
    const CYCLE_DURATION = 11000; // 11 segundos
    let startTime: number | null = null;
    let storeShown = false;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % CYCLE_DURATION;
      const cycleSec = elapsed / 1000;

      // FASE 1: Se dibuja el trazo desde el inicio hasta Burguerama (0s a 3.0s)
      if (cycleSec < 3.0) {
        if (storeShown) {
          storeMarker.setIcon(createStoreIcon(false));
          storeShown = false;
        }

        const drawProgress = Math.min(1, cycleSec / 3.0);
        const { latLng, segIndex } = getPointAt(drawProgress);
        const drawnPath = [...ROUTE_COORDS.slice(0, segIndex + 1), latLng];

        routeGlow.setLatLngs(drawnPath);
        routeMain.setLatLngs(drawnPath);

        // Moto oculta durante el trazo inicial
        motoMarker.setOpacity(0);
      }
      // FASE 2: La moto recorre el camino y el trazo detrás SE BORRA (3.0s a 7.5s)
      else if (cycleSec < 7.5) {
        if (storeShown) {
          storeMarker.setIcon(createStoreIcon(false));
          storeShown = false;
        }

        const rideProgress = Math.min(1, (cycleSec - 3.0) / 4.5);
        const { latLng, segIndex } = getPointAt(rideProgress);

        // La moto está exactamente en latLng
        motoMarker.setLatLng(latLng);
        motoMarker.setOpacity(1);

        // El camino por delante sigue existiendo; lo que pasó la moto SE BORRA en tiempo real
        const remainingPath = [latLng, ...ROUTE_COORDS.slice(segIndex + 1)];
        routeGlow.setLatLngs(remainingPath);
        routeMain.setLatLngs(remainingPath);
      }
      // FASE 3: LLEGADA A BURGUERAMA (7.5s a 10.2s)
      else if (cycleSec < 10.2) {
        // Todo el camino se borró completamente
        routeGlow.setLatLngs([]);
        routeMain.setLatLngs([]);

        // La moto queda estacionada en destino
        motoMarker.setLatLng(STORE_COORDS);
        motoMarker.setOpacity(1);

        // Disparar la entrada con animación del pin rojo Google Maps y el cartel de Burguerama
        if (!storeShown) {
          storeMarker.setIcon(createStoreIcon(true));
          storeShown = true;
        }
      }
      // FASE 4: Fade out y reseteo suave para el próximo ciclo (10.2s a 11.0s)
      else {
        const fadeProgress = (cycleSec - 10.2) / 0.8;
        const opacity = Math.max(0, 1 - fadeProgress);

        motoMarker.setOpacity(opacity);
        routeGlow.setLatLngs([]);
        routeMain.setLatLngs([]);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Invalidate size on load
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 select-none shadow-inner z-0 group">
      <div
        ref={mapContainerRef}
        className="w-full h-full cursor-pointer"
        title="Clic para abrir la ubicación de Burguerama en Google Maps"
      />

      {/* Floating CTA Badge directo a Google Maps */}
      <a
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-[11px] font-bold backdrop-blur-md border border-white/15 shadow-xl transition-all active:scale-95 hover:text-amber-400 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        title="Ver ficha oficial de Burguerama en Google Maps"
      >
        <MapPin className="w-3.5 h-3.5 text-red-500" />
        <span>Abrir en Google Maps</span>
        <ExternalLink className="w-3 h-3 text-gray-400" />
      </a>
    </div>
  );
};

