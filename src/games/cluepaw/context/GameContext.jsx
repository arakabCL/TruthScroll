import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CASES } from '../data/cases';
import { syncProgress } from '../services/progressApi';

const STORAGE_KEY = 'clupaw_progress_v2';
const LEGACY_STORAGE_KEY = 'clupaw_progress_v1';

const RANKS = [
  { level: 1, name: 'Cadet', threshold: 0 },
  { level: 2, name: 'Junior Detective', threshold: 200 },
  { level: 3, name: 'Detective', threshold: 500 },
  { level: 4, name: 'Senior Detective', threshold: 1000 },
  { level: 5, name: 'Master Rumor Ranger', threshold: 2000 },
];

const DEFAULT_BADGES = [
  {
    id: 'first-case',
    type: 'bronze',
    title: 'Rookie Detective',
    condition: 'Complete your first case.',
  },
  {
    id: 'correct-streak-3',
    type: 'silver',
    title: 'Sharp Eye',
    condition: 'Get 3 correct verdicts in a row.',
  },
  {
    id: 'daily-streak-3',
    type: 'silver',
    title: 'Daily Detective',
    condition: 'Investigate 3 days in a row.',
  },
  {
    id: 'all-web',
    type: 'gold',
    title: 'Digital Tracker',
    condition: 'Complete every Web Investigation case.',
  },
  {
    id: 'all-social',
    type: 'gold',
    title: 'Feed Forensics',
    condition: 'Complete every Social Scroll case.',
  },
  {
    id: 'all-witness',
    type: 'gold',
    title: 'Witness Whisperer',
    condition: 'Complete every Witness Stories case.',
  },
  {
    id: 'all-board',
    type: 'gold',
    title: 'Evidence Master',
    condition: 'Complete every Detective Board case.',
  },
  {
    id: 'perfect-case',
    type: 'platinum',
    title: 'Top Sleuth',
    condition: 'Complete a case with a correct verdict on the first try.',
  },
  {
    id: 'half-cases',
    type: 'silver',
    title: 'Seasoned Investigator',
    condition: 'Complete half of the archive.',
  },
  {
    id: 'all-cases',
    type: 'platinum',
    title: 'Master Rumor Ranger',
    condition: 'Complete every case in the archive.',
  },
  {
    id: 'xp-500',
    type: 'gold',
    title: 'Crystal Clear',
    condition: 'Earn 500 XP.',
  },
  {
    id: 'xp-1000',
    type: 'platinum',
    title: 'Legendary Agent',
    condition: 'Earn 1000 XP.',
  },
];

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateKeyFromIso(iso) {
  if (!iso) return null;
  return getTodayKey(new Date(iso));
}

function daysBetween(fromKey, toKey) {
  if (!fromKey || !toKey) return null;
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to - from) / 86400000);
}

function getRank(xp) {
  const currentIndex = RANKS.reduce((bestIndex, rank, index) => (xp >= rank.threshold ? index : bestIndex), 0);
  const current = RANKS[currentIndex];
  const next = RANKS[currentIndex + 1] || null;
  const progressPercent = next
    ? Math.min(100, Math.round(((xp - current.threshold) / (next.threshold - current.threshold)) * 100))
    : 100;

  return {
    ...current,
    next: next?.name || null,
    nextThreshold: next?.threshold || null,
    progressPercent,
    xpToNext: next ? Math.max(0, next.threshold - xp) : 0,
  };
}

function defaultBadges() {
  return DEFAULT_BADGES.map(badge => ({
    ...badge,
    unlocked: false,
    unlockedAt: null,
  }));
}

function createEmptyProgress() {
  return {
    schemaVersion: 2,
    xp: 0,
    coins: 0,
    streak: 0,
    lastPlayedDate: null,
    dailyActivity: {},
    claimedDailyMissions: {},
    completedCases: {},
    caseHistory: [],
    typesPlayed: {},
    perfectCases: 0,
    badges: defaultBadges(),
    settings: {
      sound: true,
      hints: true,
      hasSeenOnboarding: false,
      enableHintGuardrails: true,
      allowOpenTextReplies: false,
      weeklyGuardianSummary: true,
      caseDifficulty: 'easy',
    },
  };
}

