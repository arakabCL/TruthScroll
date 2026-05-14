import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CASES } from './data/cases';
import DetectiveBoard from './games/DetectiveBoard';
import WitnessStories from './games/WitnessStories';
import WebInvestigation from './games/WebInvestigation';
import SocialScroll from './games/SocialScroll';
import { useGame } from './context/GameContext';

export default function Investigation() {
  const { caseId } = useParams();
  const { isUnlocked, progress } = useGame();
  const caseData = CASES.find(c => c.id === parseInt(caseId, 10));
  const completed = caseData ? progress.completedCases?.[caseData.id] : null;
  const retryLocked = Boolean(completed && completed.verdict === 'incorrect' && progress.settings?.caseDifficulty === 'hard');

  if (!caseData || !isUnlocked(caseData) || retryLocked) {
    return <Navigate to="/cases" replace />;
  }

  if (caseData.gameType === 'detective-board') return <DetectiveBoard caseData={caseData} />;
  if (caseData.gameType === 'witness-stories') return <WitnessStories caseData={caseData} />;
  if (caseData.gameType === 'web-investigation') return <WebInvestigation caseData={caseData} />;
  if (caseData.gameType === 'social-scroll') return <SocialScroll caseData={caseData} />;

  return <Navigate to="/cases" replace />;
}
