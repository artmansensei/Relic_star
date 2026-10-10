/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MarsCanvas } from './mars/MarsCanvas';
import { FirstPersonController, PlayerState } from './mars/controls';
import { HUD } from './components/HUD';
import { ArtifactModal } from './components/ArtifactModal';
import { TransmissionModal } from './components/TransmissionModal';
import { MissionArchiveModal } from './components/MissionArchiveModal';
import { ControlsModal } from './components/ControlsModal';
import { MissionConsoleModal, ConsoleTab } from './components/MissionConsoleModal';
import { IntroCinematic, IntroPhase } from './components/IntroCinematic';
import { marsAudio } from './mars/audio';
import { ALL_ARTIFACTS, ARTIFACT_LIST, Artifact } from './data/artifacts';
import {
  loadPersistentMission,
  savePersistentMission,
  MissionState,
  PersistentMissionData,
} from './data/mission';

export default function App() {
  const controllerRef = useRef<FirstPersonController | null>(null);

  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Cinematic Intro Sequence State Machine: 'landing' -> 'welcome' -> 'game'
  const [introPhase, setIntroPhase] = useState<IntroPhase>('landing');
  const [skipIntroTrigger, setSkipIntroTrigger] = useState(0);

  // Track if game was paused prior to opening a modal so closing the modal restores exact prior state
  const wasPausedBeforeModalRef = useRef(false);
  const isOpeningModalRef = useRef(false);

  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isTransmissionModalOpen, setIsTransmissionModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleInitialTab, setConsoleInitialTab] = useState<ConsoleTab>('map');
  const [showVisorOverlay, setShowVisorOverlay] = useState(true);

  const isAnyModalOpen =
    isConsoleOpen ||
    isArchiveModalOpen ||
    isArtifactModalOpen ||
    isTransmissionModalOpen ||
    isControlsModalOpen;

  const isAnyModalOpenRef = useRef(false);
  const isPausedRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    isAnyModalOpenRef.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // Synchronize controller inputEnabled with active gameplay state
  useEffect(() => {
    if (controllerRef.current) {
      const isGameplayActive = !isPaused && !isAnyModalOpen && introPhase === 'game';
      controllerRef.current.setInputEnabled(isGameplayActive);
    }
  }, [isPaused, isAnyModalOpen, introPhase]);

  // Persistent Mission Progress for all 5 real NASA artifacts
  const [missionProgress, setMissionProgress] = useState<PersistentMissionData>(() => {
    return loadPersistentMission();
  });

  // Synchronous ref tracking already-discovered artifacts to guarantee discovery audio & state triggers exactly once per artifact
  const discoveredArtifactsRef = useRef<Set<string>>(
    new Set(
      Object.keys(loadPersistentMission()).filter((key) => {
        const item = loadPersistentMission()[key];
        return item?.isDiscovered;
      })
    )
  );

  // Sync ref whenever missionProgress changes
  useEffect(() => {
    Object.keys(missionProgress).forEach((key) => {
      if (missionProgress[key]?.isDiscovered) {
        discoveredArtifactsRef.current.add(key);
      }
    });
  }, [missionProgress]);

  // Target artifact for modal inspection and transmission
  const [modalArtifactId, setModalArtifactId] = useState<string>('mer_a_spirit');

  // Calculate campaign progression metrics across all 5 artifacts
  const missionState: MissionState = useMemo(() => {
    const keys = Object.keys(ALL_ARTIFACTS);
    let discovered = 0;
    let documented = 0;
    let transmitted = 0;
    let archived = 0;

    keys.forEach((key) => {
      const p = missionProgress[key];
      if (p?.isDiscovered) discovered++;
      if (p?.isDocumented) documented++;
      if (p?.isTransmitted) transmitted++;
      if (p?.isArchived) archived++;
    });

    return {
      artifactsDiscovered: discovered,
      artifactsDocumented: documented,
      artifactsTransmitted: transmitted,
      artifactsArchived: archived,
      totalArtifacts: 5,
    };
  }, [missionProgress]);

  // Initial player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: { x: 0, y: 1.75, z: 0 } as any,
    headingDeg: 140,
    pitchDeg: 0,
    isMoving: false,
    isSprinting: false,
    isGrounded: true,
    speed: 0,
    distanceFromStart: 0,
    baseBearingDeg: 180,
    isAtLandingBase: true,
    activeArtifact: {
      id: 'mer_a_spirit',
      name: 'Spirit Rover',
      designation: 'NASA MER-A',
      site: 'Gusev Crater',
      type: 'rover',
      distance: 284,
      bearingDeg: 48,
      relativeDirectionStr: 'AHEAD',
      confidence: 0,
      isIdentified: false,
      isVisualContact: false,
      isClose: false,
      isLocked: false,
      stage: 'no_signal',
      worldPosition: ALL_ARTIFACTS.mer_a_spirit.worldPosition,
    },
    distanceToRover: 284,
    bearingToRoverDeg: 48,
    isTargetLocked: false,
    isCloseToRover: false,
    latStr: '18.4412° N',
    lonStr: '77.4589° E',
    altitudeM: 0,
    oxygen: 100,
    isOxygenLow: false,
    isOxygenCritical: false,
    energy: 100,
    isEnergyLow: false,
    isEnergyDepleted: false,
    life: 100,
    signal: 100,
    scannerActive: false,
    scannerTelemetry: {
      target: 'NO ANOMALY IN SCANNER RANGE (>260M)',
      signatureType: 'BACKGROUND AMBIENT NOISE',
      distance: 284,
      bearingDeg: 48,
      relativeDirectionStr: 'AHEAD',
      confidence: 0,
      isIdentified: false,
      stage: 'no_signal',
    },
    elapsedTimeSec: 0,
    missionSolStr: 'SOL 01 — 00:00:00 MET',
    scannerEnergyConsumed: 0,
    roverSimCoords: {
      latStr: '18.4632° N',
      lonStr: '77.4769° E',
      altitudeM: 3.2,
      x: 180,
      y: 3.2,
      z: -220,
    },
  });

  // Track discovery milestone when player gets close to any artifact for the first time
  const handleStateUpdate = useCallback((state: PlayerState) => {
    setPlayerState(state);

    const activeId = state.activeArtifact.id;

    if (state.activeArtifact.isClose && !discoveredArtifactsRef.current.has(activeId)) {
      // Synchronously mark in ref to prevent duplicate triggers across animation frames
      discoveredArtifactsRef.current.add(activeId);

      const today = new Date().toISOString().split('T')[0];
      setMissionProgress((prev) => {
        const next = {
          ...prev,
          [activeId]: {
            ...(prev[activeId] || {
              isDiscovered: false,
              isDocumented: false,
              isTransmitted: false,
              isArchived: false,
            }),
            isDiscovered: true,
            discoveredAt: today,
          },
        };
        savePersistentMission(next);
        return next;
      });
      marsAudio.playDiscoveryChime();
    }
  }, []);

  const handleLockChange = useCallback((locked: boolean) => {
    setIsPointerLocked(locked);
    if (locked) {
      setHasStarted(true);
      setIsPaused(false);
    } else {
      // If a modal is opening or currently open, pointer lock was released for modal UI; DO NOT PAUSE!
      if (isOpeningModalRef.current || isAnyModalOpenRef.current) {
        return;
      }
      // If game has not started yet, do not trigger pause
      if (!hasStartedRef.current) {
        return;
      }
      // Released while in normal exploration with no modal open -> intentional pause (e.g. ESC)
      setIsPaused(true);
    }
  }, []);

  // Modal open helper: saves current pause state and releases pointer lock without triggering pause
  const openModal = useCallback((openFn: () => void) => {
    wasPausedBeforeModalRef.current = isPausedRef.current;
    isOpeningModalRef.current = true;
    openFn();
    if (controllerRef.current) {
      controllerRef.current.unlock();
    }
    setTimeout(() => {
      isOpeningModalRef.current = false;
    }, 150);
  }, []);

  // Modal close helper: closes modals and restores exact prior gameplay pause state
  const handleCloseAllModals = useCallback(() => {
    setIsConsoleOpen(false);
    setIsArchiveModalOpen(false);
    setIsArtifactModalOpen(false);
    setIsTransmissionModalOpen(false);
    setIsControlsModalOpen(false);

    if (wasPausedBeforeModalRef.current) {
      // Was already paused prior to opening this modal -> stay paused
      setIsPaused(true);
    } else {
      // Was playing prior to opening this modal -> resume exploration immediately!
      setIsPaused(false);
      if (controllerRef.current) {
        controllerRef.current.requestLock();
      }
    }
  }, []);

  const handleResume = useCallback(() => {
    marsAudio.init();
    marsAudio.resume();
    setIsPaused(false);
    setHasStarted(true);
    if (controllerRef.current) {
      controllerRef.current.requestLock();
    }
  }, []);

  const handleLandingComplete = useCallback(() => {
    setIntroPhase('welcome');
  }, []);

  const handleSkipLanding = useCallback(() => {
    setSkipIntroTrigger((prev) => prev + 1);
    setIntroPhase('welcome');
  }, []);

  const handleBeginExpedition = useCallback(() => {
    setIntroPhase('game');
    setHasStarted(true);
    setIsPaused(false);
    marsAudio.init();
    marsAudio.resume();
    if (controllerRef.current) {
      controllerRef.current.setInputEnabled(true);
      controllerRef.current.requestLock();
    }
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    if (controllerRef.current) {
      controllerRef.current.unlock();
    }
  }, []);

  const handleRequestLock = useCallback(() => {
    handleResume();
  }, [handleResume]);

  const handleResetPosition = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.teleportToLanding();
    }
  }, []);

  const handleToggleScanner = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.toggleScanner();
    }
  }, []);

  // Open Artifact Modal
  const handleOpenArtifact = useCallback(
    (artId?: string) => {
      openModal(() => {
        marsAudio.playTargetLock();
        const targetArtId = artId || playerState.activeArtifact.id;
        setModalArtifactId(targetArtId);
        setIsArtifactModalOpen(true);
      });
    },
    [openModal, playerState.activeArtifact.id]
  );

  // Open Transmission Modal
  const handleOpenTransmission = useCallback(
    (artId?: string) => {
      openModal(() => {
        const targetArtId = artId || modalArtifactId || playerState.activeArtifact.id;
        setModalArtifactId(targetArtId);
        setIsArtifactModalOpen(false);
        setIsArchiveModalOpen(false);
        setIsTransmissionModalOpen(true);
      });
    },
    [openModal, modalArtifactId, playerState.activeArtifact.id]
  );

  // Open Mission Archive Modal
  const handleOpenArchive = useCallback(() => {
    openModal(() => {
      setIsArtifactModalOpen(false);
      setIsTransmissionModalOpen(false);
      setIsArchiveModalOpen(true);
    });
  }, [openModal]);

  // Open Unified Mission Console
  const handleOpenConsole = useCallback(
    (tab: ConsoleTab = 'map') => {
      openModal(() => {
        marsAudio.playComponentSelect();
        setConsoleInitialTab(tab);
        setIsArtifactModalOpen(false);
        setIsTransmissionModalOpen(false);
        setIsArchiveModalOpen(false);
        setIsControlsModalOpen(false);
        setIsConsoleOpen(true);
      });
    },
    [openModal]
  );

  // Document discovery for an artifact permanently
  const handleDocumentDiscovery = useCallback((artId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMissionProgress((prev) => {
      const next = {
        ...prev,
        [artId]: {
          ...(prev[artId] || {
            isDiscovered: true,
            isDocumented: false,
            isTransmitted: false,
            isArchived: false,
          }),
          isDiscovered: true,
          isDocumented: true,
          documentedAt: today,
        },
      };
      savePersistentMission(next);
      return next;
    });
    marsAudio.playDiscoveryChime();
  }, []);

  // Transmission completed & archived for an artifact
  const handleTransmissionComplete = useCallback((artId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMissionProgress((prev) => {
      const next = {
        ...prev,
        [artId]: {
          ...(prev[artId] || {
            isDiscovered: true,
            isDocumented: true,
            isTransmitted: false,
            isArchived: false,
          }),
          isDiscovered: true,
          isDocumented: true,
          isTransmitted: true,
          isArchived: true,
          transmittedAt: today,
          archivedAt: today,
        },
      };
      savePersistentMission(next);
      return next;
    });
  }, []);

  // Active artifact data and status
  const currentActiveArtifact: Artifact = useMemo(() => {
    return ALL_ARTIFACTS[playerState.activeArtifact.id] || ALL_ARTIFACTS.mer_a_spirit;
  }, [playerState.activeArtifact.id]);

  const modalArtifact: Artifact = useMemo(() => {
    return ALL_ARTIFACTS[modalArtifactId] || ALL_ARTIFACTS.mer_a_spirit;
  }, [modalArtifactId]);

  const activeProgress = missionProgress[playerState.activeArtifact.id] || {
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  };

  const modalProgress = missionProgress[modalArtifactId] || {
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  };

  // Check if any documented artifact is ready to transmit
  const anyDocumentedReadyToTransmit = useMemo(() => {
    return Object.values(missionProgress).some((p) => p.isDocumented && !p.isTransmitted);
  }, [missionProgress]);

  // Global hotkeys for exploration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intro sequence keyboard handling
      if (introPhase !== 'game') {
        if (e.key === ' ' || e.key === 'Escape') {
          if (introPhase === 'landing') {
            e.preventDefault();
            handleSkipLanding();
          }
        } else if (e.key === 'Enter') {
          if (introPhase === 'welcome') {
            e.preventDefault();
            handleBeginExpedition();
          }
        }
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        if (
          playerState.activeArtifact.isClose &&
          !isArtifactModalOpen &&
          !isTransmissionModalOpen &&
          !isArchiveModalOpen
        ) {
          handleOpenArtifact(playerState.activeArtifact.id);
        }
      } else if (e.key === 't' || e.key === 'T') {
        if (anyDocumentedReadyToTransmit && !isTransmissionModalOpen) {
          // If active artifact is documented, transmit it, otherwise find the first documented artifact
          const readyId =
            activeProgress.isDocumented && !activeProgress.isTransmitted
              ? playerState.activeArtifact.id
              : Object.keys(missionProgress).find(
                  (k) => missionProgress[k].isDocumented && !missionProgress[k].isTransmitted
                ) || playerState.activeArtifact.id;
          handleOpenTransmission(readyId);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (!isArtifactModalOpen && !isTransmissionModalOpen) {
          if (isConsoleOpen && consoleInitialTab === 'map') {
            handleCloseAllModals();
          } else {
            handleOpenConsole('map');
          }
        }
      } else if (e.key === 'x' || e.key === 'X') {
        if (!isArtifactModalOpen && !isTransmissionModalOpen) {
          if (isConsoleOpen && consoleInitialTab === 'archive') {
            handleCloseAllModals();
          } else {
            handleOpenConsole('archive');
          }
        }
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        if (!isConsoleOpen) {
          handleOpenConsole('guide');
        } else {
          handleCloseAllModals();
        }
      } else if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          handleCloseAllModals();
        } else if (!isPaused) {
          handlePause();
        } else {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    introPhase,
    handleSkipLanding,
    handleBeginExpedition,
    playerState.activeArtifact.isClose,
    playerState.activeArtifact.id,
    activeProgress.isDocumented,
    activeProgress.isTransmitted,
    isArtifactModalOpen,
    isTransmissionModalOpen,
    isArchiveModalOpen,
    isControlsModalOpen,
    isConsoleOpen,
    consoleInitialTab,
    isAnyModalOpen,
    isPaused,
    anyDocumentedReadyToTransmit,
    missionProgress,
    handleOpenArtifact,
    handleOpenTransmission,
    handleOpenArchive,
    handleOpenConsole,
    handleCloseAllModals,
    handlePause,
    handleResume,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] select-none">
      {/* 3D Mars Exploration Canvas Viewport (Always active in background) */}
      <MarsCanvas
        onStateUpdate={handleStateUpdate}
        onLockChange={handleLockChange}
        controllerRef={controllerRef}
        introPhase={introPhase}
        onLandingComplete={handleLandingComplete}
        skipIntroTrigger={skipIntroTrigger}
      />

      {/* Cinematic Mars Landing Sequence & Welcome Overlay */}
      <IntroCinematic
        introPhase={introPhase}
        onSkipLanding={handleSkipLanding}
        onBeginExpedition={handleBeginExpedition}
      />

      {/* Ares EVA Heads-Up Display Overlay */}
      <HUD
        playerState={playerState}
        isPointerLocked={isPointerLocked}
        isPaused={isPaused}
        hasStarted={hasStarted}
        isAnyModalOpen={isAnyModalOpen}
        introPhase={introPhase}
        onRequestLock={handleResume}
        onResume={handleResume}
        onResetPosition={handleResetPosition}
        onToggleScanner={handleToggleScanner}
        onOpenArtifactModal={() => handleOpenArtifact(playerState.activeArtifact.id)}
        onOpenControlsModal={() => handleOpenConsole('guide')}
        onOpenConsole={(tab) => handleOpenConsole(tab)}
        missionState={missionState}
        activeArtifactDocumented={activeProgress.isDocumented}
        activeArtifactTransmitted={activeProgress.isTransmitted}
        activeArtifactArchived={activeProgress.isArchived}
        onOpenTransmission={() => handleOpenTransmission(playerState.activeArtifact.id)}
        onOpenArchive={() => handleOpenConsole('archive')}
        showVisorOverlay={showVisorOverlay}
      />

      {/* Unified NASA Mission Console Modal */}
      <MissionConsoleModal
        isOpen={isConsoleOpen}
        onClose={handleCloseAllModals}
        initialTab={consoleInitialTab}
        playerState={playerState}
        missionState={missionState}
        missionProgress={missionProgress}
        onOpenArtifactReport={(artId) => handleOpenArtifact(artId)}
        onOpenTransmission={(artId) => handleOpenTransmission(artId)}
        onResetPosition={handleResetPosition}
        showVisorOverlay={showVisorOverlay}
        onToggleVisor={() => setShowVisorOverlay((v) => !v)}
      />

      {/* Artifact Investigation & Dossier Modal */}
      <ArtifactModal
        isOpen={isArtifactModalOpen}
        onClose={handleCloseAllModals}
        artifact={modalArtifact}
        playerState={playerState}
        isDocumented={modalProgress.isDocumented}
        isTransmitted={modalProgress.isTransmitted}
        isArchived={modalProgress.isArchived}
        onDocumentDiscovery={handleDocumentDiscovery}
        onOpenTransmission={(artId) => handleOpenTransmission(artId)}
        onOpenArchive={() => handleOpenConsole('archive')}
      />

      {/* Mars-to-Earth Data Transmission Interface Modal */}
      <TransmissionModal
        isOpen={isTransmissionModalOpen}
        onClose={handleCloseAllModals}
        artifact={modalArtifact}
        playerState={playerState}
        onTransmissionComplete={handleTransmissionComplete}
        onOpenArchive={() => handleOpenConsole('archive')}
      />

      {/* NASA PDS Exploration Mission Archive Modal (Preserved for compatibility) */}
      <MissionArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={handleCloseAllModals}
        missionState={missionState}
        missionProgress={missionProgress}
        onOpenArtifactReport={(artId) => handleOpenArtifact(artId)}
        onOpenTransmission={(artId) => handleOpenTransmission(artId)}
      />

      {/* Controls & Systems Guide Modal (Preserved for compatibility) */}
      <ControlsModal
        isOpen={isControlsModalOpen}
        onClose={handleCloseAllModals}
      />
    </div>
  );
}
