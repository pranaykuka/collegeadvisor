export default function Step2Location({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Location & Distance</h2>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Your Zip Code</label>
        <input
          type="text"
          maxLength={5}
          placeholder="e.g. 10001"
          value={data.zipCode}
          onChange={e => set('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Max Driving Distance: <span className="text-indigo-600 font-bold">{data.maxDriveDistance} miles</span>
        </label>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={data.maxDriveDistance}
          onChange={e => set('maxDriveDistance', e.target.value)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>50 mi</span>
          <span>500 mi (~8 hr drive)</span>
          <span>2000 mi</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Max Flight Time (optional)
          <span className="ml-1 text-xs font-normal text-slate-500">— includes airport time</span>
        </label>
        <div className="flex gap-3 items-center">
          <select
            value={data.maxFlightHours}
            onChange={e => set('maxFlightHours', e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">No flight filter</option>
            <option value="3">Up to 3 hours total</option>
            <option value="4">Up to 4 hours total</option>
            <option value="5">Up to 5 hours total</option>
            <option value="6">Up to 6 hours total</option>
            <option value="8">Up to 8 hours total</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">Extends your search beyond driving range. Total travel time includes ~1.5 hrs for airport.</p>
      </div>
    </div>
  );
}
