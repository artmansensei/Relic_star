import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createMarsTerrain } from './terrain';
import { createMarsArtifactsManager, MarsArtifactsManager } from './artifacts3d';
import { createLandingSite, LandingSiteObject } from './landingSite';
import { createMarsAtmosphere, MarsAtmosphere } from './sky';
import { FirstPersonController, PlayerState } from './controls';
import { createDescentVehicle, DescentVehicleManager } from './descentVehicle';
import { IntroPhase } from '../components/IntroCinematic';

interface MarsCanvasProps {
  onStateUpdate: (state: PlayerState) => void;
  onLockChange: (locked: boolean) => void;
  controllerRef: React.MutableRefObject<FirstPersonController | null>;
  introPhase: IntroPhase;
  onLandingComplete: () => void;
  skipIntroTrigger?: number;
}

export const MarsCanvas: React.FC<MarsCanvasProps> = ({
  onStateUpdate,
  onLockChange,
  controllerRef,
  introPhase,
  onLandingComplete,
  skipIntroTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const artifactsManagerRef = useRef<MarsArtifactsManager | null>(null);
  const landingRef = useRef<LandingSiteObject | null>(null);
  const descentVehicleRef = useRef<DescentVehicleManager | null>(null);
  const atmosphereRef = useRef<MarsAtmosphere | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const onStateUpdateRef = useRef(onStateUpdate);
  const introPhaseRef = useRef(introPhase);
  const onLandingCompleteRef = useRef(onLandingComplete);
  const introElapsedSecRef = useRef(0);

  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
  }, [onStateUpdate]);

  useEffect(() => {
    introPhaseRef.current = introPhase;
  }, [introPhase]);

  useEffect(() => {
    onLandingCompleteRef.current = onLandingComplete;
  }, [onLandingComplete]);

  // Handle instant skip trigger to land craft immediately
  useEffect(() => {
    if (skipIntroTrigger > 0 && descentVehicleRef.current) {
      descentVehicleRef.current.skipToTouchdown();
      if (controllerRef.current) {
        controllerRef.current.resetPosition();
      }
      onLandingCompleteRef.current();
    }
  }, [skipIntroTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70, // Authentic 70° EVA Helmet FOV
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    rendererRef.current = renderer;

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.appendChild(renderer.domElement);

    // 2. Add Mars Environment
    const terrain = createMarsTerrain();
    scene.add(terrain.terrainMesh);
    scene.add(terrain.rocksMesh);
    scene.add(terrain.smallPebblesMesh);

    // 3. Add All 5 Real NASA Artifacts (Spirit, Opportunity, Phoenix, InSight, Curiosity)
    const artifactsManager = createMarsArtifactsManager(scene);
    artifactsManagerRef.current = artifactsManager;

    // 4. Add Starting Landing Site & NASA Ares Descent Vehicle
    const landingSite = createLandingSite();
    landingRef.current = landingSite;
    scene.add(landingSite.group);

    const descentVehicle = createDescentVehicle();
    descentVehicleRef.current = descentVehicle;
    scene.add(descentVehicle.group);

    // If already in welcome or game phase (e.g. fast reload), park the craft
    if (introPhaseRef.current !== 'landing') {
      descentVehicle.skipToTouchdown();
    }

    // 5. Add Sky, Sunlight, Fog & Atmospheric Dust
    const atmosphere = createMarsAtmosphere(scene);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere.skyGroup);

    // 6. Initialize First-Person Controller
    const controller = new FirstPersonController(camera, renderer.domElement);
    controllerRef.current = controller;
    controller.setOnLockChange(onLockChange);

    // Keep controls disabled until expedition officially begins
    if (introPhaseRef.current !== 'game') {
      controller.setInputEnabled(false);
    }

    // 7. Render & Animation Loop
    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp?: number) => {
      animationFrameId.current = requestAnimationFrame(animate);

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
      const elapsedTime = timer.getElapsed();
      const currentPhase = introPhaseRef.current;

      let activeCamPos = camera.position;

      // CINEMATIC INTRO PHASE EXECUTION
      if (currentPhase === 'landing') {
        introElapsedSecRef.current += delta;
        const anim = descentVehicle.update(introElapsedSecRef.current, delta);

        camera.position.copy(anim.cameraPosition);
        camera.lookAt(anim.cameraTarget);

        activeCamPos = anim.cameraPosition;

        if (anim.isComplete) {
          onLandingCompleteRef.current();
        }
      } else if (currentPhase === 'welcome') {
        descentVehicle.skipToTouchdown();
        // Keep camera grounded at starting astronaut viewpoint
        controller.resetPosition();
        activeCamPos = controller.position;
      } else {
        // Active gameplay physics & state telemetry calculation
        const state = controller.update(delta);
        onStateUpdateRef.current(state);
        activeCamPos = state.position;
      }

      // Update artifacts and landing beacons
      artifactsManager.update(elapsedTime);
      landingSite.update(elapsedTime);

      // Update atmosphere & dust particles around active camera position
      atmosphere.update(elapsedTime, activeCamPos);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Window Resizing
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      timer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (
          introPhaseRef.current === 'game' &&
          controllerRef.current &&
          !controllerRef.current.isPointerLocked
        ) {
          controllerRef.current.requestLock();
        }
      }}
      className="absolute inset-0 w-full h-full cursor-crosshair"
    />
  );
};
