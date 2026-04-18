import { MAJORS } from '../../services/collegeScorecard.js';

const SIZE_OPTIONS = ['Any Size', 'Small', 'Medium', 'Large', 'Very Large'];
const SIZE_DESC    = { Small: '<5k', Medium: '5k–15k', Large: '15k–30k', 'Very Large': '30k+' };
const PP_OPTIONS   = ['No preference', 'Public only', 'Private only'];

export default function Step3Preferences({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

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

      {/* Size */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">School Size Preference</label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => set('schoolSize', opt === 'Any Size' ? '' : opt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                (data.schoolSize || 'Any Size') === opt
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {opt}
              {SIZE_DESC[opt] && <span className="ml-1 text-xs opacity-70">({SIZE_DESC[opt]})</span>}
            </button>
          ))}
        </div>
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
