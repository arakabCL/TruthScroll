// TruthScroll scoring & progression
// Each case is graded out of 1,000 XP: 500 verdict + 450 evidence/notes + 50 speed.
// Streak bonuses stack on top across cases.

export const MAX_CASE_XP = 1000
export const MAX_VERDICT_PTS = 500
export const MAX_EVIDENCE_PTS = 450
export const MAX_SPEED_PTS = 50
export const NOTE_CHAR_CAP = 200

/* ─────────── Sticky-note tags ─────────── */
export const TAGS = [
  { id: 'supports', emoji: '✅', label: 'Supports',         hint: 'Backs the headline up' },
  { id: 'refutes',  emoji: '❌', label: 'Refutes',          hint: 'Says the headline is wrong' },
  { id: 'mixed',    emoji: '⚠️', label: 'Mixed / Half-True', hint: 'Partly correct or true-but-twisted' },
  { id: 'sketchy',  emoji: '🚩', label: 'Sketchy Source',   hint: "The source itself is the problem" },
]
export const tagById = (id) => TAGS.find((t) => t.id === id)

/* ─────────── Verdict adjacency matrix (rows: correct, cols: picked) ─────────── */
export const VERDICT_MATRIX = {
  TRUE:         { TRUE: 500, FALSE: 0,   MISLEADING: 250, SATIRE: 0,   UNVERIFIABLE: 150 },
  FALSE:        { TRUE: 0,   FALSE: 500, MISLEADING: 250, SATIRE: 200, UNVERIFIABLE: 150 },
  MISLEADING:   { TRUE: 200, FALSE: 200, MISLEADING: 500, SATIRE: 75,  UNVERIFIABLE: 150 },
  SATIRE:       { TRUE: 0,   FALSE: 250, MISLEADING: 75,  SATIRE: 500, UNVERIFIABLE: 150 },
  UNVERIFIABLE: { TRUE: 100, FALSE: 100, MISLEADING: 100, SATIRE: 75,  UNVERIFIABLE: 500 },
}
export const scoreVerdict = (correctVerdict, pickedVerdict) =>
  VERDICT_MATRIX[correctVerdict]?.[pickedVerdict] ?? 0

/* ─────────── Per-pin sticky-tag scoring ─────────── */
// Correct tag: +20/+15/+10 by credibility tier. Wrong tag: −5. Not pinned: 0.
const TAG_TIER_PTS = {
  high:   { correct: 20, wrong: -5 },
  medium: { correct: 15, wrong: -5 },
  low:    { correct: 10, wrong: -5 },
}
export const scoreTag = (tag, item) => {
  if (!tag) return { pts: 0, correct: false }
  const correct = (item.expectedTags || []).includes(tag)
  const tier = TAG_TIER_PTS[item.credibility] || TAG_TIER_PTS.medium
  return { pts: correct ? tier.correct : tier.wrong, correct }
}

/* ─────────── Note quality (0–3 stars) ───────────
   Real product should call the LLM grader. This local heuristic gives
   the same {stars, pts, feedback} shape so swap-in is one function. */
export const NOTE_PTS_BY_STARS = { 0: 0, 1: 10, 2: 30, 3: 50 }

const VAGUE_PATTERN = /^(idk|i don'?t know|seems?\s+(fake|real|sus|legit)|i don'?t trust this|this is fake|fake|sus+y?|sketchy|legit|trust(ed|y)?|sketch)\.?\s*$/i

const VERDICT_KEYWORDS = {
  TRUE:         ['real', 'true', 'confirm', 'verified', 'happened', 'documented', 'support', 'support'],
  FALSE:        ['fake', 'false', 'made up', 'no source', 'no record', 'debunk', 'refute', 'ai', 'generated', 'no proof'],
  MISLEADING:   ['mislead', 'misleading', 'spin', 'framing', 'twisted', 'partly', 'half', 'tabloid', 'exaggerat'],
  SATIRE:       ['satire', 'joke', 'parody', 'comedy', 'fake on purpose', 'pretend', 'kidding', 'student'],
  UNVERIFIABLE: ["can't tell", 'unclear', 'not sure', 'unverif', 'no way to know', 'unknown'],
}

export const scoreNoteHeuristic = (note, item, correctVerdict) => {
  const trimmed = (note || '').trim()
  if (!trimmed) return { stars: 0, pts: 0, feedback: 'No note. Even one specific reason helps next time.' }
  if (trimmed.length < 5) return { stars: 0, pts: 0, feedback: 'Way too short — try one full sentence.' }
  if (VAGUE_PATTERN.test(trimmed) || trimmed.length < 18) {
    return { stars: 1, pts: 10, feedback: 'Try saying WHAT in the doc made you feel that way.' }
  }

  const lower = trimmed.toLowerCase()
  const docHay = [
    item.title, item.source, item.author, item.headlineBig,
    item.paperTitle, item.subject, item.from,
  ].filter(Boolean).join(' ').toLowerCase()

  const noteWords = lower.split(/\W+/).filter((w) => w.length > 3)
  const specific = noteWords.some((w) => docHay.includes(w))
  const verdictHints = VERDICT_KEYWORDS[correctVerdict] || []
  const verdictHit = verdictHints.some((w) => lower.includes(w))

  if (specific && verdictHit) {
    return { stars: 3, pts: 50, feedback: "Specific AND tied to your verdict — that's detective work." }
  }
  if (specific) {
    return { stars: 2, pts: 30, feedback: 'Specific. Now also link it back to your verdict next time.' }
  }
  if (verdictHit) {
    return { stars: 2, pts: 30, feedback: "Good reasoning — point at the doc's specifics too." }
  }
  return { stars: 1, pts: 10, feedback: 'Reference something specific from the doc.' }
}

