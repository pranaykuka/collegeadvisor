import axios from 'axios';
import { haversineDistanceMiles, estimateFlightHours } from './distance.js';
import { classifySchool, actToSAT } from '../utils/classify.js';
import { estimateProbability } from '../utils/admissionStrategy.js';

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

export const MAJORS = [
  'Undecided',
  'Computer Science & Technology',
  'Engineering',
  'Business & Finance',
  'Biology & Pre-Med',
  'Health Sciences & Nursing',
  'Psychology',
  'Education',
  'Communications & Media',
  'Visual & Performing Arts',
  'Social Sciences',
  'Political Science & Government',
  'Mathematics & Statistics',
  'Physical Sciences',
  'Language & Literature',
  'Philosophy & Religion',
  'Criminal Justice',
  'Architecture',
  'Economics',
];

export const MAJOR_FIELD_MAP = {
  'Computer Science & Technology': 'latest.academics.program_percentage.computer',
  'Engineering':                   'latest.academics.program_percentage.engineering',
  'Business & Finance':            'latest.academics.program_percentage.business_marketing',
  'Biology & Pre-Med':             'latest.academics.program_percentage.biological',
  'Health Sciences & Nursing':     'latest.academics.program_percentage.health',
  'Psychology':                    'latest.academics.program_percentage.psychology',
  'Education':                     'latest.academics.program_percentage.education',
  'Communications & Media':        'latest.academics.program_percentage.communication',
  'Visual & Performing Arts':      'latest.academics.program_percentage.visual_performing',
  'Social Sciences':               'latest.academics.program_percentage.social_science',
  'Political Science & Government':'latest.academics.program_percentage.social_science',
  'Mathematics & Statistics':      'latest.academics.program_percentage.mathematics',
  'Physical Sciences':             'latest.academics.program_percentage.physical_science',
  'Language & Literature':         'latest.academics.program_percentage.language',
  'Philosophy & Religion':         'latest.academics.program_percentage.philosophy_religious',
  'Criminal Justice':              'latest.academics.program_percentage.security_law_enforcement',
  'Architecture':                  'latest.academics.program_percentage.architecture',
  'Economics':                     'latest.academics.program_percentage.social_science',
  'Undecided':                     null,
};

const FIELDS = [
  'id', 'school.name', 'school.city', 'school.state', 'school.zip',
  'school.locale', 'school.ownership', 'location.lat', 'location.lon',
  'school.school_url',
  'latest.student.size',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.student.demographics.race_ethnicity.white',
  'latest.student.demographics.race_ethnicity.black',
  'latest.student.demographics.race_ethnicity.hispanic',
  'latest.student.demographics.race_ethnicity.asian',
  'latest.student.demographics.race_ethnicity.two_or_more',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.aid.median_debt.completers.overall',
  'latest.earnings.10_yrs_after_entry.median',
  '2018.admissions.admission_rate.overall',
  '2019.admissions.admission_rate.overall',
  '2020.admissions.admission_rate.overall',
  '2021.admissions.admission_rate.overall',
  '2022.admissions.admission_rate.overall',
  'latest.academics.program_percentage.computer',
  'latest.academics.program_percentage.engineering',
  'latest.academics.program_percentage.business_marketing',
  'latest.academics.program_percentage.biological',
  'latest.academics.program_percentage.health',
  'latest.academics.program_percentage.psychology',
  'latest.academics.program_percentage.education',
  'latest.academics.program_percentage.communication',
  'latest.academics.program_percentage.visual_performing',
  'latest.academics.program_percentage.social_science',
  'latest.academics.program_percentage.mathematics',
  'latest.academics.program_percentage.physical_science',
  'latest.academics.program_percentage.language',
  'latest.academics.program_percentage.philosophy_religious',
  'latest.academics.program_percentage.security_law_enforcement',
  'latest.academics.program_percentage.architecture',
].join(',');

// Used for client-side filtering when multiple sizes are selected
const SIZE_BOUNDS = {
  'Small':      [1,     4999],
  'Medium':     [5000,  14999],
  'Large':      [15000, 29999],
  'Very Large': [30000, 500000],
};

