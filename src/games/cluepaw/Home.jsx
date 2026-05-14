import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CASES, GAME_TYPE_INFO } from './data/cases';
import { useGame } from './context/GameContext';
import AppIcon from './components/AppIcon';
import LogoIcon from './components/LogoIcon';

const Home = () => {
  const navigate = useNavigate();
  const {
    progress,
    rank,
    isUnlocked,
    recordPlay,
    dailyMissions,
    claimDailyMission,
    syncState,
    totalCases,
  } = useGame();

  const currentCase = CASES.find(c => isUnlocked(c) && !progress.completedCases[c.id]) || CASES[0];
  const gameInfo = GAME_TYPE_INFO[currentCase.gameType];
  const completedCount = Object.keys(progress.completedCases || {}).length;
  const unlockedBadges = (progress.badges || []).filter(badge => badge.unlocked).length;
  const completedMissions = dailyMissions.filter(mission => mission.complete).length;

  const openCurrentCase = () => {
    recordPlay();
    navigate(`/investigate/${currentCase.id}`);
  };

  const handleFolderKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCurrentCase();
    }
  };

  return (
    <motion.div
      className="desk-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top bar — floating pills */}
      <div className="desk-status-bar">
        <div className="status-group">
          <LogoIcon size={28} />
          <span>clupaw HQ</span>
        </div>
        <div className="status-divider" />
        <div className="status-group">
          <AppIcon name="rank" />
          <span>{rank.name}</span>
        </div>
        <div className="status-divider" />
        <div className="status-group">
          <AppIcon name="xp" />
          <span>{progress.xp} XP</span>
        </div>
        <div className="status-divider" />
        <div className="status-group">
          <AppIcon name="cloud" />
          <span>{syncState.status === 'online' ? 'Saved' : syncState.status === 'syncing' ? 'Saving' : 'Safe here'}</span>
        </div>
        <div className="status-divider" />
        <div className="status-group">
          <AppIcon name="flame" />
          <span className={progress.streak > 0 ? 'streak-active' : ''}>
            {progress.streak > 0 ? `${progress.streak} day streak` : 'Ready to play'}
          </span>
        </div>
      </div>

      <motion.button
        className="home-settings-btn"
        onClick={() => navigate('/briefing?panel=Safety')}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        aria-label="Open settings"
      >
        <AppIcon name="settings" size={17} />
        <span>Settings</span>
      </motion.button>

      {/* Left side — case folder */}
      <div className="desk-left-zone">
        <motion.div
          className="desk-folder"
          whileHover={{ y: -6, rotate: -2 }}
          onClick={openCurrentCase}
          role="button"
          tabIndex={0}
          onKeyDown={handleFolderKeyDown}
          aria-label={`Open current case: ${currentCase.title}`}
        >
          <div className="folder-tab">
            <AppIcon name="folder" size={16} />
            Start Here
          </div>
          <div className="folder-stamp">NEW CASE</div>
          <div className="folder-game-badge">
            <span className="folder-badge-icon"><AppIcon name={gameInfo.icon} size={16} /></span>
            <span>{gameInfo.label}</span>
          </div>
          <h1>{currentCase.title}</h1>
          <p>{currentCase.summary}</p>
          <div className="folder-progress-strip">
            <span>{completedCount}/{totalCases} cases</span>
            <span>{unlockedBadges} badges</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="open-case-cta" aria-hidden="true">
              Play Case
            </span>
          </div>
        </motion.div>

        <motion.button
          className="desk-side-btn archive-btn"
          onClick={(e) => { e.stopPropagation(); navigate('/cases'); }}
          whileHover={{ scale: 1.04, x: 4 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          style={{ marginTop: '1.5rem' }}
        >
          <AppIcon name="archive" />
          Pick a Case
        </motion.button>
      </div>

      {/* Center Mascot */}
      <motion.div
        className="home-center-mascot"
        aria-hidden="true"
      />

      {/* Right side — briefing + rewards */}
      <div className="desk-right-zone">
        <div className="home-daily-card" aria-label="Daily missions">
          <div className="home-daily-header">
            <span>Today&apos;s Mini Goals</span>
            <strong>{completedMissions}/{dailyMissions.length}</strong>
          </div>
          <div className="home-mission-list">
            {dailyMissions.map(mission => (
              <div key={mission.id} className={`home-mission-row${mission.complete ? ' complete' : ''}`}>
                <div>
                  <strong>{mission.title}</strong>
                  <span>{mission.detail}</span>
                </div>
                {mission.claimed ? (
                  <span className="mission-claimed">Done</span>
                ) : mission.complete ? (
                  <button type="button" onClick={() => claimDailyMission(mission.id)}>
                    Claim +{mission.rewardXp}
                  </button>
                ) : (
                  <span className="mission-count">{mission.current}/{mission.target}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          className="desk-side-btn"
          onClick={() => navigate('/briefing')}
          whileHover={{ scale: 1.04, x: -4 }}
          whileTap={{ scale: 0.97 }}
          type="button"
        >
          <AppIcon name="briefing" />
          My Progress
        </motion.button>

        <motion.button
          className="desk-side-btn"
          onClick={() => navigate('/rewards')}
          whileHover={{ scale: 1.04, x: -4 }}
          whileTap={{ scale: 0.97 }}
          type="button"
        >
          <AppIcon name="trophy" />
          Rewards
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Home;
