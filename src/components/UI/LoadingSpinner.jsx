export default function LoadingSpinner({ log = [] }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-xl font-semibold text-slate-700">Searching colleges...</p>

      {log.length > 0 && (
        <div className="w-full max-w-lg bg-slate-800 rounded-xl p-4 font-mono text-sm space-y-1">
          {log.map((line, i) => (
            <div key={i} className={`${line.startsWith('✓') ? 'text-green-400' : line.startsWith('✗') ? 'text-red-400' : 'text-slate-300'}`}>
              {line}
            </div>
          ))}
          <div className="text-slate-500 animate-pulse">▋</div>
        </div>
      )}
    </div>
  );
}