// Composite prestige score (0–1) used as a ranking proxy.
// Weights: selectivity 45%, academic strength (SAT) 35%, outcomes (earnings) 20%.
function computeRankScore(school) {
  const acceptRate = school['latest.admissions.admission_rate.overall'];
  const satAvg     = school['latest.admissions.sat_scores.average.overall'];
  const earnings   = school['latest.earnings.10_yrs_after_entry.median'];

  // Selectivity: invert accept rate — lower = more prestigious. Missing → neutral 0.5.
  const selectivity = acceptRate != null ? 1 - acceptRate : 0.5;

  // SAT: normalize 400–1600 → 0–1. Missing → neutral 0.5.
  const satScore = satAvg != null ? Math.min(Math.max((satAvg - 400) / 1200, 0), 1) : 0.5;

  // Earnings: normalize $20k–$100k → 0–1. Missing → neutral 0.4.
  const earningsScore = earnings != null ? Math.min(Math.max((earnings - 20000) / 80000, 0), 1) : 0.4;

  return selectivity * 0.45 + satScore * 0.35 + earningsScore * 0.20;
}

async function queryAPI(acceptRateRange, satRange, ownershipFilter, apiKey) {
  const params = {
    api_key: apiKey,
    'school.operating': 1,
    'school.degrees_awarded.highest__range': '3..4',
    'latest.admissions.admission_rate.overall__range': acceptRateRange,
    fields: FIELDS,
    per_page: 100,
  };
  // SAT range is optional — omitting it includes test-optional schools too
  if (satRange)        params['latest.admissions.sat_scores.average.overall__range'] = satRange;
  if (ownershipFilter) params['school.ownership'] = ownershipFilter;

  const res = await axios.get(BASE_URL, { params });
  return res.data.results || [];
}

