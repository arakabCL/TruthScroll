import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from './context/GameContext';
import { CASES } from './data/cases';
import AppIcon from './components/AppIcon';
import MascotPose from './components/MascotPose';
import MusicToggle from './components/MusicToggle';

const PANEL_META = {
  'My Progress': { heading: "Tibbee's Progress Check", label: 'Progress', variant: 'blue' },
  'Case Log': { heading: 'Cases You Played', label: 'Cases', variant: 'violet' },
  'Safety': { heading: 'Safe Play Settings', label: 'Safe', variant: 'green' },
};

const Briefing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress, rank, dailyMissions, updateSettings, totalCases, syncState, resetProgress } = useGame();
  const initialPanel = new URLSearchParams(location.search).get('panel');
  const [activePanel, setActivePanel] = useState(PANEL_META[initialPanel] ? initialPanel : 'My Progress');
  const safetySettings = progress.settings || {};
  const caseDifficulty = safetySettings.caseDifficulty || 'easy';

  const completedIds = Object.keys(progress.completedCases || {});
  const caseHistory = useMemo(
    () => completedIds
      .map(id => {
        const c = CASES.find(x => x.id === parseInt(id, 10));
        const r = progress.completedCases[id];
        return c ? {
          id,
          title: c.title,
          verdict: r.verdict === 'correct'
            ? 'Solved'
            : (r.verdict === 'incorrect' ? (caseDifficulty === 'hard' ? 'Closed' : 'Try again') : r.verdict),
          note: `Played ${new Date(r.completedAt).toLocaleDateString()}.`,
        } : null;
      })
      .filter(Boolean)
      .slice(-6)
      .reverse(),
    [completedIds, progress.completedCases, caseDifficulty],
  );

  const solvedCount = completedIds.filter(id => progress.completedCases[id].verdict === 'correct').length;
  const totalCompleted = completedIds.length;
  const sourceTraceScore = totalCompleted > 0 ? Math.round((solvedCount / totalCompleted) * 100) : 0;
  const contextScore = totalCompleted > 0 ? Math.max(20, Math.round((solvedCount / totalCompleted) * 95)) : 0;
  const missionScore = Math.round((dailyMissions.filter(mission => mission.complete).length / dailyMissions.length) * 100);

  const toggleSetting = (key) => {
    updateSettings({ [key]: !safetySettings[key] });
  };

  const toggleDifficulty = () => {
    updateSettings({ caseDifficulty: caseDifficulty === 'hard' ? 'easy' : 'hard' });
  };

  const activePanelMeta = PANEL_META[activePanel];

  return (
    <div className="briefing-room">
      <div className="parchment-layout">
        <aside className="briefing-sidebar">
          <h2>My Detective Desk</h2>
          <div className="briefing-nav">
            {Object.entries(PANEL_META).map(([panel, meta]) => (
              <button
                key={panel}
                className={activePanel === panel ? 'active' : ''}
                onClick={() => setActivePanel(panel)}
                type="button"
              >
                <AppIcon name={panel === 'Case Log' ? 'archive' : panel === 'Safety' ? 'shield' : 'trend'} size={16} />
                {panel}
              </button>
            ))}
          </div>
          <button className="briefing-btn-leave" onClick={() => navigate('/')} type="button">
            <AppIcon name="back" size={16} />
            Back to Desk
          </button>
        </aside>

        <main className="briefing-dashboard">
          <h3 className="briefing-report-title">
            <AppIcon name={activePanel === 'Case Log' ? 'archive' : activePanel === 'Safety' ? 'shield' : 'trend'} size={18} />
            {activePanelMeta.heading}
          </h3>

          {activePanel === 'My Progress' && (
            <>
              <div className="summary-card">
                {totalCompleted > 0 ? (
                  <>
                    You played <strong>{totalCompleted} case{totalCompleted === 1 ? '' : 's'}</strong> and solved <strong>{solvedCount}</strong>.
                    {' '}Your rank is <strong>{rank.name}</strong>.
                  </>
                ) : (
                  <>
                    Play your first case, then Tibbee will show your progress here.
                  </>
                )}
              </div>

              <div className="briefing-habits">
                <h4 className="briefing-habits-title">Detective Skills</h4>

                <div className="habit-module">
                  <div className="habit-header">
                    <span>Checking sources</span>
                    <span className="habit-score olive">{sourceTraceScore}%</span>
                  </div>
                  <div className="habit-track-bg">
                    <div className="habit-track-fill olive-fill" style={{ width: `${sourceTraceScore}%` }}></div>
                  </div>
                </div>

                <div className="habit-module">
                  <div className="habit-header">
                    <span>Finding context</span>
                    <span className="habit-score orange">{contextScore}%</span>
                  </div>
                  <div className="habit-track-bg">
                    <div className="habit-track-fill orange-fill" style={{ width: `${contextScore}%` }}></div>
                  </div>
                </div>

                <div className="habit-module">
                  <div className="habit-header">
                    <span>Daily practice</span>
                    <span className="habit-score olive">{missionScore}%</span>
                  </div>
                  <div className="habit-track-bg">
                    <div className="habit-track-fill olive-fill" style={{ width: `${missionScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="summary-card briefing-next-card">
                <strong>Next best move:</strong>{' '}
                {totalCompleted < totalCases
                  ? 'Play one open case, then collect your reward.'
                  : 'Replay a favorite case or collect badges.'}
              </div>

              <div className="briefing-sync-card">
                <div>
                  <span>Cloud Save</span>
                  <strong>{syncState.status === 'online' ? 'Saved' : syncState.status === 'syncing' ? 'Saving' : 'Safe here'}</strong>
                </div>
                <p>
                  {syncState.guardianReport?.summary?.focus || 'Your progress is kept safe on this device.'}
                </p>
              </div>
            </>
          )}

          {activePanel === 'Case Log' && (
            <section>
              <p className="panel-section-title">Recently played</p>
              {caseHistory.length === 0 ? (
                <p className="panel-empty">No cases yet. Pick one mystery from the case map.</p>
              ) : (
                <div className="case-history-list">
                  {caseHistory.map((entry) => (
                    <article key={entry.id} className="history-row">
                      <div className="history-row-top">
                        <h4>{entry.title}</h4>
                        <span className={`verdict-pill verdict-${entry.verdict.toLowerCase().replace(/\s+/g, '-')}`}>
                          {entry.verdict}
                        </span>
                      </div>
                      <p>{entry.note}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activePanel === 'Safety' && (
            <section>
              <p className="panel-section-title">Grown-up controls</p>
              {syncState.guardianReport && (
                <div className="guardian-report-card">
                  <h4>Grown-up Summary</h4>
                  <p>{syncState.guardianReport.summary.focus}</p>
                  <strong>Next ideas</strong>
                  <ul>
                    {syncState.guardianReport.nextSteps.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="settings-list">
                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Reset to Beginning</h4>
                    <p>Erase all data and restart the onboarding.</p>
                  </div>
                  <button
                    className="settings-reset-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
                        resetProgress();
                        window.location.href = '/';
                      }
                    }}
                    type="button"
                  >
                    Reset
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Detective Music</h4>
                    <p>Keep Tibbee&apos;s calm case music on while you play.</p>
                  </div>
                  <MusicToggle className="settings-music-toggle" />
                </div>

                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Case Retry Difficulty</h4>
                    <p>
                      Easy lets you retry a wrong verdict. Hard closes the case after one verdict.
                      <strong>{` Current: ${caseDifficulty === 'hard' ? 'Hard' : 'Easy'}.`}</strong>
                    </p>
                  </div>
                  <button
                    className={`setting-switch ${caseDifficulty === 'hard' ? 'on' : 'off'}`}
                    role="switch"
                    aria-checked={caseDifficulty === 'hard'}
                    onClick={toggleDifficulty}
                    type="button"
                  >
                    <span className="setting-thumb"></span>
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Hint Guardrails</h4>
                    <p>Keep Tibbee&apos;s hints clear and safe.</p>
                  </div>
                  <button
                    className={`setting-switch ${safetySettings.enableHintGuardrails ? 'on' : 'off'}`}
                    role="switch"
                    aria-checked={safetySettings.enableHintGuardrails}
                    onClick={() => toggleSetting('enableHintGuardrails')}
                    type="button"
                  >
                    <span className="setting-thumb"></span>
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Open Text Replies</h4>
                    <p>Allow longer answers in harder cases.</p>
                  </div>
                  <button
                    className={`setting-switch ${safetySettings.allowOpenTextReplies ? 'on' : 'off'}`}
                    role="switch"
                    aria-checked={safetySettings.allowOpenTextReplies}
                    onClick={() => toggleSetting('allowOpenTextReplies')}
                    type="button"
                  >
                    <span className="setting-thumb"></span>
                  </button>
                </div>

                <div className="setting-row">
                  <div className="setting-copy">
                    <h4>Weekly Summary Email</h4>
                    <p>Send a short weekly learning note.</p>
                  </div>
                  <button
                    className={`setting-switch ${safetySettings.weeklyGuardianSummary ? 'on' : 'off'}`}
                    role="switch"
                    aria-checked={safetySettings.weeklyGuardianSummary}
                    onClick={() => toggleSetting('weeklyGuardianSummary')}
                    type="button"
                  >
                    <span className="setting-thumb"></span>
                  </button>
                </div>
              </div>
            </section>
          )}

          <p className="briefing-privacy-note">
            Safety note: clupaw uses a pretend internet made for practice. No real web browsing is needed.
          </p>
        </main>
      </div>
      <div className="briefing-mascot" aria-hidden="true">
        <MascotPose
          pose={activePanel === 'Safety' ? 'thinking' : activePanel === 'Case Log' ? 'pointing' : 'investigate'}
          className="briefing-mascot-img"
        />
      </div>
    </div>
  );
};

export default Briefing;
