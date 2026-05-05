import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const verdictColor = (v) => {
  switch (v) {
    case 'TRUE': return 'bg-emerald-500 text-black'
    case 'FALSE': return 'bg-red-500 text-white'
    case 'MISLEADING': return 'bg-amber-400 text-black'
    case 'SATIRE': return 'bg-fuchsia-500 text-white'
    case 'UNVERIFIABLE': return 'bg-slate-400 text-black'
    default: return 'bg-slate-400 text-black'
  }
}

const relevanceLabel = (r) => {
  switch (r) {
    case 'supports': return 'supports'
    case 'debunks': return 'debunks'
    case 'misleading': return 'misleading framing'
    case 'irrelevant': return 'irrelevant'
    default: return r
  }
}

const credChip = (c) => {
  switch (c) {
    case 'high': return { label: 'HIGH CRED', cls: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40' }
    case 'medium': return { label: 'MEDIUM', cls: 'bg-amber-500/20 text-amber-300 ring-amber-400/40' }
    case 'low': return { label: 'LOW CRED', cls: 'bg-red-500/20 text-red-300 ring-red-400/40' }
    default: return { label: c, cls: 'bg-white/10 text-white/70 ring-white/20' }
  }
}

export default function ResultsScreen({
  result,
  runningScore,
  headlineIndex,
  totalHeadlines,
  onNext,
  onRestart,
  isRoundOver,
}) {
  const { headline, chosenVerdict, correct, board, breakdown } = result
  const [displayTotal, setDisplayTotal] = useState(runningScore - breakdown.total)

  // Count-up animation for running total
  useEffect(() => {
    const start = runningScore - breakdown.total
    const end = runningScore
    const duration = 900
    const t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplayTotal(Math.round(start + (end - start) * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [runningScore, breakdown.total])

  const progressPct = (headlineIndex + 1) / totalHeadlines

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-y-auto bg-[#030407] text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-glass-dark pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-feed-accent/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-feed-lime/10 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Confetti-ish glow when correct */}
      {correct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,255,61,0.18),transparent_60%)]"
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-xl px-5 pb-8 pt-[max(env(safe-area-inset-top),20px)]">
        {/* Progress */}
        <div className="mb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-white/50">
          <span>Headline {Math.min(headlineIndex + 1, totalHeadlines)} of {totalHeadlines}</span>
          <span>Round score</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-feed-lime"
            />
          </div>
          <div className="font-mono text-[14px] tabular-nums text-white">{displayTotal}</div>
        </div>

        {/* Verdict banner */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
          className={`mt-6 overflow-hidden rounded-2xl border ${correct ? 'border-feed-lime/30 shadow-glow-lime' : 'border-feed-accent/30 shadow-glow'} bg-white/[0.03] backdrop-blur-xl`}
        >
          <div className={`flex items-center gap-3 px-5 py-4 ${correct ? 'bg-feed-lime/15' : 'bg-red-500/10'}`}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                correct ? 'bg-feed-lime text-black' : 'bg-red-500 text-white'
              }`}
            >
              {correct ? '✓' : '✕'}
            </span>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-white/60">
                {correct ? 'Great read' : 'Not quite — here\u2019s what happened'}
              </div>
              <div className="font-display text-[18px] font-bold">
                {correct ? 'You called it right' : 'Close, but look again'}
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                you said
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ${verdictColor(chosenVerdict)}`}>
                {chosenVerdict}
              </span>
              {!correct && (
                <>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                    actual
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest ${verdictColor(headline.correctVerdict)}`}>
                    {headline.correctVerdict}
                  </span>
                </>
              )}
            </div>
            <div className="font-serif text-[15px] leading-relaxed text-white/85">
              {headline.explanation}
            </div>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatTile label="Verdict" value={breakdown.verdict} max={50} />
          <StatTile label="Sources" value={breakdown.source} max={30} />
          <StatTile label="Speed" value={breakdown.speed} max={20} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-5 py-4 shadow-glass backdrop-blur-md"
        >
          <span className="text-[12px] font-mono uppercase tracking-widest text-white/60">
            Headline score
          </span>
          <span className="font-display text-3xl font-bold tabular-nums text-white drop-shadow-md">
            +{breakdown.total}
          </span>
        </motion.div>

        {/* Evidence review */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-display text-[15px] font-bold uppercase tracking-wider text-white/90">
              Your Evidence Board
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-white/50">
              credibility revealed
            </div>
          </div>

          <div className="space-y-2">
            {board.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-[13px] italic text-white/50">
                You didn&rsquo;t pin any evidence — next time, back up your call.
              </div>
            )}
            {board.map((e) => {
              const chip = credChip(e.credibility)
              const strong = e.credibility === 'high' && (e.relevance === 'supports' || e.relevance === 'debunks')
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    strong ? 'border-feed-lime/40 bg-feed-lime/5 shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-white">
                      {e.title}
                    </div>
                    <div className="truncate text-[11px] font-mono text-white/50">
                      {e.source} · {relevanceLabel(e.relevance)}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ${chip.cls}`}>
                    {chip.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          {!isRoundOver ? (
            <button
              onClick={onNext}
              className="press w-full rounded-full bg-feed-accent py-4.5 text-center font-display text-[16px] font-bold uppercase tracking-widest text-white shadow-glow hover:bg-feed-accent/90 transition-colors"
            >
              Next headline →
            </button>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-feed-lime/15 to-feed-accent/10 p-5 text-center">
                <div className="text-[11px] font-mono uppercase tracking-widest text-white/60">
                  Round complete
                </div>
                <div className="mt-1 font-display text-4xl font-bold">{runningScore}</div>
                <div className="text-[12px] text-white/60">out of {totalHeadlines * 100}</div>
              </div>
              <button
                onClick={onRestart}
                className="press w-full rounded-full bg-white py-4.5 text-center font-display text-[16px] font-bold uppercase tracking-widest text-black hover:bg-white/90 transition-colors"
              >
                Play another round
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, value, max }) {
  const pct = Math.min(1, value / max)
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-glass backdrop-blur-sm">
      <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-[24px] font-bold tabular-nums drop-shadow">{value}</span>
        <span className="text-[11px] text-white/40">/ {max}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-full bg-feed-lime shadow-[0_0_10px_rgba(204,255,0,0.5)]"
        />
      </div>
    </div>
  )
}
