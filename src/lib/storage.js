// --------------------------------------------------------------------------
// Persistence adapter. Every read/write in the app goes through this file,
// which is deliberately the ONLY place that touches `localStorage`.
//
// Swapping to Firebase/Supabase later means reimplementing this same
// function surface (getUser/saveUser/getSessions/addSession/...) so it
// resolves a Promise instead of a plain value, and updating the two
// `await` call sites in `src/context/StudyContext.jsx`. Nothing else in
// the app needs to change.
// --------------------------------------------------------------------------

const KEYS = {
  USER: 'sq_user_v1',
  SESSIONS: 'sq_sessions_v1',
  LEADERBOARD_SEED: 'sq_leaderboard_seed_v1',
  AI_SETTINGS: 'sq_ai_settings_v1',
}

function safeParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.warn('StudyQuest: failed to parse stored value, resetting.', err)
    return fallback
  }
}

export function createDefaultUser() {
  return {
    id: 'local-player',
    username: 'Player One',
    avatar: '🦊',
    createdAt: new Date().toISOString(),
    xp: 0,
    streakCount: 0,
    longestStreak: 0,
    lastStudyDateISO: null,
    dailyMinutesTowardStreak: { dateISO: null, minutes: 0 },
    totalMinutes: 0,
    totalSessions: 0,
    unlockedBadgeIds: [],
    subjectMinutes: {},
  }
}

export const storage = {
  getUser() {
    return safeParse(localStorage.getItem(KEYS.USER), createDefaultUser())
  },

  saveUser(user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
    return user
  },

  getSessions() {
    return safeParse(localStorage.getItem(KEYS.SESSIONS), [])
  },

  addSession(session) {
    const sessions = storage.getSessions()
    sessions.push(session)
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions))
    return sessions
  },

  getLeaderboardSeed() {
    return safeParse(localStorage.getItem(KEYS.LEADERBOARD_SEED), null)
  },

  saveLeaderboardSeed(list) {
    localStorage.setItem(KEYS.LEADERBOARD_SEED, JSON.stringify(list))
    return list
  },

  resetAll() {
    localStorage.removeItem(KEYS.USER)
    localStorage.removeItem(KEYS.SESSIONS)
    localStorage.removeItem(KEYS.LEADERBOARD_SEED)
  },

  // API keys for the optional Claude / Gemini integration (see
  // src/pages/AIAssistant.jsx). Stored client-side only — this app has no
  // backend, so these never leave the browser except in direct calls to
  // Anthropic/Google from the user's own machine.
  getAISettings() {
    return safeParse(localStorage.getItem(KEYS.AI_SETTINGS), {
      claude: { apiKey: '', model: 'claude-sonnet-5' },
      gemini: { apiKey: '', model: 'gemini-3.6-flash' },
      activeProvider: 'claude',
    })
  },

  saveAISettings(settings) {
    localStorage.setItem(KEYS.AI_SETTINGS, JSON.stringify(settings))
    return settings
  },
}
