import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerViewer3DProps {
  className?: string;
  onLoaded?: () => void;
}

export const BurgerViewer3D: React.FC<BurgerViewer3DProps> = ({ className = '', onLoaded }) => {
  // Rotation in degrees
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [introFinished, setIntroFinished] = useState<boolean>(false);
  const [introProgress, setIntroProgress] = useState<number>(0); // 0 to 1

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: 0,
    startRotY: 0,
  });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef<number | null>(null);
  const idleAngleRef = useRef<number>(0);

  // 1. Cinematic 3D Entrance Animation (Smooth, instant, zero delay)
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1350; // 1.35 seconds entrance

    const stepIntro = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);

      // Custom exponential cubic-bezier deceleration
      const easeOut = 1 - Math.pow(1 - t, 3.5);
      setIntroProgress(easeOut);

      // Spin from -720 deg to 0 deg
      const currentRotY = -720 * (1 - easeOut);
      // Slight pitch entrance (starts tilted down, levels out)
      const currentRotX = 22 * (1 - easeOut);

      setRotY(currentRotY);
      setRotX(currentRotX);

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

  // 2. Physics & Inertia Loop after intro finishes
  useEffect(() => {
    if (!introFinished) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(32, currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isDragging) {
        // Apply friction to throw velocity
        const friction = 0.94;
        velocityRef.current.vx *= friction;
        velocityRef.current.vy *= friction;

        // Apply remaining velocity
        if (Math.abs(velocityRef.current.vx) > 0.05 || Math.abs(velocityRef.current.vy) > 0.05) {
          setRotY((prev) => prev + velocityRef.current.vx * dt * 45);
          setRotX((prev) => Math.max(-28, Math.min(28, prev - velocityRef.current.vy * dt * 35)));
        } else {
          // Gentle natural idle floating wobble
          idleAngleRef.current += dt * 0.8;
          const wobbleY = Math.sin(idleAngleRef.current) * 6;
          const wobbleX = Math.cos(idleAngleRef.current * 0.7) * 3;
          // Smooth return towards idle center
          setRotY((prev) => prev * 0.98 + wobbleY * 0.02);
          setRotX((prev) => prev * 0.96 + wobbleX * 0.04);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [introFinished, isDragging]);

  // 3. Pointer Handlers (Mouse & Touch Dragging)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    triggerHaptic('light');

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };

    lastMoveRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };

    velocityRef.current = { vx: 0, vy: 0 };

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) {
      // Subtle mouse tracking tilt when hovering without dragging
      if (containerRef.current && introFinished) {
        const rect = containerRef.current.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setRotY(normX * 18);
        setRotX(-normY * 14);
      }
      return;
    }

    const now = performance.now();
    const dt = Math.max(8, now - lastMoveRef.current.time);
    const dx = e.clientX - lastMoveRef.current.x;
    const dy = e.clientY - lastMoveRef.current.y;

    // Track instantaneous throw velocity
    velocityRef.current = {
      vx: (dx / dt) * 18,
      vy: (dy / dt) * 18,
    };

    lastMoveRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: now,
    };

    // Update rotation directly from drag offset
    const totalDx = e.clientX - dragStartRef.current.x;
    const totalDy = e.clientY - dragStartRef.current.y;

    const sensitivity = 0.55;
    setRotY(dragStartRef.current.startRotY + totalDx * sensitivity);
    setRotX(
      Math.max(-32, Math.min(32, dragStartRef.current.startRotX - totalDy * sensitivity))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Double tap/click to reset orientation
  const handleDoubleClick = () => {
    setRotX(0);
    setRotY(0);
    velocityRef.current = { vx: 0, vy: 0 };
    triggerHaptic('medium');
  };

  // Entrance scale & depth calculations
  const scale = introFinished ? 1 : 0.25 + 0.75 * introProgress;
  const opacity = introFinished ? 1 : Math.min(1, introProgress * 1.5);
  const translateZ = introFinished ? 0 : -280 * (1 - introProgress);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ perspective: '1100px' }}
    >
      {/* Golden Aura Glow Backdrop behind burger */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-orange-600/15 blur-3xl pointer-events-none transition-transform duration-700"
        style={{
          transform: `scale(${introFinished ? 1 + Math.sin(rotY * 0.05) * 0.08 : introProgress * 1.2})`,
        }}
      />

      {/* 3D Dynamic Floor Shadow */}
      <div
        className="absolute bottom-4 sm:bottom-6 w-3/4 h-12 rounded-[100%] bg-black/65 blur-xl pointer-events-none transition-transform duration-75"
        style={{
          transform: `
            scale(${scale * (1 - Math.abs(rotX) * 0.005)})
            translateX(${rotY * 0.8}px)
            scaleY(${0.7 + rotX * 0.01})
          `,
          opacity: opacity * 0.75,
        }}
      />

      {/* 3D Burger Container with Perspective & Hardware Transform */}
      <div
        className="relative w-full h-full flex items-center justify-center will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            translateZ(${translateZ}px)
            scale3d(${scale}, ${scale}, ${scale})
            rotateX(${rotX}deg)
            rotateY(${rotY}deg)
          `,
          opacity,
          transition: isDragging ? 'none' : introFinished ? 'transform 0.08s ease-out' : 'none',
        }}
      >
        {/* Real Ultra-Crisp Burguerama Smash Burger */}
        <picture className="w-full h-full flex items-center justify-center pointer-events-none drop-shadow-[0_22px_35px_rgba(0,0,0,0.85)]">
          <source srcSet="/Hamburguesa_hero.webp" type="image/webp" />
          <img
            src="/Hamburguesa_transparente.png"
            alt="Burguerama Smash Burger Artesanal"
            className="w-[92%] h-[92%] sm:w-[94%] sm:h-[94%] object-contain select-none filter contrast-[1.04] brightness-[1.02]"
            draggable={false}
          />
        </picture>

        {/* Dynamic Specular Sheen (Reacts to 3D light angle) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full mix-blend-overlay opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${50 - rotY * 0.8}% ${40 + rotX * 0.8}%, rgba(255,245,210,0.6) 0%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
};
