export default function Footer({ onDisclaimer }) {
  return (
    <footer className="border-t border-slate-200 bg-white mt-8 py-4 px-6 text-center space-y-2">
      <p className="text-xs text-slate-400 leading-relaxed">
        This tool is for informational purposes only and does not constitute professional college counseling advice.
        Admission probabilities are estimates — actual results vary.{' '}
        <button
          onClick={onDisclaimer}
          className="underline text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          Full Disclaimer
        </button>
      </p>
      <p className="text-xs text-slate-300">
        Data sourced from the U.S. Department of Education College Scorecard API.
      </p>
    </footer>
  );
}
