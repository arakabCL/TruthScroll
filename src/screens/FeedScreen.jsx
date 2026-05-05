import { useCallback, useEffect, useRef, useState } from 'react'
import FeedCard from '../components/FeedCard.jsx'
import { AnimatePresence, motion } from 'framer-motion'

export default function FeedScreen({
  headlines,
  completedIds,
  runningScore,
  onInvestigate,
  onRefresh,
  onShowHelp,
}) {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Detect which card is currently active via IntersectionObserver
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const cards = root.querySelectorAll('[data-card-index]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number(entry.target.getAttribute('data-card-index'))
            setActiveIndex(idx)
          }
        })
      },
      { root, threshold: [0.6, 0.9] },
    )
    cards.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [headlines])

  // Keyboard arrow navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        scrollToIndex(Math.min(headlines.length - 1, activeIndex + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        scrollToIndex(Math.max(0, activeIndex - 1))
      } else if (e.key === 'Enter') {
        const h = headlines[activeIndex]
        if (h) onInvestigate(h)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, headlines])

  const scrollToIndex = useCallback((i) => {
    const root = scrollRef.current
    if (!root) return
    const h = root.clientHeight
    root.scrollTo({ top: i * h, behavior: 'smooth' })
  }, [])

  // Pull-to-refresh (top of feed)
  const touchStartY = useRef(null)
  const onTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }
  const onTouchMove = (e) => {
    if (touchStartY.current == null) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0 && scrollRef.current?.scrollTop === 0) {
      setPullY(Math.min(120, dy * 0.5))
    }
  }
  const onTouchEnd = () => {
    if (pullY > 70) {
      setRefreshing(true)
      setTimeout(() => {
        onRefresh()
        setRefreshing(false)
        setPullY(0)
      }, 600)
    } else {
      setPullY(0)
    }
    touchStartY.current = null
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-feed-bg sm:bg-[#8a5326] no-select">
      {/* Detective desk background — desktop only */}
      <DeskBackground />

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto flex items-start justify-between px-3 pt-[max(env(safe-area-inset-top),16px)] sm:max-w-md">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="font-chaos text-[15px] tracking-tight text-white drop-shadow-md">
            TRUTH<span className="text-feed-accent">SCROLL</span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="rounded-full bg-black/30 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-white/90 backdrop-blur-xl shadow-glass flex items-center gap-1">
            <span className="text-white/50 uppercase tracking-widest text-[9px]">Score</span>
            <span className="font-bold">{runningScore}</span>
          </div>
          <div className="rounded-full bg-black/30 border border-white/10 px-2 py-1 text-[11px] font-mono text-white/90 backdrop-blur-xl shadow-glass">
            {Math.min(activeIndex + 1, headlines.length)}/{headlines.length}
          </div>
          {onShowHelp && (
            <button
              onClick={onShowHelp}
              aria-label="How to play"
              className="press flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/30 border border-white/10 text-[13px] font-bold text-white/90 backdrop-blur-xl shadow-glass hover:bg-white/15"
            >
              ?
            </button>
          )}
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: refreshing ? 40 : pullY - 20 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2"
          >
            <div className="mt-4 rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-mono text-white/80 backdrop-blur-md">
              {refreshing
                ? 'shuffling feed…'
                : pullY > 70
                ? 'release to refresh'
                : 'pull to refresh'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: full-screen feed. Desktop: static iPhone frame in the center, feed scrolls inside it */}
      <div className="relative h-full w-full sm:flex sm:items-center sm:justify-center sm:py-4">
        {/* Static iPhone bezel — desktop only. Real iPhone aspect 9:19.5 */}
        <div className="relative h-full w-full sm:h-full sm:max-h-[960px] sm:w-auto sm:aspect-[9/19.5] sm:p-[10px] sm:bg-gradient-to-b sm:from-[#0d0d0e] sm:to-[#1a1a1c] sm:rounded-[52px] sm:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] sm:ring-1 sm:ring-black/40 sm:shrink-0">

          {/* Notch — desktop only */}
          <div className="hidden sm:flex absolute top-[16px] left-1/2 -translate-x-1/2 z-50 h-[26px] w-[110px] items-center justify-end pr-3 rounded-full bg-black ring-1 ring-white/5 pointer-events-none">
            <div className="h-[6px] w-[6px] rounded-full bg-[#0a0a0a] ring-1 ring-[#2a2a2a]" />
          </div>

          {/* Side buttons — desktop only */}
          <div className="hidden sm:block absolute -left-[2px] top-[80px] h-7 w-[3px] rounded-l-sm bg-[#08080a] z-40" />
          <div className="hidden sm:block absolute -left-[2px] top-[125px] h-12 w-[3px] rounded-l-sm bg-[#08080a] z-40" />
          <div className="hidden sm:block absolute -left-[2px] top-[180px] h-12 w-[3px] rounded-l-sm bg-[#08080a] z-40" />
          <div className="hidden sm:block absolute -right-[2px] top-[140px] h-20 w-[3px] rounded-r-sm bg-[#08080a] z-40" />

          {/* Inner phone screen — clips the scroll feed to the phone shape */}
          <div className="relative h-full w-full sm:rounded-[44px] sm:overflow-hidden">
            <div
              ref={scrollRef}
              className="feed-scroll no-scrollbar"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ transform: `translateY(${pullY}px)`, transition: pullY === 0 ? 'transform 200ms ease' : 'none' }}
            >
              {headlines.map((h, idx) => {
                const isVisible = Math.abs(idx - activeIndex) <= 1
                return (
                  <div
                    key={h.id}
                    data-card-index={idx}
                    className="feed-card relative w-full"
                  >
                    {isVisible ? (
                      <FeedCard
                        headline={h}
                        index={idx}
                        activeIndex={activeIndex}
                        isDone={completedIds.has(h.id)}
                        onInvestigate={() => onInvestigate(h)}
                        onScrollNext={() => scrollToIndex(idx + 1)}
                      />
                    ) : (
                      <div className="h-full w-full bg-black" />
                    )}
                  </div>
                )
              })}
              {/* End-of-feed spacer */}
              <div className="feed-card flex items-center justify-center bg-black">
                <div className="text-center">
                  <div className="font-chaos text-3xl text-feed-accent">END OF FEED</div>
                  <div className="mt-2 text-sm text-white/50">pull down to reshuffle</div>
                  <button
                    onClick={onRefresh}
                    className="press mt-6 rounded-full bg-white/10 px-5 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/15"
                  >
                    reshuffle round
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Detective desk background ─────────────── */

