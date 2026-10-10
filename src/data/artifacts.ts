/**
 * Scientifically accurate NASA mission and artifact data structures.
 * Factual data grounded in NASA JPL Planetary Data System (PDS) archives.
 */

export interface ComponentInfo {
  id: string;
  name: string;
  function: string;
  scientificPurpose: string;
  simulatedFieldCondition: string;
  missionRelevance: string;
}

export interface KeyInstrument {
  name: string;
  acronym: string;
  description: string;
}

export interface HistoricalMissionData {
  missionName: string;
  artifactName: string;
  designation: string;
  agency: string;
  artifactType: 'rover' | 'stationary_lander';
  operationalStatus: string;
  launchDate: string;
  landingDate: string;
  landingSite: string;
  finalLocation?: string;
  realCoordinates: string;
  plannedDuration: string;
  actualDuration: string;
  distanceTraveled?: string;
  lastCommunication: string;
  missionConcluded: string;
  lastKnownStatus: string;
  majorScientificPurpose: string;
  scientificImportance: string;
  keyDiscoveries: string[];
  verifiedFacts: string[];
  scientificInterpretations: string[];
  keyInstruments: KeyInstrument[];
  components: ComponentInfo[];
}

export interface Artifact {
  id: string;
  name: string;
  designation: string;
  type: 'rover' | 'stationary_lander';
  site: string;
  historical: HistoricalMissionData;
  worldPosition: { x: number; y: number; z: number };
}

