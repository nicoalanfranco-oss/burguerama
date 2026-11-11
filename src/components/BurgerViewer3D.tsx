import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Play, Pause, Compass, Sparkles, Hand } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface BurgerViewer3DProps {
  className?: string;
  onLoaded?: () => void;
}

export const BurgerViewer3D: React.FC<BurgerViewer3DProps> = ({ className = '', onLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [introFinished, setIntroFinished] = useState<boolean>(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const introStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasError(true);
        return;
      }
    } catch {
      setHasError(true);
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 3.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 4.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.35; // Don't flip upside down
    controls.minPolarAngle = 0.2;
    controls.autoRotate = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      setIsInteracting(true);
      triggerHaptic('light');
    });
    controls.addEventListener('end', () => {
      setIsInteracting(false);
    });

    // 5. Studio Lighting for Gourmet Smash Burgers
    // Ambient light: soft base
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key Light: warm golden glow (cheddar & brioche warmth)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    // Fill Light: soft cool counter light
    const fillLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Rim Light: dramatic back highlight
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.8);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    bounceLight.position.set(0, -3, 1);
    scene.add(bounceLight);

    // 6. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 7. Load GLB Model
    const loader = new GLTFLoader();
    const modelUrl = encodeURI('/Modelo 3d Hamburguesa.glb');

    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 1.75;
        const scale = targetSize / (maxDim || 1);

        root.position.x = -center.x * scale;
        root.position.y = -center.y * scale;
        root.position.z = -center.z * scale;
        root.scale.set(scale, scale, scale);

        // Enhance material aesthetics
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness ?? 0.5, 0.65);
              mat.metalness = Math.min(mat.metalness ?? 0.1, 0.15);
              mat.envMapIntensity = 1.2;
            }
          }
        });

        modelGroup.add(root);
        setIsLoaded(true);
        introStartTimeRef.current = performance.now();
        onLoaded?.();
        triggerHaptic('medium');
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(pct);
        } else {
          // Fallback progress estimate
          setLoadProgress((prev) => Math.min(prev + 8, 92));
        }
      },
      (error) => {
        console.warn('Error al cargar Modelo 3d Hamburguesa.glb:', error);
        setHasError(true);
      }
    );

    // 8. Render Loop with Cinematic Intro & Inertia
    const INTRO_DURATION_MS = 2400; // 2.4s entrance spin

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (modelGroupRef.current && introStartTimeRef.current) {
        const elapsed = time - introStartTimeRef.current;

        if (elapsed < INTRO_DURATION_MS) {
          // Cinematic Entrance Animation:
          // 720 degree spin slowing down with smooth cubic ease-out
          const t = elapsed / INTRO_DURATION_MS;
          const easeOut = 1 - Math.pow(1 - t, 3);

          const totalRotation = Math.PI * 4; // 2 full revolutions
          modelGroupRef.current.rotation.y = easeOut * totalRotation;

          // Gentle scale up from 0.75 to 1.0
          const currentScale = 0.75 + easeOut * 0.25;
          modelGroupRef.current.scale.set(currentScale, currentScale, currentScale);

          // Subtle initial floating
          modelGroupRef.current.position.y = Math.sin(t * Math.PI) * 0.08;
        } else {
          if (!introFinished) {
            setIntroFinished(true);
          }

          // Gentle idle floating bob
          const floatOffset = Math.sin(time * 0.0018) * 0.04;
          modelGroupRef.current.position.y = floatOffset;

          // Auto-rotation when user isn't dragging
          if (autoRotate && !isInteracting) {
            modelGroupRef.current.rotation.y += 0.007;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Camera presets
  const resetCamera = () => {
    triggerHaptic('light');
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 0.4, 3.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setTopView = () => {
    triggerHaptic('light');
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 2.8, 1.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`relative w-full h-[380px] sm:h-[480px] lg:h-[540px] select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none relative z-10"
        title="Arrastra con el ratón o el dedo para girar la hamburguesa 3D"
      />

      {/* Loading Progress State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl p-6 transition-all duration-500">
          <div className="relative w-48 sm:w-56 mb-4 animate-pulse">
            <img
              src="/Hamburguesa_transparente.png"
              alt="Cargando Smash Burger 3D"
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(245,158,11,0.35)]"
            />
          </div>
          <div className="w-56 max-w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-amber-500/30 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(loadProgress, 12)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-amber-400 mt-2.5 tracking-wider flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            CARGANDO EXPERIENCIA 3D {loadProgress > 0 ? `${loadProgress}%` : ''}
          </span>
        </div>
      )}

      {/* Fallback if WebGL/Model fails */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
          <img
            src="/Hamburguesa_transparente.png"
            alt="Burguerama Smash Burger"
            className="w-72 sm:w-96 max-w-full h-auto drop-shadow-[0_25px_50px_rgba(245,158,11,0.3)] animate-float"
          />
        </div>
      )}

      {/* Floating 3D Control Bar */}
      {isLoaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#121217]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-2xl shadow-black/80">
          <button
            type="button"
            onClick={() => {
              setAutoRotate((prev) => !prev);
              triggerHaptic('light');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              autoRotate
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-amber-300/80 hover:text-amber-200 hover:bg-white/5'
            }`}
            title={autoRotate ? 'Pausar rotación automática' : 'Activar giro automático'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>360°</span>
          </button>

          <button
            type="button"
            onClick={resetCamera}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Vista frontal centrada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Centrar</span>
          </button>

          <button
            type="button"
            onClick={setTopView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Vista superior (cenital)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cenital</span>
          </button>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-400/90 font-medium pl-2 border-l border-white/10">
            <Hand className="w-3 h-3 text-amber-400 animate-bounce" />
            <span>Arrastra para girar</span>
          </div>
        </div>
      )}
    </div>
  );
};

