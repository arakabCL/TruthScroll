import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

const CARDS = [
  {
    emoji: '🕵️',
    title: 'You\u2019re a Truth Detective',
    body: 'The internet is full of wild stories. Your mission: figure out what\u2019s real, fake, or just sneaky.',
    color: 'from-feed-accent/40 to-feed-lime/20',
  },
  {
    emoji: '📱',
    title: 'Scroll the Feed',
    body: 'Swipe up to see new headlines. Tap the heart if you like a post. Same as any other app!',
    color: 'from-feed-lime/40 to-feed-accent/20',
  },
  {
    emoji: '🔍',
    title: 'Tap INVESTIGATE',
    body: 'Found something fishy? Hit the magnifying glass to open the detective board.',
    color: 'from-amber-400/40 to-feed-accent/20',
  },
  {
    emoji: '📌',
    title: 'Pin Your Evidence',
    body: 'Drag clues onto the board. Green = trusty source. Red = sus. Use the good stuff!',
    color: 'from-emerald-400/40 to-feed-lime/20',
  },
  {
    emoji: '⚖️',
    title: 'Make the Call',
    body: 'Pick a verdict: TRUE, FALSE, MISLEADING, SATIRE, or UNVERIFIABLE. Be fast for bonus points!',
    color: 'from-fuchsia-500/40 to-feed-accent/20',
  },
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const card = CARDS[i]
  const isLast = i === CARDS.length - 1

  const next = () => {
    if (isLast) onDone()
    else setI((v) => v + 1)
  }
  const back = () => setI((v) => Math.max(0, v - 1))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-sm px-5">
        {/* Skip */}
        <button
          onClick={onDone}
          className="absolute -top-10 right-5 text-[11px] font-mono uppercase tracking-widest text-white/50 hover:text-white"
        >
          skip →
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br ${card.color} p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl`}
          >
            {/* Background accents */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              {/* Step label */}
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-white/90 ring-1 ring-white/20">
                  Step {i + 1} of {CARDS.length}
                </span>
              </div>

              {/* Emoji bounce */}
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
                className="mb-4 text-[72px] leading-none drop-shadow-lg"
              >
                {card.emoji}
              </motion.div>

              <div className="font-display text-[26px] font-bold leading-tight text-white drop-shadow">
                {card.title}
              </div>
              <div className="mt-3 font-serif text-[16px] leading-relaxed text-white/90">
                {card.body}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === i
                  ? 'w-6 bg-feed-lime shadow-[0_0_10px_rgba(204,255,0,0.6)]'
                  : idx < i
                  ? 'w-2 bg-white/60'
                  : 'w-2 bg-white/25'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={back}
            disabled={i === 0}
            className="press rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[13px] font-mono uppercase tracking-widest text-white/80 backdrop-blur-md disabled:opacity-30"
          >
            ← back
          </button>
          <button
            onClick={next}
            className="press flex-1 rounded-full bg-feed-lime py-3.5 font-display text-[15px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:bg-feed-lime/90"
          >
            {isLast ? 'let\u2019s play →' : 'next'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
