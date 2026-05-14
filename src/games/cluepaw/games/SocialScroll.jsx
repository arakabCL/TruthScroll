import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DeskScene from './shared/DeskScene';
import PhoneFrame from './shared/PhoneFrame';
import PaperCard from './shared/PaperCard';
import VerdictNote from './shared/VerdictNote';
import CaseReport from './shared/CaseReport';
import GameTopControls from './shared/GameTopControls';
import { isCorrectVerdict } from './shared/gameVerdict';
import { useGame } from '../context/GameContext';

const SIGNAL_LABELS = {
  source: 'Source',
  context: 'Context',
  media: 'Media',
  tone: 'Tone',
  corroboration: 'Corroboration',
};

const QUALITY_LABELS = {
  strong: 'Strong',
  caution: 'Caution',
  weak: 'Weak',
};

export default function SocialScroll({ caseData }) {
  const navigate = useNavigate();
  const { progress, completeCase, updateBadgeTypeUnlocks } = useGame();
  const [activePostId, setActivePostId] = useState(caseData.socialPosts[0]?.id);
  const [mode, setMode] = useState('feed');
  const [pinnedSignals, setPinnedSignals] = useState([]);
  const [checkedSources, setCheckedSources] = useState({});
  const [verdict, setVerdict] = useState(null);
  const [phase, setPhase] = useState('investigate');
  const wasFirstAttempt = !progress.completedCases[caseData.id];
  const caseDifficulty = progress.settings?.caseDifficulty || 'easy';

  const activePost = caseData.socialPosts.find(post => post.id === activePostId) || caseData.socialPosts[0];
  const canVerdict = pinnedSignals.length >= 4;
  const isCorrect = isCorrectVerdict(verdict, caseData.actualVerdict);
  const checkedCount = Object.keys(checkedSources).length;
  const retryLocked = caseDifficulty === 'hard' && !isCorrect;
  const canRetry = !isCorrect && !retryLocked;

  function openPost(postId) {
    setActivePostId(postId);
    setMode('investigate');
  }

  function toggleSignal(signal) {
    setPinnedSignals(prev => {
      if (prev.some(item => item.id === signal.id)) {
        return prev.filter(item => item.id !== signal.id);
      }
      return [
        ...prev,
        {
          ...signal,
          postAccount: activePost.account,
          postHandle: activePost.handle,
        },
      ];
    });
  }

  function isPinned(signalId) {
    return pinnedSignals.some(item => item.id === signalId);
  }

  function checkSource(postId) {
    setCheckedSources(prev => ({ ...prev, [postId]: true }));
  }

  function resetGame() {
    setActivePostId(caseData.socialPosts[0]?.id);
    setMode('feed');
    setPinnedSignals([]);
    setCheckedSources({});
    setVerdict(null);
    setPhase('investigate');
  }

  const findings = [
    `${pinnedSignals.length} signal${pinnedSignals.length === 1 ? '' : 's'} pinned`,
    `${checkedCount} account${checkedCount === 1 ? '' : 's'} checked`,
    activePost ? `Last post: ${activePost.account}` : 'No post selected',
    pinnedSignals[0]?.takeaway || 'Feed scan started',
  ];
  const tibbeeHints = [
    mode === 'feed'
      ? 'Pick the post making the biggest claim first. Popular posts still need a source.'
      : `Check ${activePost.account}. Look for original context, edited media, or signs the post is repeating someone else.`,
    pinnedSignals.length < 4
      ? `Pin ${4 - pinnedSignals.length} more signal${4 - pinnedSignals.length === 1 ? '' : 's'}. Strong signals explain source, context, media, or tone.`
      : `You have ${pinnedSignals.length} pinned signals. The safest verdict should explain what changed between the post and the full context.`,
  ];

  return (
    <>
      <DeskScene variant="phone" className="social-redesign">
        <div className="game-top-controls desk-top-controls">
          <GameTopControls
            onBack={() => navigate('/cases')}
            claim={caseData.claim}
            progress={`${pinnedSignals.length}/4 signals`}
            skill="Skill focus: slow the scroll and find the original context"
            hints={tibbeeHints}
            hintKey={caseData.id}
          />
        </div>

        <div className="social-desk-layout">
          <PhoneFrame title="TruthScroll" progress={mode === 'feed' ? 'live feed' : `${pinnedSignals.length} pinned`}>
            <AnimatePresence mode="wait">
              {mode === 'feed' ? (
                <motion.div
                  key="feed"
                  className="social-phone-feed"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="social-feed-toolbar" aria-label="Feed filters">
                    <span>For You</span>
                    <span>Trending</span>
                    <span>School Chat</span>
                  </div>

                  <div className="social-feed-list">
                    {caseData.socialPosts.map((post, index) => (
                      <motion.article
                        key={post.id}
                        className={`social-post-card${activePostId === post.id ? ' active' : ''}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <button type="button" className="social-post-open" onClick={() => openPost(post.id)}>
                          <header className="social-post-author">
                            <span className="social-avatar" style={{ '--avatar': post.color }}>{post.initials}</span>
                            <span>
                              <strong>{post.account}</strong>
                              <small>{post.handle} · {post.time}</small>
                            </span>
                          </header>
                          <p>{post.text}</p>
                          <div className={`social-post-media media-${post.mediaType}`}>
                            {post.image && <img src={post.image} alt="" loading="lazy" />}
                            <span>{post.mediaLabel}</span>
                          </div>
                          <div className="social-post-stats">
                            <span>{post.likes} likes</span>
                            <span>{post.shares} shares</span>
                            <span>{post.comments} comments</span>
                          </div>
                        </button>
                        <button type="button" className="investigate-feed-button" onClick={() => openPost(post.id)}>
                          Investigate
                        </button>
                      </motion.article>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activePost.id}
                  className="social-investigation-phone"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="social-investigation-top">
                    <button type="button" onClick={() => setMode('feed')}>Back to Feed</button>
                    <button
                      type="button"
                      onClick={() => checkSource(activePost.id)}
                      disabled={checkedSources[activePost.id]}
                    >
                      {checkedSources[activePost.id] ? activePost.sourceRating : 'Check Account'}
                    </button>
                  </div>

                  <article className="social-focus-post">
                    <header className="social-post-author">
                      <span className="social-avatar" style={{ '--avatar': activePost.color }}>{activePost.initials}</span>
                      <span>
                        <strong>{activePost.account}</strong>
                        <small>{activePost.handle} · {activePost.time}</small>
                      </span>
                    </header>
                    <p>{activePost.text}</p>
                    {checkedSources[activePost.id] && (
                      <div className="desk-alert-note compact">
                        <strong>Account check</strong>
                        <p>{activePost.sourceNote}</p>
                      </div>
                    )}
                  </article>

                  <div className="social-signal-list" aria-label="Investigation signals">
                    {activePost.signals.map(signal => {
                      const pinned = isPinned(signal.id);
                      return (
                        <section key={signal.id} className={`social-signal-card ${signal.quality}${pinned ? ' pinned' : ''}`}>
                          <span className="paper-kicker">{SIGNAL_LABELS[signal.type] || signal.type}</span>
                          <h2>{signal.title}</h2>
                          <p>{signal.detail}</p>
                          <div className="social-signal-footer">
                            <strong>{QUALITY_LABELS[signal.quality] || signal.quality}</strong>
                            <button type="button" className={`receipt-button${pinned ? ' active' : ''}`} onClick={() => toggleSignal(signal)}>
                              {pinned ? 'Signal Pinned' : 'Pin Signal'}
                            </button>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </PhoneFrame>

          <aside className="social-desk-stack" aria-label="TruthScroll workspace">
            <PaperCard className="claim-pocket social-brief-card">
              <span className="paper-kicker">Workspace</span>
              <h2>Signal Board</h2>
              <div className="social-score-row">
                <span>{pinnedSignals.length}/4 pinned</span>
                <span>{checkedCount} checked</span>
              </div>
              {pinnedSignals.length === 0 ? (
                <p>Open a post and pin signals that reveal source, context, media, or tone.</p>
              ) : (
                <div className="receipt-list">
                  {pinnedSignals.map((signal, index) => (
                    <PaperCard
                      key={signal.id}
                      className={`receipt-slip social-signal-slip ${signal.quality}`}
                      style={{ '--rot': `${index % 2 === 0 ? -1.5 : 1.5}deg` }}
                    >
                      <span>{SIGNAL_LABELS[signal.type] || signal.type} · {signal.postHandle}</span>
                      <strong>{signal.takeaway}</strong>
                    </PaperCard>
                  ))}
                </div>
              )}
            </PaperCard>

            <VerdictNote
              value={verdict}
              onChange={setVerdict}
              onSubmit={() => {
                const correct = isCorrectVerdict(verdict, caseData.actualVerdict);
                const retryLock = caseDifficulty === 'hard' && !correct;
                completeCase(caseData.id, caseData.gameType, correct, wasFirstAttempt, retryLock);
                updateBadgeTypeUnlocks({ 'social-scroll': 1 + Object.values(progress.completedCases).filter(c => c.gameType === 'social-scroll').length });
                setPhase('result');
              }}
              disabled={!canVerdict}
              disabledReason={`Pin ${Math.max(0, 4 - pinnedSignals.length)} more signal${4 - pinnedSignals.length === 1 ? '' : 's'} to unlock.`}
              submitLabel="Lock Verdict"
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
          mediaPreview={activePost?.account}
          canRetry={canRetry}
          onTryAgain={resetGame}
          onContinue={() => navigate('/rewards')}
        />
      )}
    </>
  );
}
