import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { triggerHaptic } from '../utils/haptics';

interface BurgerViewer3DProps {
  className?: string;
  onLoaded?: () => void;
}

export const BurgerViewer3D: React.FC<BurgerViewer3DProps> = ({ className = '', onLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const introStartTimeRef = useRef<number | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
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

    // 2. Camera setup (flattering 40 deg FOV)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 2.85);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false; // Disable zoom to prevent page hijacking
    controls.enablePan = false;  // Keep centered
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Don't look too far underneath
    controls.minPolarAngle = Math.PI / 3.5;     // Flattering 3/4 angle
    controls.autoRotate = false; // We drive rotation manually during intro and idle
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isInteractingRef.current = true;
      triggerHaptic('light');
    });

    controls.addEventListener('end', () => {
      isInteractingRef.current = false;
    });

    // 5. Gourmet Warm Lighting Setup (Soft, realistic, NO plastic shine)
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.25);
    scene.add(ambientLight);

    // Key Light: warm brioche & cheddar glow
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.6);
    keyLight.position.set(2.5, 3.5, 2.5);
    scene.add(keyLight);

    // Fill Light: subtle cool counter
    const fillLight = new THREE.DirectionalLight(0xffe8cc, 0.9);
    fillLight.position.set(-2.5, 1.5, 2.0);
    scene.add(fillLight);

    // Rim Light: dramatic golden backlight
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.2);
    rimLight.position.set(0, 2.0, -3.0);
    scene.add(rimLight);

    // Subtle bottom bounce
    const bounceLight = new THREE.DirectionalLight(0xffeedd, 0.5);
    bounceLight.position.set(0, -2.5, 1.0);
    scene.add(bounceLight);

    // 6. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Start with 720 deg rotation for intro
    modelGroup.rotation.y = -Math.PI * 4;
    modelGroup.scale.set(0.2, 0.2, 0.2);

    // 7. Load Textures & GLB Model
    const textureLoader = new THREE.TextureLoader();

    // High resolution original photo for front projection
    const photoTex = textureLoader.load('/Hamburguesa_transparente.png');
    photoTex.colorSpace = THREE.SRGBColorSpace;

    // Enhanced 2048 UV texture
    const baseTex = textureLoader.load('/burger_texture_2048.jpg');
    baseTex.colorSpace = THREE.SRGBColorSpace;
    baseTex.flipY = false;

    // GLTFLoader with MeshoptDecoder for fast decompression
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const modelPath = '/burger_opt.glb';

    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.0 / maxDim;

        root.position.x = -center.x * targetScale;
        root.position.y = -center.y * targetScale;
        root.position.z = -center.z * targetScale;
        root.scale.set(targetScale, targetScale, targetScale);

        // Bounds for front photo projection:
        const minX = -0.5 * targetScale;
        const maxX = 0.5 * targetScale;
        const minY = 0;
        const maxY = 0.793 * targetScale;

        // PBR Material Enhancement with Front Photo Projection
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;

            mat.map = baseTex;
            mat.roughness = 0.76; // Natural food diffuse, removes plastic shine
            mat.metalness = 0.03;
            mat.needsUpdate = true;

            // Project high-resolution photo on front faces
            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uPhotoTexture = { value: photoTex };
              shader.uniforms.uPhotoBounds = { value: new THREE.Vector4(minX, maxX, minY, maxY) };

              shader.vertexShader = `
                varying vec3 vModelPos;
                varying vec3 vModelNorm;
                ${shader.vertexShader}
              `.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                vModelPos = position;
                vModelNorm = normal;
                `
              );

              shader.fragmentShader = `
                uniform sampler2D uPhotoTexture;
                uniform vec4 uPhotoBounds;
                varying vec3 vModelPos;
                varying vec3 vModelNorm;
                ${shader.fragmentShader}
              `.replace(
                '#include <map_fragment>',
                `
                #include <map_fragment>
                
                // Front projective texturing using the high-resolution photo
                if (vModelNorm.z > 0.02) {
                  float u = (vModelPos.x - uPhotoBounds.x) / (uPhotoBounds.y - uPhotoBounds.x);
                  float v = 1.0 - (vModelPos.y - uPhotoBounds.z) / (uPhotoBounds.w - uPhotoBounds.z);
                  
                  if (u >= 0.0 && u <= 1.0 && v >= 0.0 && v <= 1.0) {
                    vec4 photoCol = texture2D(uPhotoTexture, vec2(u, v));
                    if (photoCol.a > 0.08) {
                      float blendFactor = smoothstep(0.02, 0.40, vModelNorm.z) * photoCol.a;
                      diffuseColor.rgb = mix(diffuseColor.rgb, photoCol.rgb, blendFactor);
                    }
                  }
                }
                `
              );
            };
          }
        });

        modelGroup.add(root);
        setIsLoaded(true);
        triggerHaptic('medium');
        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => {
        console.warn('GLB load error, using fallback:', err);
        setHasError(true);
      }
    );

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Intro 720 deg spin & scale-in animation
      if (modelGroupRef.current) {
        if (!introStartTimeRef.current) {
          introStartTimeRef.current = performance.now();
        }

        const introDuration = 1400; // 1.4s
        const introElapsed = performance.now() - introStartTimeRef.current;
        const introT = Math.min(1, introElapsed / introDuration);

        if (introT < 1) {
          // Cubic ease out
          const easeOut = 1 - Math.pow(1 - introT, 3.2);
          modelGroupRef.current.rotation.y = -Math.PI * 4 * (1 - easeOut);
          const currentScale = 0.2 + 0.8 * easeOut;
          modelGroupRef.current.scale.set(currentScale, currentScale, currentScale);
        } else {
          // Intro complete: subtle floating bob & idle auto-rotation if not dragging
          const bobY = Math.sin(elapsedTime * 1.6) * 0.04;
          modelGroupRef.current.position.y = bobY;

          if (!isInteractingRef.current) {
            // Gentle continuous auto-spin
            modelGroupRef.current.rotation.y += 0.005;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, [onLoaded]);

  // Fallback: If WebGL fails, render high-res image
  if (hasError) {
    return (
      <div className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] flex items-center justify-center ${className}`}>
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <picture className="w-full h-full flex items-center justify-center p-4">
          <source srcSet="/Hamburguesa_hero.webp" type="image/webp" />
          <img
            src="/Hamburguesa_transparente.png"
            alt="Burguerama Smash Burger"
            className="w-[90%] h-[90%] object-contain select-none filter contrast-[1.04]"
          />
        </picture>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] flex items-center justify-center select-none ${className}`}
    >
      {/* Ambient Warm Golden Glow Backdrop */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-500/15 to-orange-600/10 blur-3xl pointer-events-none" />

      {/* Dynamic 3D Floor Shadow */}
      <div className="absolute bottom-4 sm:bottom-6 w-3/4 h-10 rounded-[100%] bg-black/75 blur-xl pointer-events-none" />

      {/* Three.js Canvas Container (Clean, no buttons, no badges) */}
      <div
        ref={mountRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
      />
    </div>
  );
};
