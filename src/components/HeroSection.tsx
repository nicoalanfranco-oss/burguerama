import React from 'react';
import { BurgerViewer3D } from './BurgerViewer3D';
import { Flame, Clock, MapPin, Sparkles, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import type { MarcaInfo } from '../types/food';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onFilterCategory?: (cat: string) => void;
  marca?: MarcaInfo;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu, onFilterCategory, marca }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-[#0a0a0d] via-[#121218] to-[#0d0d12]">
      {/* Ambient background glow flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-40 -left-20 w-80 h-80 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-60 -right-20 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badges Bar (Hidden on Mobile) */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-500/10">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Pioneros en Smash Burgers
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Sarandí 312 Bis · Tacuarembó
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Mar a Dom · Desde las 20:00 hs
          </span>
        </div>

        {/* Main Grid: Left copy & Right 3D interactive viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Copy Column */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.08] font-display">
                BURGUERAMA
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-3xl sm:text-4xl lg:text-5xl mt-1">
                  SMASH BAR
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Costra caramelizada al fuego vivo, 100% carne smash vacuna seleccionada, queso cheddar fundido y pan brioche artesanal tostado con manteca.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onExploreMenu();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-extrabold text-base tracking-wide shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-black" />
                <span>Pedir Online Ahora</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  if (onFilterCategory) onFilterCategory('SPECIALS');
                  onExploreMenu();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-white/15 backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Ver Specials</span>
              </button>
            </div>

            {/* Features Row (Hidden on Mobile) */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-black text-amber-400 font-display">100%</span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Carne Smash</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-black text-amber-400 font-display">
                  {marca?.tiempo_espera_delivery || '25–30\''}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Delivery Rápido</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-black text-amber-400 font-display">
                  {Number(marca?.costo_delivery) === 0 ? 'Gratis' : `$${marca?.costo_delivery ?? 0}`}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Costo Envío</span>
              </div>
            </div>
          </div>

          {/* 3D Burger Interactive Model Column */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient circular frame with rotating glow */}
            <div className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full border border-amber-500/20 bg-gradient-to-tr from-amber-500/5 to-red-500/5 blur-sm pointer-events-none" />

            <BurgerViewer3D />
          </div>
        </div>
      </div>
    </section>
  );
};

