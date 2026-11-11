import React, { useState } from 'react';
import { Flame, Clock, MapPin, Sparkles, Navigation, Phone, ExternalLink, Heart, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const CulturaBurgueramaSection: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#0c0c10] via-[#111118] to-[#0c0c10] border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-red-600/10 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-20">
        
        {/* ==============================================================
            1. BRAND CLOSING: LOGO EN GRANDE CON BRILLO EN 'B' Y CÍRCULO
            ============================================================== */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Large Emblem with Exclusive Black Parts Sweep Shine */}
          <div 
            className="relative flex items-center justify-center select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ambient Golden Halo Behind Logo */}
            <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-500/20 to-orange-600/15 blur-2xl pointer-events-none animate-pulse" />

            {/* Emblem Wrapper */}
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-b from-amber-500/30 to-white/10 shadow-2xl shadow-black/80 flex items-center justify-center transition-transform duration-500 hover:scale-105">
              {/* Circular Emblem Base */}
              <img
                src="/Burguerama_logo.png"
                alt="Burguerama Emblem"
                className="w-full h-full object-contain rounded-full shadow-inner select-none pointer-events-none"
              />

              {/* Exclusive Shine Overlay: MASKED to ONLY the black ring and letter B! */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                style={{
                  WebkitMaskImage: 'url(/Burguerama_logo_black_mask.png)',
                  maskImage: 'url(/Burguerama_logo_black_mask.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                {/* Diagonal liquid gold/silver light sweep that glides across only the black ring & B */}
                <div className="absolute inset-0 w-full h-full animate-shine-sweep bg-gradient-to-r from-transparent via-amber-300 via-white to-transparent opacity-90" />
              </div>
            </div>
          </div>

          {/* Brand Manifesto & Info */}
          <div className="flex-1 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>PIONEROS EN SMASH BURGERS EN TACUAREMBÓ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display leading-[1.1]">
              PASIÓN POR EL SMASH,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                CRUJIENTE HASTA EL ÚLTIMO BOCADO
              </span>
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Nacimos para cambiar el juego en Tacuarembó. Doble medallón de carne 100% vacuna aplastada a fuego vivo para lograr la verdadera costra Maillard, queso cheddar fundido y pan brioche artesanal tostado con manteca.
            </p>

            {/* Quick Key Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                <span className="block text-xs font-black text-amber-400 uppercase tracking-wider">Delivery & Take Away</span>
                <span className="text-xs text-gray-300">Envíos a todo Tacuarembó</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                <span className="block text-xs font-black text-amber-400 uppercase tracking-wider">Horario de Cocina</span>
                <span className="text-xs text-gray-300">Martes a Domingo desde las 20:00 hs</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                <span className="block text-xs font-black text-amber-400 uppercase tracking-wider">Dirección</span>
                <span className="text-xs text-gray-300">Sarandí 312 Bis · Tacuarembó</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="https://wa.me/59891797279?text=Hola%20Burguerama!%20Quiero%20hacer%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('medium')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
              >
                {/* Official WhatsApp SVG Icon */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Pedir al +598 91 797 279</span>
              </a>

              <a
                href="https://www.instagram.com/burgueramatbo/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@burgueramatbo</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==============================================================
            2. DELIVERY EN VIVO: SIMULADOR DE MOTO ESTILO FOOD SYSTEM
            ============================================================== */}
        <div className="rounded-3xl border border-white/10 bg-[#14141c]/90 p-5 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Rastreo de Delivery en Tiempo Real
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                EN CAMINO A SARANDÍ 312 BIS
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                🛵 Envío $50 · Tacuarembó
              </span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver en Maps</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Interactive Map Visual with Animated Moto on Street Trajectory */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-[#0a0d14] border border-white/10 select-none">
            {/* Dark Styled Map Grid with Tacuarembó Center Streets */}
            <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                {/* Glow Filter for Neon Green Route */}
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Map background blocks / city areas */}
              <rect x="0" y="0" width="800" height="400" fill="#0b0f19" />
              
              {/* City blocks with soft tint */}
              <rect x="40" y="40" width="160" height="120" rx="6" fill="#131926" opacity="0.6" />
              <rect x="230" y="40" width="180" height="120" rx="6" fill="#131926" opacity="0.6" />
              <rect x="440" y="40" width="160" height="120" rx="6" fill="#131926" opacity="0.6" />
              <rect x="630" y="40" width="140" height="120" rx="6" fill="#131926" opacity="0.6" />

              <rect x="40" y="190" width="160" height="160" rx="6" fill="#131926" opacity="0.6" />
              <rect x="230" y="190" width="180" height="160" rx="6" fill="#131926" opacity="0.6" />
              <rect x="440" y="190" width="160" height="160" rx="6" fill="#131926" opacity="0.6" />
              <rect x="630" y="190" width="140" height="160" rx="6" fill="#131926" opacity="0.6" />

              {/* Secondary Street Grid Lines */}
              <line x1="0" y1="175" x2="800" y2="175" stroke="#1d2636" strokeWidth="12" />
              <line x1="215" y1="0" x2="215" y2="400" stroke="#1d2636" strokeWidth="12" />
              <line x1="425" y1="0" x2="425" y2="400" stroke="#1d2636" strokeWidth="12" />
              <line x1="615" y1="0" x2="615" y2="400" stroke="#1d2636" strokeWidth="12" />

              {/* Diagonal Main Avenues (Avenida Manuel Oribe & Washington Beltrán) */}
              <line x1="0" y1="80" x2="800" y2="280" stroke="#253246" strokeWidth="16" />
              <line x1="120" y1="0" x2="700" y2="400" stroke="#202a3a" strokeWidth="10" />

              {/* Street Names (Tacuarembó downtown) */}
              <text x="140" y="105" fill="#64748b" fontSize="10" fontWeight="700" transform="rotate(14 140 105)" letterSpacing="1">
                AV. GRAL. MANUEL ORIBE
              </text>
              <text x="240" y="235" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">
                WASHINGTON BELTRÁN
              </text>
              <text x="445" y="210" fill="#f59e0b" fontSize="10" fontWeight="800" letterSpacing="1">
                SARANDÍ (312 BIS)
              </text>
              <text x="445" y="320" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">
                18 DE JULIO
              </text>
              <text x="235" y="130" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">
                25 DE AGOSTO
              </text>

              {/* Animated Neon Green Delivery Route Path */}
              <path
                id="deliveryRoute"
                d="M 120 70 L 320 175 L 430 200 L 530 200"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
              />

              {/* Destination Point: Burguerama Sarandí 312 Bis */}
              <g transform="translate(530, 200)">
                {/* Pulsing Beacon Rings */}
                <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.4" className="animate-ping" />
                <circle r="12" fill="#f59e0b" opacity="0.2" />
                <circle r="7" fill="#f59e0b" />
                
                {/* Store Pin Card */}
                <g transform="translate(-60, -48)">
                  <rect width="120" height="32" rx="10" fill="#0d0d14" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="60" y="15" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="900" letterSpacing="0.5">
                    BURGUERAMA
                  </text>
                  <text x="60" y="25" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="600">
                    Sarandí 312 Bis
                  </text>
                </g>
              </g>

              {/* Animated Delivery Rider (Jonatan #572) Moving along the Green Route */}
              <g className="animate-delivery-rider">
                {/* Magenta Badge matching Food System screenshot */}
                <rect x="-24" y="-28" width="48" height="24" rx="8" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                {/* Order Number #572 */}
                <text x="0" y="-13" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                  📦 #572
                </text>
                {/* Motorcycle Circle Icon */}
                <circle cx="0" cy="8" r="10" fill="#831843" stroke="#f472b6" strokeWidth="1.5" />
                <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontSize="10">
                  🛵
                </text>
                {/* Driver Name Tag underneath */}
                <rect x="-30" y="21" width="60" height="14" rx="4" fill="#090d16" stroke="#ec4899" strokeWidth="1" />
                <text x="0" y="31" textAnchor="middle" fill="#fbcfe8" fontSize="7.5" fontWeight="800">
                  JONATAN
                </text>
              </g>
            </svg>

            {/* Bottom Floating Delivery Stats Bar */}
            <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-[#090d16]/90 backdrop-blur-md border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-300 font-medium">Repartidor asignado y en ruta</span>
              </div>
              <div className="flex items-center gap-4 text-gray-400 font-semibold">
                <span>⏱️ 35–50 min</span>
                <span>🛵 Envío $50</span>
                <span className="text-amber-400">🔥 Directo de plancha</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
