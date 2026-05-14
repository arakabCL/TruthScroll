import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const formatCount = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

const sourceFontClass = (vibe) => {
  switch (vibe) {
    case 'wellness':
      return 'font-serif italic'
    case 'satire':
      return 'font-chaos tracking-tight'
    case 'news':
      return 'font-display font-bold uppercase'
    default:
      return 'font-display font-bold'
  }
}

function FeedCard({
  headline,
  index,
  activeIndex,
  isDone,
  onInvestigate,
  onScrollNext,
}) {
  const [hearts, setHearts] = useState([])
  const [liked, setLiked] = useState(false)
  const [snapPop, setSnapPop] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef(null)
  const lastTapRef = useRef(0)

  // Snap pop when becoming active
  const isActive = index === activeIndex
  const opacityProgress = Math.abs(index - activeIndex)
  const cardOpacity = opacityProgress === 0 ? 1 : 0.85
  const cardScale = opacityProgress === 0 ? 1 : 0.97

  // When this card becomes active, tiny scale bump ("haptic micro-interaction")
  useEffect(() => {
    if (isActive) {
      setSnapPop(true)
      const t = setTimeout(() => setSnapPop(false), 220)
      return () => clearTimeout(t)
    }
  }, [isActive])

  // Only the active card plays; neighbors stay paused to save battery/CPU
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      v.pause()
      try { v.currentTime = 0 } catch {}
    }
  }, [isActive])

  const handleTap = (e) => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      // Double tap → like
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX
      const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY
      const x = (clientX ?? rect.left + rect.width / 2) - rect.left
      const y = (clientY ?? rect.top + rect.height / 2) - rect.top
      const id = Math.random().toString(36).slice(2)
      setHearts((h) => [...h, { id, x, y }])
      setLiked(true)
      setTimeout(() => setHearts((h) => h.filter((p) => p.id !== id)), 1000)
    }
    lastTapRef.current = now
  }

  return (
    <motion.div
      animate={{
        scale: isActive ? (snapPop ? 1.015 : 1) : cardScale,
        opacity: cardOpacity,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="relative h-full w-full bg-feed-bg"
      onPointerDown={handleTap}
    >
      <div className="relative flex h-full w-full">

        {/* Video screen — fills the parent (viewport on mobile, phone frame on desktop) */}
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br">
          <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${headline.thumbnailGradient}`}>
            {headline.video ? (
              <>
                <video
                  ref={videoRef}
                  src={headline.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={() => setVideoReady(true)}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    videoReady ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {!videoReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[22vh] opacity-60 drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
                      {headline.thumbnail}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[22vh] drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
                  {headline.thumbnail}
                </div>
              </div>
            )}
            {/* Vignette & Smooth Scrims */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
            {/* Bottom scrim — opaque under the headline, fades up so the video stays visible */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#030407] from-15% via-[#030407]/85 via-45% to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#030407]/60 to-transparent pointer-events-none" />
          </div>

          {/* Source handle + engagement top-left */}
          <div className="absolute left-4 top-[max(env(safe-area-inset-top),24px)] sm:top-6 z-20 max-w-[70%]">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-amber-400 ring-2 ring-white/60"></div>
              <div>
                <div
                  className={`text-[15px] leading-tight text-white drop-shadow-md ${sourceFontClass(
                    headline.sourceVibe,
                  )}`}
                >
                  @{headline.fakeSource}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">
                  sponsored · {headline.engagement.timestamp}
                </div>
              </div>
            </div>
          </div>

          {/* Headline + engagement bottom-left */}
          <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),24px)] sm:pb-6">
            <div className="pr-16 sm:pr-4">
              <h2
                className="font-display text-[20px] sm:text-[22px] font-bold leading-[1.1] text-white"
                style={{
                  textWrap: 'balance',
                  textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.6)',
                }}
              >
                {headline.headline}
              </h2>
              <div className="mt-3 flex items-center gap-4 text-[12px] text-white/80">
                <span className="flex items-center gap-1">
                  <Heart filled={liked} className="h-4 w-4" />
                  {formatCount(headline.engagement.likes + (liked ? 1 : 0))}
                </span>
                <span className="flex items-center gap-1">
                  <ShareIcon className="h-4 w-4" />
                  {formatCount(headline.engagement.shares)}
                </span>
                <span className="flex items-center gap-1">
                  <CommentIcon className="h-4 w-4" />
                  {formatCount(Math.round(headline.engagement.likes / 40))}
                </span>
              </div>
              {isDone && (
                <div className="mt-3 inline-block rounded-full bg-feed-lime/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                  investigated
                </div>
              )}
            </div>
          </div>
        </div>
        {/* /Video screen */}

        {/* Right-edge floating actions — overlay inside the screen */}
        <div className="absolute right-2 bottom-20 z-30 flex flex-col items-center gap-4">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onInvestigate()
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="press group relative flex flex-col items-center"
          >
            <span className="absolute -inset-2.5 rounded-full bg-[#f4a723]/35 blur-xl transition duration-500 group-hover:bg-[#f4a723]/65 group-hover:blur-2xl animate-pulseSoft" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fde0a8] via-[#f4a723] to-[#b5672b] text-[#2d1d0c] shadow-[0_8px_18px_rgba(82,42,16,0.5),0_0_20px_rgba(244,167,35,0.5)] ring-[3px] ring-[#8a5326] overflow-hidden transition-transform duration-300">
              <Magnifier className="h-6 w-6 drop-shadow-sm" />
            </div>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white sm:text-white/80 drop-shadow">
              Investigate
            </span>
          </motion.button>

          <ActionButton
            label={liked ? 'Liked' : 'Like'}
            highlight={liked}
            onClick={(e) => {
              e.stopPropagation()
              setLiked((v) => !v)
            }}
          >
            <Heart filled={liked} className="h-5 w-5" />
          </ActionButton>

          <ActionButton
            label="Scroll"
            onClick={(e) => {
              e.stopPropagation()
              onScrollNext()
            }}
          >
            <ChevronDown className="h-5 w-5" />
          </ActionButton>
        </div>
      </div>

      {/* Swipe up hint */}
      {isActive && index === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1 }}
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center"
        >
          <div className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[11px] font-mono text-white/80 backdrop-blur-md shadow-glass">
            ↑ swipe to scroll
          </div>
        </motion.div>
      )}

      {/* Floating hearts (double-tap) */}
      <div className="pointer-events-none absolute inset-0 z-40">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="absolute animate-floatUp"
            style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}
          >
            <Heart
              filled
              className="h-24 w-24 text-feed-accent drop-shadow-[0_8px_20px_rgba(255,45,135,0.6)]"
            />
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function ActionButton({ children, onClick, label, highlight }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.88 }}
      className="press flex flex-col items-center gap-1.5 text-white"
    >
      <span
        className={`flex h-[38px] w-[38px] items-center justify-center rounded-full backdrop-blur-xl shadow-glass transition-colors duration-300 ${
          highlight
            ? 'bg-feed-accent/90 text-white ring-1 ring-feed-accent/50 shadow-glow'
            : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
        }`}
      >
        {children}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/80 drop-shadow">
        {label}
      </span>
    </motion.button>
  )
}

/* --- Icons --- */
function Heart({ filled, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      color={filled ? '#ff2d87' : 'white'}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12c-2.5 4.65-9.5 9-9.5 9z"
      />
    </svg>
  )
}
function ShareIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8M16 6l-4-4-4 4M12 2v14" />
    </svg>
  )
}
function CommentIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function ChevronDown({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}
function Magnifier({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export default memo(FeedCard)
