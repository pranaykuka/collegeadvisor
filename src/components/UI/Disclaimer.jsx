export default function Disclaimer({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50">
      {/* Top bar */}
      <div className="bg-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h1 className="font-bold text-lg">College Advisor — Legal Disclaimer</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <Section title="General Disclaimer">
          College Advisor is an independent, informational tool and is not affiliated with, endorsed by, or
          connected to any college, university, or government agency. All school data is sourced from the
          U.S. Department of Education's College Scorecard API and may be incomplete, outdated, or subject
          to change. We make no representations as to the accuracy or completeness of any data displayed.
        </Section>

        <Section title="Not Professional Advice">
          The information provided on this website — including school classifications (reach, target, safety),
          admission probability estimates, merit scholarship estimates, and application strategy recommendations
          — is for general informational purposes only. It does not constitute professional college counseling,
          financial aid advice, or legal advice.
          <br /><br />
          Results vary significantly based on factors this tool does not and cannot measure, including essays,
          extracurricular activities, letters of recommendation, demonstrated interest, legacy status, athletic
          recruitment, and admissions office priorities that change year to year. You should consult a licensed
          educational consultant or your school's guidance counselor before making college application decisions.
        </Section>

        <Section title="AI Chatbot">
          The AI advisor feature is powered by a third-party large language model (Anthropic Claude). Responses
          are generated automatically and may contain errors, outdated information, or assumptions that do not
          apply to your situation. AI-generated responses are not a substitute for professional guidance. Do not
          rely solely on chatbot responses when making significant financial or academic decisions.
        </Section>

        <Section title="Admission Probability Estimates">
          Probability percentages shown on this site are statistical estimates based on publicly available
          acceptance rates and test score ranges. They are not predictions of any individual applicant's outcome
          and carry no guarantee of admission or rejection. Colleges make holistic admissions decisions that
          cannot be fully modeled by any algorithm.
        </Section>

        <Section title="No Liability">
          To the fullest extent permitted by law, College Advisor and its operators shall not be liable for any
          direct, indirect, incidental, or consequential damages arising from your use of this website or
          reliance on any information provided herein.
        </Section>

        <Section title="Advertising">
          This website may display advertisements through Google AdSense or similar services. Advertisement
          placement does not constitute an endorsement of any product, service, or institution. Advertising
          revenue helps support the free availability of this tool.
        </Section>

        <Section title="Data Privacy">
          This tool does not store your GPA, test scores, or personal information on our servers beyond the
          duration of your browser session. Your data is used solely to generate your personalized college
          list and is not sold or shared with third parties.
        </Section>

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            ← Back to College Advisor
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">{title}</h2>
      <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}