/* ─────────── Speed bonus — only rewards CORRECT verdicts ─────────── */
export const scoreSpeed = (timeLeftMs, totalMs, correct) => {
  if (!correct || timeLeftMs <= 0 || totalMs <= 0) {
    return { tier: 'NONE', label: 'No bonus', emoji: '⏱', pts: 0 }
  }
  const elapsedMs = totalMs - timeLeftMs
  if (elapsedMs <= 2 * 60_000) return { tier: 'UNDER_2', label: 'Under 2 min', emoji: '⚡', pts: 50 }
  if (elapsedMs <= 4 * 60_000) return { tier: 'UNDER_4', label: '2–4 min',     emoji: '🔥', pts: 25 }
  return { tier: 'OVER_4', label: 'Over 4 min', emoji: '🕐', pts: 0 }
}

/* ─────────── Letter grade ─────────── */
export const GRADES = [
  { letter: 'S', min: 900, label: 'Outstanding Work, Agent', stamp: 'bg-amber-400 text-amber-900 border-amber-700' },
  { letter: 'A', min: 800, label: 'Case Closed',             stamp: 'bg-sky-400 text-sky-950 border-sky-700' },
  { letter: 'B', min: 700, label: 'Solid Verification',      stamp: 'bg-emerald-400 text-emerald-950 border-emerald-700' },
  { letter: 'C', min: 600, label: 'Verified With Concerns',  stamp: 'bg-yellow-300 text-yellow-900 border-yellow-700' },
  { letter: 'D', min: 500, label: 'Case Needs Review',       stamp: 'bg-orange-400 text-orange-950 border-orange-800' },
  { letter: 'F', min: 0,   label: 'Case Reopened',           stamp: 'bg-rose-500 text-white border-rose-900' },
]
export const gradeFor = (totalXP) => GRADES.find((g) => totalXP >= g.min) || GRADES[GRADES.length - 1]
const GRADE_ORDER = { F: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }
export const gradeAtLeast = (letter, min) => GRADE_ORDER[letter] >= GRADE_ORDER[min]

/* ─────────── Rank ladder ─────────── */
export const RANKS = [
  { id: 'cadet',    name: 'Cadet',              xp: 0,     unlock: 'Default badge, starter corkboard' },
  { id: 'junior',   name: 'Junior Verifier',    xp: 2500,  unlock: 'Bronze badge, desk skin choice' },
  { id: 'field',    name: 'Field Investigator', xp: 7000,  unlock: 'Silver badge, new stamps' },
  { id: 'senior',   name: 'Senior Analyst',     xp: 15000, unlock: 'Gold badge, mentor unlocks' },
  { id: 'chief',    name: 'Bureau Chief',       xp: 30000, unlock: 'Platinum badge, share cases' },
  { id: 'director', name: 'Director',           xp: 60000, unlock: 'Endgame seal, leaderboards' },
]
export const rankFor = (xp) => {
  let current = RANKS[0]
  for (const r of RANKS) if (xp >= r.xp) current = r
  const idx = RANKS.indexOf(current)
  const next = RANKS[idx + 1] || null
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1
  return { current, next, progress: Math.max(0, Math.min(1, progress)), toNext: next ? next.xp - xp : 0 }
}

/* ─────────── Skill tracks ───────────
   Each case exercises three media-literacy skills. Pin tags, notes, and the verdict
   all contribute XP into one or more buckets so the kid can see WHICH detective
   skills they're building — separate from the rank ladder. */
export const SKILLS = [
  {
    id: 'criticalThinking',
    name: 'Critical Thinking',
    short: 'Critical',
    emoji: '🧠',
    blurb: 'Weighing evidence, writing reasoning, admitting uncertainty.',
    gradient: 'from-sky-400 via-indigo-500 to-fuchsia-500',
    ring: 'ring-indigo-400/40',
  },
  {
    id: 'misinfoSpotting',
    name: 'Misinformation Spotting',
    short: 'Misinfo',
    emoji: '🎯',
    blurb: 'Calling out fake, manipulated, or twisted claims.',
    gradient: 'from-rose-400 via-fuchsia-500 to-purple-500',
    ring: 'ring-rose-400/40',
  },
  {
    id: 'sourceAwareness',
    name: 'Source Awareness',
    short: 'Sources',
    emoji: '🔍',
    blurb: 'Spotting sketchy sites, satire, and clickbait — and trusting the real deal.',
    gradient: 'from-amber-300 via-orange-400 to-rose-500',
    ring: 'ring-amber-400/40',
  },
]
export const skillById = (id) => SKILLS.find((s) => s.id === id)

