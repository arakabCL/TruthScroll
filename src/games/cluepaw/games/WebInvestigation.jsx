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
import EvidenceVisual from '../components/EvidenceVisual';

const RELIABILITY_LABELS = {
  reliable: { label: 'Trusted Source', color: '#2f8f52', icon: 'Trusted' },
  biased: { label: 'Biased Source', color: '#b86a1f', icon: 'Biased' },
  unreliable: { label: 'Unreliable Source', color: '#b43a2b', icon: 'Weak' },
};

export default function WebInvestigation({ caseData }) {
  const navigate = useNavigate();
  const { progress, completeCase, updateBadgeTypeUnlocks } = useGame();
  const [activeSiteId, setActiveSiteId] = useState(caseData.websites[0].id);
  const [bookmarks, setBookmarks] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [phase, setPhase] = useState('investigate');
  const [revealedReliability, setRevealedReliability] = useState({});
  const wasFirstAttempt = !progress.completedCases[caseData.id];
  const caseDifficulty = progress.settings?.caseDifficulty || 'easy';

  const activeSite = caseData.websites.find(site => site.id === activeSiteId);
  const canVerdict = bookmarks.length >= 3;
  const isCorrect = isCorrectVerdict(verdict, caseData.actualVerdict);
  const retryLocked = caseDifficulty === 'hard' && !isCorrect;
  const canRetry = !isCorrect && !retryLocked;

  function bookmarkArticle(site, article) {
    const id = `${site.id}-${article.id}`;
    setBookmarks(prev => {
      if (prev.find(bookmark => bookmark.id === id)) {
        return prev.filter(bookmark => bookmark.id !== id);
      }
      return [
        ...prev,
        {
          id,
          siteIcon: site.icon,
          siteName: site.name,
          title: article.title,
          note: article.note,
        },
      ];
    });
  }

  function isBookmarked(siteId, articleId) {
    return bookmarks.some(bookmark => bookmark.id === `${siteId}-${articleId}`);
  }

  function revealReliability(siteId) {
    setRevealedReliability(prev => ({ ...prev, [siteId]: true }));
  }

  function resetGame() {
    setActiveSiteId(caseData.websites[0].id);
    setBookmarks([]);
    setVerdict(null);
    setPhase('investigate');
    setRevealedReliability({});
  }

  const findings = [
    `${bookmarks.length} article${bookmarks.length === 1 ? '' : 's'} bookmarked`,
    `${Object.keys(revealedReliability).length} source${Object.keys(revealedReliability).length === 1 ? '' : 's'} checked`,
    activeSite ? `Last source: ${activeSite.name}` : 'No source selected',
    bookmarks[0]?.title || 'Evidence file started',
  ];
  const tibbeeHints = [
    activeSite
      ? `Check who made ${activeSite.name} and why. A seller, gossip site, and research source should not be weighed the same.`
      : 'Open a website and check who created it before pinning anything.',
    bookmarks.length < 3
      ? `Pin ${3 - bookmarks.length} more receipt${3 - bookmarks.length === 1 ? '' : 's'}. Strong receipts usually name sources, dates, and independent proof.`
      : `You have ${bookmarks.length} pinned receipt${bookmarks.length === 1 ? '' : 's'}. Compare which one is closest to the original evidence before filing the report.`,
  ];

  return (
    <>
      <DeskScene variant="phone" className="web-redesign">
        <div className="game-top-controls desk-top-controls">
          <GameTopControls
            onBack={() => navigate('/cases')}
            claim={caseData.claim}
            progress={`${bookmarks.length}/3 receipts`}
            skill="Skill focus: verify the original source"
            hints={tibbeeHints}
            hintKey={caseData.id}
          />
        </div>

        <div className="web-desk-layout">
          <PhoneFrame
            title={activeSite?.url || 'Web trace'}
            progress={`${bookmarks.length} pinned`}
          >
            <div className="phone-source-tabs" aria-label="Sources">
              {caseData.websites.map(site => {
                const revealed = revealedReliability[site.id];
                const rel = RELIABILITY_LABELS[site.reliability];
                return (
                  <button
                    key={site.id}
                    type="button"
                    className={`phone-source-tab${activeSiteId === site.id ? ' active' : ''}`}
                    onClick={() => setActiveSiteId(site.id)}
                  >
                    <EvidenceVisual kind="website" data={site} compact />
                    <strong>{site.name}</strong>
                    {revealed && <small style={{ color: rel.color }}>{rel.icon}</small>}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeSite && (
                <motion.article
                  key={activeSite.id}
                  className={`phone-site-paper site-${activeSite.styleType}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                >
                  <header className="phone-site-header">
                    <div>
                      <span className="site-logo"><EvidenceVisual kind="website" data={activeSite} /></span>
                      <h1>{activeSite.siteName}</h1>
                      <p>{activeSite.siteTagline}</p>
                    </div>
                    <button
                      type="button"
                      className="reliability-stamp"
                      onClick={() => revealReliability(activeSite.id)}
                      disabled={revealedReliability[activeSite.id]}
                      style={revealedReliability[activeSite.id] ? { color: RELIABILITY_LABELS[activeSite.reliability].color } : undefined}
                    >
                      {revealedReliability[activeSite.id]
                        ? RELIABILITY_LABELS[activeSite.reliability].label
                        : 'Check Source'}
                    </button>
                  </header>

                  <div className="phone-article-list">
                    {activeSite.articles.map(article => {
                      const bookmarked = isBookmarked(activeSite.id, article.id);
                      return (
                        <section key={article.id} className={`phone-article${bookmarked ? ' bookmarked' : ''}`}>
                          {article.isKey && <span className="paper-kicker">Key evidence</span>}
                          <h2>{article.title}</h2>
                          <p className="article-meta">{article.date} / By {article.author}</p>
                          <p>{article.body}</p>
                          {article.note && (
                            <div className="desk-alert-note compact">
                              <strong>Analyst note</strong>
                              <p>{article.note}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            className={`receipt-button${bookmarked ? ' active' : ''}`}
                            onClick={() => bookmarkArticle(activeSite, article)}
                          >
                            {bookmarked ? 'Receipt Pinned' : 'Pin Receipt'}
                          </button>
                        </section>
                      );
                    })}
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </PhoneFrame>

          <aside className="receipt-desk-stack" aria-label="Evidence file">
            <PaperCard className="claim-pocket">
              <span className="paper-kicker">Evidence file</span>
              <h2>Receipts</h2>
              {bookmarks.length === 0 ? (
                <p>The tray is empty. Time to start digging.</p>
              ) : (
                <div className="receipt-list">
                  {bookmarks.map((bookmark, index) => (
                    <PaperCard
                      key={bookmark.id}
                      className="receipt-slip"
                      style={{ '--rot': `${index % 2 === 0 ? -1.5 : 1.5}deg` }}
                    >
                      <span><EvidenceVisual kind="website" data={{ siteName: bookmark.siteName }} compact /> {bookmark.siteName}</span>
                      <strong>{bookmark.title}</strong>
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
              updateBadgeTypeUnlocks({ 'web-investigation': 1 + Object.values(progress.completedCases).filter(c => c.gameType === 'web-investigation').length });
              setPhase('result');
            }}
              disabled={!canVerdict}
              disabledReason={`Pin ${Math.max(0, 3 - bookmarks.length)} more receipt${3 - bookmarks.length === 1 ? '' : 's'} to unlock.`}
              submitLabel="File Report"
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
          mediaPreview={activeSite?.name}
          canRetry={canRetry}
          onTryAgain={resetGame}
          onContinue={() => navigate('/rewards')}
        />
      )}
    </>
  );
}
