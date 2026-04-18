import { useState } from 'react';
import AcceptanceChart from './AcceptanceChart.jsx';
import {
  fmtCurrency, fmtPercent, fmtSize, fmtLocale, fmtOwnership,
  fmtSATRange, fmtACTRange, categoryColors, categoryLabel, diversityIndex,
} from '../../utils/formatters.js';
import { formatDistance } from '../../services/distance.js';
import { getDeadlines } from '../../data/deadlines.js';
import { getProbabilities, getRecommendation, getMeritScholarship } from '../../utils/admissionStrategy.js';

export default function SchoolCard({ school, userProfile, selected, onToggleCompare }) {
  const [showStrategy, setShowStrategy] = useState(false);

  const cat    = school._category;
  const colors = categoryColors(cat);
  const dist   = school._distance;
  const url    = school['school.school_url'];
  const nonWhitePct = Math.round(diversityIndex(school) * 100);

  const deadlines      = getDeadlines(school['school.name']);
  const probabilities  = getProbabilities(school, userProfile, deadlines);
  const recommendation = getRecommendation(school, userProfile, deadlines);
  const merit          = getMeritScholarship(school, userProfile);

  const rdPct = Math.round((school._rdProb ?? 0) * 100);
  const rdColor =
    rdPct >= 60 ? 'bg-green-500'  :
    rdPct >= 35 ? 'bg-blue-500'   :
    rdPct >= 15 ? 'bg-amber-500'  :
                  'bg-red-500';
  const rdTextColor =
    rdPct >= 60 ? 'text-green-700'  :
    rdPct >= 35 ? 'text-blue-700'   :
    rdPct >= 15 ? 'text-amber-700'  :
                  'text-red-700';

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header bar */}
      <div className={`${colors.badge} px-4 py-2 flex items-center justify-between`}>
        <span className="text-white text-xs font-bold uppercase tracking-wider">{categoryLabel(cat)}</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleCompare(school)}
            className="accent-white w-3.5 h-3.5"
          />
          <span className="text-white text-xs">Compare</span>
        </label>
      </div>

      <div className="p-5 space-y-4">
        {/* Name & location */}
        <div>
          {url ? (
            <a href={`https://${url}`} target="_blank" rel="noreferrer"
               className="text-lg font-bold text-slate-900 hover:text-indigo-700 leading-tight block">
              {school['school.name']}
            </a>
          ) : (
            <p className="text-lg font-bold text-slate-900 leading-tight">{school['school.name']}</p>
          )}
          <p className="text-sm text-slate-500 mt-0.5">
            {school['school.city']}, {school['school.state']}
          </p>
        </div>

        {/* Admission probability bar — always visible */}
        <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Your Admission Chance (RD)</span>
            <span className={`text-base font-extrabold ${rdTextColor}`}>{rdPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${rdColor}`} style={{ width: `${rdPct}%` }} />
          </div>
        </div>

        {/* Merit scholarship badge */}
        <div className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${
          merit.likelihood === 'Very Likely' ? 'bg-green-50 border-green-200' :
          merit.likelihood === 'Likely'      ? 'bg-blue-50 border-blue-200'  :
          merit.likelihood === 'Possible'    ? 'bg-amber-50 border-amber-200':
                                               'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-lg leading-none mt-0.5">🏅</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Merit Scholarship</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                merit.likelihood === 'Very Likely' ? 'bg-green-200 text-green-800' :
                merit.likelihood === 'Likely'      ? 'bg-blue-200 text-blue-800'   :
                merit.likelihood === 'Possible'    ? 'bg-amber-200 text-amber-800' :
                                                     'bg-slate-200 text-slate-600'
              }`}>{merit.likelihood}</span>
              {merit.estimate && (
                <span className="text-xs font-bold text-slate-800">{merit.estimate}</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{merit.note}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge color="slate">{fmtOwnership(school['school.ownership'])}</Badge>
          <Badge color="slate">{fmtLocale(school['school.locale'])}</Badge>
          <Badge color="indigo">{formatDistance(dist, userProfile.maxDriveDistance)}</Badge>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Acceptance Rate"       value={fmtPercent(school['latest.admissions.admission_rate.overall'])} />
          <Metric label="Enrollment"             value={fmtSize(school['latest.student.size'])} />
          <Metric label="SAT Range"              value={fmtSATRange(school)} />
          <Metric label="ACT Range"              value={fmtACTRange(school)} />
          <Metric label="In-State Tuition"       value={fmtCurrency(school['latest.cost.tuition.in_state'])} />
          <Metric label="Out-of-State"           value={fmtCurrency(school['latest.cost.tuition.out_of_state'])} />
          <Metric label="Diversity (non-white)"  value={nonWhitePct ? `${nonWhitePct}%` : 'N/A'} />
          <Metric label="Median Earnings (10yr)" value={fmtCurrency(school['latest.earnings.10_yrs_after_entry.median'])} />
        </div>

        {/* Acceptance rate trend chart */}
        <div className="pt-1">
          <AcceptanceChart school={school} />
        </div>

        {/* Strategy toggle */}
        <button
          onClick={() => setShowStrategy(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-semibold text-indigo-700 transition-colors"
        >
          <span>📅 Deadlines & Strategy</span>
          <span>{showStrategy ? '▲' : '▼'}</span>
        </button>

        {showStrategy && (
          <div className="space-y-3 pt-1">
            {/* Deadlines table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-700 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                Application Deadlines
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'Early Decision 1', val: deadlines.ed1, binding: true },
                    { label: 'Early Decision 2', val: deadlines.ed2, binding: true },
                    { label: 'Early Action',     val: deadlines.ea,  binding: false },
                    { label: 'Regular Decision', val: deadlines.rd,  binding: false },
                  ].map(({ label, val, binding }) => (
                    <tr key={label} className="border-t border-slate-100 first:border-0">
                      <td className="px-3 py-2 text-slate-600 font-medium">{label}</td>
                      <td className="px-3 py-2 text-right">
                        {val ? (
                          <span className="font-semibold text-slate-800">{val}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not offered</span>
                        )}
                        {val && binding && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">binding</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deadlines.notes && (
                <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100 italic">{deadlines.notes}</p>
              )}
            </div>

            {/* Probability estimates */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-700 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                Estimated Admission Probability
              </div>
              <div className="p-3 space-y-2.5">
                {probabilities.map(({ round, label, date, probability }) => {
                  if (!probability) return null;
                  const pct = Math.round(probability * 100);
                  const barColor =
                    pct >= 60 ? 'bg-green-500' :
                    pct >= 35 ? 'bg-blue-500'  :
                    pct >= 15 ? 'bg-amber-500' :
                                'bg-red-500';
                  const textColor =
                    pct >= 60 ? 'text-green-700' :
                    pct >= 35 ? 'text-blue-700'  :
                    pct >= 15 ? 'text-amber-700' :
                                'text-red-700';
                  return (
                    <div key={round}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-600">
                          {label}
                          {date && <span className="ml-1 text-slate-400 font-normal">({date})</span>}
                        </span>
                        <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400 italic pt-1">
                  Estimates based on acceptance rate, your test scores, and GPA. Actual results vary — many factors are unmodeled.
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <RecommendationBox rec={recommendation} />
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationBox({ rec }) {
  const bg = rec.highlight === 'high' ? 'bg-indigo-50 border-indigo-300' :
             rec.highlight === 'medium' ? 'bg-amber-50 border-amber-300' :
             'bg-green-50 border-green-300';
  const titleColor = rec.highlight === 'high' ? 'text-indigo-800' :
                     rec.highlight === 'medium' ? 'text-amber-800' :
                     'text-green-800';
  return (
    <div className={`rounded-lg border p-3 ${bg}`}>
      <p className={`text-sm font-bold ${titleColor} mb-1`}>
        {rec.icon} {rec.title}
      </p>
      <p className="text-xs text-slate-600 leading-relaxed">{rec.body}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-2.5 shadow-sm">
      <p className="text-xs text-slate-400 leading-tight">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-tight">{value}</p>
    </div>
  );
}

function Badge({ children, color = 'slate' }) {
  const cls = {
    slate:  'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
  }[color] ?? 'bg-slate-100 text-slate-600';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{children}</span>;
}