function getCaseById(caseId) {
  return CASES.find(item => item.id === Number(caseId));
}

function getUniqueTypeCounts(completedCases) {
  return Object.entries(completedCases || {}).reduce((counts, [caseId, entry]) => {
    const caseData = getCaseById(caseId);
    const gameType = entry.gameType || caseData?.gameType;
    if (!gameType) return counts;
    counts[gameType] = (counts[gameType] || 0) + 1;
    return counts;
  }, {});
}

function getTotalByType(gameType) {
  return CASES.filter(item => item.gameType === gameType).length;
}

function getCorrectStreak(history = []) {
  let streak = 0;
  for (const entry of history) {
    if (entry.verdict !== 'correct') break;
    streak += 1;
  }
  return streak;
}

function evaluateBadges(progress) {
  const completedCount = Object.keys(progress.completedCases || {}).length;
  const typeCounts = getUniqueTypeCounts(progress.completedCases);
  const correctStreak = getCorrectStreak(progress.caseHistory);
  const perfectCases = Object.values(progress.completedCases || {}).filter(entry => entry.firstTryCorrect).length;
  const existingById = new Map((progress.badges || []).map(badge => [badge.id, badge]));

  return DEFAULT_BADGES.map(template => {
    const existing = existingById.get(template.id) || {};
    let unlocked = Boolean(existing.unlocked);

    if (!unlocked) {
      switch (template.id) {
        case 'first-case':
          unlocked = completedCount >= 1;
          break;
        case 'correct-streak-3':
          unlocked = correctStreak >= 3;
          break;
        case 'daily-streak-3':
          unlocked = progress.streak >= 3;
          break;
        case 'all-web':
          unlocked = typeCounts['web-investigation'] >= getTotalByType('web-investigation');
          break;
        case 'all-social':
          unlocked = typeCounts['social-scroll'] >= getTotalByType('social-scroll');
          break;
        case 'all-witness':
          unlocked = typeCounts['witness-stories'] >= getTotalByType('witness-stories');
          break;
        case 'all-board':
          unlocked = typeCounts['detective-board'] >= getTotalByType('detective-board');
          break;
        case 'perfect-case':
          unlocked = perfectCases >= 1;
          break;
        case 'half-cases':
          unlocked = completedCount >= Math.ceil(CASES.length / 2);
          break;
        case 'all-cases':
          unlocked = completedCount >= CASES.length;
          break;
        case 'xp-500':
          unlocked = progress.xp >= 500;
          break;
        case 'xp-1000':
          unlocked = progress.xp >= 1000;
          break;
        default:
          break;
      }
    }

    return {
      ...template,
      unlocked,
      unlockedAt: unlocked ? existing.unlockedAt || new Date().toISOString() : null,
    };
  });
}

function normalizeProgress(saved) {
  const base = createEmptyProgress();
  if (!saved || typeof saved !== 'object') return base;

  const completedCases = Object.entries(saved.completedCases || {}).reduce((cases, [caseId, entry]) => {
    const caseData = getCaseById(caseId);
    cases[caseId] = {
      completedAt: entry.completedAt || entry.date || new Date().toISOString(),
      gameType: entry.gameType || caseData?.gameType || 'detective-board',
      verdict: entry.verdict || 'incorrect',
      attempts: entry.attempts || 1,
      firstTryCorrect: Boolean(entry.firstTryCorrect),
    };
    return cases;
  }, {});

  const progress = {
    ...base,
    ...saved,
    schemaVersion: 2,
    coins: saved.coins || 0,
    dailyActivity: saved.dailyActivity || {},
    claimedDailyMissions: saved.claimedDailyMissions || {},
    completedCases,
    caseHistory: Array.isArray(saved.caseHistory) ? saved.caseHistory : [],
    settings: {
      ...base.settings,
      ...(saved.settings || {}),
    },
  };

  progress.typesPlayed = getUniqueTypeCounts(progress.completedCases);
  progress.perfectCases = Object.values(progress.completedCases).filter(entry => entry.firstTryCorrect).length;
  progress.badges = evaluateBadges(progress);
  return progress;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return normalizeProgress(JSON.parse(raw));
  } catch {
    // Ignore corrupted local progress and start fresh.
  }
  return createEmptyProgress();
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures so the game can still run.
  }
}

