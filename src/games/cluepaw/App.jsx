import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

function App() {
  const location = useLocation();

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
    </MusicProvider>
  );
}

export default App;
