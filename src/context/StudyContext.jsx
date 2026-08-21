import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { storage, createDefaultUser } from '../lib/storage'
import { calculateSessionXP, checkNewBadges, getLevelProgress } from '../lib/xpEngine'
import { applyStudyMinutesToStreak } from '../lib/streak'
import { BADGES } from '../data/badges'
import { getDailyQuests, WEEKLY_BOSS } from '../data/quests'
import { todayISO, isoWeekId } from '../lib/formatters'
import { useTimer } from '../hooks/useTimer'

const StudyContext = createContext(null)

export function StudyProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser())
  const [sessions, setSessions] = useState(() => storage.getSessions())
  const [lastSessionResult, setLastSessionResult] = useState(null) // drives SessionSummaryModal + confetti

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser)
    storage.saveUser(nextUser)
  }, [])

  /**
   * Called once a session (Pomodoro work phase or a manually-finished
   * stopwatch run) is complete. This is the single entry point that ties
   * together the XP multiplier math and the badge-checking algorithm.
   */
  const completeSession = useCallback(
    ({ subjectId, durationMinutes, wasFullyCompleted, startedAt }) => {
      const startDate = startedAt ? new Date(startedAt) : new Date()
      const startHour = startDate.getHours()
      const sessionDateISO = todayISO(startDate)

      const { totalXP, multiplier, baseXP, breakdown } = calculateSessionXP({
        durationMinutes,
        streakCount: user.streakCount,
        wasFullyCompleted,
        startHour,
      })

      const streakUpdate = applyStudyMinutesToStreak(user, durationMinutes, sessionDateISO)

      const updatedUser = {
        ...user,
        xp: user.xp + totalXP,
        totalMinutes: user.totalMinutes + durationMinutes,
        totalSessions: user.totalSessions + 1,
        subjectMinutes: {
          ...user.subjectMinutes,
          [subjectId]: (user.subjectMinutes[subjectId] || 0) + durationMinutes,
        },
        ...streakUpdate,
      }

      const sessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        subjectId,
        durationMinutes,
        wasFullyCompleted,
        startHour,
        dateISO: sessionDateISO,
        startedAt: startDate.toISOString(),
        xpEarned: totalXP,
      }

      const newlyUnlockedBadges = checkNewBadges({
        user: updatedUser,
        session: sessionRecord,
        badgeDefs: BADGES,
      })

      if (newlyUnlockedBadges.length > 0) {
        updatedUser.unlockedBadgeIds = [
          ...updatedUser.unlockedBadgeIds,
          ...newlyUnlockedBadges.map((b) => b.id),
        ]
      }

      persistUser(updatedUser)
      const updatedSessions = storage.addSession(sessionRecord)
      setSessions(updatedSessions)

      const result = {
        session: sessionRecord,
        xp: { totalXP, multiplier, baseXP, breakdown },
        newlyUnlockedBadges,
        streakCount: updatedUser.streakCount,
      }
      setLastSessionResult(result)
      return result
    },
    [user, persistUser]
  )

  const dismissSessionResult = useCallback(() => setLastSessionResult(null), [])

  // ------------------------------------------------------------------------
  // Focus Timer — lives here (not inside the Study Room page component) so
  // it keeps ticking no matter which tab you're on. StudyProvider wraps the
  // whole app once in main.jsx and never unmounts, so a running session
  // survives navigating to Badges, the AI Assistant, anywhere.
  // ------------------------------------------------------------------------
  const [timerSubjectId, setTimerSubjectId] = useState(null)
  const [timerMode, setTimerModeState] = useState('pomodoro') // 'pomodoro' | 'stopwatch'
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)

  const handleWorkPhaseComplete = useCallback(
    ({ durationMinutes, wasFullyCompleted }) => {
      if (!timerSubjectId) return
      completeSession({ subjectId: timerSubjectId, durationMinutes, wasFullyCompleted, startedAt: new Date() })
    },
    [timerSubjectId, completeSession]
  )

  const timer = useTimer({
    mode: timerMode,
    workMinutes,
    breakMinutes,
    onWorkPhaseComplete: handleWorkPhaseComplete,
  })

  const setTimerMode = useCallback(
    (mode) => {
      timer.reset()
      setTimerModeState(mode)
    },
    [timer]
  )

  const finishStopwatchSession = useCallback(() => {
    const { durationMinutes, wasFullyCompleted, startedAt } = timer.finishStopwatch()
    if (timerSubjectId && durationMinutes > 0) {
      completeSession({ subjectId: timerSubjectId, durationMinutes, wasFullyCompleted, startedAt: startedAt || new Date() })
    }
  }, [timer, timerSubjectId, completeSession])

  const updateProfile = useCallback(
    (patch) => {
      persistUser({ ...user, ...patch })
    },
    [user, persistUser]
  )

  const resetProgress = useCallback(() => {
    storage.resetAll()
    const fresh = createDefaultUser()
    setUser(fresh)
    setSessions([])
    setLastSessionResult(null)
  }, [])

  const levelProgress = useMemo(() => getLevelProgress(user.xp), [user.xp])

  const todaysSessions = useMemo(() => {
    const iso = todayISO()
    return sessions.filter((s) => s.dateISO === iso)
  }, [sessions])

  const weekId = isoWeekId()
  const weeklySessions = useMemo(() => {
    return sessions.filter((s) => isoWeekId(new Date(s.startedAt)) === weekId)
  }, [sessions, weekId])

  const weeklyMinutes = useMemo(
    () => weeklySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    [weeklySessions]
  )

  const bossDamage = useMemo(
    () => Math.min(WEEKLY_BOSS.maxHP, Math.round(weeklyMinutes * WEEKLY_BOSS.damagePerMinute)),
    [weeklyMinutes]
  )

  const dailyQuests = useMemo(() => {
    const iso = todayISO()
    const quests = getDailyQuests(iso)
    return quests.map((q) => {
      const minutesLogged = todaysSessions
        .filter((s) => q.subjectId === 'any' || s.subjectId === q.subjectId)
        .reduce((sum, s) => sum + s.durationMinutes, 0)
      return {
        ...q,
        minutesLogged,
        isComplete: minutesLogged >= q.targetMinutes,
        progressPct: Math.min(100, Math.round((minutesLogged / q.targetMinutes) * 100)),
      }
    })
  }, [todaysSessions])

  const unlockedBadges = useMemo(
    () => BADGES.filter((b) => user.unlockedBadgeIds.includes(b.id)),
    [user.unlockedBadgeIds]
  )

  const value = {
    user,
    sessions,
    todaysSessions,
    weeklySessions,
    weeklyMinutes,
    levelProgress,
    boss: { ...WEEKLY_BOSS, currentDamage: bossDamage, hpRemaining: Math.max(0, WEEKLY_BOSS.maxHP - bossDamage) },
    dailyQuests,
    unlockedBadges,
    lastSessionResult,
    completeSession,
    dismissSessionResult,
    updateProfile,
    resetProgress,
    // Global focus timer — see the block above for why this lives here.
    timer,
    timerSubjectId,
    setTimerSubjectId,
    timerMode,
    setTimerMode,
    workMinutes,
    setWorkMinutes,
    breakMinutes,
    setBreakMinutes,
    finishStopwatchSession,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within a StudyProvider')
  return ctx
}
