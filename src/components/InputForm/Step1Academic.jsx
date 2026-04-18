export default function Step1Academic({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Academic Profile</h2>

      {/* GPA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">GPA</label>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            placeholder="e.g. 3.85"
            value={data.gpa}
            onChange={e => set('gpa', e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <select
            value={data.gpaType}
            onChange={e => set('gpaType', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="unweighted">Unweighted (0–4.0)</option>
            <option value="weighted">Weighted (0–5.0)</option>
          </select>
        </div>
      </div>

      {/* Test Score */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Test Score</label>
        <div className="flex gap-2 mb-3">
          {['SAT', 'ACT', 'None'].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => set('testType', opt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                data.testType === opt
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {data.testType === 'SAT' && (
          <div>
            <input
              type="number"
              min="400"
              max="1600"
              placeholder="SAT Composite (400–1600)"
              value={data.sat}
              onChange={e => set('sat', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Total of Math + Evidence-Based Reading & Writing</p>
          </div>
        )}

        {data.testType === 'ACT' && (
          <div>
            <input
              type="number"
              min="1"
              max="36"
              placeholder="ACT Composite (1–36)"
              value={data.act}
              onChange={e => set('act', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Composite score (1–36)</p>
          </div>
        )}

        {data.testType === 'None' && (
          <p className="text-sm text-slate-500 italic">Classification will rely on GPA and acceptance rates.</p>
        )}
      </div>
    </div>
  );
}
