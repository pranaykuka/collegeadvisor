import { useState } from 'react';
import Step1Academic    from './Step1Academic.jsx';
import Step2Location    from './Step2Location.jsx';
import Step3Preferences from './Step3Preferences.jsx';
import Step4Profile     from './Step4Profile.jsx';
import Footer           from '../UI/Footer.jsx';

const STEPS = ['Academic Profile', 'Location & Distance', 'School Preferences', 'Additional Profile'];

const DEFAULTS = {
  // Step 1
  gpa: '', gpaType: 'unweighted', testType: 'SAT', sat: '', act: '',
  // Step 2
  zipCode: '', maxDriveDistance: 500, maxFlightHours: '',
  // Step 3
  major: 'Undecided', schoolSize: [], publicPrivate: '',
  // Step 4 (all optional)
  athleticRecruitment: '',
  hasLegacy: false,
  legacySchools: '',
  firstGen: '',
  financialSituation: '',
  ecTier: '',
  gender: '',
};

function validate(step, data) {
  if (step === 0) {
    if (!data.gpa || isNaN(parseFloat(data.gpa))) return 'Please enter your GPA.';
    const gpa = parseFloat(data.gpa);
    if (data.gpaType === 'unweighted' && (gpa < 0 || gpa > 4.0)) return 'Unweighted GPA must be 0–4.0.';
    if (data.gpaType === 'weighted'   && (gpa < 0 || gpa > 5.0)) return 'Weighted GPA must be 0–5.0.';
    if (data.testType === 'SAT') {
      if (!data.sat) return 'Please enter your SAT score.';
      const s = parseInt(data.sat);
      if (s < 400 || s > 1600) return 'SAT score must be between 400 and 1600.';
    }
    if (data.testType === 'ACT') {
      if (!data.act) return 'Please enter your ACT score.';
      const a = parseInt(data.act);
      if (a < 1 || a > 36) return 'ACT score must be between 1 and 36.';
    }
  }
  if (step === 1) {
    if (!data.zipCode || data.zipCode.length !== 5) return 'Please enter a valid 5-digit zip code.';
  }
  return null;
}

export default function InputForm({ onSubmit, error, onDisclaimer }) {
  const [step, setStep]     = useState(0);
  const [data, setData]     = useState(DEFAULTS);
  const [stepErr, setStepErr] = useState(null);

  function next() {
    const err = validate(step, data);
    if (err) { setStepErr(err); return; }
    setStepErr(null);
    setStep(s => s + 1);
  }

  function back() {
    setStepErr(null);
    setStep(s => s - 1);
  }

  function submit() {
    const err = validate(step, data);
    if (err) { setStepErr(err); return; }
    onSubmit({
      gpa:            data.gpa,
      gpaType:        data.gpaType,
      sat:            data.testType === 'SAT' ? data.sat : null,
      act:            data.testType === 'ACT' ? data.act : null,
      zipCode:        data.zipCode,
      maxDriveDistance: parseFloat(data.maxDriveDistance),
      maxFlightHours:   data.maxFlightHours ? parseFloat(data.maxFlightHours) : null,
      major:                data.major,
      schoolSize:           data.schoolSize,
      publicPrivate:        data.publicPrivate,
      athleticRecruitment:  data.athleticRecruitment,
      hasLegacy:            data.hasLegacy,
      legacySchools:        data.legacySchools,
      firstGen:             data.firstGen,
      financialSituation:   data.financialSituation,
      ecTier:               data.ecTier,
      gender:               data.gender,
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 text-3xl">🎓</div>
          <h1 className="text-3xl font-extrabold text-slate-900">College Advisor</h1>
          <p className="text-slate-500 mt-1">Find your perfect reach, target & safety schools</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              {i < STEPS.length - 1 && <div className={`w-2 h-2 rounded-full mx-1 ${i < step ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center -mt-5 mb-6">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 0 && <Step1Academic    data={data} onChange={setData} />}
          {step === 1 && <Step2Location    data={data} onChange={setData} />}
          {step === 2 && <Step3Preferences data={data} onChange={setData} />}
          {step === 3 && <Step4Profile     data={data} onChange={setData} />}

          {/* Errors */}
          {(stepErr || error) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {stepErr || error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="flex-1 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
              >
                Find My Schools →
              </button>
            )}
          </div>
        </div>

        {/* API Key hint */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by the{' '}
          <a href="https://collegescorecard.ed.gov" target="_blank" rel="noreferrer" className="underline">
            US College Scorecard API
          </a>
        </p>
      </div>
      <div className="w-full max-w-xl">
        <Footer onDisclaimer={onDisclaimer} />
      </div>
    </div>
  );
}
