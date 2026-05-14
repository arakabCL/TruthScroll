import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DeskScene from './shared/DeskScene';
import PaperCard from './shared/PaperCard';
import VerdictNote from './shared/VerdictNote';
import CaseReport from './shared/CaseReport';
import GameTopControls from './shared/GameTopControls';
import { isCorrectVerdict } from './shared/gameVerdict';
import { useGame } from '../context/GameContext';
import EvidenceVisual from '../components/EvidenceVisual';

export default function WitnessStories({ caseData }) {
  const navigate = useNavigate();
  const { progress, completeCase, updateBadgeTypeUnlocks } = useGame();
  const witnesses = caseData.witnesses;
  const [tags, setTags] = useState({});
  const [activeWitnessId, setActiveWitnessId] = useState(witnesses[0]?.id);
  const [verdict, setVerdict] = useState(null);
  const [phase, setPhase] = useState('investigate');
  const wasFirstAttempt = !progress.completedCases[caseData.id];
  const caseDifficulty = progress.settings?.caseDifficulty || 'easy';

  const activeWitness = witnesses.find(witness => witness.id === activeWitnessId) || witnesses[0];
  const taggedCount = Object.keys(tags).length;
  const canVerdict = taggedCount >= 3;
  const credibleCount = Object.values(tags).filter(tag => tag === 'credible').length;
  const suspiciousCount = Object.values(tags).filter(tag => tag === 'suspicious').length;
  const suspiciousTagged = witnesses.filter(witness => tags[witness.id] === 'suspicious');
  const isCorrect = isCorrectVerdict(verdict, caseData.actualVerdict);
  const retryLocked = caseDifficulty === 'hard' && !isCorrect;
  const canRetry = !isCorrect && !retryLocked;

  function toggleTag(witnessId, tag) {
    setTags(prev => {
      const next = { ...prev };
      if (next[witnessId] === tag) delete next[witnessId];
      else next[witnessId] = tag;
      return next;
    });
  }

  function resetGame() {
    setTags({});
    setActiveWitnessId(witnesses[0]?.id);
    setVerdict(null);
    setPhase('investigate');
  }

  const findings = [
    `${taggedCount} witness${taggedCount === 1 ? '' : 'es'} assessed`,
    `${credibleCount} marked credible`,
    `${suspiciousCount} marked suspicious`,
    activeWitness ? `Last testimony: ${activeWitness.name}` : 'No testimony selected',
  ];
  const tibbeeHints = [
    activeWitness
      ? `Start with ${activeWitness.name}. A strong witness gives specific details and matches the other records.`
      : 'Choose a witness, then ask what they saw directly and what they are only guessing.',
    taggedCount < 3
      ? `Assess ${3 - taggedCount} more witness${3 - taggedCount === 1 ? '' : 'es'} before the verdict unlocks. Watch for bias and timeline conflicts.`
      : `You marked ${credibleCount} credible and ${suspiciousCount} suspicious. The best verdict should fit the most specific accounts together.`,
  ];

  return (
    <>
      <DeskScene variant="report" className="witness-redesign">
        <div className="game-top-controls desk-top-controls">
          <GameTopControls
            onBack={() => navigate('/cases')}
            claim={caseData.claim}
            progress={`${taggedCount}/${witnesses.length} assessed`}
            skill="Skill focus: compare firsthand claims with conflicts"
            hints={tibbeeHints}
            hintKey={caseData.id}
          />
        </div>

        <div className="witness-desk-layout">
          <aside className="witness-tabs" aria-label="Witnesses">
            {witnesses.map((witness, index) => {
              const tag = tags[witness.id];
              return (
                <motion.button
                  key={witness.id}
                  type="button"
                  className={`witness-polaroid${activeWitness?.id === witness.id ? ' active' : ''}${tag ? ` ${tag}` : ''}`}
                  onClick={() => setActiveWitnessId(witness.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <span className="witness-photo" style={{ '--avatar-bg': witness.avatarBg }}>
                    <EvidenceVisual kind="witness" data={witness} compact />
                  </span>
                  <strong>{witness.name}</strong>
                  <small>{tag || witness.role}</small>
                </motion.button>
              );
            })}
          </aside>

          <motion.main
            key={activeWitness?.id}
            className="witness-report-wrap"
            initial={{ opacity: 0, rotate: -2, y: 18 }}
            animate={{ opacity: 1, rotate: -1, y: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 180 }}
          >
            <PaperCard className="witness-report-paper">
              <div className="report-polaroid witness-active-polaroid">
                <div className="report-media-box" style={{ '--avatar-bg': activeWitness.avatarBg }}>
                  <EvidenceVisual kind="witness" data={activeWitness} />
                </div>
                <small>Witness file</small>
              </div>

              <div className="witness-report-copy">
                <p className="report-field">
                  <span>Subject:</span>
                  <strong>{activeWitness.name}</strong>
                </p>
                <p className="witness-role-line">{activeWitness.role}</p>
                <div className="report-rule" />
                <section>
                  <h2>Statement:</h2>
                  <p className="witness-quote">{activeWitness.shortQuote}</p>
                  <p>{activeWitness.fullTestimony}</p>
                </section>
                {activeWitness.flagHint && (
                  <div className="desk-alert-note">
                    <strong>Look closer</strong>
                    <p>{activeWitness.flagHint}</p>
                  </div>
                )}
                {suspiciousTagged.length > 0 && (
                  <div className="desk-alert-note compact">
                    <strong>Suspicious accounts flagged</strong>
                    <p>Compare timelines and conflicts before sealing the report.</p>
                  </div>
                )}
                <div className="stamp-actions">
                  <button
                    type="button"
                    className={`stamp-button support${tags[activeWitness.id] === 'credible' ? ' selected' : ''}`}
                    onClick={() => toggleTag(activeWitness.id, 'credible')}
                  >
                    Credible
                  </button>
                  <button
                    type="button"
                    className={`stamp-button contradict${tags[activeWitness.id] === 'suspicious' ? ' selected' : ''}`}
                    onClick={() => toggleTag(activeWitness.id, 'suspicious')}
                  >
                    Suspicious
                  </button>
                </div>
              </div>
            </PaperCard>
          </motion.main>

          <aside className="desk-verdict-stack">
            <VerdictNote
              value={verdict}
              onChange={setVerdict}
              onSubmit={() => {
              const correct = isCorrectVerdict(verdict, caseData.actualVerdict);
              const retryLock = caseDifficulty === 'hard' && !correct;
              completeCase(caseData.id, caseData.gameType, correct, wasFirstAttempt, retryLock);
              updateBadgeTypeUnlocks({ 'witness-stories': 1 + Object.values(progress.completedCases).filter(c => c.gameType === 'witness-stories').length });
              setPhase('result');
            }}
              disabled={!canVerdict}
              disabledReason={`Assess ${Math.max(0, 3 - taggedCount)} more witness${3 - taggedCount === 1 ? '' : 'es'} to unlock.`}
              submitLabel="Deliver Verdict"
            />
          </aside>
        </div>
      </DeskScene>

      {phase === 'result' && (
        <CaseReport
          caseData={caseData}
          selectedVerdict={verdict}
          isCorrect={isCorrect}
          findings={findings}
          mediaPreview={activeWitness?.name}
          canRetry={canRetry}
          onTryAgain={resetGame}
          onContinue={() => navigate('/rewards')}
        />
      )}
    </>
  );
}
