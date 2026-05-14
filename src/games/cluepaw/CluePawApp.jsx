import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from './Home';
import Cases from './Cases';
import Investigation from './Investigation';
import Rewards from './Rewards';
import Briefing from './Briefing';
import FieldKit from './FieldKit';
import NotFound from './NotFound';
import OnboardingModal from './components/OnboardingModal';
import { MusicProvider } from './context/MusicContext';
import { GameProvider } from './context/GameContext';

import './index.css';

function InnerRoutes({ onExitToLauncher }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <MusicProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/investigate/:caseId" element={<Investigation />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/briefing" element={<Briefing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <FieldKit />
      <OnboardingModal />
      {isHome && onExitToLauncher && (
        <button
          type="button"
          className="cluepaw-launcher-back"
          onClick={onExitToLauncher}
          aria-label="Switch game"
        >
          <span aria-hidden="true" className="cluepaw-launcher-back-arrow">←</span>
          <span>Switch Game</span>
        </button>
      )}
    </MusicProvider>
  );
}

export default function CluePawApp({ onExitToLauncher }) {
  return (
    <div className="cluepaw-shell">
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GameProvider>
          <InnerRoutes onExitToLauncher={onExitToLauncher} />
        </GameProvider>
      </BrowserRouter>
    </div>
  );
}
