import { actToSAT, normalizeGPA } from './classify.js';

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

  const scoreMult = getScoreMultiplier(school, userProfile);
  const gpaMult   = getGPAMultiplier(userProfile.gpa, userProfile.gpaType);
  const roundMult = ROUND_MULTIPLIERS[round] ?? 1.0;

  const raw = base * scoreMult * gpaMult * roundMult;
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
