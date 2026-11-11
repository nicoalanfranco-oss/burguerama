import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerViewer3DProps {
  className?: string;
  onLoaded?: () => void;
}

export const BurgerViewer3D: React.FC<BurgerViewer3DProps> = ({ className = '', onLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Target and current values for butter-smooth lerp interpolation
  const targetTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Entrance animation state
  const [introProgress, setIntroProgress] = useState<number>(0);
  const [introFinished, setIntroFinished] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 1. Cinematic Entrance: explosive smooth scale + slight tilt + golden glow
  useEffect(() => {
    const duration = 1200; // 1.2s entrance

    const stepIntro = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);

      // Smooth elastic cubic-bezier ease out
      const ease = 1 - Math.pow(1 - t, 3.8);
      setIntroProgress(ease);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(stepIntro);
      } else {
        setIntroFinished(true);
        triggerHaptic('medium');
        if (onLoaded) onLoaded();
      }
    };

    animFrameRef.current = requestAnimationFrame(stepIntro);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [onLoaded]);

  // 2. Physics & Motion Loop (Lerp tracking + Organic Floating)
  const [renderTilt, setRenderTilt] = useState<{ x: number; y: number; floatY: number; time: number }>({
    x: 0,
    y: 0,
    floatY: 0,
    time: 0,
  });

  useEffect(() => {
    let animId: number;

    const renderLoop = (time: number) => {
      // Smooth lerp towards target tilt (0.08 damping)
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.085;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.085;

      // Gentle organic breathing/floating bob
      const floatY = introFinished ? Math.sin(time * 0.0018) * 8 : 0;

      setRenderTilt({
        x: currentTilt.current.x,
        y: currentTilt.current.y,
        floatY,
        time,
      });

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [introFinished]);

  // 3. Pointer & Mouse Movement Tracking
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !introFinished) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Normalized coordinates from -1 to 1
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Flattering 3D tilt bounds: keeps the burger volumetric without showing flat edge
    targetTilt.current = {
      y: normX * 16,       // Horizontal tilt (max 16 deg)
      x: -normY * 13,      // Vertical tilt (max 13 deg)
    };
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    // Smooth return to center
    targetTilt.current = { x: 0, y: 0 };
  };

  // Entrance calculations
  const introScale = introFinished ? 1 : 0.4 + 0.6 * introProgress;
  const introOpacity = introFinished ? 1 : Math.min(1, introProgress * 1.6);
  const introRotZ = introFinished ? 0 : -8 * (1 - introProgress);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Radiant Golden Glow Backdrop */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-500/20 to-orange-600/15 blur-3xl pointer-events-none transition-transform duration-700"
        style={{
          transform: `scale(${introFinished ? 1 + (isHovered ? 0.08 : 0) : introProgress * 1.15})`,
          opacity: introOpacity,
        }}
      />

      {/* Dynamic 3D Floor Shadow */}
      <div
        className="absolute bottom-4 sm:bottom-6 w-3/4 h-11 rounded-[100%] bg-black/80 blur-xl pointer-events-none transition-transform duration-100"
        style={{
          transform: `
            scale(${introScale * (1 - renderTilt.floatY * 0.015)})
            translateX(${renderTilt.y * 1.2}px)
            scaleY(${0.75 - renderTilt.x * 0.008})
          `,
          opacity: introOpacity * 0.85,
        }}
      />

      {/* 3D Perspective Card Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            translateY(${renderTilt.floatY}px)
            scale3d(${introScale}, ${introScale}, ${introScale})
            rotateX(${renderTilt.x}deg)
            rotateY(${renderTilt.y}deg)
            rotateZ(${introRotZ}deg)
          `,
          opacity: introOpacity,
        }}
      >
        {/* Real High-Resolution Burguerama Smash Burger */}
        <picture className="w-full h-full flex items-center justify-center pointer-events-none drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)]">
          <source srcSet="/Hamburguesa_hero.webp" type="image/webp" />
          <img
            src="/Hamburguesa_transparente.png"
            alt="Burguerama Smash Burger Artesanal"
            className="w-[94%] h-[94%] sm:w-[96%] sm:h-[96%] object-contain select-none filter contrast-[1.05] brightness-[1.02]"
            draggable={false}
          />
        </picture>

        {/* Dynamic Specular Sheen (Reacts to 3D light & tilt angle) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.45 : 0.25,
            background: `radial-gradient(circle at ${50 - renderTilt.y * 1.5}% ${40 + renderTilt.x * 1.5}%, rgba(255,248,220,0.7) 0%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
};
