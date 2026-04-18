import { useState } from 'react';
import InputForm from './components/InputForm/index.jsx';
import Results from './components/Results/index.jsx';
import LoadingSpinner from './components/UI/LoadingSpinner.jsx';
import { fetchColleges } from './services/collegeScorecard.js';
import { getCoordinatesFromZip } from './services/distance.js';

export default function App() {
  const [view, setView]       = useState('form');
  const [schools, setSchools] = useState([]);
  const [userProfile, setProfile] = useState(null);
  const [error, setError]     = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  function addLog(msg) {
    setDebugLog(prev => [...prev, msg]);
  }

  async function handleSubmit(profile) {
    setProfile(profile);
    setView('loading');
    setError(null);
    setDebugLog([]);

    try {
      addLog('Step 1: Looking up coordinates for zip code ' + profile.zipCode + '...');
      const coords = await getCoordinatesFromZip(profile.zipCode);
      addLog(`✓ Zip found: lat=${coords.lat.toFixed(4)}, lon=${coords.lon.toFixed(4)}`);

      addLog('Step 2: Querying College Scorecard API (3 acceptance-rate buckets)...');
      const results = await fetchColleges({ ...profile, ...coords }, addLog);

      addLog(`Step 3: Got ${results.length} schools after filtering.`);

      if (results.length === 0) {
        throw new Error('No schools found. Check debug log below for details.');
      }
      setSchools(results);
      setView('results');
    } catch (err) {
      addLog('✗ ERROR: ' + (err?.response?.data?.message || err?.response?.statusText || err.message));
      if (err?.response) {
        addLog('HTTP status: ' + err.response.status);
        addLog('Response: ' + JSON.stringify(err.response.data).slice(0, 300));
      }
      setError(err.message);
      setView('debug');
    }
  }

  if (view === 'debug') {
    return (
      <div className="min-h-screen bg-slate-900 text-green-400 font-mono p-6">
        <h2 className="text-white text-xl font-bold mb-4">Debug Log</h2>
        <div className="space-y-1 mb-6">
          {debugLog.map((line, i) => (
            <div key={i} className={`text-sm ${line.startsWith('✗') ? 'text-red-400' : line.startsWith('✓') ? 'text-green-400' : 'text-slate-300'}`}>
              <span className="text-slate-500 mr-2">{i + 1}.</span>{line}
            </div>
          ))}
        </div>
        <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-300 font-bold">Error:</p>
          <p className="text-red-200 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => { setView('form'); setError(null); setDebugLog([]); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          ← Back to Form
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50">
      {view === 'form'    && <InputForm onSubmit={handleSubmit} error={error} />}
      {view === 'loading' && <LoadingSpinner log={debugLog} />}
      {view === 'results' && (
        <Results
          schools={schools}
          userProfile={userProfile}
          onReset={() => { setView('form'); setError(null); setDebugLog([]); }}
        />
      )}
    </div>
  );
}
