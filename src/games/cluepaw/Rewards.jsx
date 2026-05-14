import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from './context/GameContext';
import MascotPose from './components/MascotPose';
import AppIcon from './components/AppIcon';

const TYPE_LABELS = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

const Rewards = () => {
  const navigate = useNavigate();
  const { rank, progress, dailyMissions, claimDailyMission, totalCases } = useGame();

  const badges = progress.badges || [];
  const firstUnlockedBadge = badges.find(badge => badge.unlocked) || badges[0];
  const [selectedBadgeId, setSelectedBadgeId] = useState(firstUnlockedBadge?.id);
  const selectedBadge = badges.find(badge => badge.id === selectedBadgeId) || firstUnlockedBadge;
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const completedCount = Object.keys(progress.completedCases || {}).length;
  const missionClaimsReady = dailyMissions.filter(mission => mission.complete && !mission.claimed);
  const nextBadge = badges.find(badge => !badge.unlocked);

  const recentWins = useMemo(
    () => (progress.caseHistory || []).slice(0, 5),
    [progress.caseHistory],
  );

  return (
    <motion.div
      className="trophy-room rewards-hub"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="rewards-shell">
        <header className="rewards-hero">
          <button type="button" className="archive-back-btn" onClick={() => navigate('/')}>
            <AppIcon name="back" size={16} />
            Desk
          </button>
          <div>
            <span className="rewards-kicker">Your Rewards</span>
            <h1>{rank.name}</h1>
            <p>{progress.xp} XP · {progress.coins || 0} coins · {progress.streak || 0} day streak</p>
          </div>
          <MascotPose pose="reward" className="rewards-hero-mascot" />
        </header>

        <section className="rewards-rank-panel">
          <div className="rank-copy">
            <span>Level {rank.level}</span>
            <strong>{rank.next ? `${rank.xpToNext} XP until ${rank.next}` : 'Top rank reached'}</strong>
          </div>
          <div className="clearance-track">
            <motion.div
              className="clearance-fill xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${rank.progressPercent}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <div className="rank-stats">
            <span>{completedCount}/{totalCases} cases</span>
            <span>{unlockedCount}/{badges.length} badges</span>
            <span>{missionClaimsReady.length} ready</span>
          </div>
        </section>

        {missionClaimsReady.length > 0 && (
          <section className="reward-claim-panel" aria-label="Ready mission rewards">
            <span>Tap to claim</span>
            <div>
              {missionClaimsReady.map(mission => (
                <button key={mission.id} type="button" onClick={() => claimDailyMission(mission.id)}>
                  {mission.title} +{mission.rewardXp} XP
                </button>
              ))}
            </div>
          </section>
        )}

        {nextBadge && (
          <section className="next-reward-panel" aria-label="Next badge">
            <span>Next badge</span>
            <strong>{nextBadge.title}</strong>
            <p>{nextBadge.condition}</p>
          </section>
        )}

        <main className="rewards-grid-layout">
          <section className="badge-vault" aria-label="Badge vault">
            {badges.map((badge, index) => (
              <motion.button
                key={badge.id}
                type="button"
                className={`badge-vault-item ${badge.type}${badge.unlocked ? ' unlocked' : ' locked'}${selectedBadge?.id === badge.id ? ' selected' : ''}`}
                onClick={() => setSelectedBadgeId(badge.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                aria-pressed={selectedBadge?.id === badge.id}
              >
                <AppIcon name={badge.unlocked ? 'badge' : 'lock'} size={34} />
                <span>{badge.title}</span>
              </motion.button>
            ))}
          </section>

          <aside className="badge-detail-panel">
            {selectedBadge && (
              <>
                <span className={`badge-tier ${selectedBadge.type}`}>{TYPE_LABELS[selectedBadge.type] || selectedBadge.type}</span>
                <h2>{selectedBadge.title}</h2>
                <p>{selectedBadge.condition}</p>
                <div className={`badge-status-line${selectedBadge.unlocked ? ' unlocked' : ''}`}>
                  {selectedBadge.unlocked
                    ? `Won ${selectedBadge.unlockedAt ? new Date(selectedBadge.unlockedAt).toLocaleDateString() : 'today'}`
                    : 'Locked'}
                </div>
              </>
            )}

            <div className="recent-wins">
              <h3>Recent wins</h3>
              {recentWins.length === 0 ? (
                <p>No wins yet. Start a case from the desk.</p>
              ) : (
                recentWins.map(entry => (
                  <article key={`${entry.caseId}-${entry.date}`}>
                    <strong>{entry.title}</strong>
                    <span>{entry.note} {entry.xp ? `+${entry.xp} XP` : ''}</span>
                  </article>
                ))
              )}
            </div>
          </aside>
        </main>

        <div className="rewards-actions">
          <button type="button" onClick={() => navigate('/cases')}>Pick a Case</button>
          <button type="button" onClick={() => navigate('/briefing')}>My Progress</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Rewards;
