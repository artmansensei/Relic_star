import * as THREE from 'three';
import { getTerrainHeight } from './terrain';
import { ALL_ARTIFACTS, ARTIFACT_LIST, Artifact } from '../data/artifacts';
import { marsAudio } from './audio';

export type ScannerDetectionStage =
  | 'no_signal'
  | 'weak_anomaly'
  | 'human_signal'
  | 'identified'
  | 'locked';

export interface ScannerTelemetry {
  target: string;
  signatureType: string;
  distance: number;
  bearingDeg: number;
  relativeDirectionStr: string;
  confidence: number;
  isIdentified: boolean;
  stage: ScannerDetectionStage;
}

export interface RoverSimCoords {
  latStr: string;
  lonStr: string;
  altitudeM: number;
  x: number;
  y: number;
  z: number;
}

export interface ActiveArtifactTelemetry {
  id: string;
  name: string;
  designation: string;
  site: string;
  type: 'rover' | 'stationary_lander';
  distance: number;
  bearingDeg: number;
  relativeDirectionStr: string;
  confidence: number;
  isIdentified: boolean;
  isVisualContact: boolean;
  isClose: boolean;
  isLocked: boolean;
  stage: ScannerDetectionStage;
  worldPosition: { x: number; y: number; z: number };
}

export interface PlayerState {
  position: THREE.Vector3;
  headingDeg: number;
  pitchDeg: number;
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  speed: number;
  distanceFromStart: number;
  baseBearingDeg: number;
  isAtLandingBase: boolean;

  // Active nearest artifact tracking
  activeArtifact: ActiveArtifactTelemetry;

  // Legacy compatibility fields (mirrors active artifact)
  distanceToRover: number;
  bearingToRoverDeg: number;
  isTargetLocked: boolean;
  isCloseToRover: boolean;

  latStr: string;
  lonStr: string;
  altitudeM: number;

  // Real-time gameplay systems
  oxygen: number;
  isOxygenLow: boolean;
  isOxygenCritical: boolean;
  energy: number;
  isEnergyLow: boolean;
  isEnergyDepleted: boolean;
  life: number;
  signal: number;
  scannerActive: boolean;
  scannerTelemetry: ScannerTelemetry;

  // Mission timeline and resource metrics
  elapsedTimeSec: number;
  missionSolStr: string;
  scannerEnergyConsumed: number;
  roverSimCoords: RoverSimCoords;
}

export class FirstPersonController {
  public camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  // Position & physics
  public position: THREE.Vector3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private verticalVelocity: number = 0;
  private isGrounded: boolean = true;
  private headBobTimer: number = 0;
  private landingCushion: number = 0;

  // View angles (radians)
  private yaw: number = 0;
  private pitch: number = 0;

  // Pointer lock state
  public isLocked: boolean = false;
  private onLockChangeCallback?: (locked: boolean) => void;

