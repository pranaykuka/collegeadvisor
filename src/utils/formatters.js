export function fmtCurrency(n) {
  if (!n) return 'N/A';
  return `$${n.toLocaleString()}`;
}

export function fmtPercent(n) {
  if (n === null || n === undefined) return 'N/A';
  return `${(n * 100).toFixed(1)}%`;
}

export function fmtSize(n) {
  if (!n) return 'N/A';
  if (n >= 30000) return `${(n / 1000).toFixed(0)}k+ (Very Large)`;
  if (n >= 15000) return `${(n / 1000).toFixed(0)}k (Large)`;
  if (n >= 5000)  return `${(n / 1000).toFixed(0)}k (Medium)`;
  return `${n.toLocaleString()} (Small)`;
}

export function fmtLocale(code) {
  const map = {
    11: 'Urban', 12: 'Urban', 13: 'Urban',
    21: 'Suburban', 22: 'Suburban', 23: 'Suburban',
    31: 'Rural', 32: 'Rural', 33: 'Rural',
    41: 'Rural', 42: 'Rural', 43: 'Rural',
  };
  return map[code] ?? 'Unknown';
}

export function fmtOwnership(code) {
  if (code === 1) return 'Public';
  if (code === 2) return 'Private';
  if (code === 3) return 'For-Profit';
  return 'Unknown';
}

export function fmtSATRange(school) {
  const r25 =
    (school['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.25th_percentile.math'] || 0);
  const r75 =
    (school['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
    (school['latest.admissions.sat_scores.75th_percentile.math'] || 0);
  if (!r25 || !r75) return 'N/A';
  return `${r25}–${r75}`;
}

export function fmtACTRange(school) {
  const a25 = school['latest.admissions.act_scores.25th_percentile.cumulative'];
  const a75 = school['latest.admissions.act_scores.75th_percentile.cumulative'];
  if (!a25 || !a75) return 'N/A';
  return `${a25}–${a75}`;
}

export function diversityIndex(school) {
  const fields = [
    'latest.student.demographics.race_ethnicity.white',
    'latest.student.demographics.race_ethnicity.black',
    'latest.student.demographics.race_ethnicity.hispanic',
    'latest.student.demographics.race_ethnicity.asian',
    'latest.student.demographics.race_ethnicity.two_or_more',
  ];
  const values = fields.map(f => school[f] || 0);
  const nonWhite = values.slice(1).reduce((a, b) => a + b, 0);
  return nonWhite; // 0–1, higher = more diverse
}

export function getTrendData(school) {
  const years = ['2018', '2019', '2020', '2021', '2022'];
  return years
    .map(y => ({
      year: y,
      rate: school[`${y}.admissions.admission_rate.overall`],
    }))
    .filter(d => d.rate !== null && d.rate !== undefined);
}

export function categoryLabel(cat) {
  if (cat === 'reach') return 'Reach';
  if (cat === 'target') return 'Target';
  return 'Safety';
}

export function categoryColors(cat) {
  if (cat === 'reach')  return { bg: 'bg-red-50',   border: 'border-red-400',   text: 'text-red-800',   badge: 'bg-red-600'   };
  if (cat === 'target') return { bg: 'bg-blue-50',  border: 'border-blue-400',  text: 'text-blue-800',  badge: 'bg-blue-600'  };
  return                       { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', badge: 'bg-green-600' };
}
