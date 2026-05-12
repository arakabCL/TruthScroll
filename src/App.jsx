import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import headlinesData from './data/headlines.json'
import StartScreen from './screens/StartScreen.jsx'
import FeedScreen from './screens/FeedScreen.jsx'
import InvestigationScreen from './screens/InvestigationScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import LeaderboardScreen from './screens/LeaderboardScreen.jsx'
import Tutorial from './components/Tutorial.jsx'
import { scoreCase, rankFor, SKILLS } from './lib/scoring.js'
import { useAuth } from './lib/auth-context.jsx'

// Onboarded state is per-user so a fresh signup on a device that previously
// hosted another account still gets the tutorial. Guests share one slot.
const onboardingKeyFor = (user) => `truthscroll_onboarded_v2_${user?.id || 'guest'}`
const XP_KEY = 'truthscroll_total_xp_v1'
const GRADE_HISTORY_KEY = 'truthscroll_grade_history_v1'
const SKILL_XP_KEY = 'truthscroll_skill_xp_v1'
const CASES_KEY = 'truthscroll_cases_completed_v1'
const emptySkillXP = () => SKILLS.reduce((acc, s) => { acc[s.id] = 0; return acc }, {})

const loadInt = (key, fallback = 0) => {
  try { const v = localStorage.getItem(key); return v == null ? fallback : Number(v) || 0 } catch { return fallback }
}
const loadJSON = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v) } catch { return fallback }
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const { user, remoteProgress, loading: authLoading, logout, syncProgress } = useAuth()

  // Guest mode is session-only and never persisted: every fresh tab load
  // shows the auth screen until the user explicitly signs in or chooses
  // "Continue as guest" again. We also proactively clear any old persisted
  // guest flag from previous versions so existing visitors get gated too.
  const [guestMode, setGuestMode] = useState(false)
  useEffect(() => {
    try { localStorage.removeItem('truthscroll_guest_mode_v1') } catch {}
  }, [])

  const [screen, setScreen] = useState('start') // start | feed | investigation | results | leaderboard | tutorial
  const [round, setRound] = useState(() => shuffle(headlinesData))
  const [activeHeadlineId, setActiveHeadlineId] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [runningScore, setRunningScore] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState(() => new Set())
  const [totalXP, setTotalXP] = useState(() => loadInt(XP_KEY, 0))
  const [gradeHistory, setGradeHistory] = useState(() => loadJSON(GRADE_HISTORY_KEY, []))
  const [skillXP, setSkillXP] = useState(() => ({ ...emptySkillXP(), ...loadJSON(SKILL_XP_KEY, {}) }))
  const [casesCompleted, setCasesCompleted] = useState(() => loadInt(CASES_KEY, 0))

  // When the signed-in user's remote progress loads, hydrate local state from it.
  // Take whichever is higher (handles guest-then-login scenarios).
  const hydratedForUser = useRef(null)
  useEffect(() => {
    if (!user || !remoteProgress) { hydratedForUser.current = null; return }
    if (hydratedForUser.current === user.id) return
    hydratedForUser.current = user.id

    setTotalXP((cur) => Math.max(cur, remoteProgress.totalXP || 0))
    setCasesCompleted((cur) => Math.max(cur, remoteProgress.casesCompleted || 0))
    if (Array.isArray(remoteProgress.gradeHistory) && remoteProgress.gradeHistory.length) {
      setGradeHistory(remoteProgress.gradeHistory)
    }
    if (remoteProgress.skillXP && Object.keys(remoteProgress.skillXP).length) {
      setSkillXP((cur) => {
        const next = { ...cur }
        for (const s of SKILLS) {
          next[s.id] = Math.max(next[s.id] || 0, remoteProgress.skillXP[s.id] || 0)
        }
        return next
      })
    }
  }, [user, remoteProgress])

  useEffect(() => { try { localStorage.setItem(XP_KEY, String(totalXP)) } catch {} }, [totalXP])
  useEffect(() => {
    try { localStorage.setItem(GRADE_HISTORY_KEY, JSON.stringify(gradeHistory.slice(-20))) } catch {}
  }, [gradeHistory])
  useEffect(() => { try { localStorage.setItem(SKILL_XP_KEY, JSON.stringify(skillXP)) } catch {} }, [skillXP])
  useEffect(() => { try { localStorage.setItem(CASES_KEY, String(casesCompleted)) } catch {} }, [casesCompleted])

  const rank = useMemo(() => rankFor(totalXP), [totalXP])

  // Whether THIS user (or guest) has finished the tutorial — read fresh from
  // localStorage on every click so a new signup on a shared device always
  // sees the tutorial, with no risk of stale React state after auth changes.
  const isOnboarded = useCallback(() => {
    try { return localStorage.getItem(onboardingKeyFor(user)) === '1' }
    catch { return false }
  }, [user])

  // Start Investigating from StartScreen: first-timers for this account get
  // walked through the tutorial; returning detectives jump straight to feed.
  const handleStart = useCallback(() => {
    if (!isOnboarded()) setScreen('tutorial')
    else setScreen('feed')
  }, [isOnboarded])

  // Tutorial finished — mark this user as onboarded and return to start so
  // they can hit "Start Investigating" for real.
  const finishTutorial = useCallback(() => {
    try { localStorage.setItem(onboardingKeyFor(user), '1') } catch {}
    setScreen('start')
  }, [user])

  // "How to play" — replay the tutorial whenever the user wants a refresher.
  const replayTutorial = useCallback(() => setScreen('tutorial'), [])

  const activeHeadline = useMemo(
    () => round.find((h) => h.id === activeHeadlineId) ?? null,
    [round, activeHeadlineId],
  )

  const startInvestigation = useCallback((headline) => {
    setActiveHeadlineId(headline.id)
    setScreen('investigation')
  }, [])

  const submitInvestigation = useCallback(
    ({ verdict, pins, timeLeftMs, totalMs }) => {
      if (!activeHeadline) return

      const scored = scoreCase({
        headline: activeHeadline,
        pickedVerdict: verdict,
        pins,
        timeLeftMs,
        totalMs,
        gradeHistory,
      })

      const skillBefore = { ...skillXP }
      const skillAfter = SKILLS.reduce(
        (acc, s) => { acc[s.id] = (skillXP[s.id] || 0) + (scored.skillXP?.[s.id] || 0); return acc },
        {},
      )

      const result = {
        headline: activeHeadline,
        chosenVerdict: verdict,
        scored,
        rankBefore: rankFor(totalXP),
        rankAfter: rankFor(totalXP + scored.totalXP),
        skillBefore,
        skillAfter,
      }

      const nextTotalXP = totalXP + scored.totalXP
      const nextHistory = [...gradeHistory, scored.grade.letter].slice(-20)
      const nextCases = casesCompleted + 1

      setLastResult(result)
      setRunningScore((s) => s + scored.totalXP)
      setTotalXP(nextTotalXP)
      setSkillXP(skillAfter)
      setGradeHistory(nextHistory)
      setCasesCompleted(nextCases)
      setCompletedIds((prev) => new Set(prev).add(activeHeadline.id))
      setScreen('results')

      // Fire-and-forget sync if signed in
      if (user) {
        syncProgress({
          totalXP: nextTotalXP,
          skillXP: skillAfter,
          gradeHistory: nextHistory,
          casesCompleted: nextCases,
        })
      }
    },
    [activeHeadline, gradeHistory, totalXP, skillXP, casesCompleted, user, syncProgress],
  )

  const nextHeadline = useCallback(() => {
    setActiveHeadlineId(null)
    setLastResult(null)
    setHeadlineIndex((i) => i + 1)
    setScreen('feed')
  }, [])

  const refreshRound = useCallback(() => {
    setRound(shuffle(headlinesData))
    setCompletedIds(new Set())
    setHeadlineIndex(0)
    setRunningScore(0)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setGuestMode(false)
    setScreen('start')
    // Clear local progress so a new login doesn't inherit the previous user's stats
    setTotalXP(0)
    setSkillXP(emptySkillXP())
    setGradeHistory([])
    setCasesCompleted(0)
    setRunningScore(0)
    setCompletedIds(new Set())
    try {
      localStorage.removeItem(XP_KEY)
      localStorage.removeItem(SKILL_XP_KEY)
      localStorage.removeItem(GRADE_HISTORY_KEY)
      localStorage.removeItem(CASES_KEY)
    } catch {}
  }, [logout])

  // Disable pinch-zoom/double-tap zoom on iOS
  useEffect(() => {
    const prevent = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault() }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [])

  // Persistent background music. Browsers block autoplay until the user
  // interacts with the page, so kick playback off on the first gesture.
  useEffect(() => {
    const audio = new Audio('/audio/detective-ambience.mp3')
    audio.loop = true
    audio.volume = 0.25
    const tryPlay = () => { audio.play().catch(() => {}) }
    tryPlay()
    const unlock = () => {
      tryPlay()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    window.addEventListener('touchstart', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // While the auth boot check runs, show a tiny shim instead of the start screen
  // (prevents AuthScreen flashing when the user has a valid token)
  if (authLoading) {
    return (
      <div className="h-[100dvh] w-full bg-feed-bg flex items-center justify-center text-white/60 font-mono text-xs uppercase tracking-widest">
        Loading…
      </div>
    )
  }

  // Gate: must be signed in OR in guest mode
  if (!user && !guestMode) {
    return (
      <AuthScreen
        onContinueAsGuest={() => setGuestMode(true)}
        onAuthed={() => setScreen('start')}
      />
    )
  }

  const headerProps = {
    username: user?.username,
    isGuest: !user,
    onShowLeaderboard: () => setScreen('leaderboard'),
    onLogout: handleLogout,
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-feed-bg text-white">
      {screen === 'start' && (
        <div className="absolute inset-0">
          <StartScreen
            onStart={handleStart}
            onShowHelp={replayTutorial}
            {...headerProps}
          />
        </div>
      )}

      {screen === 'tutorial' && (
        <div className="absolute inset-0">
          <Tutorial onFinish={finishTutorial} totalXP={totalXP} rank={rank} />
        </div>
      )}

      {screen === 'feed' && (
        <div className="absolute inset-0">
          <FeedScreen
            headlines={round}
            completedIds={completedIds}
            runningScore={runningScore}
            totalXP={totalXP}
            rank={rank}
            onInvestigate={startInvestigation}
            onRefresh={refreshRound}
            onShowHelp={replayTutorial}
            {...headerProps}
          />
        </div>
      )}

      {screen === 'investigation' && activeHeadline && (
        <div className="absolute inset-0">
          <InvestigationScreen
            headline={activeHeadline}
            onSubmit={submitInvestigation}
            onAbandon={() => {
              setActiveHeadlineId(null)
              setScreen('feed')
            }}
          />
        </div>
      )}

      {screen === 'results' && lastResult && (
        <div className="absolute inset-0">
          <ResultsScreen
            result={lastResult}
            runningScore={runningScore}
            headlineIndex={headlineIndex}
            totalHeadlines={round.length}
            onNext={nextHeadline}
            onRestart={refreshRound}
            isRoundOver={completedIds.size >= round.length}
          />
        </div>
      )}

      {screen === 'leaderboard' && (
        <div className="absolute inset-0">
          <LeaderboardScreen
            onBack={() => setScreen('feed')}
            currentUsername={user?.username}
          />
        </div>
      )}

    </div>
  )
}
