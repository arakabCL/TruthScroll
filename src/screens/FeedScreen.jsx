import { useCallback, useEffect, useRef, useState } from 'react'
import FeedCard from '../components/FeedCard.jsx'
import { AnimatePresence, motion } from 'framer-motion'

export default function FeedScreen({
  headlines,
  completedIds,
  runningScore,
  totalXP,
  rank,
  onInvestigate,
  onRefresh,
  onShowHelp,
  username,
  isGuest,
  onShowLeaderboard,
  onLogout,
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
    <div className="relative h-[100dvh] w-full overflow-hidden bg-feed-bg sm:bg-[#c98a5b] no-select flex items-center justify-center">
      {/* Top-of-viewport HUD — sits on the desk (or top of mobile screen), OUTSIDE the iPhone */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] sm:pt-5">
        {/* LEFT column — TRUTHSCROLL title with the Detective ID badge tucked underneath */}
        <div className="pointer-events-auto flex flex-col items-start gap-3">
          <div>
            <div className="font-chaos text-[28px] sm:text-[40px] lg:text-[48px] leading-none tracking-tight text-[#fef3c7] drop-shadow-[0_4px_0_#5a3a1a,0_8px_18px_rgba(0,0,0,0.55)]">
              TRUTH<span className="text-[#c82424]">SCROLL</span>
            </div>
            <div className="mt-1 hidden sm:block text-[10px] font-mono uppercase tracking-[0.3em] text-[#fef3c7]/85 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Scroll Bureau · Field Investigation
            </div>
          </div>
          <RankBadge rank={rank} totalXP={totalXP ?? runningScore} />
        </div>

        {/* RIGHT column — big Leaderboard button + circular profile avatar (or Sign-in pill) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {onShowLeaderboard && <LeaderboardButton onClick={onShowLeaderboard} />}
          {username ? (
            <ProfileButton username={username} onLogout={onLogout} />
          ) : isGuest && onLogout ? (
            <SignInButton onClick={onLogout} />
          ) : null}
        </div>
      </div>

      {/* Bottom-right "?" help button — large and unmissable */}
      {onShowHelp && (
        <button
          onClick={onShowHelp}
          aria-label="How to play"
          title="How to play"
          className="press absolute z-50 right-3 sm:right-7 flex items-center justify-center rounded-full bg-[#f4a723] border-[3px] border-[#8a5326] font-chaos leading-none text-[#2d1d0c] shadow-[0_6px_0_#8a5326,0_14px_28px_-6px_rgba(82,42,16,0.55)] hover:scale-[1.06] active:scale-95 transition-transform h-16 w-16 sm:h-20 sm:w-20 text-[34px] sm:text-[40px]"
          style={{ bottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
          ?
        </button>
      )}

      {/* Desktop: container sized to fit the 16:9 desk image inside the viewport.
          Mobile: container fills the viewport (no desk image). */}
      <div className="relative h-full w-full sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-[max(100dvh,calc(100vw*9/16))] sm:w-[max(100vw,calc(100dvh*16/9))] sm:scale-[1.06]">
        {/* Desk image — desktop only */}
        <img
          src="/desk.png"
          alt=""
          aria-hidden
          draggable={false}
          className="hidden sm:block absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        />

        {/* Phone screen area — full screen on mobile, sits over the iPhone in the desk image on desktop.
            Screen bounds measured from the image: L 40.4%, T 15.6%, W 19.8%, H 72.7%. */}
        <div className="absolute inset-0 sm:inset-auto sm:left-[40.4%] sm:top-[15.6%] sm:w-[19.8%] sm:h-[72.7%] sm:scale-[1.03] sm:origin-center bg-black overflow-hidden sm:rounded-[10%/5%] sm:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          {/* Page count — small TikTok-style indicator inside the phone */}
          <div className="pointer-events-none absolute top-0 inset-x-0 z-30 flex justify-center pt-[max(env(safe-area-inset-top),16px)] sm:pt-3">
            <div className="pointer-events-auto rounded-full bg-black/45 border border-white/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-white/85 backdrop-blur-xl shadow-glass tabular-nums">
              {Math.min(activeIndex + 1, headlines.length)} / {headlines.length}
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

          {/* Scroll feed */}
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
  )
}

/* ─────────── Rank badge — manila detective-ID card, matches the game's warm cartoon palette ─────────── */
function RankBadge({ rank, totalXP }) {
  if (!rank?.current) return null
  const progressPct = Math.round((rank.progress ?? 0) * 100)
  const nextName = rank.next?.name || 'Top rank'
  const toNext = rank.next ? rank.toNext.toLocaleString() : null
  const xpStr = (totalXP ?? 0).toLocaleString()
  return (
    <div
      title={toNext ? `${toNext} XP to ${nextName}` : 'Top rank reached'}
      className="relative rotate-[1.5deg] hover:rotate-0 transition-transform duration-300"
    >
      {/* Paperclip on top */}
      <div className="absolute -top-2.5 left-6 z-20 text-[26px] sm:text-[30px] rotate-[-22deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] pointer-events-none">📎</div>

      {/* Manila ID card */}
      <div className="relative w-[240px] sm:w-[300px] lg:w-[330px] rounded-xl bg-[#f3d8ad] border-[3px] border-[#8a5326] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] overflow-hidden">
        {/* Red banner header — "CASE FILE" style */}
        <div className="relative bg-[#c82424] border-b-[3px] border-[#8a5326] px-3 py-1.5 sm:py-2 flex items-center justify-between">
          <span className="font-chaos text-[12px] sm:text-[14px] tracking-[0.22em] text-white drop-shadow leading-none">
            DETECTIVE&nbsp;ID
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-widest text-white/85">
            №&nbsp;{xpStr}
          </span>
        </div>

        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Detective medallion */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 -m-1 rounded-full bg-feed-accent/40 blur-md" />
            <div className="relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 ring-[3px] ring-[#8a5326] shadow-inner">
              <span className="text-[24px] sm:text-[32px] drop-shadow">🕵️</span>
            </div>
          </div>

          {/* Rank + XP block */}
          <div className="min-w-0 flex-1">
            <div className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#8a5326] leading-none">
              Rank
            </div>
            <div className="font-chaos text-[18px] sm:text-[24px] leading-tight mt-0.5 text-[#1c1b18] truncate">
              {rank.current.name}
            </div>

            {/* XP progress */}
            <div className="mt-2">
              <div className="relative h-3 sm:h-3.5 rounded-full bg-[#fef3c7] border-2 border-[#8a5326] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-feed-lime via-amber-400 to-feed-accent"
                  style={{ width: `${progressPct}%`, transition: 'width 600ms cubic-bezier(0.22, 0.61, 0.36, 1)' }}
                />
              </div>
              {toNext ? (
                <div className="mt-1 text-[10px] sm:text-[11px] font-mono font-bold leading-tight text-[#5a3a1a]">
                  <span className="text-feed-accent tabular-nums">{toNext}</span>
                  <span className="text-[#5a3a1a]/70"> XP to {nextName.split(' ')[0]}</span>
                </div>
              ) : (
                <div className="mt-1 text-[10px] sm:text-[11px] font-mono font-bold text-feed-accent">★ TOP RANK ★</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── Top-right chrome: big gold leaderboard button + circular profile ───────── */
export function LeaderboardButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Leaderboard"
      aria-label="Leaderboard"
      className="press flex items-center gap-2 rounded-full bg-[#f4a723] border-[3px] border-[#8a5326] px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 font-chaos text-[14px] sm:text-[16px] lg:text-[18px] tracking-widest text-[#2d1d0c] shadow-[0_5px_0_#8a5326,0_12px_24px_-6px_rgba(82,42,16,0.55)] hover:scale-[1.04] active:scale-95 transition-transform"
    >
      <span aria-hidden className="text-[18px] sm:text-[22px] leading-none drop-shadow-sm">🏆</span>
      <span className="uppercase">Leaderboard</span>
    </button>
  )
}

export function ProfileButton({ username, onLogout }) {
  const initial = username?.[0]?.toUpperCase() || '?'
  return (
    <button
      onClick={onLogout}
      title={`@${username} · click to log out`}
      aria-label={`Logged in as @${username}. Click to log out.`}
      className="press relative flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fde0a8] via-[#f4a723] to-[#b5672b] ring-[3px] ring-[#8a5326] shadow-[0_10px_24px_-6px_rgba(82,42,16,0.55)] hover:scale-[1.05] active:scale-95 transition-transform"
    >
      <span className="font-chaos text-[22px] sm:text-[26px] lg:text-[30px] text-[#2d1d0c] leading-none drop-shadow-sm">
        {initial}
      </span>
    </button>
  )
}

export function SignInButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Sign in to save progress"
      className="press flex items-center gap-1.5 rounded-full bg-[#f4a723] border-[3px] border-[#8a5326] px-4 sm:px-5 py-2.5 sm:py-3 font-chaos text-[14px] sm:text-[16px] tracking-widest text-[#2d1d0c] shadow-[0_5px_0_#8a5326,0_10px_22px_-6px_rgba(82,42,16,0.55)] hover:scale-[1.04] active:scale-95 transition-transform"
    >
      <span className="uppercase">Sign in</span>
    </button>
  )
}

