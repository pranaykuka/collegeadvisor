import { MAJORS } from '../../services/collegeScorecard.js';

const SIZES = [
  { key: 'Small',      desc: '<5k' },
  { key: 'Medium',     desc: '5k–15k' },
  { key: 'Large',      desc: '15k–30k' },
  { key: 'Very Large', desc: '30k+' },
];
const PP_OPTIONS = ['No preference', 'Public only', 'Private only'];

export default function Step3Preferences({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  function toggleSize(key) {
    const current = data.schoolSize; // array
    if (current.includes(key)) {
      set('schoolSize', current.filter(s => s !== key));
    } else {
      set('schoolSize', [...current, key]);
    }
  }

  const noneSelected = data.schoolSize.length === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">School Preferences</h2>

      {/* Major */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Intended Major / Field</label>
        <select
          value={data.major}
          onChange={e => set('major', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <p className="text-xs text-slate-500">Schools stronger in your field will be ranked higher.</p>
      </div>

      {/* Size — multi-select */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          School Size
          <span className="ml-2 text-xs font-normal text-slate-400">Select one or more</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Any Size clears all */}
          <button
            type="button"
            onClick={() => set('schoolSize', [])}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              noneSelected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
            }`}
          >
            Any Size
          </button>
          {SIZES.map(({ key, desc }) => {
            const active = data.schoolSize.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSize(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                }`}
              >
                {key}
                <span className="ml-1 text-xs opacity-70">({desc})</span>
              </button>
            );
          })}
        </div>
        {!noneSelected && (
          <p className="text-xs text-indigo-600">
            Selected: {data.schoolSize.join(', ')}
          </p>
        )}
      </div>

      {/* Public/Private */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">School Type</label>
        <div className="flex gap-2">
          {PP_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => set('publicPrivate', opt === 'No preference' ? '' : opt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                (data.publicPrivate || 'No preference') === opt
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
