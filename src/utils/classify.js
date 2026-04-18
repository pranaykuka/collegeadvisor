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

export function classifySchool(school, userProfile) {
  const { sat, act, gpa, gpaType } = userProfile;
  const userSAT = sat ? parseInt(sat) : actToSAT(parseInt(act));
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

  let scorePos = 'unknown'; // 'above75' | 'in_range' | 'below25' | 'unknown'

  if (sat25 > 0 && sat75 > 0) {
    if (userSAT >= sat75) scorePos = 'above75';
    else if (userSAT >= sat25) scorePos = 'in_range';
    else scorePos = 'below25';
  } else if (act25 && act75) {
    const userACT = act ? parseInt(act) : Math.round((userSAT - 150) / 40);
    if (userACT >= act75) scorePos = 'above75';
    else if (userACT >= act25) scorePos = 'in_range';
    else scorePos = 'below25';
  }

  const gpaStrong = normGPA >= 3.7;
  const gpaWeak   = normGPA < 3.0;

  // Extremely selective — always reach
  if (acceptRate !== null && acceptRate < 0.10) return 'reach';

  // Highly selective — reach unless scores are exceptional
  if (acceptRate !== null && acceptRate < 0.20) {
    if (scorePos === 'above75' && gpaStrong) return 'target';
    return 'reach';
  }

  if (scorePos === 'above75' && !gpaWeak) return 'safety';
  if (scorePos === 'below25' || gpaWeak) return 'reach';
  return 'target';
}
