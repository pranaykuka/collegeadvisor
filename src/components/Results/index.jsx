import { useState } from 'react';
import SchoolCard      from './SchoolCard.jsx';
import ComparisonTable from './ComparisonTable.jsx';
import ChatBot         from './ChatBot.jsx';
import Footer          from '../UI/Footer.jsx';
import { categoryColors, categoryLabel } from '../../utils/formatters.js';

const CATEGORY_ORDER = ['reach', 'target', 'safety'];

export default function Results({ schools, userProfile, onReset, onDisclaimer }) {
  const [view, setView]           = useState('cards'); // 'cards' | 'compare'
  const [compareList, setCompare] = useState([]);

  function toggleCompare(school) {
    setCompare(prev => {
      const exists = prev.find(s => s.id === school.id);
      if (exists) return prev.filter(s => s.id !== school.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, school];
    });
  }

  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = schools.filter(s => s._category === cat);
    return acc;
  }, {});

  const totalCount = schools.length;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="bg-slate-900 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0">🎓</span>
            <div className="min-w-0">
              <h1 className="font-bold text-base leading-none">College Advisor</h1>
              <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[260px] sm:max-w-none">
                GPA {userProfile.gpa} {userProfile.gpaType} ·{' '}
                {userProfile.sat ? `SAT ${userProfile.sat}` : userProfile.act ? `ACT ${userProfile.act}` : 'No score'} ·{' '}
                {userProfile.major}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-slate-400 hidden sm:inline">{totalCount} schools</span>
            <button
              onClick={onReset}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              ← New Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Category summary pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {CATEGORY_ORDER.map(cat => {
            const colors = categoryColors(cat);
            const count  = byCategory[cat].length;
            return (
              <div key={cat} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colors.border} ${colors.bg}`}>
                <span className={`w-2 h-2 rounded-full ${colors.badge}`} />
                <span className={`font-semibold text-sm ${colors.text}`}>
                  {categoryLabel(cat)}: {count} school{count !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('cards')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm border transition-colors ${
              view === 'cards' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
            }`}
          >
            School Cards
          </button>
          <button
            onClick={() => setView('compare')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm border transition-colors ${
              view === 'compare' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
            }`}
          >
            Compare Table
            {compareList.length > 0 && (
              <span className="ml-2 bg-indigo-200 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {compareList.length}
              </span>
            )}
          </button>
          {compareList.length > 0 && view === 'cards' && (
            <p className="text-xs text-slate-400 self-center ml-2">
              {compareList.length}/4 selected — switch to Compare Table to view
            </p>
          )}
        </div>

        {/* Disclaimer notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-xs text-amber-800">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <p>
            Admission probabilities and school classifications are estimates based on public data — not guarantees.
            Many factors (essays, activities, recommendations) are not modeled.{' '}
            <button onClick={onDisclaimer} className="underline font-semibold hover:text-amber-900">
              Full Disclaimer
            </button>
          </p>
        </div>

        {/* Cards view */}
        {view === 'cards' && (
          <div className="space-y-10">
            {CATEGORY_ORDER.map(cat => {
              const catSchools = byCategory[cat];
              if (catSchools.length === 0) return null;
              const colors = categoryColors(cat);
              return (
                <section key={cat}>
                  <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2 ${colors.border}`}>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${colors.badge}`}>
                      {categoryLabel(cat)}
                    </span>
                    <span className="text-slate-500 text-sm">{catSchools.length} school{catSchools.length !== 1 ? 's' : ''}</span>
                    <span className={`text-xs ${colors.text} ml-auto`}>
                      {cat === 'reach'  && 'These schools will be a stretch — your scores are below their typical range'}
                      {cat === 'target' && 'Your profile is competitive for these schools'}
                      {cat === 'safety' && 'You are a strong candidate at these schools'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {catSchools.map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        userProfile={userProfile}
                        selected={!!compareList.find(s => s.id === school.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Compare view */}
        {view === 'compare' && (
          <ComparisonTable
            schools={compareList}
            userProfile={userProfile}
            onRemove={s => setCompare(prev => prev.filter(x => x.id !== s.id))}
          />
        )}
      </div>

      {/* Footer */}
      <Footer onDisclaimer={onDisclaimer} />

      {/* AI Chatbot — floating panel */}
      <ChatBot userProfile={userProfile} schools={schools} />
    </div>
  );
}