// -----------------------------------------------------------------------------
// 1. SPIRIT ROVER (MER-A)
// -----------------------------------------------------------------------------
export const SPIRIT_ROVER_ARTIFACT: Artifact = {
  id: 'mer_a_spirit',
  name: 'Spirit Rover',
  designation: 'NASA MER-A',
  type: 'rover',
  site: 'Gusev Crater (Columbia Memorial Station)',
  worldPosition: { x: 180, y: 3.2, z: -220 },
  historical: {
    missionName: 'Mars Exploration Rover',
    artifactName: 'Spirit',
    designation: 'MER-A',
    agency: 'NASA / Jet Propulsion Laboratory (JPL)',
    artifactType: 'rover',
    operationalStatus: 'COMMUNICATION LOST',
    launchDate: 'June 10, 2003 UTC',
    landingDate: 'January 4, 2004 UTC (Sol 1)',
    landingSite: 'Gusev Crater, Mars (Columbia Memorial Station)',
    finalLocation: 'Western edge of Home Plate plateau ("Troy"), Gusev Crater (14.60° S, 175.53° E)',
    realCoordinates: '14.5684° S, 175.47263° E',
    plannedDuration: '90 Martian Sols (~92 Earth Days)',
    actualDuration: '2,210 Martian Sols (6 Years, 2 Months, 19 Days)',
    distanceTraveled: '7.73 km (4.80 miles)',
    lastCommunication: 'March 22, 2010 UTC (Sol 2210)',
    missionConcluded: 'May 25, 2011 UTC (Formal mission completion announcement)',
    lastKnownStatus:
      'In May 2009 (Sol 1892), Spirit became trapped in soft sandy sulfate soil at a location named "Troy" on the western edge of Home Plate. Despite months of extrication attempts by JPL engineering teams, the rover was transitioned into a stationary science platform. As the Martian winter deepened, dust buildup on the solar arrays dropped electrical power below operational thresholds. Final transmission was received on March 22, 2010 (Sol 2210).',
    majorScientificPurpose:
      'Search for and characterize a wide variety of rocks and soils that hold clues to past water activity on Mars. Specifically targeted to determine whether past environmental conditions at Gusev Crater were favorable to microbial life and to assess the history of Martian volcanic and hydrothermal activity.',
    scientificImportance:
      'Spirit fundamentally transformed planetary science by uncovering geochemical and mineralogical evidence of past liquid water on Mars. Exploring the volcanic plains and Columbia Hills of Gusev Crater, Spirit identified ancient hydrothermal systems, volcanic fumaroles, and carbonate-bearing rocks, demonstrating that early Mars possessed localized warm, watery environments that could have supported prebiotic chemistry.',
    keyDiscoveries: [
      'Silica-Rich Soil Deposits: Spirit\'s APXS measurements found soil containing approximately 90% silica. NASA scientists considered water-related processes such as hot-spring or fumarole environments as possible explanations.',
      'Comanche Carbonate Outcrops: Discovered magnesite and siderite carbonate-bearing rocks formed in neutral-pH hydrothermal water, confirming ancient non-acidic aqueous activity.',
      'Home Plate Hydrothermal Structure: Explored bedded volcaniclastic deposits formed by explosive phreatomagmatic eruptions where magma interacted with liquid groundwater.',
      'Extensive Aeolian Dust Devil Dynamics: Directly imaged and measured dozens of atmospheric dust devils in action across Gusev Crater, tracking seasonal atmospheric pressure swings.',
    ],
    verifiedFacts: [
      'Six-wheel rocker-bogie kinematic suspension system traversed 7.73 km across Gusev Crater over 2,210 sols.',
      'Right-front steering/drive actuator permanently seized on Sol 779 (March 2006); rover was driven backward dragging the wheel.',
      'APXS and Mini-TES instruments measured soil with ~90% silica concentration exposed by the dragging wheel near Home Plate.',
      'Alpha Particle X-Ray Spectrometer (APXS) and Mössbauer (MB) spectrometer confirmed magnesium-iron carbonate deposits at Comanche outcrop.',
      'Entered soft regolith trap at "Troy" on Sol 1892 (May 2009); final transmission received March 22, 2010 (Sol 2210).',
    ],
    scientificInterpretations: [
      'Hydrothermal / Fumarolic Silica Origin: NASA scientists interpreted the ~90% silica finding as potential evidence of ancient fumarolic acid-steam leaching or hot-spring precipitation, though alternative low-temperature leaching processes remain debated.',
      'Early Martian Habitability: The neutral-pH carbonate rocks at Comanche suggest localized ancient aqueous environments that were less acidic than the sulfate environments explored at Meridiani Planum, potentially more favorable to prebiotic chemistry.',
      'Phreatomagmatic Volcanism: Bedded deposits at Home Plate are interpreted as evidence that volcanic magma erupted into groundwater or permafrost during Mars\'s Hesperian epoch.',
    ],
    keyInstruments: [
      {
        name: 'Panoramic Camera',
        acronym: 'Pancam',
        description: 'High-resolution multispectral stereoscopic imaging system on the 1.5m mast used to investigate geology, mineralogy, and atmospheric dust.',
      },
      {
        name: 'Miniature Thermal Emission Spectrometer',
        acronym: 'Mini-TES',
        description: 'Infrared spectrometer determining mineral compositions of rocks and soils from thermal radiation.',
      },
      {
        name: 'Alpha Particle X-Ray Spectrometer',
        acronym: 'APXS',
        description: 'Arm-mounted sensor measuring abundances of chemical elements from rock surfaces using curium-244 radiation.',
      },
      {
        name: 'Mössbauer Spectrometer',
        acronym: 'MB',
        description: 'Arm-mounted sensor determining composition and oxidation states of iron-bearing minerals.',
      },
      {
        name: 'Microscopic Imager',
        acronym: 'MI',
        description: 'Extreme close-up camera on the robotic arm resolving sub-millimeter textures and grain boundaries.',
      },
      {
        name: 'Rock Abrasion Tool',
        acronym: 'RAT',
        description: 'Diamond-tipped grinder capable of grinding 5mm into weathered rock veneers to expose unweathered interiors.',
      },
    ],
    components: [
      {
        id: 'solar_panels',
        name: 'Triple-Junction GaAs Solar Array',
        function: 'Multi-panel articulated solar array converting Martian sunlight into electrical energy to charge twin lithium-ion batteries.',
        scientificPurpose: 'Supplied ~900 to 140 Watt-hours per sol across seasonal cycles, powering heaters, computers, and science instruments.',
        simulatedFieldCondition: 'Surface covered in thin ferric oxide regolith dust layer. Photovoltaic cells dormant; wiring harness intact.',
        missionRelevance: 'Dust deposition on these panels caused Spirit\'s critical power drop during the 2009-2010 Martian winter, eventually leading to loss of thermal regulation.',
      },
      {
        id: 'pancam',
        name: 'Pancam & Navcam Stereo Mast Head',
        function: 'Pancam Mast Assembly (PMA) elevating dual stereoscopic science cameras and hazard cameras 1.5 meters above the ground.',
        scientificPurpose: 'Acquired 100,000+ high-resolution stereoscopic multispectral images of Gusev Crater, identifying iron oxides and hematite.',
        simulatedFieldCondition: 'Camera lenses coated in micro-particulate ferric dust. Elevation and azimuth gimbal actuators locked in final orientation.',
        missionRelevance: 'Provided human eyes on Mars, guiding Spirit through the Columbia Hills to the summit of Husband Hill and the Home Plate plateau.',
      },
      {
        id: 'high_gain_antenna',
        name: 'Steerable High-Gain Parabolic Antenna (HGA)',
        function: 'Two-axis steerable 28cm parabolic dish for direct bidirectional X-band communications with NASA Deep Space Network (DSN) ground antennas.',
        scientificPurpose: 'Downlinked heavy science payloads (full-resolution panoramas, raw spectra, engineering telemetry) at up to 28 kbps directly to Earth.',
        simulatedFieldCondition: 'Reflector dish shows fine sandblast micro-pitting. Gimbals aligned toward Earth\'s mean orbital transit arc.',
        missionRelevance: 'Essential for high-bandwidth scientific transmission without requiring immediate orbiter pass scheduling.',
      },
      {
        id: 'low_gain_antenna',
        name: 'Omnidirectional Low-Gain Antenna (LGA)',
        function: 'Non-steerable whip antenna radiating in all directions for emergency and low-data-rate command reception.',
        scientificPurpose: 'Ensured spacecraft could receive emergency commands from DSN regardless of vehicle orientation or attitude failure.',
        simulatedFieldCondition: 'Flexible alloy mast intact without structural fatigue or fractures.',
        missionRelevance: 'Served as Spirit\'s lifeline during communication anomalies and safe mode recoveries in early Sol 18-20 flight software crises.',
      },
      {
        id: 'rover_body',
        name: 'Warm Electronics Box (WEB) & Aerogel Insulation',
        function: 'Sealed central chassis structure insulated with lightweight silica aerogel tiles, enclosing batteries, RAD6000 flight computers, and radio transceivers.',
        scientificPurpose: 'Maintained internal temperatures between -40°C and +40°C while outside ambient temperatures plunged below -100°C.',
        simulatedFieldCondition: 'Gold-coated Mylar thermal blanket exhibits minor ultraviolet micro-embrittlement on sunward edge; structural welds 100% sound.',
        missionRelevance: 'Protected the central CPU and payload electronics throughout the harsh, freezing 2,210-sol journey.',
      },
      {
        id: 'wheels',
        name: '6-Wheel Rocker-Bogie Mobility System',
        function: 'Differential rocker-bogie kinematic suspension with six individually driven aluminum wheels equipped with cleats for cross-country climbing.',
        scientificPurpose: 'Enabled 7.73 kilometers of travel across loose drift dunes, slippery scree slopes, and 30-degree mountain inclines.',
        simulatedFieldCondition: 'Cleats show mechanical abrasive polishing. Right-front steering actuator locked in historical stalled position; rear wheels half-embedded in regolith.',
        missionRelevance: 'When the right-front wheel seized on Sol 779, Spirit was driven in reverse, dragging the inoperable wheel. In 2007, the trench it gouged unearthed soil containing ~90% silica, which scientists interpreted as potential evidence of ancient fumarolic or hydrothermal water activity.',
      },
      {
        id: 'robotic_arm',
        name: 'Instrument Deployment Device (IDD) & Sensor Turret',
        function: '5-degree-of-freedom robotic manipulator arm capable of placing contact scientific sensors directly against rocks and soil.',
        scientificPurpose: 'Placed the Mössbauer spectrometer, APXS, Microscopic Imager, and Rock Abrasion Tool (RAT) against targets with millimeter precision.',
        simulatedFieldCondition: 'Arm joints positioned extending forward. Diamond grit cutting teeth on the RAT show abrasive mineral wear.',
        missionRelevance: 'Executed hundreds of rock surface abrasions (including Adirondack, Humphrey, and Mazatzal) to reveal Mars\'s unaltered geochemical interior.',
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 2. OPPORTUNITY ROVER (MER-B)
// -----------------------------------------------------------------------------
export const OPPORTUNITY_ROVER_ARTIFACT: Artifact = {
  id: 'mer_b_opportunity',
  name: 'Opportunity Rover',
  designation: 'NASA MER-B',
  type: 'rover',
  site: 'Meridiani Planum (Challenger Memorial Station / Perseverance Valley)',
  worldPosition: { x: -240, y: 4.1, z: -190 },
  historical: {
    missionName: 'Mars Exploration Rover',
    artifactName: 'Opportunity',
    designation: 'MER-B',
    agency: 'NASA / Jet Propulsion Laboratory (JPL)',
    artifactType: 'rover',
    operationalStatus: 'MISSION COMPLETE / POWER DEPLETED',
    launchDate: 'July 7, 2003 UTC',
    landingDate: 'January 25, 2004 UTC (Sol 1)',
    landingSite: 'Meridiani Planum, Mars (Challenger Memorial Station / Eagle Crater landing area)',
    finalLocation: 'Perseverance Valley, western rim of Endeavour Crater (Sol 5111)',
    realCoordinates: '1.9483° S, 354.4742° E',
    plannedDuration: '90 Martian Sols (~92 Earth Days)',
    actualDuration: '5,111 Martian Sols (14 Years, 138 Days)',
    distanceTraveled: 'Opportunity traveled 45.16 km across the Martian surface, setting the record for the longest drive on another world.',
    lastCommunication: 'June 10, 2018 UTC (Sol 5111)',
    missionConcluded: 'February 13, 2019 UTC (Declared formally complete after global dust storm)',
    lastKnownStatus:
      'In June 2018, a catastrophic planet-encircling dust storm blotted out the sun over Meridiani Planum, dropping atmospheric opacity (tau) above 10.8. Opportunity entered low-power sleep mode at Perseverance Valley on the rim of Endeavour Crater. Over eight months, NASA engineers sent >1,000 recovery commands via DSN. On February 13, 2019, NASA announced the formal conclusion of the historic mission.',
    majorScientificPurpose:
      'Investigate the smooth, hematite-rich plains of Meridiani Planum to determine whether its geological past included persistent liquid water, assess ancient climatic habitability, and examine the sedimentary layers exposed within major impact craters (Eagle, Endurance, Victoria, and Endeavour).',
    scientificImportance:
      'Opportunity provided the first ground-truth mineralogical proof of ancient standing liquid water on Mars. Over its historic 45.16 km journey, Opportunity identified hematite spherules nicknamed "blueberries", jarosite sulfate minerals, sedimentary cross-bedding, and pre-acidic clay minerals at Endeavour Crater, documenting a major environmental transition in early Martian history.',
    keyDiscoveries: [
      'Hematite "Blueberries": Discovered millimeter-scale spherical hematite concretions weathered out of sulfate bedrock across Meridiani Planum, providing evidence of ancient groundwater saturation.',
      'Extensive Sulfate Sedimentary Bedrock: Analyzed exposed sulfate-rich sandstone layers at Eagle, Endurance, and Victoria craters, revealing cross-bedding from ancient surface waters.',
      'Clay Minerals at Endeavour Crater: At Matijevic Hill along Endeavour Crater rim, discovered smectite clay minerals formed in mild, neutral-pH water prior to the planet\'s acidification.',
      'Extraterrestrial Meteorites: Found and analyzed five nickel-iron meteorites on the Martian surface (including "Heat Shield Rock" and "Block Island"), the first meteorites discovered on another planet.',
    ],
    verifiedFacts: [
      'Traversed 45.16 km (28.06 miles) on Mars, setting the record for the longest drive on another world.',
      'Operational for 5,111 Martian sols (exceeding original 90-sol primary design warranty by a factor of 55).',
      'Landed inside the 22-meter wide Eagle Crater on Meridiani Planum on January 25, 2004 UTC.',
      'Confirmed the presence of jarosite (an iron-hydroxy-sulfate mineral) using Mössbauer and APXS spectrometers.',
      'Traverse ended at Perseverance Valley on Endeavour Crater rim when the June 2018 planet-encircling dust storm depleted solar power.',
    ],
    scientificInterpretations: [
      'Ancient Acidic Groundwater Environment: Geologists interpreted the hematite spherules as concretions precipitated inside porous sandstones soaked in acidic, iron-rich groundwater.',
      'Transition to Arid Climate: The stratigraphic succession from neutral-pH phyllosilicates at Endeavour rim to younger sulfate evaporites is interpreted as recording the global drying and acidification of Mars.',
      'Cross-Bedding Hydrodynamics: Sedimentary structures in Burns formation sulfate rocks are interpreted as evidence of water ripples in shallow, intermittent playa lakes.',
    ],
    keyInstruments: [
      {
        name: 'Panoramic Camera',
        acronym: 'Pancam',
        description: 'Twin multispectral stereo camera system that captured over 228,000 images during the 14-year mission.',
      },
      {
        name: 'Miniature Thermal Emission Spectrometer',
        acronym: 'Mini-TES',
        description: 'Infrared spectrometer providing remote mineral signatures of rocks and crater walls.',
      },
      {
        name: 'Alpha Particle X-Ray Spectrometer',
        acronym: 'APXS',
        description: 'Alpha/X-ray source measuring elemental abundances on rock targets across the 45km traverse.',
      },
      {
        name: 'Mössbauer Spectrometer',
        acronym: 'MB',
        description: 'Instrument that conclusively identified the iron sulfate mineral jarosite, sealing the liquid water discovery.',
      },
      {
        name: 'Microscopic Imager',
        acronym: 'MI',
        description: 'Microscope lens revealing the exquisite internal structure and erosion patterns of the hematite blueberries.',
      },
      {
        name: 'Rock Abrasion Tool',
        acronym: 'RAT',
        description: 'Abraded dozens of rock surfaces including El Capitan and Bounce Rock.',
      },
    ],
    components: [
      {
        id: 'solar_panels',
        name: 'Tilted Solar Array & Dust Cleaning Tracks',
        function: 'Gallium arsenide solar array with wind-cleaned panels tilted toward the western crater rim horizon.',
        scientificPurpose: 'Surrendered to thousands of dust devils that periodically cleansed the cells, extending the mission from 90 sols to over 14 years.',
        simulatedFieldCondition: 'Thick atmospheric dust coating from the 2018 global dust storm blankets the photovoltaic cells; structural panel hinges intact.',
        missionRelevance: 'Dust storms periodically cut Opportunity\'s power down to survival levels until the final June 2018 storm overwhelmed the batteries.',
      },
      {
        id: 'pancam',
        name: 'Pancam Mast & Solar Filter Optics',
        function: 'Periscopic mast head housing dual high-resolution CCD cameras and solar calibration target.',
        scientificPurpose: 'Captured the iconic "Last Panorama" overlooking Perseverance Valley and recorded hundreds of Martian sunsets.',
        simulatedFieldCondition: 'Optical glass displays slight dust accumulation; azimuth actuators angled toward Endeavour Crater floor.',
        missionRelevance: 'Guided Opportunity over 45 kilometers of treacherous sand drifts, bedrock ripples, and crater slopes without ever becoming permanently stuck.',
      },
      {
        id: 'high_gain_antenna',
        name: 'Articulated High-Gain Parabolic Dish',
        function: '28-cm gimbaled steerable antenna transmitting direct-to-Earth telemetry at X-band frequencies.',
        scientificPurpose: 'Transmitted tens of thousands of scientific data frames and raw chemical spectra directly to Deep Space Network 70-meter dishes.',
        simulatedFieldCondition: 'Gimbal actuators parked in safe stow position; surface coated in micro-dune sand ripples.',
        missionRelevance: 'Allowed Opportunity to maintain independent communication even during Mars orbital relay blackouts.',
      },
      {
        id: 'low_gain_antenna',
        name: 'Low-Gain Omnidirectional Mast',
        function: 'Broad-beam antenna for emergency uplinks and vehicle beacon tracking.',
        scientificPurpose: 'Served as the target for NASA\'s final 1,000+ recovery commands transmitted from Earth between June 2018 and February 2019.',
        simulatedFieldCondition: 'Stainless steel whip antenna fully erect and structurally sound.',
        missionRelevance: 'The subject of the final farewell transmission from Earth: "Our faithful Opportunity, rest well under the Martian sky."',
      },
      {
        id: 'rover_body',
        name: 'MER-B Warm Electronics Box Chassis',
        function: 'Triple-layer silica aerogel insulated electronics enclosure maintaining computer operational temperatures.',
        scientificPurpose: 'Housed redundant RAD6000 computers, power distribution units, and 16 Amp-hour rechargeable lithium-ion battery banks.',
        simulatedFieldCondition: 'Thermal blanket faded by 14 years of intense Martian solar ultraviolet flux; telemetry bus quiescent.',
        missionRelevance: 'Endured over 5,000 deep Martian day-night freeze-thaw cycles without a single structural failure.',
      },
      {
        id: 'wheels',
        name: 'Steered 6-Wheel Rocker-Bogie Mobility System',
        function: 'Six independently motorized aluminum wheels with front-and-rear steering actuators that traversed 45.16 km.',
        scientificPurpose: 'Climbed out of Eagle Crater, navigated the perilous dunes of Purgatory Ripple, and descended into Victoria Crater.',
        simulatedFieldCondition: 'Right-front wheel steering actuator parked in 8-degree offset angle; wheel cleats show heavy abrasive wear from bedrock grinding.',
        missionRelevance: 'Overcame the famous 2005 "Purgatory Ripple" dune trap through weeks of meticulous millimetric backward driving.',
      },
      {
        id: 'robotic_arm',
        name: 'Instrument Deployment Device (IDD)',
        function: 'Articulated robotic arm holding the Mössbauer spectrometer, APXS, MI, and RAT.',
        scientificPurpose: 'Made direct contact measurements on over 100 geologic targets across Meridiani Planum.',
        simulatedFieldCondition: 'Shoulder azimuth heater failed during Sol 400s; arm rests deployed slightly forward against sulfate rock bed.',
        missionRelevance: 'Carried the contact sensors that discovered jarosite and the famous hematite blueberries.',
      },
      {
        id: 'hematite_field',
        name: 'Hematite Spherule ("Blueberry") Outcrop',
        function: 'Surrounding geological bedrock exposure containing dense clusters of 1-3mm spherical hematite concretions.',
        scientificPurpose: 'Conclusive evidence of mineral precipitation inside water-saturated porous sedimentary rock.',
        simulatedFieldCondition: 'Spherules eroded out of host bedrock resting loosely on the surrounding soil ripple troughs.',
        missionRelevance: 'The single most famous geochemical finding of the MER mission, proving Mars once had liquid groundwater.',
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 3. PHOENIX LANDER
// -----------------------------------------------------------------------------
export const PHOENIX_LANDER_ARTIFACT: Artifact = {
  id: 'phoenix_lander',
  name: 'Phoenix Lander',
  designation: 'NASA Phoenix',
  type: 'stationary_lander',
  site: 'Northern Plains of Mars (Vastitas Borealis)',
  worldPosition: { x: -220, y: 1.8, z: 260 },
  historical: {
    missionName: 'Phoenix Mars Lander',
    artifactName: 'Phoenix',
    designation: 'NASA Scout Program',
    agency: 'NASA / Jet Propulsion Laboratory / University of Arizona',
    artifactType: 'stationary_lander',
    operationalStatus: 'MISSION COMPLETE / POLAR FREEZE',
    launchDate: 'August 4, 2007 UTC',
    landingDate: 'May 25, 2008 UTC (Sol 1)',
    landingSite: 'Phoenix landing site in the northern plains of Mars (Vastitas Borealis, informal nickname: "Green Valley")',
    finalLocation: 'Northern plains of Mars (Vastitas Borealis, 68.2188° N, 234.2508° E)',
    realCoordinates: '68.2188° N, 234.2508° E',
    plannedDuration: '90 Martian Sols (~92 Earth Days)',
    actualDuration: '157 Martian Sols (5 Months, 4 Days)',
    lastCommunication: 'November 2, 2008 UTC (Sol 152)',
    missionConcluded: 'November 10, 2008 UTC (Spacecraft frozen by encroaching polar winter)',
    lastKnownStatus:
      'As Martian northern autumn turned into deep polar winter, sunlight diminished drastically. Solar power dropped below survival levels as the Sun dipped below the northern horizon. The spacecraft stopped responding on November 2, 2008. Orbital imagery from Mars Reconnaissance Orbiter subsequently verified that heavy dry-ice (carbon dioxide) accumulation during polar winter cracked and collapsed the solar arrays as predicted.',
    majorScientificPurpose:
      'Conduct the first in-situ study of Mars\'s polar arctic environment. Touch and analyze the subsurface water ice suspected by Mars Odyssey orbital data, determine whether the arctic soil could have supported microbial life, and monitor the polar atmospheric boundary layer.',
    scientificImportance:
      'Phoenix confirmed water ice in the Martian subsurface using samples analyzed by TEGA and monitored by its surface imager. It demonstrated that pure water ice lies just centimeters beneath the red regolith across Vastitas Borealis, detected perchlorate oxidizers, discovered alkaline soil chemistry favorable to prebiotic reactions, and observed water-ice snow falling from Martian clouds.',
    keyDiscoveries: [
      'Subsurface Water Ice Confirmation: Phoenix confirmed water ice in the Martian subsurface using samples analyzed by TEGA, along with optical imaging of excavated trench material sublimating over several sols.',
      'Perchlorate Soil Chemistry: MECA wet-chemistry cells identified perchlorate salts (ClO4-) in the soil, which act as strong oxidizers and depress the freezing point of water.',
      'Alkaline Soil pH: Measured soil pH of 7.7 ± 0.5 (similar to terrestrial garden soils) containing magnesium, sodium, potassium, and chloride ions.',
      'Atmospheric Martian Snowfall: The Canadian Space Agency LIDAR instrument detected water-ice snow falling from clouds at ~4 km altitude, sublimating before reaching the surface.',
    ],
    verifiedFacts: [
      'Stationary three-legged lander (no mobility wheels); deployed two decagonal fan-shaped solar arrays.',
      'Landed May 25, 2008 in the high northern arctic plains (Vastitas Borealis, 68.2188° N).',
      'Thermal and Evolved Gas Analyzer (TEGA) heated subsurface samples to detect released volatile water vapor via mass spectrometry.',
      'Microscopy, Electrochemistry, and Conductivity Analyzer (MECA) measured an alkaline soil pH of 7.7 ± 0.5 and identified perchlorate anions.',
      'Operated for 157 Martian sols; power ceased in November 2008 due to seasonal loss of solar illumination in northern winter.',
    ],
    scientificInterpretations: [
      'Cryogenic Water Reservoir: Scientists interpret subsurface ice sheets across Vastitas Borealis as remnants of past atmospheric water vapor deposition during periods of higher orbital obliquity.',
      'Perchlorate Astrobiological Implications: The presence of perchlorates is interpreted as a dual factor: their chemical toxicity to some terrestrial organisms contrasts with their ability to sustain liquid brines at sub-zero temperatures and serve as metabolic electron acceptors for certain anaerobic microbes.',
      'Polygonal Ground Formation: The geometric pattern of surface polygons is interpreted as thermal contraction crack networks formed over repetitive seasonal temperature cycling.',
    ],
    keyInstruments: [
      {
        name: 'Thermal and Evolved Gas Analyzer',
        acronym: 'TEGA',
        description: 'High-temperature oven and mass spectrometer that heated soil and ice samples to 1000°C to analyze released gases and confirm water vapor.',
      },
      {
        name: 'Microscopy, Electrochemistry, and Conductivity Analyzer',
        acronym: 'MECA',
        description: 'Wet chemistry laboratory cells, optical microscope, and atomic force microscope that analyzed soil salinity and mineral grains.',
      },
      {
        name: 'Robotic Arm & Backhoe Scoop',
        acronym: 'RA',
        description: '2.35-meter articulated robotic backhoe arm with motorized rasp to scrape into rock-hard cryogenic ice layers.',
      },
      {
        name: 'Surface Stereo Imager',
        acronym: 'SSI',
        description: 'Mast-mounted 12-filter stereo camera providing 3D multi-spectral panoramas and monitoring trench sublimation.',
      },
      {
        name: 'Meteorological Station & LIDAR',
        acronym: 'MET',
        description: 'Laser atmospheric sounding system and temperature/pressure sensors measuring the northern polar climate.',
      },
    ],
    components: [
      {
        id: 'lander_body',
        name: 'Hexagonal Lander Deck & Gold Thermal Blankets',
        function: 'Stationary payload platform enclosed in multi-layer gold thermal insulation, resting upon 3 shock-absorbing landing struts.',
        scientificPurpose: 'Mounted the TEGA ovens, MECA wet-chemistry cells, electronics, and descent propulsion thrusters underneath.',
        simulatedFieldCondition: 'Thermal blankets show crinkled surface frost etching. Deck clear of debris; thrusters deactivated.',
        missionRelevance: 'Performed flawless pulsed-rocket retro-landing on Vastitas Borealis without using airbags.',
      },
      {
        id: 'landing_legs',
        name: 'Tripod Landing Struts & Footpads',
        function: 'Three articulated inverted-tripod landing legs with wide circular footpads and crushable aluminum honeycomb shock cores.',
        scientificPurpose: 'Absorbed terminal touchdown shock at 2.4 m/s and leveled the deck on the polygonal arctic permafrost ground.',
        simulatedFieldCondition: 'Footpads firmly planted in firm regolith; landing leg struts show no buckling or structural fatigue.',
        missionRelevance: 'Descent thruster plumes underneath the landing legs blew away topsoil, exposing the "Holy Smoke" pure ice sheet on Sol 0!',
      },
      {
        id: 'solar_arrays',
        name: 'Twin Decagonal Fan-Like Solar Arrays',
        function: 'Two circular/decagonal accordion-folding solar arrays extending port and starboard from the central deck.',
        scientificPurpose: 'Provided ~300 to 700 Watts of electrical power during the long polar summer sols.',
        simulatedFieldCondition: 'Photovoltaic cells exhibit heavy cryogenic carbon dioxide frost and micro-cracking from severe polar winter freezing.',
        missionRelevance: 'Designed for a 90-sol summer mission; could not survive the perpetual darkness and dry-ice overburden of polar winter.',
      },
      {
        id: 'robotic_arm',
        name: '2.35m Robotic Arm & Cryogenic Rasp Scoop',
        function: 'Four-degree-of-freedom robotic backhoe arm equipped with a motorized rasp to cut into hard permafrost ice.',
        scientificPurpose: 'Excavated 12 distinct scientific trenches and delivered frozen regolith directly into TEGA oven hopper doors.',
        simulatedFieldCondition: 'Arm extended forward and downward into the excavation trench; titanium scoop resting against the permafrost shelf.',
        missionRelevance: 'The physical tool that first touched and uncovered pure extraterrestrial water ice on Mars.',
      },
      {
        id: 'excavation_trench',
        name: 'Subsurface Water-Ice Trench ("Snow White")',
        function: 'Ground excavation trench dug into the polygonal permafrost terrain displaying exposed bright subsurface water-ice shelf.',
        scientificPurpose: 'Exposed cryogenic ice at a depth of just 5 centimeters beneath the red regolith surface.',
        simulatedFieldCondition: 'Exposed bright white water-ice shelf gleaming through the trench floor beneath excavated regolith berms.',
        missionRelevance: 'The physical site of the historic water-ice confirmation.',
      },
      {
        id: 'ssi_mast',
        name: 'Surface Stereo Imager (SSI) Mast',
        function: 'Elevated dual-camera mast delivering high-resolution stereoscopic true-color images of the arctic landing site.',
        scientificPurpose: 'Monitored the progressive disappearance (sublimation) of ice chunks over 4 days, proving they were water ice.',
        simulatedFieldCondition: 'Optics locked facing north toward the polar ice cap; calibration target clean.',
        missionRelevance: 'Provided iconic imagery of the arctic polygonal patterned ground and midnight sun.',
      },
      {
        id: 'tega_ovens',
        name: 'TEGA Thermal Analyzer Ovens & Hopper Doors',
        function: 'Eight single-use miniature electric ovens with spring-loaded sample doors and vibrators to process frozen soil.',
        scientificPurpose: 'Heated soil to 1,000°C to release volatile water vapor, carbon dioxide, and sulfur dioxide for mass spectrometry.',
        simulatedFieldCondition: 'Oven doors #4 and #5 open in deployed position; sample intake screens visible.',
        missionRelevance: 'Conclusively recorded the first mass-spectrometry chemical signature of Martian water vapor.',
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 4. INSIGHT LANDER
// -----------------------------------------------------------------------------
export const INSIGHT_LANDER_ARTIFACT: Artifact = {
  id: 'insight_lander',
  name: 'InSight Lander',
  designation: 'NASA InSight',
  type: 'stationary_lander',
  site: 'Elysium Planitia (Homestead Hollow)',
  worldPosition: { x: 270, y: 2.2, z: 210 },
  historical: {
    missionName: 'InSight (Interior Exploration using Seismic Investigations)',
    artifactName: 'InSight',
    designation: 'NASA Discovery Program',
    agency: 'NASA / Jet Propulsion Laboratory / CNES / DLR',
    artifactType: 'stationary_lander',
    operationalStatus: 'MISSION COMPLETE / POWER DEPLETED',
    launchDate: 'May 5, 2018 UTC',
    landingDate: 'November 26, 2018 UTC (Sol 1)',
    landingSite: 'Elysium Planitia, Mars (informal nickname: "Homestead Hollow")',
    finalLocation: 'Elysium Planitia, Mars (4.5024° N, 135.6234° E)',
    realCoordinates: '4.5024° N, 135.6234° E',
    plannedDuration: '708 Sols (1 Martian Year / ~2 Earth Years)',
    actualDuration: '1,440 Sols (4 Years, 19 Days — Exceeded Planned Life by 2x)',
    lastCommunication: 'December 15, 2022 UTC (Sol 1440)',
    missionConcluded: 'December 21, 2022 UTC (NASA declared mission complete after power loss)',
    lastKnownStatus:
      'Over four years of operation, a heavy blanket of Martian dust gradually accumulated on InSight\'s twin 2.15-meter UltraFlex solar arrays, dropping power output from 5,000 Watt-hours/sol down to less than 285 Watt-hours/sol. On December 15, 2022, InSight missed two consecutive communication sessions with Earth. On December 21, 2022, NASA announced that the lander had reached the end of its mission.',
    majorScientificPurpose:
      'Conduct the first thorough "check-up" of the deep interior of Mars. Determine the size, thickness, density, and structure of the Martian crust, mantle, and molten core, measure the planet\'s internal rate of heat loss, and determine the rate of contemporary seismic activity (marsquakes).',
    scientificImportance:
      'InSight detected seismic waves from marsquakes and meteorite impacts, allowing scientists to infer the presence and approximate size of a liquid iron-rich core. Detecting 1,319 marsquakes, InSight measured Mars\'s crustal thickness (24–72 km), provided seismic evidence of an active liquid core, and revealed that the Cerberus Fossae fault zone is tectonically and volcanically active today.',
    keyDiscoveries: [
      'Detection of 1,319+ Marsquakes: Used the ultra-sensitive SEIS instrument to record 1,319 seismic tremors up to magnitude 5.0 (Sol 1222), proving Mars is seismically active.',
      'Inferring Core Structure: InSight detected seismic waves from marsquakes and meteorite impacts, allowing scientists to infer the presence and approximate size of a liquid iron-rich core. Approximately 1,830 km based on InSight-era measurements; later analyses of InSight seismic data continue to refine estimates of core radius and mantle structure.',
      'Active Magma Chamber at Cerberus Fossae: Discovered that low-frequency marsquakes cluster in Cerberus Fossae, confirming subsurface stress and potential magmatic movement within the last few million years.',
      'Meteoroid Impact Seismic Signatures: Recorded the seismic waves and acoustic airbursts from several large meteoroid impacts that excavated 130m craters and exposed subsurface ice.',
    ],
    verifiedFacts: [
      'Stationary three-legged geophysical lander deployed two 2.15-meter circular UltraFlex solar arrays.',
      'SEIS broadband seismometer placed directly onto Martian soil using robotic arm and enclosed inside Wind and Thermal Shield (WTS).',
      'Detected 1,319 seismic events over 1,440 operational sols.',
      'HP3 thermal probe encountered dense, cemented duricrust soil that halted penetration short of the 5-meter target depth.',
      'Operated from November 2018 to December 2022; mission concluded after dust accumulation on UltraFlex arrays reduced daily power.',
    ],
    scientificInterpretations: [
      'Core Size and Composition Models: InSight detected seismic compressional (P) waves and reflections from marsquakes and meteorite impacts, allowing scientists to infer the presence and approximate size of a liquid iron-rich core. While early InSight-era models estimated a core radius of approximately 1,830 km, later analyses of InSight seismic data continue to refine estimates of core radius and mantle structure (suggesting a slightly smaller core surrounded by a molten silicate layer).',
      'Crustal Thickness Variation: Seismic inversion models infer an average global crustal thickness of 24–72 km, divided into two or three distinct seismic velocity layers.',
      'Cerberus Fossae Magmatism: Quakes originating from Cerberus Fossae are interpreted by geophysicists as evidence of stress released by cooling and contracting magma bodies in the shallow crust.',
    ],
    keyInstruments: [
      {
        name: 'Seismic Experiment for Interior Structure',
        acronym: 'SEIS',
        description: 'Ultra-sensitive 3-axis broadband seismometer sealed under a heavy Wind and Thermal Shield (WTS) deployed directly onto the Martian ground.',
      },
      {
        name: 'Heat Flow and Physical Properties Package',
        acronym: 'HP3',
        description: 'German Aerospace Center (DLR) self-hammering thermal probe ("the mole") designed to burrow up to 5 meters underground to measure thermal gradient.',
      },
      {
        name: 'Rotation and Interior Structure Experiment',
        acronym: 'RISE',
        description: 'Precision X-band radio tracking using DSN to measure the wobble (precession and nutation) of Mars\'s spin axis to constrain core size.',
      },
      {
        name: 'Temperature and Winds for InSight',
        acronym: 'TWINS',
        description: 'Spanish meteorological sensors mounted on booms measuring surface winds and ambient temperatures continuously.',
      },
      {
        name: 'Instrument Deployment Arm',
        acronym: 'IDA',
        description: '2.4-meter robotic arm equipped with a five-claw mechanical grapple to lift instruments off the deck and place them onto Mars.',
      },
    ],
    components: [
      {
        id: 'lander_body',
        name: 'Hexagonal Lander Bus & White Thermal Blankets',
        function: 'Central payload platform supported by three shock-absorbing legs, housing flight avionics, computers, and communications.',
        scientificPurpose: 'Served as the stationary command and relay hub for SEIS and HP3 while conducting RISE radio science.',
        simulatedFieldCondition: 'Thermal blankets and instrument mounting deck coated in a thick, uniform layer of reddish-brown aeolian dust.',
        missionRelevance: 'Protected sensitive electronics through 1,440 sols of continuous daily operations.',
      },
      {
        id: 'ultraflex_solar',
        name: 'Twin 2.15m Round UltraFlex Solar Arrays',
        function: 'Twin circular accordion-pleated solar arrays unfurled like Chinese paper fans on opposite sides of the lander.',
        scientificPurpose: 'Generated up to 5,000 Watt-hours per sol at landing, dropping to <300 Wh as dust accumulated over 4 years.',
        simulatedFieldCondition: 'Deeply obscured by four years of undisturbed Martian dust; circular structural ribs intact.',
        missionRelevance: 'Dust buildup on these arrays dictated the vehicle\'s operational lifespan and eventual conclusion.',
      },
      {
        id: 'seis_dome',
        name: 'SEIS Seismometer & Wind / Thermal Shield (WTS)',
        function: 'Large aerodynamic domed shield resting on the ground protecting the French CNES ultra-sensitive seismometer beneath.',
        scientificPurpose: 'Shielded the seismometer from wind vibrations and wild 100°C daily temperature swings so it could detect vibrations smaller than an atom.',
        simulatedFieldCondition: 'Dome seated firmly in the soil 1.8 meters in front of the lander; golden ribbon tether trailing back to the lander bus.',
        missionRelevance: 'Recorded over 1,300 marsquakes and delivered the definitive structural profile of Mars\'s core and crust.',
      },
      {
        id: 'seis_tether',
        name: 'SEIS Flexible Ribbon Tether',
        function: 'Flat multi-conductor cable connecting the ground-deployed SEIS instrument directly to electronics inside the lander bus.',
        scientificPurpose: 'Carried high-fidelity seismic data channels and sensor power while mechanically isolating the instrument from lander vibrations.',
        simulatedFieldCondition: 'Tether lies draped across the regolith surface; partially covered by windblown dust.',
        missionRelevance: 'Engineered with a service loop and mass damper to prevent wind-induced line noise.',
      },
      {
        id: 'hp3_housing',
        name: 'HP3 "Mole" Support Structure & Tether',
        function: 'DLR heat-flow experiment housing box resting on the ground containing the mechanical mole hammer.',
        scientificPurpose: 'Attempted to hammer 5 meters into the regolith to measure the geothermal heat escaping from Mars\'s interior.',
        simulatedFieldCondition: 'Housing box resting on the ground with its electrical umbilical tether linked to the lander.',
        missionRelevance: 'Encountered unexpected cohesive Martian duricrust soil ("cemented sand") that limited penetration depth.',
      },
      {
        id: 'robotic_arm',
        name: 'Instrument Deployment Arm (IDA) & Claw Grapple',
        function: '2.4-meter robotic arm featuring a five-claw grapple mechanism that picked up and placed SEIS and HP3 onto the surface.',
        scientificPurpose: 'Conducted the first off-world placement of scientific instruments onto the ground by a robotic spacecraft.',
        simulatedFieldCondition: 'Arm parked in safe mid-reach position; scoop and grapple claw oriented toward the ground.',
        missionRelevance: 'In 2021, used its scoop to trick wind into blowing dust off the solar panels in an ingenious cleanup effort!',
      },
      {
        id: 'twins_booms',
        name: 'TWINS Atmospheric Wind & Thermal Booms',
        function: 'Dual meteorological sensor booms extending outward from the lander deck to record wind vectors and atmospheric pressure.',
        scientificPurpose: 'Recorded thousands of passing dust devils and provided continuous boundary-layer climate data.',
        simulatedFieldCondition: 'Sensor heads clean; thermal sensors operational until mission conclusion.',
        missionRelevance: 'Correlated atmospheric pressure drops with small ground deformations measured by SEIS.',
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 5. CURIOSITY ROVER (MSL)
// -----------------------------------------------------------------------------
export const CURIOSITY_ROVER_ARTIFACT: Artifact = {
  id: 'msl_curiosity',
  name: 'Curiosity Rover',
  designation: 'NASA MSL',
  type: 'rover',
  site: 'Gale Crater (Bradbury Landing / Mount Sharp Slopes)',
  worldPosition: { x: 75, y: 5.6, z: -390 },
  historical: {
    missionName: 'Mars Science Laboratory',
    artifactName: 'Curiosity',
    designation: 'NASA MSL',
    agency: 'NASA / Jet Propulsion Laboratory (JPL)',
    artifactType: 'rover',
    operationalStatus: 'OPERATIONAL / ACTIVE EXPLORATION',
    launchDate: 'November 26, 2011 UTC',
    landingDate: 'August 6, 2012 UTC (Sol 1)',
    landingSite: 'Gale Crater, Mars (Bradbury Landing)',
    finalLocation: 'Mount Sharp (Aeolis Mons) slopes, Gale Crater (Active Traverse)',
    realCoordinates: '4.5895° S, 137.4417° E',
    plannedDuration: '1 Martian Year (687 Earth Days)',
    actualDuration: 'Active Operational Mission (>4,900 Martian Sols)',
    distanceTraveled: 'Traversed over 32 km across Gale Crater and Mount Sharp slopes.',
    lastCommunication: 'Active ongoing Deep Space Network (DSN) tracking',
    missionConcluded: 'Ongoing active primary science mission',
    lastKnownStatus:
      'Curiosity is actively exploring the sulfate-bearing unit of Mount Sharp (Aeolis Mons) inside Gale Crater. Power is reliably supplied by its plutonium-powered Multi-Mission Radioisotope Thermoelectric Generator (MMRTG), making Curiosity immune to the dust-storm-induced power deaths that ended Spirit, Opportunity, and InSight.',
    majorScientificPurpose:
      'Investigate whether Gale Crater ever had environmental conditions favorable for microbial life. Characterize the geology and geochemistry of ancient lakebeds, study the Martian atmosphere and radiation environment, and trace the history of water in the layered sedimentary strata of Mount Sharp.',
    scientificImportance:
      'Curiosity confirmed that early Mars had environments capable of supporting microbial life. At Yellowknife Bay, Curiosity discovered that an ancient freshwater lake existed with neutral pH, low salinity, and all key biogenic elements (C, H, N, O, P, S). It detected diverse organic molecules preserved in ancient mudstones and continues to document Mars\'s climatic transition from wet conditions to extreme aridity.',
    keyDiscoveries: [
      'Ancient Habitable Freshwater Lake: Analyzed fine-grained mudstone at Yellowknife Bay, proving persistent standing water that could have supported chemolithoautotrophic microbes.',
      'Indigenous Organic Molecules: SAM instrument detected complex thiophenic, aromatic, and aliphatic organic compounds preserved in 3.5-billion-year-old mudstones.',
      'Atmospheric Methane Measurements: Detected background atmospheric methane of ~0.4 ppbv alongside episodic surges (up to ~21 ppbv). NASA scientists emphasize that the origin of this methane—whether abiotic (such as serpentinization or UV photolysis) or biological—remains an unresolved scientific question.',
      'Layered History of Mount Sharp: Traversed from ancient clay-rich strata into transitional sulfate-bearing units, directly observing Mars\'s global drying transition.',
    ],
    verifiedFacts: [
      'Heavy 899-kg rover powered by a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG) containing 4.8 kg plutonium-238.',
      'Landed inside Gale Crater on August 6, 2012 UTC using the sky crane descent technique.',
      'Active and operational for >4,900 sols; traversed over 32 km across Gale Crater.',
      'Drilled and analyzed over 40 rock samples using CheMin (X-ray diffraction) and SAM (gas chromatograph / mass spectrometer).',
      'Fired over 1,000,000 laser shots with ChemCam to determine geochemical compositions via laser-induced breakdown spectroscopy.',
    ],
    scientificInterpretations: [
      'Lakebed Habitability vs Biogenesis: Confirmed habitability (chemical energy, liquid water, bio-essential elements) in ancient Gale Crater; this confirms conditions were suitable for life, but is not evidence that life ever originated.',
      'Methane Source Hypotheses: Episodic methane detections remain an open scientific debate. Leading abiotic hypotheses include subsurface olivine serpentinization, clathrate degassing, or UV photodegradation of carbonaceous interplanetary dust; biological methanogenesis remains an untested speculative hypothesis.',
      'Layered Strata Evolution: The transition from clay to sulfate minerals on Mount Sharp is interpreted as recording the regional and planetary transition from a wetter Noachian/early Hesperian climate to hyper-arid conditions.',
    ],
    keyInstruments: [
      {
        name: 'Chemistry and Camera Complex',
        acronym: 'ChemCam',
        description: 'Mast-mounted pulsed infrared laser that vaporizes rock targets up to 7 meters away, analyzing the glowing plasma with a spectrometer.',
      },
      {
        name: 'Mast Camera System',
        acronym: 'Mastcam',
        description: 'Dual multispectral stereo cameras with zoom lenses that have captured hundreds of thousands of gigapixel Martian landscapes.',
      },
      {
        name: 'Sample Analysis at Mars',
        acronym: 'SAM',
        description: 'Internal analytical suite with quadrupole mass spectrometer, gas chromatograph, and tunable laser spectrometer detecting organics.',
      },
      {
        name: 'Chemistry and Mineralogy',
        acronym: 'CheMin',
        description: 'X-ray diffraction instrument inside the rover body that identifies quantitative mineral structures from pulverized rock powder.',
      },
      {
        name: 'Mars Hand Lens Imager',
        acronym: 'MAHLI',
        description: 'Microscopic color camera mounted on the robotic arm turret resolving details thinner than a human hair.',
      },
      {
        name: 'Alpha Particle X-Ray Spectrometer',
        acronym: 'APXS',
        description: 'Turret-mounted contact sensor analyzing chemical element abundances in drilled powder and rock coatings.',
      },
    ],
    components: [
      {
        id: 'rover_body',
        name: 'Heavy MSL Chassis & White Thermal Shell',
        function: 'Massive SUV-sized chassis (~899 kg) housing the SAM and CheMin internal chemistry laboratories and flight computers.',
        scientificPurpose: 'Protects the internal instruments with active fluid heat-loop pumps distributing thermal energy from the RTG.',
        simulatedFieldCondition: 'Painted white aluminum skin shows fine dust layering and sandblast weathering; sample intake funnels open.',
        missionRelevance: 'Roughly double the size and four times the mass of the earlier Spirit and Opportunity rovers.',
      },
      {
        id: 'rtg_power',
        name: 'Multi-Mission Radioisotope Thermoelectric Generator (MMRTG)',
        function: 'Nuclear power canister extending aft from the rover body containing 4.8 kg of plutonium-238 dioxide with cooling fins.',
        scientificPurpose: 'Produces ~110 Watts of electrical power and ~2,000 Watts of thermal heat continuously, unaffected by dust or winter.',
        simulatedFieldCondition: 'Thermal cooling fins warm and radiating heat; thermocouple power output steady.',
        missionRelevance: 'The key technology that allows Curiosity to operate continuously day or night, through dust storms and winter.',
      },
      {
        id: 'chemcam_mast',
        name: 'Remote Sensing Mast with ChemCam & Mastcam',
        function: '2.1-meter tall Remote Sensing Mast (RSM) housing the iconic cyclops ChemCam laser eye and Mastcam stereo optics.',
        scientificPurpose: 'Fired over 1,000,000 laser shots at Martian rocks, analyzing plasma emissions from meters away.',
        simulatedFieldCondition: 'Laser output window clean; Mastcam lenses focused toward the distant slopes of Mount Sharp.',
        missionRelevance: 'Provides high-vantage stereoscopic reconnaissance to steer Curiosity safely along the crater floor.',
      },
      {
        id: 'wheels',
        name: 'Heavy 6-Wheel Rocker-Bogie & Chevron Treads',
        function: 'Six 50-cm diameter machined aluminum wheels with curved chevron grousers and independent drive motors.',
        scientificPurpose: 'Propelled Curiosity over 32 kilometers across sharp ventifact bedrock ridges and sand dunes.',
        simulatedFieldCondition: 'Wheel skin shows historical puncture holes and cracks caused by driving over sharp, cemented ventifact rocks in 2013-2014.',
        missionRelevance: 'The wheel puncture wear prompted JPL to develop autonomous traction control algorithms to preserve wheel life.',
      },
      {
        id: 'robotic_arm',
        name: '2.1m Heavy-Duty Arm & 30kg Sensor Turret',
        function: 'Robust 5-degree-of-freedom robotic arm carrying a heavy 30-kg turret with percussion drill, MAHLI, and APXS.',
        scientificPurpose: 'Drilled over 40 rock cores into Martian mudstones, pulverizing samples and sieving powder into SAM and CheMin.',
        simulatedFieldCondition: 'Drill bit assembly shows bedrock powder residue; turret parked in inspection pose.',
        missionRelevance: 'Delivered the drill samples that revealed organic carbon molecules and the ancient Yellowknife Bay lakebed.',
      },
      {
        id: 'high_gain_antenna',
        name: 'Hexagonal High-Gain Antenna (HGA)',
        function: 'Steerable hexagonal flat-panel antenna communicating directly with Earth\'s Deep Space Network at X-band.',
        scientificPurpose: 'Downlinks high-priority command responses and telemetry without waiting for orbiter flyovers.',
        simulatedFieldCondition: 'Antenna gimbal tracking Earth\'s daytime line-of-sight across the Gale Crater horizon.',
        missionRelevance: 'Guarantees direct contact with JPL mission control every Martian morning.',
      },
      {
        id: 'sample_inlets',
        name: 'SAM & CheMin Sample Funnel Inlets',
        function: 'Vibrating funnel doors on the top rover deck that ingest powdered rock delivered by the robotic arm.',
        scientificPurpose: 'Transfers sieved rock powder into internal oven carousels and X-ray diffraction chambers.',
        simulatedFieldCondition: 'Protective stainless steel mesh screens exposed to atmosphere; dust skirts intact.',
        missionRelevance: 'The portal through which Mars\'s ancient rocks entered humanity\'s most complex off-world laboratory.',
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// ARTIFACT CATALOG REGISTRY
// -----------------------------------------------------------------------------
export const ALL_ARTIFACTS: Record<string, Artifact> = {
  mer_a_spirit: SPIRIT_ROVER_ARTIFACT,
  mer_b_opportunity: OPPORTUNITY_ROVER_ARTIFACT,
  phoenix_lander: PHOENIX_LANDER_ARTIFACT,
  insight_lander: INSIGHT_LANDER_ARTIFACT,
  msl_curiosity: CURIOSITY_ROVER_ARTIFACT,
};

export const ARTIFACT_LIST: Artifact[] = [
  SPIRIT_ROVER_ARTIFACT,
  OPPORTUNITY_ROVER_ARTIFACT,
  PHOENIX_LANDER_ARTIFACT,
  INSIGHT_LANDER_ARTIFACT,
  CURIOSITY_ROVER_ARTIFACT,
];
