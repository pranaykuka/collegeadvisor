import { actToSAT, normalizeGPA } from './classify.js';

// ── Major-Specific Difficulty Multipliers ─────────────────────────────────
// Reflects that some departments are harder to get into than the school overall
const MAJOR_DIFFICULTY = {
  'Computer Science & Technology': 0.65,
  'Engineering':                   0.70,
  'Mathematics & Statistics':      0.80,
  'Economics':                     0.82,
  'Business & Finance':            0.82,
  'Architecture':                  0.86,
  'Biology & Pre-Med':             0.87,
  'Physical Sciences':             0.88,
  'Health Sciences & Nursing':     0.88,
  'Visual & Performing Arts':      0.90,
  'Political Science & Government':0.92,
  'Communications & Media':        0.95,
  'Psychology':                    0.95,
  'Social Sciences':               0.98,
  'Language & Literature':         1.00,
  'Undecided':                     1.00,
  'Philosophy & Religion':         1.05,
  'Criminal Justice':              1.05,
  'Education':                     1.10,
};

// ── Legacy School Matching ────────────────────────────────────────────────
function hasLegacyMatch(school, legacySchools) {
  if (!legacySchools) return false;
  const schoolName = (school['school.name'] || '').toLowerCase();
  return legacySchools.split(',').some(s => {
    const term = s.trim().toLowerCase();
    return term.length > 3 && schoolName.includes(term);
  });
}

// ── Profile-Based Multipliers ─────────────────────────────────────────────
function getProfileMultiplier(school, userProfile) {
  let mult = 1.0;
  const acceptRate = school['latest.admissions.admission_rate.overall'] ?? 0.5;

  // 1. Athletic Recruitment
  const athletic = userProfile.athleticRecruitment;
  if (athletic === 'd1')  mult *= 5.0;
  else if (athletic === 'd2')  mult *= 2.5;
  else if (athletic === 'd3')  mult *= 1.8;

  // 2. Legacy (only at matched school, meaningful at <60% acceptance)
  if (userProfile.hasLegacy && hasLegacyMatch(school, userProfile.legacySchools)) {
    mult *= acceptRate < 0.10 ? 1.4 : 1.65;
  }

  // 3. First-generation student
  if (userProfile.firstGen === 'yes') mult *= 1.25;

  // 4. Financial situation (only matters at need-aware schools: 10–70% accept rate)
  if (acceptRate >= 0.10 && acceptRate <= 0.70) {
    if (userProfile.financialSituation === 'fullpay') mult *= 1.22;
    else if (userProfile.financialSituation === 'need') mult *= 0.92;
  }

  // 5. Extracurricular tier
  const ecMults = { national: 1.40, state: 1.20, school: 1.06, participant: 1.0, limited: 0.90 };
  if (userProfile.ecTier && ecMults[userProfile.ecTier]) {
    mult *= ecMults[userProfile.ecTier];
  }

  // 6. Gender — boost for women in STEM-heavy majors
  if (userProfile.gender === 'female') {
    const stemMajors = ['Computer Science & Technology', 'Engineering', 'Mathematics & Statistics', 'Physical Sciences'];
    if (stemMajors.includes(userProfile.major)) mult *= 1.15;
  }

  // 8. Major difficulty
  const majorMult = MAJOR_DIFFICULTY[userProfile.major] ?? 1.0;
  mult *= majorMult;

  return mult;
}

// ── Probability Estimation ────────────────────────────────────────────────

function getScoreMultiplier(school, userProfile) {
  const { sat, act } = userProfile;
  const userSAT = sat ? parseInt(sat) : act ? actToSAT(parseInt(act)) : null;
  if (!userSAT) return 1.0;

  const sat25 =
    (school['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.25th_percentile.math'] || 0);
  const sat75 =
    (school['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.75th_percentile.math'] || 0);

  if (!sat25 || !sat75) return 1.0;

  if (userSAT >= sat75)           return 1.6;   // well above range
  if (userSAT >= (sat25 + sat75) / 2) return 1.2; // upper half of range
  if (userSAT >= sat25)           return 0.9;   // lower half of range
  if (userSAT >= sat25 - 80)      return 0.55;  // slightly below 25th
  return 0.3;                                    // significantly below
}

