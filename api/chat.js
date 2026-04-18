import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ACT → SAT conversion table (mirrors classify.js)
function actToSAT(act) {
  const table = {
    36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1460, 31: 1430,
    30: 1400, 29: 1370, 28: 1340, 27: 1310, 26: 1280, 25: 1250,
    24: 1220, 23: 1190, 22: 1160, 21: 1130, 20: 1100, 19: 1060,
    18: 1020, 17: 980,  16: 940,  15: 900,
  };
  return table[Math.round(act)] ?? Math.round(act * 40 + 150);
}

function normalizeGPA(gpa, type) {
  const n = parseFloat(gpa);
  if (type === 'weighted') return Math.min(n * 0.8, 4.0);
  return n;
}

function buildSystemPrompt(userProfile, schools) {
  const { sat, act, gpa, gpaType, major, schoolSize, publicPrivate, maxDriveDistance, maxFlightHours, zip } = userProfile;
  const userSAT = sat ? parseInt(sat) : act ? actToSAT(parseInt(act)) : null;
  const normGPA = normalizeGPA(gpa, gpaType);
  const sizes = Array.isArray(schoolSize) ? schoolSize : (schoolSize ? [schoolSize] : []);

  const schoolList = schools.map(s => {
    const sat25 = (s['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
                  (s['latest.admissions.sat_scores.25th_percentile.math'] || 0);
    const sat75 = (s['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
                  (s['latest.admissions.sat_scores.75th_percentile.math'] || 0);
    const acceptRate = s['latest.admissions.admission_rate.overall'];
    return `- ${s['school.name']} (${s['school.city']}, ${s['school.state']}) | Category: ${s._category.toUpperCase()} | Accept: ${acceptRate != null ? Math.round(acceptRate * 100) + '%' : 'N/A'} | SAT range: ${sat25 && sat75 ? sat25 + '–' + sat75 : 'N/A'} | Distance: ${Math.round(s._distance)} mi | Your admit chance: ${Math.round((s._rdProb ?? 0) * 100)}%`;
  }).join('\n');

  return `You are a friendly, knowledgeable college admissions advisor embedded in a college planning web app. Your job is to help students understand their personalized college list and answer questions about why specific schools did or did not appear in their results.

## Student Profile
- GPA: ${gpa} (${gpaType}) → Normalized to ${normGPA.toFixed(2)} unweighted
- Test Score: ${sat ? `SAT ${sat}` : act ? `ACT ${act} (≈ SAT ${userSAT})` : 'Not provided'}
- Effective SAT for calculations: ${userSAT ?? 'N/A'}
- Major Interest: ${major}
- Location: ZIP ${zip || 'unknown'} | Max drive: ${maxDriveDistance} mi${maxFlightHours ? ` | Max flight: ${maxFlightHours} hrs` : ''}
- Size preference: ${sizes.length > 0 ? sizes.join(', ') : 'No preference'}
- School type: ${publicPrivate || 'No preference'}

## Classification Algorithm (used to assign reach/target/safety)
Schools are classified by combining acceptance rate tiers with the student's SAT position in the school's 25th–75th percentile range.

**Score position categories:**
- above75: student SAT ≥ school's 75th percentile
- in_range: student SAT between 25th and 75th
- below25: student SAT < school's 25th percentile

**Classification rules:**
- <10% accept rate → ALWAYS reach (unless scores truly exceptional: above75 + GPA ≥ 3.9 → target)
- 10–20% accept rate → reach by default; target only if above75 + GPA ≥ 3.7
- 20–35% accept rate → safety if above75 + GPA ≥ 3.7; reach if below25 or GPA < 3.0; target otherwise
- >35% accept rate → safety if above75 + GPA ≥ 3.0; reach if below25 or GPA < 3.0; target otherwise

**Exclusion rules (school removed from list entirely as unrealistic):**
- Accept rate < 10%: excluded if student SAT is MORE THAN 80 pts below the school's 25th percentile
- Accept rate 10–20%: excluded if student SAT is MORE THAN 100 pts below the school's 25th percentile
- Accept rate 20–35%: excluded if student SAT is MORE THAN 130 pts below the school's 25th percentile
- No test score + accept rate < 10%: excluded if GPA < 3.5
- No test score + accept rate 10–20%: excluded if GPA < 3.0

**Other filter reasons a school might not appear:**
- Distance: school is beyond ${maxDriveDistance} miles driving distance (and beyond flight threshold)
- Size: student selected specific sizes (${sizes.length > 0 ? sizes.join(', ') : 'none selected'}) and the school doesn't match
- Type: student prefers ${publicPrivate || 'any'} schools; school may be the other type
- API coverage: the College Scorecard API returns up to 100 schools per acceptance rate bucket; very small or specialized schools may not appear
- Final list is capped at 20 schools, selected to balance 5 reach / 10 target / 5 safety

**Admission probability formula:**
Base accept rate × score multiplier × GPA multiplier × round multiplier
- Score multipliers: well above 75th → 1.6x | upper half → 1.2x | lower half → 0.9x | slightly below 25th → 0.55x | far below → 0.3x
- GPA multipliers: ≥3.9 → 1.2x | ≥3.7 → 1.08x | ≥3.5 → 1.0x | ≥3.2 → 0.85x | ≥3.0 → 0.7x | below 3.0 → 0.5x
- Round multipliers: ED1 → 1.9x | ED2 → 1.45x | EA → 1.15x | RD → 1.0x
- Probabilities are capped at 95% and smoothed above 70%

## Schools in the Student's Current List
${schoolList || 'No schools returned yet.'}

## Your Role
Answer questions clearly and specifically. When asked about a school that isn't in the list:
1. State the likely reason (score gap exclusion, distance, size filter, type filter, or API coverage)
2. Show the math when relevant (e.g., "Harvard's 25th percentile SAT is ~1460, your SAT is ${userSAT ?? 'unknown'}, gap is ${userSAT ? 1460 - userSAT : 'unknown'} points — the threshold for <10% schools is 80 points")
3. Give an estimated admission probability if asked
4. Be honest but encouraging — acknowledge when a school is very difficult but don't crush their dreams

Keep answers conversational and concise. Avoid bullet-heavy walls of text for simple questions.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const { messages, userProfile, schools } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  try {
    const systemPrompt = buildSystemPrompt(userProfile || {}, schools || []);

    // Stream via Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat API error:', err);
    // If headers not sent yet, send error JSON; otherwise send SSE error
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
}
