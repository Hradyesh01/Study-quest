// --------------------------------------------------------------------------
// Core game-design logic: XP multiplier math + badge-unlock checking.
// This file is pure (no localStorage, no DOM) so it is easy to unit test
// and easy to port unchanged to a backend (e.g. a Firebase Cloud Function)
// later if session XP ever needs to be authoritative server-side.
// --------------------------------------------------------------------------

export const XP_CONFIG = {
  BASE_XP_PER_MINUTE: 2,
  STREAK_BONUS_PER_DAY: 0.05, // +5% multiplier per streak day
  STREAK_BONUS_CAP: 0.5, // capped at +50% (10-day streak)
  COMPLETION_BONUS: 0.15, // +15% for finishing a full Pomodoro work phase uninterrupted
  MARATHON_THRESHOLD_MINUTES: 120, // 2h+ single session
  MARATHON_BONUS: 0.1,
  NIGHT_OWL_HOUR: 23, // sessions starting at/after 11 PM
  EARLY_BIRD_HOUR: 6, // sessions starting before 6 AM
  NIGHT_BONUS: 0.1,
}

/**
 * Calculates the XP awarded for a finished study session.
 *
 * @param {Object} params
 * @param {number} params.durationMinutes - length of the session in minutes
 * @param {number} params.streakCount - the user's CURRENT streak count (before this session)
 * @param {boolean} params.wasFullyCompleted - true if a Pomodoro work phase ran to completion
 *   without being skipped/reset (stopwatch sessions pass `true` when the user taps "Finish")
 * @param {number} params.startHour - local hour (0-23) the session started at
 * @returns {{ baseXP: number, multiplier: number, totalXP: number, breakdown: Array<{label: string, bonus: number}> }}
 */
export function calculateSessionXP({ durationMinutes, streakCount, wasFullyCompleted, startHour }) {
  const breakdown = []
  let multiplier = 1

  const streakBonus = Math.min(streakCount * XP_CONFIG.STREAK_BONUS_PER_DAY, XP_CONFIG.STREAK_BONUS_CAP)
  if (streakBonus > 0) {
    multiplier += streakBonus
    breakdown.push({ label: `${streakCount}-day streak`, bonus: streakBonus })
  }

  if (wasFullyCompleted) {
    multiplier += XP_CONFIG.COMPLETION_BONUS
    breakdown.push({ label: 'Full session completed', bonus: XP_CONFIG.COMPLETION_BONUS })
  }

  if (durationMinutes >= XP_CONFIG.MARATHON_THRESHOLD_MINUTES) {
    multiplier += XP_CONFIG.MARATHON_BONUS
    breakdown.push({ label: 'Marathon session (2h+)', bonus: XP_CONFIG.MARATHON_BONUS })
  }

  if (startHour >= XP_CONFIG.NIGHT_OWL_HOUR || startHour < XP_CONFIG.EARLY_BIRD_HOUR) {
    multiplier += XP_CONFIG.NIGHT_BONUS
    breakdown.push({ label: 'Off-hours focus bonus', bonus: XP_CONFIG.NIGHT_BONUS })
  }

  const baseXP = Math.round(durationMinutes * XP_CONFIG.BASE_XP_PER_MINUTE)
  const totalXP = Math.round(baseXP * multiplier)

  return { baseXP, multiplier: Number(multiplier.toFixed(2)), totalXP, breakdown }
}

/**
 * Level curve: level N requires `100 * N^1.35` XP (rounded) on top of the
 * previous level's requirement. Returns the user's level plus progress
 * toward the next one, all derived from lifetime XP (never stored directly).
 */
export function getLevelProgress(totalXP) {
  let level = 1
  let remaining = totalXP
  let requiredForNext = 100

  while (remaining >= requiredForNext) {
    remaining -= requiredForNext
    level += 1
    requiredForNext = Math.round(100 * Math.pow(level, 1.35))
  }

  return {
    level,
    currentLevelXP: remaining,
    xpForNextLevel: requiredForNext,
    progressPct: Math.min(100, Math.round((remaining / requiredForNext) * 100)),
  }
}

function evaluateCriteria(criteria, { user, session }) {
  switch (criteria.type) {
    case 'firstSession':
      return user.totalSessions >= 1
    case 'sessionAfterHour':
      return session.startHour >= criteria.hour
    case 'sessionBeforeHour':
      return session.startHour < criteria.hour
    case 'sessionDurationMinutes':
      return session.durationMinutes >= criteria.minutes
    case 'streakCount':
      return user.streakCount >= criteria.days
    case 'totalHours':
      return user.totalMinutes / 60 >= criteria.hours
    default:
      return false
  }
}

/**
 * Runs every badge definition against the user's freshly-updated stats and
 * the session that just finished. `user` must already reflect the new XP,
 * streak, totalMinutes, totalSessions etc. — call this AFTER applying the
 * session, not before. Returns only the badges newly earned this call.
 *
 * @param {Object} params
 * @param {Object} params.user - the user object, already updated for this session
 * @param {Object} params.session - { startHour, durationMinutes, ... }
 * @param {Array} params.badgeDefs - the BADGES catalog from src/data/badges.js
 * @returns {Array} newly unlocked badge definitions
 */
export function checkNewBadges({ user, session, badgeDefs }) {
  const alreadyUnlocked = new Set(user.unlockedBadgeIds)
  const newlyUnlocked = []

  for (const badge of badgeDefs) {
    if (alreadyUnlocked.has(badge.id)) continue
    if (evaluateCriteria(badge.criteria, { user, session })) {
      newlyUnlocked.push(badge)
    }
  }

  return newlyUnlocked
}