function DeskBackground() {
  return (
    <div className="hidden sm:block absolute inset-0 -z-0 overflow-hidden pointer-events-none">
      {/* Wood base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#b8743f_0%,#8c5224_55%,#5e3614_100%)]" />

      {/* Wood grain — soft vertical streaks */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(94deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 7px), repeating-linear-gradient(94deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 23px)',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)]" />

      {/* — Top-left: paperclips — */}
      <Paperclip className="absolute top-[7%] left-[3%] w-10 -rotate-[24deg] opacity-90" />
      <Paperclip className="absolute top-[14%] left-[8%] w-9 rotate-[18deg] opacity-90" />
      <Paperclip className="absolute top-[22%] left-[3%] w-10 rotate-[42deg] opacity-90" />

      {/* — Top-right: file folder stack — */}
      <FolderStack className="absolute top-[3%] right-[2%] w-44 -rotate-[5deg]" />

      {/* — Mid-left: case file with label — */}
      <CaseFile className="absolute top-[42%] left-[2%] w-36 -rotate-[6deg]" />

      {/* — Mid-right: magnifying glass — */}
      <Magnifier className="absolute top-[40%] right-[3%] w-28 -rotate-[15deg]" />

      {/* — Bottom-left: fountain pen — */}
      <FountainPen className="absolute bottom-[14%] left-[2%] w-56 -rotate-[28deg]" />

      {/* — Bottom-right: binder clips — */}
      <BinderClip className="absolute bottom-[20%] right-[6%] w-14 rotate-[8deg]" />
      <BinderClip className="absolute bottom-[10%] right-[12%] w-12 -rotate-[6deg]" />

      {/* — Sticky note — */}
      <div className="absolute bottom-[10%] left-[14%] -rotate-[4deg] w-32 h-32 bg-[#fef0a8] shadow-[0_8px_18px_rgba(0,0,0,0.35)] p-3">
        <div className="font-mono text-[10px] leading-[1.35] text-amber-900/80">
          CASE #47<br />
          ──────────<br />
          trust no<br />
          headline<br />
          <span className="italic">— D.</span>
        </div>
      </div>

      {/* — Coffee ring stain — */}
      <div className="absolute top-[58%] left-[16%] h-20 w-20 rounded-full border-[6px] border-[#3b1f0b]/30 -rotate-[10deg]" />
    </div>
  )
}

const Paperclip = ({ className }) => (
  <svg viewBox="0 0 40 90" className={className} aria-hidden>
    <rect
      x="6"
      y="4"
      width="28"
      height="82"
      rx="14"
      fill="none"
      stroke="#dadde0"
      strokeWidth="3"
    />
    <rect
      x="13"
      y="13"
      width="14"
      height="55"
      rx="7"
      fill="none"
      stroke="#dadde0"
      strokeWidth="3"
    />
    <rect
      x="6"
      y="4"
      width="28"
      height="82"
      rx="14"
      fill="none"
      stroke="rgba(0,0,0,0.3)"
      strokeWidth="1"
      transform="translate(1 1)"
    />
  </svg>
)

const FolderStack = ({ className }) => (
  <svg viewBox="0 0 200 130" className={className} aria-hidden>
    {/* Back folder */}
    <g transform="translate(8 14) rotate(-3 90 60)">
      <rect x="32" y="0" width="60" height="14" rx="3" fill="#9b7239" />
      <rect x="0" y="10" width="180" height="105" rx="4" fill="#cfa067" />
      <rect x="0" y="10" width="180" height="6" fill="#a37b3f" />
    </g>
    {/* Front folder */}
    <g transform="translate(0 22) rotate(2 90 55)">
      <rect x="40" y="0" width="60" height="14" rx="3" fill="#a37b3f" />
      <rect x="0" y="10" width="180" height="100" rx="4" fill="#dcae73" />
      <rect x="0" y="10" width="180" height="5" fill="#b08446" />
      <rect x="14" y="40" width="60" height="6" rx="2" fill="#7a5526" opacity="0.45" />
      <rect x="14" y="52" width="90" height="5" rx="2" fill="#7a5526" opacity="0.35" />
      <rect x="14" y="62" width="50" height="5" rx="2" fill="#7a5526" opacity="0.35" />
    </g>
  </svg>
)

const CaseFile = ({ className }) => (
  <svg viewBox="0 0 200 130" className={className} aria-hidden>
    <rect x="0" y="0" width="200" height="130" rx="3" fill="#f4ead2" />
    <rect x="0" y="0" width="200" height="22" fill="#b91c1c" />
    <text
      x="12"
      y="16"
      fontFamily="Courier, monospace"
      fontSize="11"
      fontWeight="bold"
      fill="white"
      letterSpacing="2"
    >
      CONFIDENTIAL
    </text>
    <line x1="14" y1="40" x2="180" y2="40" stroke="#7a5526" strokeWidth="1" opacity="0.4" />
    <line x1="14" y1="56" x2="180" y2="56" stroke="#7a5526" strokeWidth="1" opacity="0.4" />
    <line x1="14" y1="72" x2="160" y2="72" stroke="#7a5526" strokeWidth="1" opacity="0.4" />
    <line x1="14" y1="88" x2="170" y2="88" stroke="#7a5526" strokeWidth="1" opacity="0.4" />
    <line x1="14" y1="104" x2="120" y2="104" stroke="#7a5526" strokeWidth="1" opacity="0.4" />
    {/* Stamp */}
    <g transform="translate(140 92) rotate(-18)">
      <rect x="0" y="0" width="56" height="22" rx="2" fill="none" stroke="#b91c1c" strokeWidth="2" />
      <text
        x="6"
        y="15"
        fontFamily="Impact, sans-serif"
        fontSize="11"
        fill="#b91c1c"
        letterSpacing="2"
      >
        URGENT
      </text>
    </g>
  </svg>
)

const Magnifier = ({ className }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden>
    <line
      x1="62"
      y1="62"
      x2="108"
      y2="108"
      stroke="#3a2412"
      strokeWidth="11"
      strokeLinecap="round"
    />
    <circle cx="46" cy="46" r="34" fill="rgba(255,255,255,0.18)" stroke="#dadde0" strokeWidth="6" />
    <circle cx="46" cy="46" r="34" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
    <ellipse cx="36" cy="34" rx="10" ry="6" fill="rgba(255,255,255,0.5)" transform="rotate(-30 36 34)" />
  </svg>
)

const FountainPen = ({ className }) => (
  <svg viewBox="0 0 220 36" className={className} aria-hidden>
    {/* Cap */}
    <rect x="0" y="10" width="60" height="16" rx="6" fill="#1f2937" />
    <rect x="56" y="10" width="6" height="16" fill="#fbbf24" />
    {/* Body */}
    <rect x="62" y="10" width="100" height="16" rx="3" fill="#0f172a" />
    {/* Nib housing */}
    <rect x="160" y="11" width="14" height="14" fill="#fbbf24" />
    {/* Nib */}
    <polygon points="174,11 200,18 174,25" fill="#cbd5e1" />
    <polygon points="174,11 200,18 174,25" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
    <line x1="183" y1="16" x2="183" y2="20" stroke="#475569" strokeWidth="1" />
    {/* Clip */}
    <rect x="14" y="6" width="3" height="20" rx="1" fill="#fbbf24" />
  </svg>
)

const BinderClip = ({ className }) => (
  <svg viewBox="0 0 70 56" className={className} aria-hidden>
    <rect x="0" y="16" width="70" height="40" rx="3" fill="#0f172a" />
    <rect x="0" y="16" width="70" height="6" fill="#1e293b" />
    <path
      d="M5 16 q30-22 60 0"
      fill="none"
      stroke="#94a3b8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="5" cy="16" r="4" fill="#475569" stroke="#1e293b" strokeWidth="1" />
    <circle cx="65" cy="16" r="4" fill="#475569" stroke="#1e293b" strokeWidth="1" />
  </svg>
)
