/**
 * Mission progression and deep space transmission data models.
 * Grounded in authentic NASA Deep Space Network (DSN) telemetry protocols.
 */

export interface ArtifactProgress {
  id: string;
  name: string;
  designation: string;
  agency: string;
  site: string;
  planetaryCoords: string;
  isDiscovered: boolean;
  isDocumented: boolean;
  isTransmitted: boolean;
  isArchived: boolean;
  discoveredAt?: string;
  documentedAt?: string;
  transmittedAt?: string;
  archivedAt?: string;
}

export interface MissionState {
  artifactsDiscovered: number;
  artifactsDocumented: number;
  artifactsTransmitted: number;
  artifactsArchived: number;
  totalArtifacts: number;
}

export type TransmissionStep =
  | 'idle'
  | 'link_request'
  | 'signal_acquired'
  | 'packetization'
  | 'transmitting'
  | 'deep_space_relay'
  | 'earth_receiving'
  | 'packet_verification'
  | 'archive_complete';

export interface TransmissionPacket {
  id: number;
  label: string;
  type: 'metadata' | 'field_telemetry' | 'geochemistry' | 'imagery' | 'spectra' | 'checksum';
  status: 'pending' | 'in_transit' | 'received' | 'verified' | 'dropped';
}

export interface TransmissionTelemetry {
  distanceKm: number;
  distanceAU: number;
  oneWayLightTimeSec: number;
  oneWayLightTimeStr: string;
  roundTripDelayStr: string;
  dsnGroundStation: string;
  frequencyBand: string;
  carrierLock: boolean;
}

/**
 * Calculates simulated Mars-to-Earth orbital distance and light propagation delays.
 * Mars-Earth distance varies between 55M km and 401M km (mean ~225M km).
 */
export function calculateDeepSpaceLinkTelemetry(): TransmissionTelemetry {
  // Realistic mean orbital transit distance (~1.436 AU)
  const distanceKm = 214840000;
  const distanceAU = 1.436;
  const SPEED_OF_LIGHT_KM_S = 299792.458; // Speed of light in vacuo

  const oneWaySeconds = distanceKm / SPEED_OF_LIGHT_KM_S;
  const roundTripSeconds = oneWaySeconds * 2;

  const formatDelay = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toFixed(1);
    return `${mins}m ${secs}s (${totalSeconds.toFixed(1)}s)`;
  };

  return {
    distanceKm,
    distanceAU,
    oneWayLightTimeSec: oneWaySeconds,
    oneWayLightTimeStr: formatDelay(oneWaySeconds),
    roundTripDelayStr: formatDelay(roundTripSeconds),
    dsnGroundStation: 'DSN Goldstone Complex (Deep Space Station 14 - 70m Antenna)',
    frequencyBand: 'X-Band (7.145–8.450 GHz)',
    carrierLock: true,
  };
}

/**
 * Pre-cataloged Mars exploration artifacts list.
 * 5 Real historical NASA Mars missions.
 */
export const CATALOGED_MARS_ARTIFACTS: ArtifactProgress[] = [
  {
    id: 'mer_a_spirit',
    name: 'Spirit Rover',
    designation: 'NASA MER-A',
    agency: 'NASA / JPL',
    site: 'Gusev Crater (Columbia Memorial Station)',
    planetaryCoords: '14.5684° S, 175.47263° E',
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  },
  {
    id: 'mer_b_opportunity',
    name: 'Opportunity Rover',
    designation: 'NASA MER-B',
    agency: 'NASA / JPL',
    site: 'Meridiani Planum (Eagle Crater / Perseverance Valley)',
    planetaryCoords: '1.9483° S, 354.4742° E',
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  },
  {
    id: 'phoenix_lander',
    name: 'Phoenix Lander',
    designation: 'NASA Scout',
    agency: 'NASA / JPL / Univ. Arizona',
    site: 'Northern Plains of Mars (Vastitas Borealis)',
    planetaryCoords: '68.2188° N, 234.2508° E',
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  },
  {
    id: 'insight_lander',
    name: 'InSight Lander',
    designation: 'NASA Discovery',
    agency: 'NASA / JPL / CNES / DLR',
    site: 'Elysium Planitia (Homestead Hollow)',
    planetaryCoords: '4.5024° N, 135.6234° E',
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  },
  {
    id: 'msl_curiosity',
    name: 'Curiosity Rover',
    designation: 'NASA MSL',
    agency: 'NASA / JPL',
    site: 'Gale Crater (Bradbury Landing / Mount Sharp)',
    planetaryCoords: '4.5895° S, 137.4417° E',
    isDiscovered: false,
    isDocumented: false,
    isTransmitted: false,
    isArchived: false,
  },
];

const LOCAL_STORAGE_KEY = 'abnf_mars_campaign_v2';
const LEGACY_STORAGE_KEY = 'abnf_mars_mission_v1';

export interface ArtifactStatusRecord {
  isDiscovered: boolean;
  isDocumented: boolean;
  isTransmitted: boolean;
  isArchived: boolean;
  discoveredAt?: string;
  documentedAt?: string;
  transmittedAt?: string;
  archivedAt?: string;
}

export type PersistentMissionData = Record<string, ArtifactStatusRecord>;

const DEFAULT_ARTIFACT_RECORD: ArtifactStatusRecord = {
  isDiscovered: false,
  isDocumented: false,
  isTransmitted: false,
  isArchived: false,
};

export function loadPersistentMission(): PersistentMissionData {
  const result: PersistentMissionData = {
    mer_a_spirit: { ...DEFAULT_ARTIFACT_RECORD },
    mer_b_opportunity: { ...DEFAULT_ARTIFACT_RECORD },
    phoenix_lander: { ...DEFAULT_ARTIFACT_RECORD },
    insight_lander: { ...DEFAULT_ARTIFACT_RECORD },
    msl_curiosity: { ...DEFAULT_ARTIFACT_RECORD },
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.keys(result).forEach((key) => {
        if (parsed[key]) {
          result[key] = { ...DEFAULT_ARTIFACT_RECORD, ...parsed[key] };
        }
      });
      return result;
    }

    // Check legacy key for migration
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (parsedLegacy.mer_a_spirit) {
        result.mer_a_spirit = { ...DEFAULT_ARTIFACT_RECORD, ...parsedLegacy.mer_a_spirit };
      }
    }
  } catch (err) {
    console.warn('Failed to load mission progress from localStorage:', err);
  }

  return result;
}

export function savePersistentMission(data: PersistentMissionData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save mission progress to localStorage:', err);
  }
}
