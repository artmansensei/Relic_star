import React, { useState, useMemo } from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  Radio,
  CheckCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Layers,
  ChevronRight,
  Database,
  Shield,
  Activity,
} from 'lucide-react';
import { PlayerState } from '../mars/controls';
import { PersistentMissionData } from '../data/mission';
import { ARTIFACT_LIST, Artifact } from '../data/artifacts';
import { marsAudio } from '../mars/audio';

interface MissionMapProps {
  playerState: PlayerState;
  missionProgress: PersistentMissionData;
  onSwitchToArchiveTab?: (artifactId?: string) => void;
}

// Convert degrees to 16-point cardinal direction string
function getCompassDirection(deg: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

// World coordinate bounds for the 1100m x 1100m quadrant
// Base is at (0, 0).
// -Z is North, +Z is South.
// +X is East, -X is West.
const WORLD_HALF_SIZE = 550; // -550 to +550
const SVG_VIEW_SIZE = 600; // viewBox 0 0 600 600
const SVG_PADDING = 38; // padding inside border for coordinate numbers
const USABLE_RADIUS = (SVG_VIEW_SIZE / 2) - SVG_PADDING; // 262px for 550m

function worldToSvg(x: number, z: number): { cx: number; cy: number } {
  const cx = SVG_VIEW_SIZE / 2 + (x / WORLD_HALF_SIZE) * USABLE_RADIUS;
  // -z is North (up), so negative z maps to smaller cy (top of SVG)
  const cy = SVG_VIEW_SIZE / 2 + (z / WORLD_HALF_SIZE) * USABLE_RADIUS;
  return { cx, cy };
}

export const MissionMap: React.FC<MissionMapProps> = ({
  playerState,
  missionProgress,
  onSwitchToArchiveTab,
}) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // STRICT RULE: Only discovered artifacts may appear anywhere on the map!
  const discoveredArtifacts = useMemo<Artifact[]>(() => {
    return ARTIFACT_LIST.filter((art: Artifact) => {
      const prog = missionProgress[art.id];
      return prog && prog.isDiscovered === true;
    });
  }, [missionProgress]);

  // Selected artifact data (if discovered)
  const selectedArtifact = useMemo(() => {
    if (!selectedArtifactId) return null;
    return discoveredArtifacts.find((a: Artifact) => a.id === selectedArtifactId) || null;
  }, [selectedArtifactId, discoveredArtifacts]);

  // Player position in SVG coordinates
  const playerSvg = worldToSvg(playerState.position.x, playerState.position.z);
  // Base clearing at (0, 0)
  const baseSvg = worldToSvg(0, 0);

  // Dynamic telemetry calculations for selected artifact
  const selectedTelemetry = useMemo(() => {
    if (!selectedArtifact) return null;
    const dx = selectedArtifact.worldPosition.x - playerState.position.x;
    const dz = selectedArtifact.worldPosition.z - playerState.position.z;
    const distance = Math.hypot(dx, dz);
    const angleRad = Math.atan2(dx, -dz);
    const bearingDeg = ((angleRad * 180) / Math.PI + 360) % 360;
    const compassDir = getCompassDirection(bearingDeg);
    const bearingStr = `${Math.round(bearingDeg).toString().padStart(3, '0')}° ${compassDir}`;

    // Relative angle to player heading
    const relAngle = ((bearingDeg - playerState.headingDeg + 180) % 360) - 180;
    let relStr = 'AHEAD';
    if (Math.abs(relAngle) < 18) {
      relStr = 'DIRECTLY AHEAD';
    } else if (relAngle >= 18 && relAngle < 75) {
      relStr = `${Math.round(relAngle)}° TO STARBOARD (RIGHT)`;
    } else if (relAngle >= 75 && relAngle < 135) {
      relStr = 'RIGHT FLANK';
    } else if (relAngle <= -18 && relAngle > -75) {
      relStr = `${Math.round(Math.abs(relAngle))}° TO PORT (LEFT)`;
    } else if (relAngle <= -75 && relAngle > -135) {
      relStr = 'LEFT FLANK';
    } else {
      relStr = 'ASTERN (BEHIND)';
    }

    const prog = missionProgress[selectedArtifact.id] || {
      isDiscovered: true,
      isDocumented: false,
      isTransmitted: false,
      isArchived: false,
    };

    return {
      distance,
      bearingDeg,
      bearingStr,
      relStr,
      progress: prog,
    };
  }, [selectedArtifact, playerState.position, playerState.headingDeg, missionProgress]);

  // Zoom controls
  const handleZoomIn = () => {
    marsAudio.playComponentSelect();
    setZoomLevel((prev) => Math.min(2.2, prev + 0.3));
  };

  const handleZoomOut = () => {
    marsAudio.playComponentSelect();
    setZoomLevel((prev) => Math.max(0.85, prev - 0.3));
  };

  const handleResetView = () => {
    marsAudio.playComponentSelect();
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCenterOnPlayer = () => {
    marsAudio.playTargetLock();
    // Center pan on player
    const svgCoords = worldToSvg(playerState.position.x, playerState.position.z);
    setPanOffset({
      x: (SVG_VIEW_SIZE / 2 - svgCoords.cx) * zoomLevel,
      y: (SVG_VIEW_SIZE / 2 - svgCoords.cy) * zoomLevel,
    });
  };

  const handleCenterOnBase = () => {
    marsAudio.playTargetLock();
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full select-none text-[#e2e2ea] font-mono-tech animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. TACTICAL 2D VECTOR MISSION MAP VIEWPORT                     */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col bg-[#06080d] rounded-xl border border-[#38bdf8]/30 shadow-2xl overflow-hidden relative min-h-[420px] lg:min-h-[500px]">
        {/* Top Header / Map Datum Bar */}
        <div className="px-3.5 py-2.5 bg-[#0a0d14]/95 border-b border-white/10 flex items-center justify-between text-xs shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
              SIMULATED MISSION WORLD // 1100M × 1100M JEZERO QUADRANT
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#87929a]">
            <span className="hidden sm:inline">DATUM: LOCAL TERRAIN (ORIGIN AT BASE)</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[#38bdf8] font-bold">
              {discoveredArtifacts.length} / 5 DISCOVERED
            </span>
          </div>
        </div>

        {/* Map Interactive Canvas */}
        <div className="relative flex-1 bg-[#05070c] overflow-hidden flex items-center justify-center p-1 sm:p-3">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(56, 189, 248, 0.08) 0, transparent 70%),
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 30px 30px, 30px 30px',
            }}
          />

          {/* SVG Tactical Vector Map */}
          <div
            className="relative w-full max-w-[580px] aspect-square transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              viewBox={`0 0 ${SVG_VIEW_SIZE} ${SVG_VIEW_SIZE}`}
              className="w-full h-full drop-shadow-2xl overflow-visible"
            >
              <defs>
                {/* Tactical Corner Bracket Pattern */}
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#0b0e14" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#05070c" stopOpacity="0.95" />
                </radialGradient>

                {/* Player FOV Gradient */}
                <radialGradient id="playerFov" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </radialGradient>

                {/* Base safe zone gradient */}
                <radialGradient id="baseZone" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Map Domain Background Circle */}
              <circle
                cx={SVG_VIEW_SIZE / 2}
                cy={SVG_VIEW_SIZE / 2}
                r={USABLE_RADIUS}
                fill="url(#mapGlow)"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeOpacity="0.3"
              />

              {/* Concentric Range Rings from Base Clearing (100m, 200m, 300m, 400m, 500m) */}
              {[100, 200, 300, 400, 500].map((radiusM) => {
                const r = (radiusM / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <g key={`ring-${radiusM}`}>
                    <circle
                      cx={SVG_VIEW_SIZE / 2}
                      cy={SVG_VIEW_SIZE / 2}
                      r={r}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="0.8"
                      strokeDasharray="4 6"
                      strokeOpacity="0.35"
                    />
                    {/* Ring Label along North axis */}
                    <text
                      x={SVG_VIEW_SIZE / 2 + 4}
                      y={SVG_VIEW_SIZE / 2 - r + 9}
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="monospace"
                      opacity="0.75"
                    >
                      {radiusM}M
                    </text>
                  </g>
                );
              })}

              {/* Crosshair Axes through Base (0, 0) */}
              <line
                x1={SVG_VIEW_SIZE / 2}
                y1={SVG_PADDING}
                x2={SVG_VIEW_SIZE / 2}
                y2={SVG_VIEW_SIZE - SVG_PADDING}
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.2"
                strokeDasharray="2 4"
              />
              <line
                x1={SVG_PADDING}
                y1={SVG_VIEW_SIZE / 2}
                x2={SVG_VIEW_SIZE - SVG_PADDING}
                y2={SVG_VIEW_SIZE / 2}
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.2"
                strokeDasharray="2 4"
              />

              {/* Subtle Topographical Geological Contours (Authentic to terrain.ts craters) */}
              {/* Spirit Ridge Crater: (140, -180, r: 55m) */}
              {(() => {
                const p = worldToSvg(140, -180);
                const r = (55 / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={r}
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    strokeOpacity="0.25"
                  />
                );
              })()}

              {/* Opportunity Crater: (-200, -160, r: 70m) */}
              {(() => {
                const p = worldToSvg(-200, -160);
                const r = (70 / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={r}
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    strokeOpacity="0.25"
                  />
                );
              })()}

              {/* Phoenix Basin: (-180, 220, r: 58m) */}
              {(() => {
                const p = worldToSvg(-180, 220);
                const r = (58 / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={r}
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    strokeOpacity="0.25"
                  />
                );
              })()}

              {/* InSight Plain Crater: (230, 170, r: 52m) */}
              {(() => {
                const p = worldToSvg(230, 170);
                const r = (52 / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={r}
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    strokeOpacity="0.25"
                  />
                );
              })()}

              {/* Base Clearing Rim: (0, 0, r: 45m) */}
              {(() => {
                const r = (45 / WORLD_HALF_SIZE) * USABLE_RADIUS;
                return (
                  <circle
                    cx={baseSvg.cx}
                    cy={baseSvg.cy}
                    r={r}
                    fill="url(#baseZone)"
                    stroke="#10b981"
                    strokeWidth="0.9"
                    strokeDasharray="2 3"
                    strokeOpacity="0.4"
                  />
                );
              })()}

              {/* Metric Boundary Coordinate Labels on perimeter */}
              <text
                x={SVG_VIEW_SIZE / 2}
                y={SVG_PADDING - 14}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="1"
              >
                ▲ NORTH [000°] (-550M Z)
              </text>

              <text
                x={SVG_VIEW_SIZE / 2}
                y={SVG_VIEW_SIZE - SVG_PADDING + 22}
                textAnchor="middle"
                fill="#87929a"
                fontSize="9"
                fontWeight="bold"
              >
                ▼ SOUTH [180°] (+550M Z)
              </text>

              <text
                x={SVG_PADDING - 6}
                y={SVG_VIEW_SIZE / 2 + 3}
                textAnchor="end"
                fill="#87929a"
                fontSize="9"
                fontWeight="bold"
              >
                WEST [-550M X]
              </text>

              <text
                x={SVG_VIEW_SIZE - SVG_PADDING + 6}
                y={SVG_VIEW_SIZE / 2 + 3}
                textAnchor="start"
                fill="#87929a"
                fontSize="9"
                fontWeight="bold"
              >
                EAST [+550M X]
              </text>

              {/* ======================================================== */}
              {/* EXPEDITION LANDING BASE AT (0, 0)                        */}
              {/* ======================================================== */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  marsAudio.playComponentSelect();
                  setSelectedArtifactId(null);
                }}
              >
                {/* Base Habitat Octagon */}
                <polygon
                  points={`
                    ${baseSvg.cx - 6},${baseSvg.cy - 10}
                    ${baseSvg.cx + 6},${baseSvg.cy - 10}
                    ${baseSvg.cx + 10},${baseSvg.cy - 6}
                    ${baseSvg.cx + 10},${baseSvg.cy + 6}
                    ${baseSvg.cx + 6},${baseSvg.cy + 10}
                    ${baseSvg.cx - 6},${baseSvg.cy + 10}
                    ${baseSvg.cx - 10},${baseSvg.cy + 6}
                    ${baseSvg.cx - 10},${baseSvg.cy - 6}
                  `}
                  fill="#10b981"
                  fillOpacity="0.25"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <circle cx={baseSvg.cx} cy={baseSvg.cy} r="2.5" fill="#10b981" />

                {/* Base Label */}
                <text
                  x={baseSvg.cx}
                  y={baseSvg.cy + 18}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="8.5"
                  fontWeight="bold"
                  letterSpacing="0.5"
                >
                  EXPEDITION BASE (0, 0)
                </text>
              </g>

              {/* ======================================================== */}
              {/* DISCOVERED ARTIFACT MARKERS (ONLY DISCOVERED ONES!)      */}
              {/* ======================================================== */}
              {discoveredArtifacts.map((art) => {
                const pos = worldToSvg(art.worldPosition.x, art.worldPosition.z);
                const isSelected = selectedArtifactId === art.id;
                const isRover = art.type === 'rover';

                // Distance from player
                const dx = art.worldPosition.x - playerState.position.x;
                const dz = art.worldPosition.z - playerState.position.z;
                const dist = Math.hypot(dx, dz);

                return (
                  <g
                    key={art.id}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={() => {
                      marsAudio.playComponentSelect();
                      setSelectedArtifactId(art.id);
                    }}
                  >
                    {/* Pulsing selection bracket */}
                    {isSelected && (
                      <g>
                        <circle
                          cx={pos.cx}
                          cy={pos.cy}
                          r="16"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          className="animate-spin"
                          style={{ animationDuration: '6s', transformOrigin: `${pos.cx}px ${pos.cy}px` }}
                        />
                        <rect
                          x={pos.cx - 13}
                          y={pos.cy - 13}
                          width="26"
                          height="26"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeOpacity="0.8"
                        />
                      </g>
                    )}

                    {/* Artifact Marker Glyph: Amber/Gold scientific symbol */}
                    {isRover ? (
                      // Rover chassis with rocker-bogie wheels
                      <g transform={`translate(${pos.cx}, ${pos.cy})`}>
                        <rect
                          x="-7"
                          y="-7"
                          width="14"
                          height="14"
                          fill="#f59e0b"
                          fillOpacity="0.25"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          rx="2"
                        />
                        {/* Mast Dot */}
                        <circle cx="0" cy="-2" r="2" fill="#fbbf24" />
                        <line x1="-5" y1="5" x2="5" y2="5" stroke="#f59e0b" strokeWidth="1.2" />
                      </g>
                    ) : (
                      // Stationary lander tripod with solar decagons
                      <g transform={`translate(${pos.cx}, ${pos.cy})`}>
                        <polygon
                          points="0,-8 7,5 -7,5"
                          fill="#f59e0b"
                          fillOpacity="0.25"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                        />
                        <circle cx="0" cy="0" r="2.5" fill="#fbbf24" />
                      </g>
                    )}

                    {/* Scientific Label Tag */}
                    <g transform={`translate(${pos.cx}, ${pos.cy - 16})`}>
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
                        height="13"
                        rx="2"
                        fill="#0b0e14"
                        fillOpacity="0.85"
                        stroke={isSelected ? '#38bdf8' : '#f59e0b'}
                        strokeWidth="0.8"
                        strokeOpacity={isSelected ? 1 : 0.6}
                      />
                      <text
                        x="0"
                        y="-1"
                        textAnchor="middle"
                        fill={isSelected ? '#38bdf8' : '#f59e0b'}
                        fontSize="7.5"
                        fontWeight="bold"
                        letterSpacing="0.4"
                      >
                        {art.name.toUpperCase()} [{dist.toFixed(0)}M]
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* ======================================================== */}
              {/* CURRENT PLAYER ASTRONAUT POSITION (ARES EVA)             */}
              {/* ======================================================== */}
              <g transform={`translate(${playerSvg.cx}, ${playerSvg.cy})`}>
                {/* Field-of-View Cone aligned with player's compass heading */}
                {/* Note: In our coordinate system, heading 0° is North (pointing up / -Z) */}
                <g transform={`rotate(${playerState.headingDeg})`}>
                  <path
                    d="M 0 0 L -18 -40 A 45 45 0 0 1 18 -40 Z"
                    fill="url(#playerFov)"
                    stroke="#38bdf8"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                  />
                  {/* Heading Vector Arrow */}
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-26"
                    stroke="#38bdf8"
                    strokeWidth="1.6"
                  />
                  <polygon points="0,-30 -3,-24 3,-24" fill="#38bdf8" />
                </g>

                {/* Astronaut Location Beacon */}
                <circle
                  cx="0"
                  cy="0"
                  r="7"
                  fill="#38bdf8"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                />
                <circle cx="0" cy="0" r="2.8" fill="#ffffff" />

                {/* Astronaut Tag */}
                <g transform="translate(0, 16)">
                  <rect
                    x="-34"
                    y="-9"
                    width="68"
                    height="12"
                    rx="2"
                    fill="#070a10"
                    fillOpacity="0.9"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="-1"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="7"
                    fontWeight="bold"
                    letterSpacing="0.4"
                  >
                    ARES EVA (YOU)
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Interactive Navigation Control Overlays */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-[#111622]/90 hover:bg-[#1b2336] text-[#bdc8d1] hover:text-white border border-white/10 transition-colors shadow-lg cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-[#111622]/90 hover:bg-[#1b2336] text-[#bdc8d1] hover:text-white border border-white/10 transition-colors shadow-lg cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleResetView}
              className="px-2 py-1 rounded-lg bg-[#111622]/90 hover:bg-[#1b2336] text-[10px] text-[#bdc8d1] hover:text-white border border-white/10 transition-colors shadow-lg cursor-pointer"
              title="Reset View"
            >
              100%
            </button>
            <button
              onClick={handleCenterOnPlayer}
              className="px-2 py-1 rounded-lg bg-[#111622]/90 hover:bg-[#1b2336] text-[10px] text-[#38bdf8] hover:text-white border border-[#38bdf8]/30 transition-colors shadow-lg flex items-center gap-1 cursor-pointer"
              title="Center on Astronaut"
            >
              <Navigation size={11} />
              <span>TRACK EVA</span>
            </button>
            <button
              onClick={handleCenterOnBase}
              className="px-2 py-1 rounded-lg bg-[#111622]/90 hover:bg-[#1b2336] text-[10px] text-[#10b981] hover:text-white border border-[#10b981]/30 transition-colors shadow-lg flex items-center gap-1 cursor-pointer"
              title="Center on Base Clearing"
            >
              <MapPin size={11} />
              <span>BASE</span>
            </button>
          </div>

          {/* Compass Orientation Badge in Top-Right */}
          <div className="absolute top-3 right-3 bg-[#070a0f]/85 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-[10px] shadow-lg pointer-events-none">
            <Compass size={13} className="text-[#38bdf8]" />
            <div className="flex flex-col leading-none">
              <span className="text-[#87929a]">BEARING</span>
              <span className="font-bold text-white">
                {Math.round(playerState.headingDeg).toString().padStart(3, '0')}° {getCompassDirection(playerState.headingDeg)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Legend Footer */}
        <div className="px-3 py-2 bg-[#090c12]/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#87929a] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              <strong className="text-white">ARES EVA:</strong> ({playerState.position.x.toFixed(0)}m, {playerState.position.z.toFixed(0)}m)
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#10b981]" />
              <strong className="text-[#10b981]">BASE:</strong> (0, 0) [{playerState.distanceFromStart.toFixed(0)}m away]
            </span>
          </div>

          <div className="text-[9px] text-[#64748b]">
            * Undiscovered hardware remains unmapped until localized on foot
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SIDEBAR: DISCOVERY ROSTER & TARGET TELEMETRY INSPECTOR       */}
      {/* ============================================================== */}
      <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
        {/* DISCOVERED TARGETS ROSTER */}
        <div className="bg-[#0b0e17]/95 rounded-xl border border-white/10 p-3.5 shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <span className="font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
              <Layers size={13} className="text-[#38bdf8]" />
              DISCOVERED HARDWARE
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#bdc8d1]">
              {discoveredArtifacts.length} / 5
            </span>
          </div>

          {discoveredArtifacts.length === 0 ? (
            <div className="p-3 rounded-lg bg-[#07090e] border border-white/5 text-xs text-[#87929a] leading-relaxed flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[#f59e0b] font-bold text-[11px]">
                <Radio size={12} />
                <span>NO TARGETS CURRENTLY DISCOVERED</span>
              </div>
              <p className="text-[11px]">
                Per mission exploration protocol, dormant NASA spacecraft are omitted from the orbital map until approached on foot.
              </p>
              <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-[#cbd5e1]">
                <strong>EXPEDITION DIRECTIVE:</strong> Deploy your directional LIDAR scanner with <strong>[F]</strong> or follow anomalous RF vectors to locate dormant hardware.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto pr-1">
              {discoveredArtifacts.map((art) => {
                const isSelected = selectedArtifactId === art.id;
                const dx = art.worldPosition.x - playerState.position.x;
                const dz = art.worldPosition.z - playerState.position.z;
                const dist = Math.hypot(dx, dz);
                const angleRad = Math.atan2(dx, -dz);
                const bearingDeg = ((angleRad * 180) / Math.PI + 360) % 360;
                const bearingStr = `${Math.round(bearingDeg).toString().padStart(3, '0')}° ${getCompassDirection(bearingDeg)}`;

                return (
                  <button
                    key={art.id}
                    onClick={() => {
                      marsAudio.playComponentSelect();
                      setSelectedArtifactId(art.id);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-all text-xs flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-white shadow-md'
                        : 'bg-[#0f1420]/60 hover:bg-[#151c2c] border-white/5 text-[#87929a] hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        {art.name}
                      </span>
                      <span className="text-[9px] text-[#87929a]">
                        {art.designation} • {art.type === 'rover' ? 'Rover' : 'Lander'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[10px] text-[#38bdf8] block">
                        {dist.toFixed(0)}M
                      </span>
                      <span className="text-[9px] text-[#87929a]">{bearingStr}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SELECTED TARGET TELEMETRY INSPECTOR */}
        <div className="bg-[#0b0e17]/95 rounded-xl border border-[#38bdf8]/30 p-3.5 shadow-xl flex-1 flex flex-col justify-between gap-3">
          {selectedArtifact && selectedTelemetry ? (
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#f59e0b] mb-0.5">
                  <span>DISCOVERED TARGET INSPECTION</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40">
                    {selectedArtifact.type === 'rover' ? 'SURFACE ROVER' : 'STATIONARY LANDER'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {selectedArtifact.name} ({selectedArtifact.designation})
                </h3>
                <span className="text-[10px] text-[#87929a]">
                  {selectedArtifact.historical.agency} • {selectedArtifact.site}
                </span>
              </div>

              {/* Progress Status Badges */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded bg-[#0e131d] border border-white/5 flex items-center gap-1">
                  <CheckCircle size={11} className="text-[#10b981]" />
                  <span className="text-[#10b981] font-bold">DISCOVERED</span>
                </div>

                <div className="p-1.5 rounded bg-[#0e131d] border border-white/5 flex items-center gap-1">
                  <CheckCircle
                    size={11}
                    className={selectedTelemetry.progress.isDocumented ? 'text-[#f59e0b]' : 'text-[#64748b]'}
                  />
                  <span
                    className={
                      selectedTelemetry.progress.isDocumented ? 'text-[#f59e0b] font-bold' : 'text-[#64748b]'
                    }
                  >
                    {selectedTelemetry.progress.isDocumented ? 'DOCUMENTED' : 'NOT DOCUMENTED'}
                  </span>
                </div>

                <div className="p-1.5 rounded bg-[#0e131d] border border-white/5 flex items-center gap-1">
                  <CheckCircle
                    size={11}
                    className={selectedTelemetry.progress.isTransmitted ? 'text-[#a855f7]' : 'text-[#64748b]'}
                  />
                  <span
                    className={
                      selectedTelemetry.progress.isTransmitted ? 'text-[#a855f7] font-bold' : 'text-[#64748b]'
                    }
                  >
                    {selectedTelemetry.progress.isTransmitted ? 'TRANSMITTED' : 'UNTRANSMITTED'}
                  </span>
                </div>

                <div className="p-1.5 rounded bg-[#0e131d] border border-white/5 flex items-center gap-1">
                  <CheckCircle
                    size={11}
                    className={selectedTelemetry.progress.isArchived ? 'text-[#10b981]' : 'text-[#64748b]'}
                  />
                  <span
                    className={
                      selectedTelemetry.progress.isArchived ? 'text-[#10b981] font-bold' : 'text-[#64748b]'
                    }
                  >
                    {selectedTelemetry.progress.isArchived ? 'ARCHIVED' : 'UNARCHIVED'}
                  </span>
                </div>
              </div>

              {/* Dynamic Real-Time Vectors */}
              <div className="p-2.5 rounded-lg bg-[#0e131d] border border-white/5 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[10px] text-[#87929a] font-bold uppercase">
                  <span>LIVE RELATIVE NAVIGATION</span>
                  <span className="text-[#38bdf8]">FROM ACTIVE EVA</span>
                </div>

                <div className="flex justify-between py-0.5">
                  <span className="text-[#87929a]">Surface Distance:</span>
                  <span className="text-white font-bold">{selectedTelemetry.distance.toFixed(1)} M</span>
                </div>

                <div className="flex justify-between py-0.5">
                  <span className="text-[#87929a]">Compass Bearing:</span>
                  <span className="text-[#38bdf8] font-bold">{selectedTelemetry.bearingStr}</span>
                </div>

                <div className="flex justify-between py-0.5">
                  <span className="text-[#87929a]">Relative Vector:</span>
                  <span className="text-[#f59e0b] font-bold">{selectedTelemetry.relStr}</span>
                </div>
              </div>

              {/* World Coordinates vs Historical NASA Archive (Clearly separated!) */}
              <div className="p-2.5 rounded-lg bg-[#0e131d] border border-white/5 flex flex-col gap-1.5 text-[11px]">
                <div className="text-[9px] text-[#87929a] uppercase font-bold tracking-wider">
                  COORDINATE BREAKDOWN
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#38bdf8] font-bold">
                    SIMULATED GAME-WORLD POSITION:
                  </span>
                  <span className="text-white font-mono-tech text-[10px]">
                    X: {selectedArtifact.worldPosition.x >= 0 ? '+' : ''}
                    {selectedArtifact.worldPosition.x.toFixed(1)}m | Z:{' '}
                    {selectedArtifact.worldPosition.z >= 0 ? '+' : ''}
                    {selectedArtifact.worldPosition.z.toFixed(1)}m | Elev:{' '}
                    +{selectedArtifact.worldPosition.y.toFixed(1)}m
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 pt-1.5 border-t border-white/5">
                  <span className="text-[10px] text-[#cbd5e1] font-bold">
                    AUTHENTIC NASA PDS ARCHIVE (REAL MARS):
                  </span>
                  <span className="text-[#87929a] text-[10px]">
                    {selectedArtifact.historical.realCoordinates} ({selectedArtifact.historical.landingSite})
                  </span>
                </div>
              </div>

              {/* Action to switch to Archive Tab */}
              {onSwitchToArchiveTab && (
                <button
                  onClick={() => onSwitchToArchiveTab(selectedArtifact.id)}
                  className="w-full py-2 px-3 bg-[#182338] hover:bg-[#25324d] text-[#38bdf8] border border-[#38bdf8]/40 hover:border-[#38bdf8] rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Database size={13} />
                  <span>VIEW FULL PDS ARCHIVE DOSSIER</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 my-auto gap-2 text-[#87929a]">
              <Crosshair size={28} className="text-[#38bdf8]/40" />
              <div className="text-xs font-bold text-white uppercase">NO MARKER SELECTED</div>
              <p className="text-[11px] leading-relaxed max-w-xs">
                Click any discovered artifact marker on the vector map or choose from the discovered hardware roster above to view real-time distance, bearing, and simulated world coordinates.
              </p>
            </div>
          )}

          {/* Expedition Landing Base Quick Status */}
          <div className="p-2.5 rounded-lg bg-[#07090e] border border-white/5 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-[#10b981]">
              <MapPin size={12} />
              <span className="font-bold">BASE CLEARING STATUS</span>
            </div>
            <span className="text-[#87929a]">
              {playerState.distanceFromStart.toFixed(0)}M // {Math.round(playerState.baseBearingDeg ?? 180).toString().padStart(3, '0')}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