// Tag → which skill bucket it builds when the kid gets it right
const TAG_TO_SKILL = {
  sketchy:  'sourceAwareness',
  refutes:  'misinfoSpotting',
  supports: 'criticalThinking',
  mixed:    'criticalThinking',
}

// Verdict pts split: how the 500-pt verdict reward divides into skills,
// based on what the CORRECT verdict for the case was.
const VERDICT_SKILL_SPLITS = {
  TRUE:         { criticalThinking: 1.0 },
  FALSE:        { misinfoSpotting:  1.0 },
  MISLEADING:   { misinfoSpotting:  0.5, criticalThinking: 0.5 },
  SATIRE:       { sourceAwareness:  0.6, criticalThinking: 0.4 },
  UNVERIFIABLE: { criticalThinking: 1.0 },
}

function emptySkills() {
  return SKILLS.reduce((acc, s) => { acc[s.id] = 0; return acc }, {})
}

// Compute per-skill XP contributions for one case.
function computeSkillXP({ pinResults, verdictPts, correctVerdict }) {
  const skills = emptySkills()

  pinResults.forEach((p) => {
    // Tag XP only counts toward a skill when the kid tagged it correctly.
    if (p.tagCorrect && p.tagPts > 0) {
      const bucket = TAG_TO_SKILL[p.tag]
      if (bucket) skills[bucket] += p.tagPts
    }
    // Notes always feed Critical Thinking — that's literally the skill of writing your reasoning.
    if (p.notePts > 0) {
      skills.criticalThinking += p.notePts
    }
  })

  // Verdict pts get distributed by what the case actually was.
  const split = VERDICT_SKILL_SPLITS[correctVerdict] || { criticalThinking: 1.0 }
  Object.entries(split).forEach(([id, frac]) => {
    skills[id] = (skills[id] || 0) + Math.round(verdictPts * frac)
  })

  return skills
}

/* ─────────── Streak bonuses ─────────── */
export const STREAK_BONUSES = [
  { id: 'perfectFive', min: 5, requires: 'S', pts: 1000, label: 'Perfect S streak ×5' },
  { id: 'fiveAPlus',   min: 5, requires: 'A', pts: 500,  label: '5 in a row, A+ grade' },
  { id: 'threeBPlus',  min: 3, requires: 'B', pts: 200,  label: '3 in a row, B+ grade' },
]

// Given an array of recent grade letters (oldest → newest), return the highest active bonus.
export const detectStreakBonus = (gradeHistory) => {
  for (const rule of STREAK_BONUSES) {
    const recent = gradeHistory.slice(-rule.min)
    if (recent.length === rule.min && recent.every((g) => gradeAtLeast(g, rule.requires))) {
      return rule
    }
  }
  return null
}

/* ─────────── Top-level case scorer ─────────── */
export function scoreCase({ headline, pickedVerdict, pins, timeLeftMs, totalMs, gradeHistory = [] }) {
  // Verdict
  const verdictPts = scoreVerdict(headline.correctVerdict, pickedVerdict)
  const correct = pickedVerdict === headline.correctVerdict

  // Per-pin evidence + notes
  const pinResults = pins.map((p) => {
    const item = headline.evidencePool.find((e) => e.id === p.id)
    if (!item) return null
    const tagResult = scoreTag(p.tag, item)
    const noteResult = scoreNoteHeuristic(p.note, item, headline.correctVerdict)
    return {
      id: p.id,
      title: item.title,
      source: item.source,
      credibility: item.credibility,
      tag: p.tag,
      tagCorrect: tagResult.correct,
      tagPts: tagResult.pts,
      note: p.note || '',
      stars: noteResult.stars,
      notePts: noteResult.pts,
      noteFeedback: noteResult.feedback,
      totalPinPts: tagResult.pts + noteResult.pts,
    }
  }).filter(Boolean)

  const rawEvidencePts = pinResults.reduce((sum, r) => sum + r.totalPinPts, 0)
  // Floor evidence at 0 and cap at 450
  const evidencePts = Math.max(0, Math.min(MAX_EVIDENCE_PTS, rawEvidencePts))

  // Speed (only on correct verdict)
  const speed = scoreSpeed(timeLeftMs, totalMs, correct)

  const caseXP = verdictPts + evidencePts + speed.pts
  const grade = gradeFor(caseXP)

  // Streak — uses the history INCLUDING this case's grade
  const newHistory = [...gradeHistory, grade.letter]
  const streak = detectStreakBonus(newHistory)
  const streakBonus = streak ? streak.pts : 0

  const totalXP = caseXP + streakBonus

  // Per-skill XP contributions for this case
  const skillXP = computeSkillXP({
    pinResults,
    verdictPts,
    correctVerdict: headline.correctVerdict,
  })

  return {
    correct,
    verdictPts,
    pinResults,
    evidencePts,
    evidenceRawPts: rawEvidencePts,
    speed,
    caseXP,
    grade,
    streak,
    streakBonus,
    totalXP,
    skillXP,
  }
}
