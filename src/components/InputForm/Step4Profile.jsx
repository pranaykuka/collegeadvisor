const ATHLETIC_OPTIONS = [
  { value: '',    label: 'Not applicable' },
  { value: 'd1',  label: 'Yes — Division I recruited' },
  { value: 'd2',  label: 'Yes — Division II recruited' },
  { value: 'd3',  label: 'Yes — Division III / NAIA recruited' },
];

const FINANCIAL_OPTIONS = [
  { value: '',         label: 'Prefer not to say' },
  { value: 'need',     label: 'Will need significant financial aid' },
  { value: 'partial',  label: 'May need partial aid' },
  { value: 'fullpay',  label: 'Can pay full tuition without aid' },
];

const EC_OPTIONS = [
  { value: '',            label: 'Prefer not to say' },
  { value: 'national',    label: 'National-level achievement (National Merit, USAMO, Regeneron, Olympiad, etc.)' },
  { value: 'state',       label: 'State or regional award / leadership position' },
  { value: 'school',      label: 'School-level leadership (captain, president, editor-in-chief)' },
  { value: 'participant', label: 'Active participant in clubs or activities' },
  { value: 'limited',     label: 'Limited extracurricular involvement' },
];


const GENDER_OPTIONS = [
  { value: '',           label: 'Prefer not to say' },
  { value: 'male',       label: 'Male' },
  { value: 'female',     label: 'Female' },
  { value: 'nonbinary',  label: 'Non-binary' },
];

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
          <input
            type="radio"
            name={Math.random()}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-indigo-600 flex-shrink-0"
          />
          <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function SectionHeader({ priority, color, children }) {
  const styles = {
    high:   'bg-rose-50 border-rose-300 text-rose-700',
    medium: 'bg-amber-50 border-amber-300 text-amber-700',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${styles[priority]} mb-4`}>
      <span className="text-xs font-bold uppercase tracking-wider">{priority} priority</span>
      <span className="text-xs opacity-70">— {children}</span>
    </div>
  );
}

export default function Step4Profile({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Additional Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          All fields are <span className="font-semibold text-indigo-600">optional</span> — but each one you fill in makes your probability estimates more accurate.
        </p>
      </div>

      {/* ── HIGH PRIORITY ─────────────────────────────────────── */}
      <div className="space-y-6">
        <SectionHeader priority="high">biggest impact on your estimates</SectionHeader>

        {/* Athletic Recruitment */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">🏆 Athletic Recruitment</label>
          <p className="text-xs text-slate-500">Recruited athletes receive a significant admissions boost at most schools.</p>
          <RadioGroup
            options={ATHLETIC_OPTIONS}
            value={data.athleticRecruitment || ''}
            onChange={v => set('athleticRecruitment', v)}
          />
        </div>

        {/* Legacy */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">🎓 Legacy Status</label>
          <p className="text-xs text-slate-500">A parent who graduated from a school can provide a meaningful admissions advantage there.</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!data.hasLegacy}
                onChange={() => { set('hasLegacy', false); set('legacySchools', ''); }}
                className="accent-indigo-600"
              />
              <span className="text-sm text-slate-700">No legacy connection</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!!data.hasLegacy}
                onChange={() => set('hasLegacy', true)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-slate-700">Yes — a parent attended one or more colleges</span>
            </label>
          </div>
          {data.hasLegacy && (
            <div className="mt-2 ml-7">
              <input
                type="text"
                placeholder="e.g. University of Michigan, Duke University"
                value={data.legacySchools || ''}
                onChange={e => set('legacySchools', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">Separate multiple schools with commas</p>
            </div>
          )}
        </div>

        {/* First-Gen */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">👨‍👩‍👧 First-Generation College Student</label>
          <p className="text-xs text-slate-500">Many schools actively recruit first-gen students and give them a meaningful boost.</p>
          <div className="space-y-2">
            {[{ value: '', label: 'Prefer not to say' }, { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes — I will be the first in my family to earn a 4-year degree' }].map(opt => (
              <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={data.firstGen === opt.value} onChange={() => set('firstGen', opt.value)} className="mt-0.5 accent-indigo-600 flex-shrink-0" />
                <span className="text-sm text-slate-700 leading-snug">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Financial Situation */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">💰 Financial Situation</label>
          <p className="text-xs text-slate-500">Most schools outside the top 20 are "need-aware" — ability to pay can affect your admission odds.</p>
          <RadioGroup
            options={FINANCIAL_OPTIONS}
            value={data.financialSituation || ''}
            onChange={v => set('financialSituation', v)}
          />
        </div>
      </div>

      {/* ── MEDIUM PRIORITY ───────────────────────────────────── */}
      <div className="space-y-6">
        <SectionHeader priority="medium">adds meaningful precision</SectionHeader>

        {/* EC Tier */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">🏅 Strongest Extracurricular Achievement</label>
          <p className="text-xs text-slate-500">Your highest level of recognition or leadership outside academics.</p>
          <RadioGroup
            options={EC_OPTIONS}
            value={data.ecTier || ''}
            onChange={v => set('ecTier', v)}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">⚧ Gender</label>
          <p className="text-xs text-slate-500">Some programs (especially engineering and CS) actively recruit women, which can improve odds.</p>
          <RadioGroup
            options={GENDER_OPTIONS}
            value={data.gender || ''}
            onChange={v => set('gender', v)}
          />
        </div>
      </div>
    </div>
  );
}