function buildDailyMissions(progress, todayKey) {
  const activity = progress.dailyActivity?.[todayKey] || {};
  const claimed = progress.claimedDailyMissions?.[todayKey] || {};

  return [
    {
      id: 'daily-open',
      title: 'Clock in at HQ',
      detail: 'Open one investigation today.',
      current: activity.opened ? 1 : 0,
      target: 1,
      rewardXp: 10,
      rewardCoins: 2,
    },
    {
      id: 'daily-close',
      title: 'Close a case file',
      detail: 'Finish one case today, correct or not.',
      current: Math.min(1, activity.completed || 0),
      target: 1,
      rewardXp: 25,
      rewardCoins: 5,
    },
    {
      id: 'daily-accurate',
      title: 'Make a clean call',
      detail: 'Submit one correct verdict today.',
      current: Math.min(1, activity.correct || 0),
      target: 1,
      rewardXp: 40,
      rewardCoins: 8,
    },
  ].map(mission => ({
    ...mission,
    complete: mission.current >= mission.target,
    claimed: Boolean(claimed[mission.id]),
  }));
}

function withEvaluatedProgress(progress) {
  const next = {
    ...progress,
    typesPlayed: getUniqueTypeCounts(progress.completedCases),
  };
  next.perfectCases = Object.values(next.completedCases).filter(entry => entry.firstTryCorrect).length;
  next.badges = evaluateBadges(next);
  return next;
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [syncState, setSyncState] = useState({
    status: 'idle',
    lastSyncedAt: null,
    summary: null,
    guardianReport: null,
  });

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) saveProgress(progress);
  }, [progress, initialized]);

  useEffect(() => {
    if (!initialized) return undefined;

    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    const timeoutId = window.setTimeout(() => {
      syncProgress(progress)
        .then(result => {
          setSyncState({
            status: 'online',
            lastSyncedAt: result.serverTime || new Date().toISOString(),
            summary: result.summary || null,
            guardianReport: result.guardianReport || null,
          });
        })
        .catch(() => {
          setSyncState(prev => ({
            ...prev,
            status: 'offline',
          }));
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [progress, initialized]);

  const todayKey = useMemo(() => getTodayKey(), []);

  const recordPlay = useCallback(() => {
    setProgress(prev => {
      const previousKey = dateKeyFromIso(prev.lastPlayedDate);
      const dayGap = daysBetween(previousKey, todayKey);
      const streak = dayGap === 0 ? prev.streak : (dayGap === 1 ? prev.streak + 1 : 1);
      const dailyActivity = {
        ...prev.dailyActivity,
        [todayKey]: {
          ...(prev.dailyActivity?.[todayKey] || {}),
          opened: true,
        },
      };

      return withEvaluatedProgress({
        ...prev,
        streak,
        lastPlayedDate: new Date().toISOString(),
        dailyActivity,
      });
    });
  }, [todayKey]);

  const completeCase = useCallback((caseId, gameType, isCorrect, wasFirstTry, retryLocked) => {
    setProgress(prev => {
      const caseKey = String(caseId);
      const existing = prev.completedCases[caseKey];
      const isFirstCompletion = !existing;
      const baseXp = isFirstCompletion ? 100 : 25;
      const correctBonus = isCorrect ? 50 : 0;
      const firstTryBonus = wasFirstTry && isCorrect && isFirstCompletion ? 50 : 0;
      const earnedXp = isCorrect ? baseXp + correctBonus + firstTryBonus : 0;
      const earnedCoins = isCorrect ? 12 : 0;

      const completedCases = {
        ...prev.completedCases,
        [caseKey]: {
          completedAt: new Date().toISOString(),
          gameType,
          verdict: isCorrect ? 'correct' : 'incorrect',
          attempts: (existing?.attempts || 0) + 1,
          firstTryCorrect: Boolean(existing?.firstTryCorrect || (wasFirstTry && isCorrect && isFirstCompletion)),
        },
      };

      const caseData = getCaseById(caseId);
      const historyEntry = {
        caseId,
        gameType,
        title: caseData?.title || `Case ${caseId}`,
        verdict: isCorrect ? 'correct' : 'incorrect',
        xp: earnedXp,
        coins: earnedCoins,
        date: new Date().toISOString(),
        note: isCorrect
          ? 'Verdict sealed with corroborated evidence.'
          : retryLocked
            ? 'Case closed. Another detective will follow up.'
            : 'Verdict filed. Evidence review recommended.',
      };

      const todayActivity = prev.dailyActivity?.[todayKey] || {};
      const dailyActivity = {
        ...prev.dailyActivity,
        [todayKey]: {
          ...todayActivity,
          opened: true,
          completed: (todayActivity.completed || 0) + 1,
          correct: (todayActivity.correct || 0) + (isCorrect ? 1 : 0),
        },
      };

      return withEvaluatedProgress({
        ...prev,
        xp: prev.xp + earnedXp,
        coins: prev.coins + earnedCoins,
        completedCases,
        caseHistory: [historyEntry, ...prev.caseHistory].slice(0, 40),
        dailyActivity,
      });
    });
  }, [todayKey]);

  const claimDailyMission = useCallback((missionId) => {
    setProgress(prev => {
      const mission = buildDailyMissions(prev, todayKey).find(item => item.id === missionId);
      if (!mission || !mission.complete || mission.claimed) return prev;

      return withEvaluatedProgress({
        ...prev,
        xp: prev.xp + mission.rewardXp,
        coins: prev.coins + mission.rewardCoins,
        claimedDailyMissions: {
          ...prev.claimedDailyMissions,
          [todayKey]: {
            ...(prev.claimedDailyMissions?.[todayKey] || {}),
            [missionId]: true,
          },
        },
        caseHistory: [
          {
            caseId: `mission-${missionId}`,
            gameType: 'daily-mission',
            title: mission.title,
            verdict: 'correct',
            xp: mission.rewardXp,
            coins: mission.rewardCoins,
            date: new Date().toISOString(),
            note: 'Daily mission reward claimed.',
          },
          ...prev.caseHistory,
        ].slice(0, 40),
      });
    });
  }, [todayKey]);

  const updateBadgeTypeUnlocks = useCallback(() => {
    setProgress(prev => withEvaluatedProgress(prev));
  }, []);

  const updateSettings = useCallback((updates) => {
    setProgress(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const empty = createEmptyProgress();
    setProgress(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('clupaw-onboarding-seen');
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const rank = useMemo(() => getRank(progress.xp), [progress.xp]);

  const isUnlocked = useCallback((caseData) => {
    if (!caseData) return false;
    if (caseData.status === 'unlocked') return true;
    const completedCount = Object.keys(progress.completedCases || {}).length;
    if (caseData.id === 4) return completedCount >= 1;
    if (caseData.id === 5) return completedCount >= 2;
    if (caseData.id === 6) return completedCount >= 3;
    return false;
  }, [progress.completedCases]);

  const getNextCase = useCallback(() => (
    CASES.find(caseData => isUnlocked(caseData) && !progress.completedCases[caseData.id]) || CASES[0]
  ), [isUnlocked, progress.completedCases]);

  const dailyMissions = useMemo(() => buildDailyMissions(progress, todayKey), [progress, todayKey]);

  const value = useMemo(() => ({
    progress,
    rank,
    todayKey,
    dailyMissions,
    syncState,
    totalCases: CASES.length,
    recordPlay,
    completeCase,
    claimDailyMission,
    updateBadgeTypeUnlocks,
    updateSettings,
    resetProgress,
    isUnlocked,
    getNextCase,
  }), [
    progress,
    rank,
    todayKey,
    dailyMissions,
    syncState,
    recordPlay,
    completeCase,
    claimDailyMission,
    updateBadgeTypeUnlocks,
    updateSettings,
    resetProgress,
    isUnlocked,
    getNextCase,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
