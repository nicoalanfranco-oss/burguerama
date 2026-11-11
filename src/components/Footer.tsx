import React from 'react';
import { MapPin, Clock, MessageCircle } from 'lucide-react';
import { TenantInfo, MarcaInfo } from '../types/food';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface FooterProps {
  tenant: TenantInfo;
  marca: MarcaInfo;
}

export const Footer: React.FC<FooterProps> = ({ tenant, marca }) => {
  return (
    <footer className="bg-[#09090d] border-t border-white/10 text-gray-400 text-xs py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 p-0 flex items-center justify-center bg-black">
                <img
                  src="/Burguerama_logo.png"
                  alt="Burguerama"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-black text-white uppercase tracking-wider font-display">
                BURGUERAMA
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Pioneros en smash burgers artesanales en Tacuarembó. Sabor genuino, técnica e ingredientes de máxima calidad.
            </p>
          </div>

          {/* Col 2: Ubicación & Maps */}
          <div className="space-y-2">
            <span className="text-xs font-black text-white uppercase tracking-wider block font-display">
              UBICACIÓN
            </span>
            <div className="flex items-start gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{tenant.direccion || 'Sarandí 312 Bis'}<br />Tacuarembó, Uruguay</span>
            </div>
            <a
              href={tenant.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=-31.7158226,-55.978271'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] text-amber-400 hover:underline font-bold mt-1"
            >
              Ver en Google Maps →
            </a>
          </div>

          {/* Col 3: Horarios & Delivery */}
          <div className="space-y-2">
            <span className="text-xs font-black text-white uppercase tracking-wider block font-display">
              HORARIOS DE ATENCIÓN
            </span>
            <div className="flex items-start gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Martes a Domingo</p>
                <p>Desde las 20:00 hs</p>
                <p className="text-[11px] text-gray-400 mt-1">Lunes cerrado por descanso.</p>
              </div>
            </div>
          </div>

          {/* Col 4: Contacto & Redes */}
          <div className="space-y-3">
            <span className="text-xs font-black text-white uppercase tracking-wider block font-display">
              PEDIDOS & CONSULTAS
            </span>
            <div className="space-y-2">
              <a
                href="https://wa.me/59891797279?text=Hola%20Burguerama!%20Quiero%20hacer%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +598 91 797 279</span>
              </a>

              <a
                href="https://www.instagram.com/burgueramatbo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold"
              >
                <InstagramIcon size={16} />
                <span>@burgueramatbo</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Burguerama Smash Bar · Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Powered by</span>
            <span className="font-bold text-amber-400">Nicolabs Food System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
