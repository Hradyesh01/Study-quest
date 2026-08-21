import { daysBetweenISO, todayISO } from './formatters'

export const MIN_MINUTES_FOR_STREAK = 25

/**
 * Pure streak-update function. A day only "counts" once at least
 * MIN_MINUTES_FOR_STREAK minutes have been logged on it (possibly across
 * multiple sessions), which mirrors the "burning fire icon" rule in the
 * spec. Returns a new streak snapshot to merge into the user object.
 */
export function applyStudyMinutesToStreak(user, minutesJustStudied, sessionDateISO = todayISO()) {
  const prevDaily = user.dailyMinutesTowardStreak || { dateISO: null, minutes: 0 }
  const isSameDayAsTracker = prevDaily.dateISO === sessionDateISO
  const minutesToday = (isSameDayAsTracker ? prevDaily.minutes : 0) + minutesJustStudied

  const alreadyCountedToday = user.lastStudyDateISO === sessionDateISO
  const crossedThresholdJustNow = minutesToday >= MIN_MINUTES_FOR_STREAK

  let streakCount = user.streakCount || 0
  let longestStreak = user.longestStreak || 0
  let lastStudyDateISO = user.lastStudyDateISO

  if (crossedThresholdJustNow && !alreadyCountedToday) {
    const gap = lastStudyDateISO ? daysBetweenISO(lastStudyDateISO, sessionDateISO) : null
    if (gap === 1 || gap === null) {
      streakCount = streakCount + 1
    } else if (gap === 0) {
      // same day, shouldn't happen given alreadyCountedToday check, but stay safe
      streakCount = Math.max(streakCount, 1)
    } else {
      // missed one or more days -> streak resets and restarts today
      streakCount = 1
    }
    lastStudyDateISO = sessionDateISO
    longestStreak = Math.max(longestStreak, streakCount)
  }

  return {
    streakCount,
    longestStreak,
    lastStudyDateISO,
    dailyMinutesTowardStreak: { dateISO: sessionDateISO, minutes: minutesToday },
  }
}
