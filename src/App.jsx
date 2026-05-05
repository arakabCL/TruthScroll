import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import headlinesData from './data/headlines.json'
import FeedScreen from './screens/FeedScreen.jsx'
import InvestigationScreen from './screens/InvestigationScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'
import Onboarding from './components/Onboarding.jsx'

const ONBOARDING_KEY = 'truthscroll_onboarded_v1'

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [screen, setScreen] = useState('feed') // feed | investigation | results
  const [round, setRound] = useState(() => shuffle(headlinesData))
  const [activeHeadlineId, setActiveHeadlineId] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [runningScore, setRunningScore] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState(() => new Set())
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== '1'
    } catch {
      return true
    }
  })

  const dismissOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {}
    setShowOnboarding(false)
  }, [])

  const replayOnboarding = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  const activeHeadline = useMemo(
    () => round.find((h) => h.id === activeHeadlineId) ?? null,
    [round, activeHeadlineId],
  )

  const startInvestigation = useCallback((headline) => {
    setActiveHeadlineId(headline.id)
    setScreen('investigation')
  }, [])

  const submitInvestigation = useCallback(
    ({ verdict, boardIds, timeLeftMs, totalMs }) => {
      if (!activeHeadline) return
      const correct = verdict === activeHeadline.correctVerdict
      const board = activeHeadline.evidencePool.filter((e) => boardIds.includes(e.id))
      const total = board.length || 1
      const credibleCount = board.filter((e) => e.credibility === 'high').length
      const mediumCount = board.filter((e) => e.credibility === 'medium').length
      const lowCount = board.filter((e) => e.credibility === 'low').length

      const verdictPts = correct ? 50 : 0
      // Source quality: weight high=1, medium=0.5, low=0
      const qualityRatio = board.length
        ? (credibleCount + 0.5 * mediumCount) / total
        : 0
      const sourcePts = Math.round(qualityRatio * 30)
      const speedPts = Math.max(0, Math.round((timeLeftMs / totalMs) * 20))
      const total100 = verdictPts + sourcePts + speedPts

      const result = {
        headline: activeHeadline,
        chosenVerdict: verdict,
        correct,
        board,
        breakdown: {
          verdict: verdictPts,
          source: sourcePts,
          speed: speedPts,
          total: total100,
        },
      }
      setLastResult(result)
      setRunningScore((s) => s + total100)
      setCompletedIds((prev) => new Set(prev).add(activeHeadline.id))
      setScreen('results')
    },
    [activeHeadline],
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

  // Disable pinch-zoom/double-tap zoom on iOS
  useEffect(() => {
    const prevent = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-feed-bg text-white">
      <AnimatePresence mode="wait">
        {screen === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <FeedScreen
              headlines={round}
              completedIds={completedIds}
              runningScore={runningScore}
              onInvestigate={startInvestigation}
              onRefresh={refreshRound}
              onShowHelp={replayOnboarding}
            />
          </motion.div>
        )}

        {screen === 'investigation' && activeHeadline && (
          <motion.div
            key="investigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <InvestigationScreen
              headline={activeHeadline}
              onSubmit={submitInvestigation}
              onAbandon={() => {
                setActiveHeadlineId(null)
                setScreen('feed')
              }}
            />
          </motion.div>
        )}

        {screen === 'results' && lastResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <ResultsScreen
              result={lastResult}
              runningScore={runningScore}
              headlineIndex={headlineIndex}
              totalHeadlines={round.length}
              onNext={nextHeadline}
              onRestart={refreshRound}
              isRoundOver={completedIds.size >= round.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && <Onboarding key="onboarding" onDone={dismissOnboarding} />}
      </AnimatePresence>
    </div>
  )
}