export async function fetchColleges(profile, addLog = () => {}) {
  const {
    sat, act, gpa, gpaType,
    maxDriveDistance, maxFlightHours,
    major, schoolSize, publicPrivate,
    lat, lon,
  } = profile;

  const apiKey = import.meta.env.VITE_COLLEGE_SCORECARD_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('API key missing. Please add VITE_COLLEGE_SCORECARD_API_KEY to your .env file.');
  }

  const ownershipFilter = publicPrivate === 'Public only' ? 1 : publicPrivate === 'Private only' ? 2 : null;

  // Size is now filtered client-side so multiple selections work correctly
  const selectedSizes = Array.isArray(schoolSize) ? schoolSize : (schoolSize ? [schoolSize] : []);
  const sizeFilter = selectedSizes.length > 0
    ? s => selectedSizes.some(sz => {
        const [min, max] = SIZE_BOUNDS[sz];
        const n = s['latest.student.size'];
        return n != null && n >= min && n <= max;
      })
    : () => true;

  // Convert score to SAT for range calculations
  const userSAT = sat ? parseInt(sat) : act ? actToSAT(parseInt(act)) : null;

  // SAT ranges per bucket.
  // Reach: NO SAT filter — acceptance rate (0–35%) already ensures selectivity.
  //   A 1600 SAT student still gets reach schools like Harvard (avg SAT ~1515)
  //   because those schools reject 96%+ of applicants regardless of test scores.
  //   Adding a SAT floor would incorrectly exclude elite schools for top scorers.
  // Target/Safety: SAT filter narrows to academically similar schools.
  const satReach  = null;
  const satTarget = userSAT ? `${Math.max(userSAT - 200, 400)}..${Math.min(userSAT + 150, 1600)}` : null;
  const satSafety = userSAT ? `400..${Math.min(userSAT + 50,  1600)}`                             : null;

  if (userSAT) {
    addLog(`  SAT filters — reach: none (accept rate only) | target: ${satTarget} | safety: ${satSafety}`);
  } else {
    addLog('  No test score provided — using acceptance rate only');
  }

  // Each bucket is cross-filtered by BOTH acceptance rate AND SAT average.
  // Schools that report no SAT average (test-optional) won't appear when satRange is set —
  // that's intentional: the user gave a test score, so SAT-reportng schools are preferred.
  const [rawReach, rawTarget, rawSafety] = await Promise.all([
    queryAPI('0..0.35',    satReach,  ownershipFilter, apiKey),
    queryAPI('0.20..0.75', satTarget, ownershipFilter, apiKey),
    queryAPI('0.55..1.0',  satSafety, ownershipFilter, apiKey),
  ]);

  addLog(`✓ API returned — reach bucket: ${rawReach.length} | target bucket: ${rawTarget.length} | safety bucket: ${rawSafety.length}`);
  addLog(`  User coords: lat=${lat?.toFixed(4)}, lon=${lon?.toFixed(4)} | max drive: ${maxDriveDistance} mi`);

  // Deduplicate across buckets (prefer higher-bucket assignment)
  const seen = new Set();
  const tag = (schools, hint) =>
    schools
      .filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return s['location.lat'] && s['location.lon'];
      })
      .map(s => ({ ...s, _hint: hint }));

  const allTagged = [...tag(rawReach, 'reach'), ...tag(rawTarget, 'target'), ...tag(rawSafety, 'safety')];
  addLog(`  Unique schools after dedup: ${allTagged.length}`);

  // Max distance: the farther of drive limit or flight limit
  const maxFlightMiles = maxFlightHours ? (parseFloat(maxFlightHours) - 1.5) * 500 : 0;
  const maxTotalMiles  = Math.max(parseFloat(maxDriveDistance), maxFlightMiles);
  addLog(`  Max distance filter: ${Math.round(maxTotalMiles)} miles`);

  const majorField = MAJOR_FIELD_MAP[major] || null;

  const userProfile = { sat, act, gpa, gpaType };

  const enriched = allTagged.map(school => {
    const dist     = haversineDistanceMiles(lat, lon, school['location.lat'], school['location.lon']);
    const category = classifySchool(school, userProfile);
    const majorScore = majorField ? (school[majorField] || 0) : 0;
    const rdProb   = estimateProbability(school, userProfile, 'RD') ?? 0;
    const rankScore = computeRankScore(school);
    return { ...school, _distance: dist, _category: category, _majorScore: majorScore, _rdProb: rdProb, _rankScore: rankScore };
  });

  const sample = enriched.slice(0, 3).map(s => `${s['school.name']} (rank=${s._rankScore.toFixed(2)}, prob=${Math.round(s._rdProb * 100)}%)`);
  addLog(`  Sample schools: ${sample.join(' | ')}`);

  // Primary sort: prestige/rank score desc. Secondary: admission probability desc.
  enriched.sort((a, b) => b._rankScore - a._rankScore || b._rdProb - a._rdProb);

  // Apply distance + size filters; fall back if nothing passes
  let filtered = enriched.filter(s => s._distance <= maxTotalMiles && sizeFilter(s));
  addLog(`  After distance + size filter: ${filtered.length} schools remain`);

  if (filtered.length === 0) {
    addLog('⚠ Filters removed all schools — showing closest schools regardless of size/distance');
    filtered = [...enriched].sort((a, b) => a._distance - b._distance).slice(0, 20);
    filtered = filtered.map(s => ({ ...s, _outsideRange: true }));
  }

  // Group by category
  const byCat = { reach: [], target: [], safety: [] };
  for (const s of filtered) byCat[s._category].push(s);
  addLog(`✓ By category — reach: ${byCat.reach.length} | target: ${byCat.target.length} | safety: ${byCat.safety.length}`);

  return allocate(byCat, 20);
}

function allocate(byCat, total) {
  const ideal = { reach: 5, target: 10, safety: 5 };
  const avail = { reach: byCat.reach.length, target: byCat.target.length, safety: byCat.safety.length };
  const alloc = {
    reach:  Math.min(ideal.reach,  avail.reach),
    target: Math.min(ideal.target, avail.target),
    safety: Math.min(ideal.safety, avail.safety),
  };

  let remaining = total - alloc.reach - alloc.target - alloc.safety;
  // Redistribute leftover slots to target → safety → reach
  for (const cat of ['target', 'safety', 'reach']) {
    if (remaining <= 0) break;
    const extra = Math.min(remaining, avail[cat] - alloc[cat]);
    alloc[cat] += extra;
    remaining  -= extra;
  }

  return [
    ...byCat.reach.slice(0, alloc.reach),
    ...byCat.target.slice(0, alloc.target),
    ...byCat.safety.slice(0, alloc.safety),
  ];
}
