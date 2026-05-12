import { useEffect } from 'react'
import { LeaderboardButton, ProfileButton, SignInButton } from './FeedScreen.jsx'

export default function StartScreen({ onStart, onShowHelp, username, isGuest, onShowLeaderboard, onLogout }) {
  // Preload the feed's desk backdrop so navigating to the feed feels instant
  useEffect(() => {
    const img = new Image()
    img.src = '/desk.png'
  }, [])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#3d5775] no-select flex items-center justify-center">
      {/* Detective office backdrop — same cover-fit pattern as the feed desk image */}
      <div className="absolute inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-[max(100dvh,calc(100vw*9/16))] sm:w-[max(100vw,calc(100dvh*16/9))]">
        <img
          src="/start.png"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        />
        {/* Vignette + scrim so the title reads cleanly over the busy art */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.55)_85%)] pointer-events-none" />
      </div>

      {/* Top-right user/leaderboard widget — big gold button + circular profile */}
      <div className="pointer-events-auto absolute top-0 right-0 z-20 flex items-center gap-2 sm:gap-3 p-4 pt-[max(env(safe-area-inset-top),16px)] sm:p-5">
        {onShowLeaderboard && <LeaderboardButton onClick={onShowLeaderboard} />}
        {username ? (
          <ProfileButton username={username} onLogout={onLogout} />
        ) : isGuest && onLogout ? (
          <SignInButton onClick={onLogout} />
        ) : null}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="font-chaos text-[clamp(38px,10vw,120px)] leading-none tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          TRUTH<span className="text-feed-accent">SCROLL</span>
        </div>

        <div className="mt-3 font-serif italic text-[clamp(16px,2.2vw,22px)] text-white/85 drop-shadow-md max-w-md">
          Scroll the feed. Spot the lies. Crack the case.
        </div>

        <button
          onClick={onStart}
          className="press mt-10 rounded-full bg-feed-lime px-10 py-4 font-display text-[clamp(16px,2.2vw,20px)] font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(204,255,0,0.55)] ring-2 ring-feed-lime/40 transition-transform hover:scale-[1.04] hover:bg-feed-lime/95 active:scale-95"
        >
          Start Investigating →
        </button>

        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="press mt-5 rounded-full border border-white/25 bg-black/30 px-5 py-2 font-mono text-[11px] uppercase tracking-widest text-white/80 backdrop-blur-md hover:bg-black/50"
          >
            How to play
          </button>
        )}
      </div>
    </div>
  )
}
