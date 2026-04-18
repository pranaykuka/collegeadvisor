export function actToSAT(act) {
  const table = {
    36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1460, 31: 1430,
    30: 1400, 29: 1370, 28: 1340, 27: 1310, 26: 1280, 25: 1250,
    24: 1220, 23: 1190, 22: 1160, 21: 1130, 20: 1100, 19: 1060,
    18: 1020, 17: 980,  16: 940,  15: 900,  14: 860,  13: 820,
  };
  return table[Math.round(act)] ?? Math.round(act * 40 + 150);
}

export function normalizeGPA(gpa, type) {
  const n = parseFloat(gpa);
  if (type === 'weighted') return Math.min(n * 0.8, 4.0);
  return n;
}

// Returns 'reach' | 'target' | 'safety' | null
// null means the school is unrealistic for this student and should be excluded.
export function classifySchool(school, userProfile) {
  const { sat, act, gpa, gpaType } = userProfile;
  const userSAT = sat ? parseInt(sat) : act ? actToSAT(parseInt(act)) : null;
  const normGPA = normalizeGPA(gpa, gpaType);

  const acceptRate = school['latest.admissions.admission_rate.overall'];

  const sat25 =
    (school['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.25th_percentile.math'] || 0);
  const sat75 =
    (school['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.75th_percentile.math'] || 0);
  const act25 = school['latest.admissions.act_scores.25th_percentile.cumulative'];
  const act75 = school['latest.admissions.act_scores.75th_percentile.cumulative'];

  // ── Score gap check ──────────────────────────────────────────────────────
  // How far is the student below the school's 25th percentile?
  // Beyond certain thresholds, the school is not a realistic reach and is excluded.
  //
  //  Selectivity tier  | Max gap below 25th to still be a realistic reach
  //  <10% (Ivy-level)  | 80 SAT points  (e.g. Harvard 25th ~1460 → need ≥1380)
  //  10–20%            | 100 SAT points (e.g. Georgetown 25th ~1370 → need ≥1270)
  //  20–35%            | 130 SAT points (moderate reach schools)
  //  >35%              | No exclusion   (accessible enough that scores matter less)

  if (userSAT && sat25 > 0) {
    const gap = sat25 - userSAT; // positive = student is below 25th
    if (acceptRate < 0.10 && gap > 80)  return null;
    if (acceptRate < 0.20 && gap > 100) return null;
    if (acceptRate < 0.35 && gap > 130) return null;
  } else if (!userSAT) {
    // No test score: only exclude if GPA is dramatically below what the school expects.
    // Use accept rate as a rough proxy — if <10% and GPA is weak, exclude.
    if (acceptRate < 0.10 && normGPA < 3.5) return null;
    if (acceptRate < 0.20 && normGPA < 3.0) return null;
  }

  // ── Score position relative to the school's full range ───────────────────
  let scorePos = 'unknown'; // 'above75' | 'in_range' | 'below25' | 'unknown'

  if (userSAT && sat25 > 0 && sat75 > 0) {
    if (userSAT >= sat75)      scorePos = 'above75';
    else if (userSAT >= sat25) scorePos = 'in_range';
    else                       scorePos = 'below25';
  } else if (act25 && act75) {
    const userACT = act ? parseInt(act) : userSAT ? Math.round((userSAT - 150) / 40) : null;
    if (userACT) {
      if (userACT >= act75)      scorePos = 'above75';
      else if (userACT >= act25) scorePos = 'in_range';
      else                       scorePos = 'below25';
    }
  }

  const gpaStrong    = normGPA >= 3.7;
  const gpaVeryStrong = normGPA >= 3.9;
  const gpaWeak      = normGPA < 3.0;

  // ── Classification ───────────────────────────────────────────────────────

  // Ultra-selective (<10%): reach unless scores + GPA are truly exceptional
  if (acceptRate !== null && acceptRate < 0.10) {
    if (scorePos === 'above75' && gpaVeryStrong) return 'target';
    return 'reach';
  }

  // Highly selective (10–20%): reach by default, target only if above range
  if (acceptRate !== null && acceptRate < 0.20) {
    if (scorePos === 'above75' && gpaStrong) return 'target';
    return 'reach';
  }

  // Selective (20–35%): standard reach/target/safety logic
  if (acceptRate !== null && acceptRate < 0.35) {
    if (scorePos === 'above75' && gpaStrong) return 'safety';
    if (scorePos === 'below25' || gpaWeak)   return 'reach';
    return 'target';
  }

  // Accessible (>35%): more generous — below25 is a reach, above75 is safety
  if (scorePos === 'above75' && !gpaWeak) return 'safety';
  if (scorePos === 'below25' || gpaWeak)  return 'reach';
  return 'target';
}
