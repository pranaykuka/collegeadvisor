// Application deadline database for well-known US colleges.
// Patterns are matched as case-insensitive substrings of the school name.
// Order matters — more specific patterns must come before general ones.
// Source: publicly available admissions information (verify annually at each school's site).

const ENTRIES = [
  // ── Ivy League ──────────────────────────────────────────────────────────
  ['Harvard',           { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Yale',              { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  ['Princeton',         { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Columbia',          { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['University of Pennsylvania', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Jan 5', notes: null }],
  ['Brown',             { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 5',  notes: null }],
  ['Dartmouth',         { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  ['Cornell',           { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  // ── Near-Ivy / Elite ────────────────────────────────────────────────────
  ['MIT',               { ed1: null,     ed2: null,    ea: 'Nov 1', rd: 'Jan 1',  notes: 'Restrictive EA — cannot apply EA/ED elsewhere' }],
  ['Stanford',          { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  ['California Institute of Technology', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Jan 3', notes: null }],
  ['Caltech',           { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 3',  notes: null }],
  ['Duke',              { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  ['Northwestern',      { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 2',  notes: null }],
  ['Carnegie Mellon',   { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Vanderbilt',        { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Georgetown',        { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 10', notes: null }],
  ['Notre Dame',        { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: 'Restrictive EA' }],
  ['Washington University in St. Louis', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Jan 2', notes: null }],
  ['Emory',             { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Tufts',             { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Wake Forest',       { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Tulane',            { ed1: 'Nov 1',  ed2: 'Jan 15',ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Northeastern',      { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Boston University', { ed1: 'Nov 1',  ed2: 'Jan 2', ea: null,    rd: 'Jan 2',  notes: null }],
  ['Boston College',    { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['New York University', { ed1: 'Nov 1', ed2: 'Jan 1', ea: null,  rd: 'Jan 1',  notes: null }],
  ['Rochester',         { ed1: 'Nov 1',  ed2: 'Jan 5', ea: null,    rd: 'Jan 5',  notes: null }],
  ['Case Western',      { ed1: 'Nov 1',  ed2: 'Jan 15',ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Syracuse',          { ed1: 'Nov 15', ed2: 'Jan 1', ea: 'Nov 15',rd: 'Jan 1',  notes: null }],
  ['Villanova',         { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 15', notes: null }],
  ['George Washington', { ed1: 'Nov 1',  ed2: 'Jan 5', ea: null,    rd: 'Jan 5',  notes: null }],
  ['American University',{ ed1: 'Nov 1', ed2: 'Feb 1', ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Fordham',           { ed1: 'Nov 1',  ed2: 'Dec 1', ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Drexel',            { ed1: 'Nov 1',  ed2: null,    ea: 'Nov 1', rd: 'Mar 1',  notes: null }],
  ['Lehigh',            { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Bucknell',          { ed1: 'Nov 1',  ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Lafayette',         { ed1: 'Nov 1',  ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Babson',            { ed1: 'Nov 1',  ed2: 'Jan 4', ea: null,    rd: 'Feb 1',  notes: null }],
  ['Bentley',           { ed1: 'Nov 15', ed2: 'Jan 15',ea: 'Nov 15',rd: 'Feb 1',  notes: null }],
  ['Quinnipiac',        { ed1: 'Nov 1',  ed2: null,    ea: 'Nov 1', rd: 'Feb 1',  notes: null }],
  ['Fairfield',         { ed1: 'Nov 1',  ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Sacred Heart',      { ed1: null,     ed2: null,    ea: null,    rd: 'Rolling', notes: null }],
  // ── Top Public Universities ─────────────────────────────────────────────
  ['University of Michigan', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Feb 1',  notes: null }],
  ['University of California-Los Angeles', { ed1: null, ed2: null, ea: null, rd: 'Nov 30', notes: 'UC system uses one application for all campuses' }],
  ['University of California-Berkeley', { ed1: null, ed2: null, ea: null, rd: 'Nov 30', notes: 'UC system' }],
  ['University of California', { ed1: null, ed2: null, ea: null, rd: 'Nov 30', notes: 'UC system — one application covers all campuses' }],
  ['University of Virginia', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Jan 1', notes: null }],
  ['Georgia Institute of Technology', { ed1: 'Oct 15', ed2: null, ea: 'Oct 15', rd: 'Jan 1', notes: null }],
  ['Georgia Tech',      { ed1: 'Oct 15', ed2: null,    ea: 'Oct 15',rd: 'Jan 1',  notes: null }],
  ['University of North Carolina', { ed1: 'Oct 15', ed2: null, ea: null, rd: 'Jan 15', notes: null }],
  ['University of Maryland', { ed1: 'Nov 1', ed2: null, ea: null, rd: 'Jan 20', notes: null }],
  ['University of Florida', { ed1: 'Oct 15', ed2: null, ea: 'Oct 15', rd: 'Mar 1', notes: null }],
  ['Florida State',     { ed1: null,     ed2: null,    ea: null,    rd: 'Mar 1',  notes: null }],
  ['University of Texas', { ed1: 'Nov 1', ed2: null,  ea: null,    rd: 'Dec 1',  notes: null }],
  ['Texas A&M',         { ed1: null,     ed2: null,    ea: null,    rd: 'Dec 1',  notes: null }],
  ['Ohio State',        { ed1: null,     ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['Penn State',        { ed1: null,     ed2: null,    ea: null,    rd: 'Nov 30', notes: null }],
  ['Purdue',            { ed1: null,     ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['Indiana University',{ ed1: null,     ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['University of Illinois', { ed1: null, ed2: null,  ea: null,    rd: 'Dec 1',  notes: null }],
  ['University of Wisconsin', { ed1: null, ed2: null, ea: null,    rd: 'Feb 1',  notes: null }],
  ['University of Washington', { ed1: null, ed2: null, ea: null,  rd: 'Nov 15', notes: null }],
  ['University of Pittsburgh', { ed1: 'Nov 1', ed2: 'Dec 1', ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Rutgers',           { ed1: null,     ed2: null,    ea: null,    rd: 'Dec 1',  notes: null }],
  ['University of Connecticut', { ed1: null, ed2: null, ea: null,  rd: 'Feb 1',  notes: null }],
  ['University of Minnesota', { ed1: null, ed2: null, ea: null,   rd: 'Jan 15', notes: null }],
  ['University of Colorado', { ed1: 'Nov 1', ed2: 'Jan 15', ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['University of Arizona', { ed1: null, ed2: null,   ea: null,    rd: 'May 1',  notes: null }],
  ['Arizona State',     { ed1: null,     ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['University of Iowa', { ed1: null,   ed2: null,    ea: null,    rd: 'Apr 1',  notes: null }],
  ['Temple',            { ed1: null,     ed2: null,    ea: null,    rd: 'Mar 1',  notes: null }],
  ['Howard',            { ed1: null,     ed2: null,    ea: null,    rd: 'Feb 15', notes: null }],
  // ── Top Liberal Arts Colleges ────────────────────────────────────────────
  ['Williams',          { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Amherst',           { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Swarthmore',        { ed1: 'Nov 15', ed2: null,    ea: null,    rd: 'Jan 1',  notes: null }],
  ['Wellesley',         { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 8',  notes: null }],
  ['Pomona',            { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 8',  notes: null }],
  ['Harvey Mudd',       { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 5',  notes: null }],
  ['Claremont McKenna', { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 10', notes: null }],
  ['Bowdoin',           { ed1: 'Nov 15', ed2: null,    ea: null,    rd: 'Jan 5',  notes: null }],
  ['Middlebury',        { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Colby',             { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Bates',             { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Colgate',           { ed1: 'Nov 15', ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Hamilton',          { ed1: 'Nov 15', ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Vassar',            { ed1: 'Nov 15', ed2: 'Jan 1', ea: null,    rd: 'Jan 1',  notes: null }],
  ['Oberlin',           { ed1: 'Nov 15', ed2: 'Jan 2', ea: null,    rd: 'Jan 15', notes: null }],
  ['Grinnell',          { ed1: 'Nov 1',  ed2: 'Jan 1', ea: null,    rd: 'Jan 15', notes: null }],
  ['Carleton',          { ed1: 'Nov 15', ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Davidson',          { ed1: 'Nov 15', ed2: null,    ea: null,    rd: 'Jan 15', notes: null }],
  ['Colorado College',  { ed1: 'Nov 1',  ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Kenyon',            { ed1: 'Nov 15', ed2: 'Jan 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Skidmore',          { ed1: 'Nov 1',  ed2: 'Jan 15',ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Trinity College',   { ed1: 'Nov 1',  ed2: 'Jan 1', ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Reed',              { ed1: 'Nov 1',  ed2: 'Dec 1', ea: null,    rd: 'Jan 15', notes: null }],
  // ── Engineering & Tech ───────────────────────────────────────────────────
  ['Rensselaer',        { ed1: 'Nov 1',  ed2: 'Dec 15',ea: null,    rd: 'Jan 15', notes: null }],
  ['Worcester Polytechnic', { ed1: 'Nov 1', ed2: 'Feb 1', ea: null, rd: 'Feb 1', notes: null }],
  ['Stevens Institute', { ed1: 'Nov 15', ed2: null,    ea: 'Nov 15',rd: 'Feb 1',  notes: null }],
  // ── Jesuit / Catholic ───────────────────────────────────────────────────
  ['Santa Clara',       { ed1: 'Nov 1',  ed2: null,    ea: null,    rd: 'Jan 15', notes: null }],
  ['Loyola Marymount',  { ed1: 'Nov 1',  ed2: null,    ea: 'Nov 1', rd: 'Jan 15', notes: null }],
  ['Gonzaga',           { ed1: null,     ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['Creighton',         { ed1: 'Nov 1',  ed2: null,    ea: 'Nov 1', rd: 'Feb 1',  notes: null }],
  ['Marquette',         { ed1: null,     ed2: null,    ea: 'Dec 1', rd: 'Dec 1',  notes: null }],
  // ── HBCUs ───────────────────────────────────────────────────────────────
  ['Spelman',           { ed1: 'Oct 15', ed2: null,    ea: null,    rd: 'Feb 1',  notes: null }],
  ['Morehouse',         { ed1: 'Oct 15', ed2: null,    ea: null,    rd: 'Feb 15', notes: null }],
];

// Default for schools not in the database
const DEFAULT = {
  ed1: 'Nov 1*',
  ed2: 'Jan 1*',
  ea:  'Nov 1*',
  rd:  'Jan 15*',
  notes: '* Typical dates — verify on the school\'s website',
};

export function getDeadlines(schoolName) {
  if (!schoolName) return DEFAULT;
  const lower = schoolName.toLowerCase();
  for (const [pattern, deadlines] of ENTRIES) {
    if (lower.includes(pattern.toLowerCase())) return deadlines;
  }
  return DEFAULT;
}