  // Key states
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  };

  // Systems State
  public oxygen: number = 100;
  public energy: number = 100;
  public life: number = 100;
  public scannerActive: boolean = false;
  public scannerEnergyConsumed: number = 0;
  public elapsedTimeSec: number = 0;
  private inputEnabled: boolean = true;

  // Edge-triggered audio state machine for artifact proximity stages
  private proximityAudioState: {
    artifactId: string | null;
    stage: 'outside' | 'visual_contact' | 'target_locked';
  } = {
    artifactId: null,
    stage: 'outside',
  };

  // Astronaut Spacesuit Physics Constants (Weighted for 0.38g Mars Gravity)
  private readonly EYE_HEIGHT = 1.75;
  private readonly WALK_SPEED = 4.0; // m/s (~14.4 km/h brisk EVA stride)
  private readonly SPRINT_SPEED = 7.2; // m/s (~26 km/h EVA propulsion sprint)
  private readonly ACCELERATION = 16.0; // Responsive, intentional spacesuit stride
  private readonly FRICTION = 16.0; // Firm regolith grip without slippery sliding
  private readonly MARS_GRAVITY = 5.8; // 0.38g gives sustained, buoyant arcs
  private readonly JUMP_FORCE = 4.4; // Controlled, lofty low-gravity hop

  // Base coordinates for landing site (Jezero Crater quad)
  private readonly BASE_LAT = 18.4412;
  private readonly BASE_LON = 77.4589;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Start player at (0, 0)
    const startY = getTerrainHeight(0, 0);
    this.position = new THREE.Vector3(0, startY + this.EYE_HEIGHT, 0);
    this.camera.position.copy(this.position);

    // Initial heading facing toward the northeast dunes (azimuth ~48°)
    this.yaw = Math.PI * 0.76;
    this.updateCameraRotation();

    this.bindEvents();
  }

  public get isPointerLocked(): boolean {
    return this.isLocked;
  }

  public setInputEnabled(enabled: boolean) {
    this.inputEnabled = enabled;
    if (!enabled) {
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.sprint = false;
      this.keys.jump = false;
      this.velocity.set(0, 0, 0);
    }
  }

  public getInputEnabled(): boolean {
    return this.inputEnabled;
  }

  public setOnLockChange(callback: (locked: boolean) => void) {
    this.onLockChangeCallback = callback;
  }

  public requestLock() {
    this.domElement.requestPointerLock();
    marsAudio.init();
    marsAudio.resume();
  }

  public unlock() {
    document.exitPointerLock();
  }

  public toggleScanner(): boolean {
    if (this.energy <= 2 && !this.scannerActive) {
      return false;
    }
    this.scannerActive = !this.scannerActive;
    marsAudio.playScannerToggle(this.scannerActive);
    return this.scannerActive;
  }

  public teleportToLanding() {
    const startY = getTerrainHeight(0, 0);
    this.position.set(0, startY + this.EYE_HEIGHT, 0);
    this.velocity.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.yaw = Math.PI * 0.76;
    this.pitch = 0;
    this.oxygen = 100; // Replenish at base
    this.energy = 100;
    this.proximityAudioState = {
      artifactId: null,
      stage: 'outside',
    };
    this.updateCameraRotation();
    marsAudio.playFootstep();
  }

  public resetPosition() {
    this.teleportToLanding();
  }

  private bindEvents() {
    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === this.domElement;
      this.isLocked = locked;
      if (this.onLockChangeCallback) {
        this.onLockChangeCallback(locked);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked || !this.inputEnabled) return;

      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;

      // Restrict pitch (-85° to +85°)
      const maxPitch = (Math.PI / 2) * 0.94;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

      this.updateCameraRotation();
    });

    this.domElement.addEventListener('click', () => {
      if (this.inputEnabled && !this.isLocked) {
        this.requestLock();
      }
    });

    window.addEventListener('keydown', (e) => {
      this.onKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.onKey(e.code, false);
    });
  }

  private onKey(code: string, pressed: boolean) {
    if (!this.inputEnabled) return;
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = pressed;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = pressed;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = pressed;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = pressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = pressed;
        break;
      case 'Space':
        this.keys.jump = pressed;
        break;
      case 'KeyF':
        if (pressed) this.toggleScanner();
        break;
    }
  }

  private updateCameraRotation() {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);
  }

  public update(dt: number): PlayerState {
    const delta = Math.min(dt, 0.1);

    // If input is disabled (paused or modal open), prevent movement input
    if (!this.inputEnabled) {
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.sprint = false;
      this.keys.jump = false;
    }

    // 1. Calculate Input Directions Relative to View Yaw
    const moveVector = new THREE.Vector3();
    if (this.keys.forward) moveVector.z -= 1;
    if (this.keys.backward) moveVector.z += 1;
    if (this.keys.left) moveVector.x -= 1;
    if (this.keys.right) moveVector.x += 1;

    const isMovingInput = moveVector.lengthSq() > 0.001;
    if (isMovingInput) moveVector.normalize();

    // Rotate input by yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const desiredDirection = new THREE.Vector3()
      .addScaledVector(forward, -moveVector.z)
      .addScaledVector(right, moveVector.x);

    // 2. Sprinting & Energy Rules
    const wantsToSprint = this.keys.sprint && isMovingInput && this.energy > 3;
    const isActivelySprinting = wantsToSprint && this.isGrounded;
    const targetSpeed = isActivelySprinting ? this.SPRINT_SPEED : this.WALK_SPEED;

    const targetVelocity = desiredDirection.multiplyScalar(targetSpeed);

    // Smooth inertia acceleration and deceleration for heavy astronaut spacesuit
    const accelRate = isMovingInput ? this.ACCELERATION : this.FRICTION;
    this.velocity.lerp(targetVelocity, Math.min(1.0, accelRate * delta));

    // Jump Physics (0.38g Martian gravity allows high, graceful leaps)
    if (this.keys.jump && this.isGrounded && this.energy > 4) {
      this.verticalVelocity = this.JUMP_FORCE;
      this.isGrounded = false;
      this.energy = Math.max(0, this.energy - 3.2);
      marsAudio.playJump();
    }

    // Apply Martian Gravity
    this.verticalVelocity -= this.MARS_GRAVITY * delta;

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.position.y += this.verticalVelocity * delta;

    // Clamp to expanded 1000m planetary domain (-480m to +480m)
    const MAX_BOUND = 480;
    this.position.x = Math.max(-MAX_BOUND, Math.min(MAX_BOUND, this.position.x));
    this.position.z = Math.max(-MAX_BOUND, Math.min(MAX_BOUND, this.position.z));

    // Ground Collision Detection
    const groundY = getTerrainHeight(this.position.x, this.position.z);
    const targetGroundEyeLevel = groundY + this.EYE_HEIGHT;

    if (this.position.y <= targetGroundEyeLevel) {
      if (!this.isGrounded) {
        if (this.verticalVelocity < -1.6) {
          marsAudio.playLand();
          // Absorptive knee-bend cushion in heavy spacesuit under Mars gravity
          this.landingCushion = Math.min(0.08, Math.abs(this.verticalVelocity) * 0.016);
        }
      }
      this.position.y = targetGroundEyeLevel;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // Recover landing cushion smoothly
    if (this.landingCushion > 0.001) {
      this.landingCushion = THREE.MathUtils.lerp(this.landingCushion, 0, Math.min(1.0, delta * 12));
    } else {
      this.landingCushion = 0;
    }

    // Camera Head Bobbing while walking
    const horizontalSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
    if (this.isGrounded && horizontalSpeed > 0.3) {
      const bobFreq = isActivelySprinting ? 11.5 : 7.2;
      this.headBobTimer += delta * bobFreq;
      const bobAmount = isActivelySprinting ? 0.038 : 0.020;
      this.camera.position.y = this.position.y + Math.sin(this.headBobTimer) * bobAmount - this.landingCushion;

      // Natural footstep timing (paced for spacesuit locomotion)
      if (Math.sin(this.headBobTimer) < -0.94) {
        marsAudio.playFootstep(isActivelySprinting);
      }
    } else {
      this.headBobTimer = 0;
      this.camera.position.y = this.position.y - this.landingCushion;
    }

    this.camera.position.x = this.position.x;
    this.camera.position.z = this.position.z;

    // Check Safe Zone (Landing Site at (0, 0), radius 16m)
    const distanceFromStart = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);
    const isAtLandingBase = distanceFromStart < 16;

    // 4. Oxygen System Logic: balanced for extended scientific exploration across 1100m
    if (isAtLandingBase) {
      // Safe base refills O₂ supply quickly
      this.oxygen = Math.min(100, this.oxygen + 15.0 * delta);
    } else {
      // Normal walking: ~41 minutes of continuous exploration; Sprint: ~21 minutes
      const o2Drain = isActivelySprinting ? 0.078 : 0.040;
      this.oxygen = Math.max(0, this.oxygen - o2Drain * delta);
    }

    const isOxygenLow = this.oxygen < 25;
    const isOxygenCritical = this.oxygen < 10;

    // 5. Energy System Logic
    this.elapsedTimeSec += delta;

    if (isAtLandingBase) {
      this.energy = Math.min(100, this.energy + 25.0 * delta);
    } else {
      if (isActivelySprinting) {
        this.energy = Math.max(0, this.energy - 2.2 * delta);
      }
      if (this.scannerActive) {
        const drain = 1.0 * delta;
        this.energy = Math.max(0, this.energy - drain);
        this.scannerEnergyConsumed += drain;
        if (this.energy <= 0) {
          this.scannerActive = false;
          marsAudio.playScannerToggle(false);
        }
      }
      if (!isActivelySprinting && !this.scannerActive) {
        // Fast energy recharge when resting or normal walking
        this.energy = Math.min(100, this.energy + 3.8 * delta);
      }
    }

    const isEnergyLow = this.energy < 20;
    const isEnergyDepleted = this.energy <= 0;

    // 6. Player Life Logic
    if (this.oxygen <= 0) {
      this.life = Math.max(0, this.life - 2.5 * delta);
    } else if (isAtLandingBase && this.life < 100) {
      this.life = Math.min(100, this.life + 8.0 * delta);
    }

    // 7. Distance & Communication Signal Calculations across 1000m
    // Signal ranges from 100% at base to ~22% at 450m perimeter
    const rawSignal = 100 - (distanceFromStart / 480) * 78;
    const signal = Math.max(15, Math.min(100, Math.round(rawSignal)));

    // 8. Find Closest Mars Artifact among the 5
    let activeArtifactData: Artifact = ARTIFACT_LIST[0];
    let minArtifactDist = Infinity;

    ARTIFACT_LIST.forEach((art) => {
      const dist = Math.sqrt(
        (art.worldPosition.x - this.position.x) ** 2 +
        (art.worldPosition.z - this.position.z) ** 2
      );
      if (dist < minArtifactDist) {
        minArtifactDist = dist;
        activeArtifactData = art;
      }
    });

    const activeArtPos = activeArtifactData.worldPosition;
    const activeArtVec = new THREE.Vector3(activeArtPos.x, activeArtPos.y, activeArtPos.z);
    const distanceToActive = this.position.distanceTo(activeArtVec);

    // Bearing & Relative Vector
    const currentHeadingDeg = ((this.yaw * 180) / Math.PI + 360) % 360;
    const currentPitchDeg = (this.pitch * 180) / Math.PI;

    const dx = activeArtPos.x - this.position.x;
    const dz = activeArtPos.z - this.position.z;
    const artAngleRad = Math.atan2(dx, -dz);
    const artBearingDeg = ((artAngleRad * 180) / Math.PI + 360) % 360;

    // Bearing back to Expedition Landing Base at (0, 0)
    const baseDx = -this.position.x;
    const baseDz = -this.position.z;
    const baseAngleRad = Math.atan2(baseDx, -baseDz);
    const baseBearingDeg = ((baseAngleRad * 180) / Math.PI + 360) % 360;

    const lookAngleRad = (Math.PI * 2 - this.yaw) % (Math.PI * 2);
    const lookAngleDeg = ((lookAngleRad * 180) / Math.PI + 360) % 360;
    const relativeAngle = ((artBearingDeg - lookAngleDeg + 180) % 360) - 180;

    let relativeDirectionStr = 'AHEAD';
    if (Math.abs(relativeAngle) < 18) {
      relativeDirectionStr = 'AHEAD';
    } else if (relativeAngle >= 18 && relativeAngle < 75) {
      relativeDirectionStr = `${Math.round(relativeAngle)}° RIGHT`;
    } else if (relativeAngle >= 75 && relativeAngle < 135) {
      relativeDirectionStr = 'RIGHT FLANK';
    } else if (relativeAngle <= -18 && relativeAngle > -75) {
      relativeDirectionStr = `${Math.round(Math.abs(relativeAngle))}° LEFT`;
    } else if (relativeAngle <= -75 && relativeAngle > -135) {
      relativeDirectionStr = 'LEFT FLANK';
    } else {
      relativeDirectionStr = 'BEHIND';
    }

    // 9. PROGRESSIVE DETECTION STAGES (Strict spatial progression based on distance)
    // - Far (> 260m): NO SIGNIFICANT ANOMALY DETECTED (Confidence 0%)
    // - Medium (130m - 260m): WEAK ANOMALOUS SIGNATURE (Confidence 15–30%, bearing & approximate range)
    // - Close (85m - 130m): UNKNOWN ARTIFICIAL SIGNATURE (Confidence 35–60%)
    // - Close (48m - 85m): LIKELY HUMAN-MADE HARDWARE (Confidence 60–80%)
    // - Visual Contact (12m - 48m): ARTIFACT CLASSIFICATION (Confidence 80–90%, structural description)
    // - Proximity (< 12m): TARGET LOCKED with Mission Designation & Name
    let stage: ScannerDetectionStage = 'no_signal';
    let targetLabel = 'NO SIGNIFICANT ANOMALY DETECTED';
    let signatureType = 'AMBIENT MARTIAN BACKGROUND NOISE';
    let confidence = 0;
    let isIdentified = false;

    if (distanceToActive < 12) {
      stage = 'locked';
      targetLabel = `IDENTIFIED: ${activeArtifactData.designation} (${activeArtifactData.name.toUpperCase()})`;
      signatureType = `AUTHENTIC ${activeArtifactData.historical.agency.toUpperCase()} HARDWARE`;
      confidence = 99.8;
      isIdentified = true;
    } else if (distanceToActive <= 48) {
      stage = 'identified';
      targetLabel =
        activeArtifactData.type === 'stationary_lander'
          ? 'STATIONARY LANDER STRUCTURE'
          : 'ROVER-LIKE MECHANICAL STRUCTURE';
      signatureType =
        activeArtifactData.type === 'stationary_lander'
          ? 'TRIPOD LANDING STRUTS & SOLAR BUS'
          : 'GROUND MOBILITY ROCKER-BOGIE CHASSIS';
      confidence = Math.round(80 + (1.0 - (distanceToActive - 12) / 36) * 10);
      isIdentified = false; // Only structural classification, not yet identified as specific mission!
    } else if (distanceToActive <= 85) {
      stage = 'human_signal';
      targetLabel = 'LIKELY HUMAN-MADE HARDWARE';
      signatureType = 'ACTIVE / PASSIVE AVIONICS HARNESS';
      confidence = Math.round(60 + (1.0 - (distanceToActive - 48) / 37) * 20);
      isIdentified = false;
    } else if (distanceToActive <= 130) {
      stage = 'human_signal';
      targetLabel = 'UNKNOWN ARTIFICIAL SIGNATURE';
      signatureType = 'METALLIC COMPONENT / RF EMISSION';
      confidence = Math.round(35 + (1.0 - (distanceToActive - 85) / 45) * 25);
      isIdentified = false;
    } else if (distanceToActive <= 260) {
      stage = 'weak_anomaly';
      targetLabel = 'WEAK ANOMALOUS SIGNATURE';
      signatureType = 'FAINT RF / THERMAL DISCONTINUITY';
      confidence = Math.round(15 + (1.0 - (distanceToActive - 130) / 130) * 15);
      isIdentified = false;
    } else {
      stage = 'no_signal';
      targetLabel = 'NO SIGNIFICANT ANOMALY DETECTED';
      signatureType = 'AMBIENT MARTIAN BACKGROUND NOISE';
      confidence = 0;
      isIdentified = false;
    }

    const isCloseToActive = distanceToActive < 12;
    const isTargetLocked = distanceToActive < 12;
    const isVisualContact = distanceToActive >= 12 && distanceToActive <= 48;

    // Edge-triggered proximity detection audio
    let currentProximityStage: 'outside' | 'visual_contact' | 'target_locked' = 'outside';
    if (isTargetLocked) {
      currentProximityStage = 'target_locked';
    } else if (isVisualContact) {
      currentProximityStage = 'visual_contact';
    } else {
      currentProximityStage = 'outside';
    }

    const prevStage = this.proximityAudioState.stage;
    const prevArtifactId = this.proximityAudioState.artifactId;
    const isSameArtifact = prevArtifactId === activeArtifactData.id;

    if (!isSameArtifact) {
      this.proximityAudioState.artifactId = activeArtifactData.id;
      this.proximityAudioState.stage = currentProximityStage;
      if (currentProximityStage === 'visual_contact') {
        marsAudio.playVisualContact();
      } else if (currentProximityStage === 'target_locked') {
        marsAudio.playTargetLock();
      }
    } else if (prevStage !== currentProximityStage) {
      if (currentProximityStage === 'visual_contact' && prevStage === 'outside') {
        marsAudio.playVisualContact();
      } else if (currentProximityStage === 'target_locked' && prevStage !== 'target_locked') {
        marsAudio.playTargetLock();
      }
      this.proximityAudioState.stage = currentProximityStage;
    }

    // Dynamic coordinates in local planetary frame
    const currentLat = this.BASE_LAT + this.position.z * -0.0001;
    const currentLon = this.BASE_LON + this.position.x * 0.0001;
    const altitudeM = groundY;

    const artLat = this.BASE_LAT + activeArtPos.z * -0.0001;
    const artLon = this.BASE_LON + activeArtPos.x * 0.0001;

    // Format mission exploration time
    const totalSec = Math.floor(this.elapsedTimeSec);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const timeFormatted = `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const missionSolStr = `SOL 01 — ${timeFormatted} MET`;

    const activeArtifact: ActiveArtifactTelemetry = {
      id: activeArtifactData.id,
      name: activeArtifactData.name,
      designation: activeArtifactData.designation,
      site: activeArtifactData.site,
      type: activeArtifactData.type,
      distance: distanceToActive,
      bearingDeg: artBearingDeg,
      relativeDirectionStr,
      confidence,
      isIdentified,
      isVisualContact,
      isClose: isCloseToActive,
      isLocked: isTargetLocked,
      stage,
      worldPosition: activeArtPos,
    };

    return {
      position: this.position.clone(),
      headingDeg: currentHeadingDeg,
      pitchDeg: currentPitchDeg,
      isMoving: horizontalSpeed > 0.3,
      isSprinting: isActivelySprinting,
      isGrounded: this.isGrounded,
      speed: horizontalSpeed,
      distanceFromStart,
      baseBearingDeg,
      isAtLandingBase,

      activeArtifact,

      // Legacy compatibility
      distanceToRover: distanceToActive,
      bearingToRoverDeg: artBearingDeg,
      isTargetLocked,
      isCloseToRover: isCloseToActive,

      latStr: `${currentLat.toFixed(4)}° N`,
      lonStr: `${currentLon.toFixed(4)}° E`,
      altitudeM,

      // Live gameplay metrics
      oxygen: this.oxygen,
      isOxygenLow,
      isOxygenCritical,
      energy: this.energy,
      isEnergyLow,
      isEnergyDepleted,
      life: this.life,
      signal,
      scannerActive: this.scannerActive,
      scannerTelemetry: {
        target: targetLabel,
        signatureType,
        distance: distanceToActive,
        bearingDeg: artBearingDeg,
        relativeDirectionStr,
        confidence,
        isIdentified,
        stage,
      },

      // Mission timeline and resource metrics
      elapsedTimeSec: this.elapsedTimeSec,
      missionSolStr,
      scannerEnergyConsumed: this.scannerEnergyConsumed,
      roverSimCoords: {
        latStr: `${artLat.toFixed(4)}° N`,
        lonStr: `${artLon.toFixed(4)}° E`,
        altitudeM: activeArtPos.y,
        x: activeArtPos.x,
        y: activeArtPos.y,
        z: activeArtPos.z,
      },
    };
  }
}
