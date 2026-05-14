import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CASES, GAME_TYPE_INFO } from './data/cases';
import { useGame } from './context/GameContext';
import AppIcon from './components/AppIcon';

const TABS = ['Viral Rumors', 'Source Sleuthing', 'Missing Context'];

const Cases = () => {
  const navigate = useNavigate();
  const { isUnlocked, progress, totalCases } = useGame();
  const [activeTab, setActiveTab] = useState('Viral Rumors');
  const caseDifficulty = progress.settings?.caseDifficulty || 'easy';

  const filtered = CASES.filter(c => c.cat === activeTab);
  const completedCount = Object.keys(progress.completedCases || {}).length;
  const nextCase = CASES.find(c => isUnlocked(c) && !progress.completedCases[c.id]);

  return (
    <motion.div
      className="archive-page"
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
    >
      {/* Top nav bar */}
      <div className="archive-topbar">
        <motion.button
          className="archive-back-btn"
          onClick={() => navigate('/')}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
        >
          <AppIcon name="back" size={16} />
          Back
        </motion.button>
        <span className="archive-topbar-label">Pick a Mystery</span>
      </div>

      <div className="archive-header">
        <h1 className="archive-title">Pick a Mystery</h1>
        <p className="archive-subtitle">Choose one case. Tibbee will help you spot clues and make a smart call.</p>
        <div className="archive-path-card">
          <div>
            <span>Your Progress</span>
            <strong>{completedCount}/{totalCases} cases solved</strong>
          </div>
          {nextCase && (
            <button type="button" onClick={() => navigate(`/investigate/${nextCase.id}`)} aria-label={`Play next case: ${nextCase.title}`}>
              Play Next
            </button>
          )}
        </div>
        <div className="brass-toggles">
          {TABS.map(tab => (
            <motion.button
              key={tab}
              className={`brass-toggle${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="archive-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => {
            const gameInfo = c.gameType ? GAME_TYPE_INFO[c.gameType] : null;
            const unlocked = isUnlocked(c);
            const completed = progress.completedCases[c.id];
            const isClosed = Boolean(completed && completed.verdict === 'incorrect' && caseDifficulty === 'hard');
            const isPlayable = unlocked && !isClosed;
            const statusClass = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');
            return (
              <motion.button
                key={c.id}
                className={`case-card ${statusClass}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, type: 'spring', damping: 22 }}
                whileHover={isPlayable ? { scale: 1.02, y: -3 } : {}}
                whileTap={isPlayable ? { scale: 0.99 } : {}}
                onClick={() => isPlayable && navigate(`/investigate/${c.id}`)}
                type="button"
                aria-disabled={!isPlayable}
                aria-label={`${c.title} — ${completed ? (isClosed ? 'closed' : 'completed') : unlocked ? 'start case' : 'locked'}`}
              >
                <div className="card-binder-rings" aria-hidden="true">
                  <div className={`ring ${c.ring}`} />
                  <div className={`ring ${c.ring}`} />
                  <div className={`ring ${c.ring}`} />
                </div>

                <div className="case-card-top">
                  {gameInfo && unlocked && (
                    <div
                      className="game-type-badge"
                      style={{ color: gameInfo.color, background: gameInfo.bg, borderColor: `${gameInfo.color}33` }}
                    >
                      <span aria-hidden="true"><AppIcon name={gameInfo.icon} size={14} /></span>
                      <span>{gameInfo.label}</span>
                    </div>
                  )}
                  {completed && (
                    <div className={`case-completion-badge ${completed.verdict}`}>
                      {completed.verdict === 'correct' ? (
                        <><AppIcon name="check" size={14} /> Solved</>
                      ) : isClosed ? (
                        <><AppIcon name="lock" size={14} /> Closed</>
                      ) : (
                        <><AppIcon name="refresh" size={14} /> Try Again</>
                      )}
                    </div>
                  )}
                  {c.image && (
                    <div className="case-card-cover" aria-hidden="true">
                      <img src={c.image} alt="" loading="lazy" />
                    </div>
                  )}
                  <h2 className="case-card-title">{c.title}</h2>
                  <p className="case-card-summary">
                    {unlocked ? c.summary : 'Locked for now. Solve more cases to open this one.'}
                  </p>
                </div>

                <div className="card-footer">
                  <div className="case-meta">
                    {unlocked ? (
                      <>
                        <span className="case-meta-item"><AppIcon name="clock" size={14} /> {c.time}</span>
                        <span className="case-meta-item"><AppIcon name="source" size={14} /> {c.sourceMix}</span>
                      </>
                    ) : (
                      <span className="case-meta-item lock-hint"><AppIcon name="lock" size={14} /> {c.unlockHint}</span>
                    )}
                  </div>
                  <span className={`case-status ${statusClass}`}>
                    {completed
                      ? (completed.verdict === 'correct' ? 'Solved' : (isClosed ? 'Closed' : 'Try Again'))
                      : (unlocked ? 'Play' : 'Locked')}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="archive-empty">No mysteries here yet. Try another shelf.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Cases;