function getGPAMultiplier(gpa, gpaType) {
  const norm = normalizeGPA(gpa, gpaType);
  if (norm >= 3.9) return 1.2;
  if (norm >= 3.7) return 1.08;
  if (norm >= 3.5) return 1.0;
  if (norm >= 3.2) return 0.85;
  if (norm >= 3.0) return 0.7;
  return 0.5;
}

const ROUND_MULTIPLIERS = { ED1: 1.9, ED2: 1.45, EA: 1.15, RD: 1.0 };

function dimReturns(p) {
  // Smooth cap: probability above 70% grows at half rate
  if (p <= 0.70) return p;
  return 0.70 + (p - 0.70) * 0.4;
}

export function estimateProbability(school, userProfile, round) {
  const base = school['latest.admissions.admission_rate.overall'];
  if (base == null) return null;

  const scoreMult   = getScoreMultiplier(school, userProfile);
  const gpaMult     = getGPAMultiplier(userProfile.gpa, userProfile.gpaType);
  const roundMult   = ROUND_MULTIPLIERS[round] ?? 1.0;
  const profileMult = getProfileMultiplier(school, userProfile);

  const raw  = base * scoreMult * gpaMult * roundMult * profileMult;
  const prob = dimReturns(raw);
  return Math.min(Math.max(prob, 0.01), 0.95);
}

export function getProbabilities(school, userProfile, deadlines) {
  const rounds = [];
  if (deadlines.ed1) rounds.push({ round: 'ED1', label: 'Early Decision 1', date: deadlines.ed1, binding: true });
  if (deadlines.ed2) rounds.push({ round: 'ED2', label: 'Early Decision 2', date: deadlines.ed2, binding: true });
  if (deadlines.ea)  rounds.push({ round: 'EA',  label: 'Early Action',     date: deadlines.ea,  binding: false });
  rounds.push(         { round: 'RD',  label: 'Regular Decision', date: deadlines.rd,  binding: false });

  return rounds.map(r => ({
    ...r,
    probability: estimateProbability(school, userProfile, r.round),
  }));
}

// ── Merit Scholarship Estimation ─────────────────────────────────────────

export function getMeritScholarship(school, userProfile) {
  const { sat, act, gpa, gpaType } = userProfile;
  const userSAT = sat ? parseInt(sat) : act ? actToSAT(parseInt(act)) : null;
  const normGPA = normalizeGPA(gpa, gpaType);
  const ownership = school['school.ownership']; // 1=public, 2=private, 3=for-profit
  const acceptRate = school['latest.admissions.admission_rate.overall'];

  // For-profit schools: no meaningful merit aid
  if (ownership === 3) return { likelihood: 'Unlikely', estimate: null, note: 'For-profit colleges rarely offer merit aid.' };

  // Highly selective schools (<15%) rarely give merit aid — they don't need to recruit
  if (acceptRate != null && acceptRate < 0.15) {
    return { likelihood: 'Rare', estimate: null, note: 'Elite schools rarely offer merit scholarships — financial aid is need-based only.' };
  }

  const sat75 =
    (school['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.75th_percentile.math'] || 0);
  const sat25 =
    (school['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.25th_percentile.math'] || 0);
  const satMid = sat25 && sat75 ? (sat25 + sat75) / 2 : null;

  // How far above the school's midpoint is the student?
  const scoreGap = userSAT && satMid ? userSAT - satMid : 0;
  const gpaStrong = normGPA >= 3.7;
  const gpaVeryStrong = normGPA >= 3.9;

  const outOfState = school['latest.cost.tuition.out_of_state'];
  const inState    = school['latest.cost.tuition.in_state'];
  const tuition    = outOfState || inState || 30000;

  // Score well above midpoint + strong GPA = highest merit chance
  if (scoreGap >= 150 && gpaVeryStrong) {
    const low  = Math.round(tuition * 0.30 / 1000) * 1000;
    const high = Math.round(tuition * 0.70 / 1000) * 1000;
    return {
      likelihood: 'Very Likely',
      estimate: `$${low.toLocaleString()}–$${high.toLocaleString()}/yr`,
      note: 'Your scores are well above this school\'s range. You are a strong merit scholarship candidate.',
    };
  }

  if (scoreGap >= 80 && gpaStrong) {
    const low  = Math.round(tuition * 0.15 / 1000) * 1000;
    const high = Math.round(tuition * 0.45 / 1000) * 1000;
    return {
      likelihood: 'Likely',
      estimate: `$${low.toLocaleString()}–$${high.toLocaleString()}/yr`,
      note: 'Your profile is above their typical range, making you a competitive merit aid candidate.',
    };
  }

  if (scoreGap >= 0 && gpaStrong) {
    const low  = Math.round(tuition * 0.05 / 1000) * 1000;
    const high = Math.round(tuition * 0.25 / 1000) * 1000;
    return {
      likelihood: 'Possible',
      estimate: `$${low.toLocaleString()}–$${high.toLocaleString()}/yr`,
      note: 'You may qualify for modest merit aid. Applying early can improve your chances.',
    };
  }

  if (scoreGap < 0) {
    return {
      likelihood: 'Unlikely',
      estimate: null,
      note: 'Your scores are near or below their typical range. Merit aid is unlikely but financial need-based aid may still be available.',
    };
  }

  return {
    likelihood: 'Possible',
    estimate: null,
    note: 'Some merit aid may be available. Contact the admissions office for specifics.',
  };
}

