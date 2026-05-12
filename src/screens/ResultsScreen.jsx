import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { tagById, SKILLS, MAX_VERDICT_PTS, MAX_EVIDENCE_PTS, MAX_SPEED_PTS } from '../lib/scoring.js'

const PAGES = [
  { id: 'verdict',  label: 'The Verdict' },
  { id: 'story',    label: 'The Story' },
  { id: 'review',   label: 'Bureau Review' },
  { id: 'score',    label: 'The Score' },
  { id: 'final',    label: 'Case Total' },
]

export default function ResultsScreen({
  result,
  runningScore,
  headlineIndex,
  totalHeadlines,
  onNext,
  onRestart,
  isRoundOver,
}) {
  const [page, setPage] = useState(0)
  const cur = PAGES[page]
  const last = page === PAGES.length - 1
  const first = page === 0
  const goNext = () => setPage((p) => Math.min(PAGES.length - 1, p + 1))
  const goPrev = () => setPage((p) => Math.max(0, p - 1))

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#2b221a] p-3 sm:p-6 overflow-y-auto text-[#3b2a1a]">
      {/* Wood texture overlay */}
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div className="fixed inset-0 pointer-events-none mix-blend-multiply opacity-50 bg-gradient-to-br from-[#7a4c28] to-[#120a05]" />

      <div className="relative z-10 mx-auto max-w-2xl pt-8 pb-32">
        {/* Folder shell with tab + page indicator */}
        <div className="relative">
          {/* Folder tab */}
          <div className="absolute -top-7 sm:-top-8 left-6 z-10 bg-[#e4c49d] rounded-t-xl border-t-[3px] border-l-[3px] border-r-[3px] border-[#8a5326] px-5 sm:px-6 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
            <span className="font-chaos text-[12px] sm:text-[14px] tracking-widest text-[#5a3a1a] leading-none uppercase">
              Case File {headlineIndex + 1} of {totalHeadlines} · {cur.label}
            </span>
          </div>

          {/* Page dots */}
          <div className="absolute -top-6 sm:-top-7 right-6 z-10 flex items-center gap-1.5">
            {PAGES.map((p, i) => (
              <div
                key={p.id}
                className={`h-2.5 sm:h-3 rounded-full transition-all ${
                  i === page ? 'w-7 bg-[#c82424]' : i < page ? 'w-2.5 bg-[#8a5326]/70' : 'w-2.5 bg-[#8a5326]/25'
                }`}
              />
            ))}
          </div>

          {/* The folder body */}
          <div className="relative rounded-lg bg-[#e4c49d] border-[3px] border-[#8a5326] shadow-[0_18px_40px_-10px_rgba(0,0,0,0.55)] p-4 sm:p-6 min-h-[500px] sm:min-h-[560px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={cur.id}
                initial={{ opacity: 0, x: 36, rotate: 1 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -28, rotate: -1 }}
                transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex-1 flex flex-col"
              >
                {cur.id === 'verdict' && <VerdictPage result={result} />}
                {cur.id === 'story'   && <StoryPage   result={result} />}
                {cur.id === 'review'  && <ReviewPage  result={result} />}
                {cur.id === 'score'   && <ScorePage   result={result} />}
                {cur.id === 'final'   && <FinalPage   result={result} runningScore={runningScore} isRoundOver={isRoundOver} onNext={onNext} onRestart={onRestart} />}
              </motion.div>
            </AnimatePresence>

            {/* Bottom nav */}
            <div className="mt-5 sm:mt-7 flex items-center justify-between gap-3 border-t-[3px] border-dashed border-[#8a5326]/40 pt-4">
              <button
                onClick={goPrev}
                disabled={first}
                className={`press rounded-full border-[3px] px-4 sm:px-5 py-2.5 sm:py-3 font-mono font-bold uppercase tracking-widest text-[13px] sm:text-[14px] transition ${
                  first
                    ? 'border-[#8a5326]/20 text-[#8a5326]/30 cursor-not-allowed'
                    : 'border-[#8a5326]/70 bg-[#fdfcf9] text-[#5a3a1a] hover:bg-white shadow-sm'
                }`}
              >
                ← Back
              </button>
              {!last && (
                <button
                  onClick={goNext}
                  className="press relative rounded-full bg-[#c82424] border-[3px] border-[#8a5326] px-7 sm:px-9 py-3 sm:py-3.5 font-chaos text-[18px] sm:text-[22px] tracking-wider text-white shadow-[0_6px_0_#8a5326,0_10px_18px_rgba(0,0,0,0.3)] hover:translate-y-[1px] hover:shadow-[0_5px_0_#8a5326,0_8px_14px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-[0_3px_0_#8a5326,0_5px_10px_rgba(0,0,0,0.3)] transition"
                >
                  NEXT →
                </button>
              )}
              {last && <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ PAGE 1 — VERDICT REVEAL ═══════════════════ */
// Different verdict words have wildly different lengths (TRUE = 4 chars,
// UNVERIFIABLE = 12). Scale the chaos font down so even the longest fits its card.
const verdictSizeClass = (v) => {
  const n = (v || '').length
  if (n <= 5)  return 'text-[28px] sm:text-[36px]'
  if (n <= 7)  return 'text-[24px] sm:text-[32px]'
  if (n <= 10) return 'text-[20px] sm:text-[26px]'
  return 'text-[16px] sm:text-[22px]' // UNVERIFIABLE etc.
}

function VerdictPage({ result }) {
  const { headline, chosenVerdict, scored } = result
  const { correct, grade } = scored
  return (
    <div className="flex-1 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}
        className={`rounded-2xl border-[5px] px-5 py-3 sm:px-7 sm:py-4 font-chaos shadow-[0_10px_20px_rgba(0,0,0,0.2)] ${
          correct ? 'border-emerald-700 bg-emerald-100 text-emerald-900' : 'border-rose-700 bg-rose-100 text-rose-900'
        }`}
      >
        <div className="text-[12px] sm:text-[14px] font-mono uppercase tracking-[0.3em] opacity-70">
          Case
        </div>
        <div className="font-chaos text-[28px] sm:text-[40px] leading-none tracking-tight mt-1">
          {correct ? 'CLOSED' : 'REOPENED'}
        </div>
      </motion.div>

      <div className="mt-5 sm:mt-6 font-serif text-[14px] sm:text-[16px] italic text-[#5a3a1a]/80 max-w-md leading-snug px-2">
        “{headline.headline}”
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring' }}
          className="rounded-xl border-[4px] border-emerald-700 bg-emerald-100 px-3 py-4 sm:py-5 shadow-[0_6px_0_rgba(6,78,59,0.45)] min-w-0 overflow-hidden"
        >
          <div className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-800/70">
            Correct verdict
          </div>
          <div className={`mt-1.5 font-chaos leading-none tracking-tight text-emerald-900 break-words ${verdictSizeClass(headline.correctVerdict)}`}>
            {headline.correctVerdict}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className={`rounded-xl border-[4px] px-3 py-4 sm:py-5 shadow-[0_6px_0_rgba(0,0,0,0.25)] min-w-0 overflow-hidden ${
            correct
              ? 'border-emerald-700 bg-emerald-100'
              : 'border-rose-700 bg-rose-100'
          }`}
        >
          <div className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest ${correct ? 'text-emerald-800/70' : 'text-rose-800/70'}`}>
            Your call
          </div>
          <div className={`mt-1.5 font-chaos leading-none tracking-tight break-words ${correct ? 'text-emerald-900' : 'text-rose-900'} ${verdictSizeClass(chosenVerdict)}`}>
            {chosenVerdict}
          </div>
        </motion.div>
      </div>

      {/* Letter grade stamp */}
      <motion.div
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 260, damping: 13 }}
        className="mt-7 sm:mt-9"
      >
        <div className={`inline-block rounded-md border-[5px] px-6 py-2.5 sm:px-8 sm:py-3 shadow-md ${grade.stamp}`}>
          <div className="font-chaos text-[56px] sm:text-[72px] leading-none text-center tracking-tighter">
            {grade.letter}
          </div>
          <div className="text-[10px] sm:text-[12px] font-mono uppercase tracking-widest text-center -mt-1">
            {grade.label}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════ PAGE 2 — THE STORY ═══════════════════ */
function StoryPage({ result }) {
  const { headline } = result
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Polaroid */}
        <div className="self-center sm:self-start w-40 sm:w-44 shrink-0 bg-[#fdfcf9] p-2 pb-7 shadow-md rounded-sm rotate-[-3deg] border border-[#e6ded3]">
          <div className="w-full aspect-square bg-black overflow-hidden relative shadow-inner mb-2 border border-black/10">
            {headline.video ? (
              <video src={headline.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl bg-[#1c1b18] text-white">
                {headline.thumbnail}
              </div>
            )}
          </div>
          <div className="text-center font-serif italic text-[11px] text-black/60 font-bold">Subject</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-[#5a3a1a]/70 mb-2">
            What was actually going on?
          </div>
          <div className="font-serif text-[16px] sm:text-[18px] leading-[1.6] text-[#1c1b18]">
            {headline.explanation}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ PAGE 3 — BUREAU REVIEW ═══════════════════ */
function ReviewPage({ result }) {
  const { pinResults } = result.scored
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-[#5a3a1a]/70 mb-3">
        Bureau Review · {pinResults.length} pin{pinResults.length === 1 ? '' : 's'}
      </div>
      {pinResults.length === 0 ? (
        <div className="rounded-lg border-[3px] border-rose-300 bg-rose-50 px-4 py-4 text-[15px] italic text-rose-900 leading-snug">
          No evidence pinned. Next time, drop a few of the most trustworthy docs and tag them.
        </div>
      ) : (
        <div className="space-y-3">
          {pinResults.map((p) => <PinReview key={p.id} pin={p} />)}
        </div>
      )}
    </div>
  )
}

function PinReview({ pin }) {
  const tag = tagById(pin.tag)
  return (
    <div className="rounded-lg border-[3px] border-[#8a5326]/30 bg-[#fdfcf9] px-3.5 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-[26px] sm:text-[30px] leading-none mt-0.5">{tag?.emoji ?? '📎'}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-black/55 mb-0.5 truncate">
            {pin.source}
          </div>
          <div className="text-[14px] sm:text-[15px] font-bold leading-snug line-clamp-2">{pin.title}</div>
          {pin.note && (
            <div className="mt-1.5 text-[13px] italic leading-snug text-black/75">“{pin.note}”</div>
          )}
          <div className="mt-1.5 text-[12px] text-black/75 flex items-center gap-2 flex-wrap">
            <Stars count={pin.stars} />
            <span className="italic">{pin.noteFeedback}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[10px] font-mono uppercase tracking-widest ${pin.tagCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
            tag {pin.tagCorrect ? '✓' : '✗'}
          </div>
          <div className="font-display text-[18px] font-bold tabular-nums">
            {pin.totalPinPts >= 0 ? '+' : ''}{pin.totalPinPts}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stars({ count }) {
  return (
    <span className="inline-flex gap-0.5 align-middle text-[15px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? 'text-amber-500' : 'text-black/15'}>★</span>
      ))}
    </span>
  )
}

/* ═══════════════════ PAGE 4 — SCORE BREAKDOWN ═══════════════════ */
function ScorePage({ result }) {
  const { verdictPts, evidencePts, speed, streak, streakBonus, skillXP } = result.scored
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-[#5a3a1a]/70 mb-3">
        Where the points came from
      </div>

      <div className="space-y-3 mb-5">
        <ScoreBar label="Verdict" pts={verdictPts} max={MAX_VERDICT_PTS} color="bg-sky-600" />
        <ScoreBar label="Evidence &amp; notes" pts={evidencePts} max={MAX_EVIDENCE_PTS} color="bg-emerald-600" />
        <ScoreBar
          label={`Speed (${speed.emoji} ${speed.label})`}
          pts={speed.pts}
          max={MAX_SPEED_PTS}
          color="bg-amber-500"
        />
        {streak && (
          <div className="rounded-md border-[3px] border-fuchsia-500/70 bg-fuchsia-50 px-3 py-2.5 flex items-center gap-3">
            <span className="text-[24px]">🔥</span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-widest text-fuchsia-700">Streak bonus</div>
              <div className="text-[14px] font-bold text-fuchsia-900 truncate">{streak.label}</div>
            </div>
            <div className="font-display text-[22px] font-bold text-fuchsia-700">+{streakBonus}</div>
          </div>
        )}
      </div>

      <div className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-[#5a3a1a]/70 mb-2.5">
        Skills you practiced
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SKILLS.map((s) => (
          <SkillTile key={s.id} skill={s} gained={skillXP?.[s.id] || 0} />
        ))}
      </div>
    </div>
  )
}

function ScoreBar({ label, pts, max, color }) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, pts / max)) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px] mb-1">
        <span className="font-mono uppercase tracking-widest opacity-75 truncate pr-2">{label}</span>
        <span className="font-bold tabular-nums text-[15px]">{pts} / {max}</span>
      </div>
      <div className="h-3 rounded-full bg-black/10 overflow-hidden border border-black/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  )
}

function SkillTile({ skill, gained }) {
  return (
    <div className={`rounded-xl p-[2px] bg-gradient-to-br ${skill.gradient} shadow-sm`}>
      <div className="rounded-[10px] bg-[#fdfcf9] px-3 py-2.5 flex flex-col items-center text-center">
        <div className="text-[28px] leading-none">{skill.emoji}</div>
        <div className="mt-1 text-[12px] font-bold leading-tight">{skill.short}</div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-black/55">
          {gained > 0 ? `+${gained} XP` : '—'}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ PAGE 5 — FINAL TALLY ═══════════════════ */
function FinalPage({ result, runningScore, isRoundOver, onNext, onRestart }) {
  const { scored, rankBefore, rankAfter } = result
  const { totalXP, caseXP, streakBonus, grade } = scored
  const rankedUp = rankAfter?.current?.id !== rankBefore?.current?.id
  return (
    <div className="flex-1 flex flex-col items-center text-center">
      <div className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-[#5a3a1a]/70">
        Case total
      </div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mt-3 relative"
      >
        <div className="rounded-2xl border-[5px] border-[#c82424] bg-[#fef0a8] px-7 py-5 sm:px-10 sm:py-6 shadow-[0_10px_0_#8a5326,0_18px_30px_rgba(0,0,0,0.35)]">
          <div className="font-chaos text-[72px] sm:text-[96px] leading-none text-[#c82424] drop-shadow">
            +{totalXP}
          </div>
          <div className="text-[12px] sm:text-[14px] font-mono uppercase tracking-[0.3em] text-[#8a5326] mt-1">
            Experience earned · / 1000
          </div>
        </div>
      </motion.div>

      {/* Mini sub-tally */}
      <div className="mt-5 flex items-center gap-2.5 flex-wrap justify-center">
        <span className="rounded-full bg-[#fdfcf9] border-2 border-[#8a5326]/40 px-3 py-1.5 text-[12px] font-mono">
          Case <span className="font-bold tabular-nums">+{caseXP}</span>
        </span>
        {streakBonus > 0 && (
          <span className="rounded-full bg-fuchsia-100 border-2 border-fuchsia-400 px-3 py-1.5 text-[12px] font-mono text-fuchsia-900">
            Streak <span className="font-bold tabular-nums">+{streakBonus}</span>
          </span>
        )}
        <span className="rounded-full bg-[#fdfcf9] border-2 border-[#8a5326]/40 px-3 py-1.5 text-[12px] font-mono">
          Grade <span className="font-bold">{grade.letter}</span>
        </span>
      </div>

      {/* Rank progress card */}
      <div className="mt-6 w-full rounded-xl border-[3px] border-[#8a5326] bg-[#fdfcf9] p-4 shadow-sm">
        {rankedUp && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="mb-2 inline-block rounded-md border-[3px] border-emerald-700 bg-emerald-100 px-3 py-1"
          >
            <span className="font-chaos text-[14px] sm:text-[16px] text-emerald-900 tracking-wider">⬆ PROMOTED!</span>
          </motion.div>
        )}
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#5a3a1a]/70">Rank</div>
          <div className="text-[12px] font-bold text-[#5a3a1a]/85 truncate ml-2">
            {rankAfter.next ? `${rankAfter.toNext.toLocaleString()} XP to ${rankAfter.next.name}` : 'Top rank reached'}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-chaos text-[18px] sm:text-[22px] truncate">{rankAfter.current.name}</span>
          {rankAfter.next && (
            <>
              <span className="text-black/40">→</span>
              <span className="text-[13px] font-mono uppercase tracking-widest text-black/55 truncate">{rankAfter.next.name}</span>
            </>
          )}
        </div>
        <div className="h-3 rounded-full bg-black/10 overflow-hidden border border-black/10">
          <motion.div
            initial={{ width: `${(rankBefore?.progress ?? 0) * 100}%` }}
            animate={{ width: `${rankAfter.progress * 100}%` }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-feed-lime via-amber-400 to-feed-accent"
          />
        </div>
      </div>

      {/* Big action buttons */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch gap-3 w-full">
        <button
          onClick={onRestart}
          className="press flex-1 rounded-full bg-[#fde047] border-[3px] border-[#8a5326] px-5 py-3.5 font-chaos text-[16px] sm:text-[18px] tracking-wider text-[#5a3a1a] shadow-[0_5px_0_#8a5326,0_8px_14px_rgba(0,0,0,0.25)] hover:translate-y-[1px] hover:shadow-[0_4px_0_#8a5326,0_6px_12px_rgba(0,0,0,0.25)] active:translate-y-[3px] active:shadow-[0_2px_0_#8a5326,0_3px_8px_rgba(0,0,0,0.25)] transition"
        >
          {isRoundOver ? 'NEW ROUND ↺' : 'TRY AGAIN ↺'}
        </button>
        <button
          onClick={isRoundOver ? onRestart : onNext}
          className="press flex-1 rounded-full bg-[#c82424] border-[3px] border-[#8a5326] px-5 py-3.5 font-chaos text-[18px] sm:text-[22px] tracking-wider text-white shadow-[0_6px_0_#8a5326,0_10px_18px_rgba(0,0,0,0.3)] hover:translate-y-[1px] hover:shadow-[0_5px_0_#8a5326,0_8px_14px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-[0_3px_0_#8a5326,0_5px_10px_rgba(0,0,0,0.3)] transition"
        >
          {isRoundOver ? `FINISH ROUND · ${runningScore.toLocaleString()} XP` : 'NEXT CASE →'}
        </button>
      </div>
    </div>
  )
}
