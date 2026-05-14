import { useEffect, useState } from 'react'
import { AuthProvider } from './lib/auth-context.jsx'
import DetectScrollApp from './App.jsx'
import CluePawApp from './games/cluepaw/CluePawApp.jsx'
import './launcher.css'

export default function Launcher() {
  const [view, setView] = useState('home')

  // Each game owns very different global styles (Tailwind dark vs. CluePaw cream).
  // Tag the <body> so launcher.css can keep its own background from leaking and
  // the games can reset cleanly when they unmount.
  useEffect(() => {
    document.body.dataset.view = view
    return () => { delete document.body.dataset.view }
  }, [view])

  const goHome = () => setView('home')

  if (view === 'cluepaw') {
    return <CluePawApp onExitToLauncher={goHome} />
  }

  if (view === 'detectscroll') {
    return (
      <AuthProvider>
        <DetectScrollApp onExitToLauncher={goHome} />
      </AuthProvider>
    )
  }

  return <LauncherHome onPick={setView} />
}

function LauncherHome({ onPick }) {
  return (
    <div className="launcher-root">
      <div className="launcher-bg" aria-hidden="true" />

      <header className="launcher-header">
        <span className="launcher-kicker">Pick your case file</span>
        <h1 className="launcher-title">
          Detective <span>HQ</span>
        </h1>
        <p className="launcher-sub">
          Two desks. Two mysteries. Pick the one that fits the mood.
        </p>
      </header>

      <main className="launcher-grid">
        <GameCard
          onClick={() => onPick('cluepaw')}
          ageTag="Ages 10–12"
          tag="4 mini-games"
          title="CluePaw"
          tagline="Solve internet mysteries with Tibbee. Pin clues, hear witnesses, scroll feeds, check sources."
          mascot="/mascots/tibbee.png"
          mascotAlt="Tibbee the otter mascot"
          accent="amber"
        />
        <GameCard
          onClick={() => onPick('detectscroll')}
          ageTag="Ages 11–13"
          tag="Verify the feed · timed"
          title="TruthScroll"
          tagline="Scroll the feed. Spot the lies. Pin evidence on the corkboard and crack the case in under 5 minutes."
          mascot="/tigers/tiger-magnify.png"
          mascotAlt="Tiger detective mascot"
          accent="copper"
        />
      </main>
    </div>
  )
}

function GameCard({ onClick, ageTag, tag, title, tagline, mascot, mascotAlt, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`launcher-card launcher-card-${accent}`}
    >
      <span className="launcher-card-tab" aria-hidden="true">
        Case File
      </span>
      <span className="launcher-card-paperclip" aria-hidden="true">📎</span>

      <span className="launcher-card-age" aria-label={ageTag}>
        {ageTag}
      </span>

      <div className="launcher-card-mascot">
        <img src={mascot} alt={mascotAlt} draggable={false} />
      </div>

      <div className="launcher-card-body">
        <span className="launcher-card-tag">{tag}</span>
        <h2>{title}</h2>
        <p>{tagline}</p>
      </div>

      <span className="launcher-card-cta">
        Open Case <span aria-hidden="true">→</span>
      </span>
    </button>
  )
}