// ── Strategy Recommendation ───────────────────────────────────────────────

export function getRecommendation(school, userProfile, deadlines) {
  const category    = school._category;
  const acceptRate  = school['latest.admissions.admission_rate.overall'];
  const hasED1      = !!deadlines.ed1;
  const hasEA       = !!deadlines.ea;
  const hasED2      = !!deadlines.ed2;
  const ultraSelect = acceptRate != null && acceptRate < 0.12;
  const verySelect  = acceptRate != null && acceptRate < 0.25;

  if (category === 'safety') {
    return {
      icon: '✅',
      title: 'Apply Regular Decision',
      body: `Your profile is well above this school's typical range. Save Early Decision for target or reach schools where the binding commitment gives a meaningful advantage.`,
      highlight: 'low',
    };
  }

  if (category === 'reach' && ultraSelect) {
    if (hasED1) {
      return {
        icon: '🎯',
        title: 'Early Decision 1 — if this is your #1 choice',
        body: `Ultra-selective schools accept a significantly higher share of ED applicants. The binding commitment signals genuine interest and provides the largest possible boost — but it won't overcome scores far below their range.`,
        highlight: 'high',
      };
    }
    return {
      icon: '⚡',
      title: 'Apply Early Action or Regular Decision',
      body: `This school doesn't offer ED. Apply EA if available for a modest advantage. At this selectivity level, your application strength matters far more than timing.`,
      highlight: 'medium',
    };
  }

  if (category === 'reach' && verySelect) {
    if (hasED1) {
      return {
        icon: '🎯',
        title: 'Strongly consider Early Decision 1',
        body: `Highly selective schools show a meaningful gap between ED and RD acceptance rates. If this school ranks highly for you, the binding commitment is worth it. If not, EA (if offered) provides a smaller non-binding boost.`,
        highlight: 'high',
      };
    }
    if (hasEA) {
      return {
        icon: '⚡',
        title: 'Apply Early Action',
        body: `No ED offered. Early Action gives a modest advantage and earlier notification — apply EA.`,
        highlight: 'medium',
      };
    }
  }

  if (category === 'target') {
    if (hasED1) {
      return {
        icon: '💡',
        title: hasEA ? 'Early Action (unless this is your top choice)' : 'Early Decision 1 if this is your top choice',
        body: hasEA
          ? `Early Action gives a non-binding boost and earlier notification. Reserve ED1 for your absolute first-choice school since it's binding.`
          : `ED1 provides a meaningful boost at this school. If it's your top choice, applying ED1 is worth the binding commitment. Otherwise apply Regular Decision.`,
        highlight: 'medium',
      };
    }
    if (hasEA) {
      return {
        icon: '⚡',
        title: 'Apply Early Action',
        body: `You're a competitive applicant here. EA is non-binding and gives a slight advantage along with earlier notification — a win-win.`,
        highlight: 'medium',
      };
    }
  }

  // Fallback
  return {
    icon: '📅',
    title: 'Regular Decision',
    body: hasED2
      ? `If your list isn't finalized by ED1, ED2 in January offers a binding option with a boost over RD.`
      : `Apply on time with a strong application. Your profile is in range for this school.`,
    highlight: 'low',
  };
}
