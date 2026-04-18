import AcceptanceChart from './AcceptanceChart.jsx';
import {
  fmtCurrency, fmtPercent, fmtSize, fmtLocale, fmtOwnership,
  fmtSATRange, fmtACTRange, categoryColors, categoryLabel, diversityIndex,
} from '../../utils/formatters.js';
import { formatDistance } from '../../services/distance.js';

const ROWS = [
  { label: 'Category',          key: s => categoryLabel(s._category) },
  { label: 'Location',          key: s => `${s['school.city']}, ${s['school.state']}` },
  { label: 'Type',              key: s => fmtOwnership(s['school.ownership']) },
  { label: 'Setting',           key: s => fmtLocale(s['school.locale']) },
  { label: 'Enrollment',        key: s => fmtSize(s['latest.student.size']) },
  { label: 'Acceptance Rate',   key: s => fmtPercent(s['latest.admissions.admission_rate.overall']), numeric: true, lower: true },
  { label: 'SAT Range',         key: s => fmtSATRange(s) },
  { label: 'ACT Range',         key: s => fmtACTRange(s) },
  { label: 'In-State Tuition',  key: s => fmtCurrency(s['latest.cost.tuition.in_state']),  numeric: true, lower: true },
  { label: 'Out-of-State',      key: s => fmtCurrency(s['latest.cost.tuition.out_of_state']), numeric: true, lower: true },
  { label: 'Diversity (non-white)', key: s => `${Math.round(diversityIndex(s) * 100)}%`, numeric: true, lower: false },
  { label: 'Median Earnings (10yr)', key: s => fmtCurrency(s['latest.earnings.10_yrs_after_entry.median']), numeric: true, lower: false },
  { label: 'Distance',          key: (s, p) => formatDistance(s._distance, p.maxDriveDistance) },
];

export default function ComparisonTable({ schools, userProfile, onRemove }) {
  if (schools.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold">Select schools to compare</p>
        <p className="text-sm mt-1">Check the "Compare" box on any school card</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="py-3 px-4 text-left font-semibold text-slate-300 w-36">Metric</th>
            {schools.map(s => {
              const colors = categoryColors(s._category);
              return (
                <th key={s.id} className="py-3 px-4 text-center min-w-48">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} text-white`}>
                      {categoryLabel(s._category)}
                    </span>
                    <span className="font-bold leading-tight text-white">{s['school.name']}</span>
                    <button
                      onClick={() => onRemove(s)}
                      className="text-slate-400 hover:text-red-400 text-xs"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">{row.label}</td>
              {schools.map(s => (
                <td key={s.id} className="py-3 px-4 text-center text-slate-700">
                  {row.key(s, userProfile)}
                </td>
              ))}
            </tr>
          ))}
          {/* Acceptance rate trend row */}
          <tr className="bg-white">
            <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap align-top">Accept. Trend</td>
            {schools.map(s => (
              <td key={s.id} className="py-3 px-4">
                <AcceptanceChart school={s} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
