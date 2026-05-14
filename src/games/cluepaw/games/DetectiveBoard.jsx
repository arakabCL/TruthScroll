import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CorkBoardScene from './shared/CorkBoardScene';
import PaperCard from './shared/PaperCard';
import VerdictNote from './shared/VerdictNote';
import CaseReport from './shared/CaseReport';
import GameTopControls from './shared/GameTopControls';
import { isCorrectVerdict } from './shared/gameVerdict';
import { useGame } from '../context/GameContext';
import EvidenceVisual from '../components/EvidenceVisual';

const ROTATIONS = [-3, 2, -1.5, 2.4, -2, 1.5, -2.5, 1];

const BOARD_ZONES = {
  support: [
    { top: '24%', left: '18%' },
    { top: '38%', left: '37%' },
    { top: '61%', left: '20%' },
    { top: '76%', left: '40%' },
    { top: '52%', left: '31%' },
  ],
  contradict: [
    { top: '24%', left: '62%' },
    { top: '39%', left: '82%' },
    { top: '61%', left: '65%' },
    { top: '76%', left: '84%' },
    { top: '52%', left: '74%' },
  ],
};

export default function DetectiveBoard({ caseData }) {
  const navigate = useNavigate();
  const { progress, completeCase, updateBadgeTypeUnlocks } = useGame();
  const clues = caseData.clues;
  const [tags, setTags] = useState({});
  const [activeClueId, setActiveClueId] = useState(clues[0]?.id);
  const [verdict, setVerdict] = useState(null);
  const [phase, setPhase] = useState('investigate');
  const wasFirstAttempt = !progress.completedCases[caseData.id];
  const caseDifficulty = progress.settings?.caseDifficulty || 'easy';

  const activeClue = clues.find(clue => clue.id === activeClueId) || null;
  const taggedCount = Object.keys(tags).length;
  const canVerdict = taggedCount >= 4;
  const supportCount = Object.values(tags).filter(tag => tag === 'support').length;
  const contradictCount = Object.values(tags).filter(tag => tag === 'contradict').length;
  const isCorrect = isCorrectVerdict(verdict, caseData.actualVerdict);
  const retryLocked = caseDifficulty === 'hard' && !isCorrect;
  const canRetry = !isCorrect && !retryLocked;

  // Untagged clues to show in the tray
  const untaggedClues = clues.filter(c => !tags[c.id]);

  function toggleTag(clueId, tag) {
    setTags(prev => {
      const next = { ...prev };
      if (next[clueId] === tag) {
        delete next[clueId];
      } else {
        next[clueId] = tag;
        // Auto-advance to next untagged clue after a short delay
        const nextUntagged = clues.find(c => c.id !== clueId && !next[c.id]);
        setTimeout(() => setActiveClueId(nextUntagged ? nextUntagged.id : null), 300);
      }
      return next;
    });
  }

  function moveClue(direction) {
    if (clues.length === 0) return;
    const currentIndex = clues.findIndex(clue => clue.id === activeClue?.id);
    const validIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (validIndex + direction + clues.length) % clues.length;
    setActiveClueId(clues[nextIndex].id);
  }

  function resetGame() {
    setTags({});
    setActiveClueId(clues[0]?.id);
    setVerdict(null);
    setPhase('investigate');
  }

  const findings = [
    `${taggedCount} clue${taggedCount === 1 ? '' : 's'} tagged`,
    `${supportCount} supporting clue${supportCount === 1 ? '' : 's'}`,
    `${contradictCount} contradicting clue${contradictCount === 1 ? '' : 's'}`,
    activeClue ? `Last inspected: ${activeClue.title}` : 'No clue selected',
  ];
  const tibbeeHints = [
    activeClue
      ? `Look closely at "${activeClue.title}". Ask whether it proves the exact mission claim, or only sounds related.`
      : 'Pick one clue from the tray first. A good detective checks the source before deciding.',
    taggedCount < 4
      ? `You need ${4 - taggedCount} more tagged clue${4 - taggedCount === 1 ? '' : 's'}. Try comparing time, place, and original source.`
      : `Your board has ${supportCount} supporting and ${contradictCount} contradicting clue${contradictCount === 1 ? '' : 's'}. The verdict should match the stronger evidence, not the loudest clue.`,
  ];

  // Get tagged clues in order for drawing traces
  const taggedClues = clues.filter(c => tags[c.id]);
  const taggedCluesByZone = {
    support: taggedClues.filter(clue => tags[clue.id] === 'support'),
    contradict: taggedClues.filter(clue => tags[clue.id] === 'contradict'),
  };
  const taggedPositionMap = taggedClues.reduce((acc, clue) => {
    const tag = tags[clue.id];
    const zoneIndex = taggedCluesByZone[tag].findIndex(item => item.id === clue.id);
    acc[clue.id] = BOARD_ZONES[tag][zoneIndex % BOARD_ZONES[tag].length];
    return acc;
  }, {});
  const boardTraceLines = ['support', 'contradict'].flatMap(tag => {
    const zoneClues = taggedCluesByZone[tag];
    return zoneClues.slice(1).map((clue, index) => {
      const previousClue = zoneClues[index];
      return {
        id: `${previousClue.id}-${clue.id}`,
        from: taggedPositionMap[previousClue.id],
        to: taggedPositionMap[clue.id],
      };
    });
  });

  return (
    <>
      <CorkBoardScene
        topControls={
          <GameTopControls
            onBack={() => navigate('/cases')}
            claim={caseData.claim}
            progress={`${taggedCount}/${clues.length} tagged`}
            skill="Skill focus: separate evidence from attention bait"
            hints={tibbeeHints}
            hintKey={caseData.id}
          />
        }
        leftControl={
          <button className="board-arrow" type="button" onClick={() => moveClue(-1)} aria-label="Previous clue">
            &lt;
          </button>
        }
        rightControl={
          <button className="board-arrow" type="button" onClick={() => moveClue(1)} aria-label="Next clue">
            &gt;
          </button>
        }
        boardContent={
          <div className="detective-board-workspace">
            <div className="board-zone-label board-zone-label-support">
              <strong>Supports</strong>
              <span>{supportCount}</span>
            </div>
            <div className="board-zone-label board-zone-label-contradict">
              <strong>Contradicts</strong>
              <span>{contradictCount}</span>
            </div>
            <div className="board-zone-divider" aria-hidden="true" />

            <svg className="board-string-layer" aria-hidden="true">
              <defs>
                <filter id="string-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#2b1408" floodOpacity="0.4" />
                </filter>
              </defs>
              {boardTraceLines.map(line => {
                if (!line.from || !line.to) return null;
                return (
                  <line
                    key={`line-${line.id}`}
                    x1={line.from.left}
                    y1={line.from.top}
                    x2={line.to.left}
                    y2={line.to.top}
                    stroke="var(--scene-pin)"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                    filter="url(#string-shadow)"
                  />
                );
              })}
            </svg>

            {taggedClues.map((clue, index) => {
              const pos = taggedPositionMap[clue.id];
              const tag = tags[clue.id];
              const isActive = activeClueId === clue.id;

              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%", rotate: ROTATIONS[index % ROTATIONS.length] - 10 }}
                  animate={{ opacity: 1, scale: isActive ? 1.05 : 1, x: "-50%", y: "-50%", rotate: ROTATIONS[index % ROTATIONS.length] }}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    zIndex: isActive ? 5 : 2
                  }}
                >
                  <PaperCard
                    as="button"
                    type="button"
                    className={`tray-clue-card ${tag}`}
                    style={{
                      width: '135px',
                      height: 'auto',
                      padding: '0.8rem',
                      cursor: 'pointer',
                      transform: 'none',
                      margin: 0,
                      boxShadow: isActive ? '0 12px 24px rgba(0,0,0,0.3)' : '0 6px 12px rgba(0,0,0,0.2)',
                      outline: isActive ? '3px solid var(--amber-main)' : 'none',
                      outlineOffset: '2px',
                      transition: 'box-shadow 0.2s, outline 0.2s'
                    }}
                    onClick={() => setActiveClueId(clue.id)}
                  >
                    <div className="paper-pin" />
                    <span className="tray-clue-icon" style={{ marginBottom: '0.4rem', display: 'block' }}>
                      <EvidenceVisual kind="clue" data={clue} compact />
                    </span>
                    <strong style={{ fontSize: '0.8rem', display: 'block', lineHeight: 1.2 }}>{clue.title}</strong>
                    <small style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'block', color: 'rgba(0,0,0,0.6)', fontWeight: 800 }}>
                      {tag === 'support' ? '✓ Supports' : '✕ Contradicts'}
                    </small>
                  </PaperCard>
                </motion.div>
              );
            })}

            {activeClue && (
              <motion.div
                key={`active-panel-${activeClue.id}`}
                initial={{ opacity: 0, x: '-50%', y: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className="board-active-clue-panel"
              >
                <PaperCard style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '1.2rem', 
                  gap: '0.8rem', 
                  boxShadow: '0 15px 35px rgba(32, 20, 10, 0.4), 0 5px 15px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="evidence-polaroid" style={{ transform: 'rotate(-2deg)', padding: '0.4rem', width: '70px', flexShrink: 0 }}>
                      <div className="evidence-preview" style={{ height: '54px', fontSize: '1.8rem' }}>
                        <EvidenceVisual kind="clue" data={activeClue} />
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span className="paper-kicker" style={{ margin: 0, fontSize: '0.6rem' }}>{activeClue.snippet}</span>
                      <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', lineHeight: 1.1 }}>{activeClue.title}</h1>
                    </div>
                  </div>
                  
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    lineHeight: 1.4, 
                    color: 'rgba(0,0,0,0.75)',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem'
                  }}>
                    {activeClue.content}
                  </p>
                  
                  <div className="stamp-actions" aria-label="Tag clue" style={{ marginTop: '0.2rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`stamp-button support${tags[activeClue.id] === 'support' ? ' selected' : ''}`}
                      onClick={() => toggleTag(activeClue.id, 'support')}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', minWidth: 0 }}
                    >
                      Supports
                    </button>
                    <button
                      type="button"
                      className={`stamp-button contradict${tags[activeClue.id] === 'contradict' ? ' selected' : ''}`}
                      onClick={() => toggleTag(activeClue.id, 'contradict')}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', minWidth: 0 }}
                    >
                      Contradicts
                    </button>
                  </div>
                </PaperCard>
              </motion.div>
            )}
          </div>
        }
        rightNote={
          <VerdictNote
            value={verdict}
            onChange={setVerdict}
            onSubmit={() => {
                const correct = isCorrectVerdict(verdict, caseData.actualVerdict);
                const retryLock = caseDifficulty === 'hard' && !correct;
                completeCase(caseData.id, caseData.gameType, correct, wasFirstAttempt, retryLock);
              updateBadgeTypeUnlocks({ 'detective-board': 1 + Object.values(progress.completedCases).filter(c => c.gameType === 'detective-board').length });
              setPhase('result');
            }}
            disabled={!canVerdict}
            disabledReason={`Tag ${Math.max(0, 4 - taggedCount)} more clue${4 - taggedCount === 1 ? '' : 's'} to unlock.`}
            submitLabel="Close Case"
          />
        }
        trayItems={untaggedClues.map((clue, index) => {
          return (
            <PaperCard
              key={clue.id}
              as="button"
              type="button"
              className={`tray-clue-card${activeClue?.id === clue.id ? ' active' : ''}`}
              style={{ '--rot': `${ROTATIONS[index % ROTATIONS.length]}deg` }}
              onClick={() => setActiveClueId(clue.id)}
            >
              <span className="tray-clue-icon"><EvidenceVisual kind="clue" data={clue} compact /></span>
              <strong>{clue.title}</strong>
              <small>Open clue</small>
            </PaperCard>
          );
        })}
      />

      {phase === 'result' && (
        <CaseReport
          caseData={caseData}
          selectedVerdict={verdict}
          isCorrect={isCorrect}
          findings={findings}
          mediaPreview={activeClue?.title}
          canRetry={canRetry}
          onTryAgain={resetGame}
          onContinue={() => navigate('/rewards')}
        />
      )}
    </>
  );
}
