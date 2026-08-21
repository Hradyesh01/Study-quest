// Declarative badge catalog. Each badge's `criteria` is evaluated by
// `checkNewBadges()` in `src/lib/xpEngine.js` whenever a session finishes.
//
// criteria.type values:
//   'firstSession'          -> user.totalSessions >= 1
//   'sessionAfterHour'      -> the session started at/after criteria.hour (local time)
//   'sessionBeforeHour'     -> the session started before criteria.hour (local time)
//   'sessionDurationMinutes'-> a single session lasted >= criteria.minutes
//   'streakCount'           -> user.streakCount >= criteria.days
//   'totalHours'            -> user.totalMinutes / 60 >= criteria.hours
export const BADGES = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your very first study session.',
    category: 'milestone',
    icon: 'Footprints',
    glow: 'shadow-neon-green',
    ring: 'ring-neon-green',
    criteria: { type: 'firstSession' },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Study after 11 PM.',
    category: 'time',
    icon: 'Moon',
    glow: 'shadow-neon-purple',
    ring: 'ring-neon-purple',
    criteria: { type: 'sessionAfterHour', hour: 23 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Study before 6 AM.',
    category: 'time',
    icon: 'Sunrise',
    glow: 'shadow-neon-gold',
    ring: 'ring-neon-gold',
    criteria: { type: 'sessionBeforeHour', hour: 6 },
  },
  {
    id: 'marathoner',
    name: 'Marathoner',
    description: 'Complete a single session of 4+ hours.',
    category: 'time',
    icon: 'Timer',
    glow: 'shadow-neon-pink',
    ring: 'ring-neon-pink',
    criteria: { type: 'sessionDurationMinutes', minutes: 240 },
  },
  {
    id: 'streak-3',
    name: '3-Day Fire',
    description: 'Keep a 3-day study streak alive.',
    category: 'streak',
    icon: 'Flame',
    glow: 'shadow-neon-cyan',
    ring: 'ring-neon-cyan',
    criteria: { type: 'streakCount', days: 3 },
  },
  {
    id: 'streak-7',
    name: '7-Day Unstoppable',
    description: 'Keep a 7-day study streak alive.',
    category: 'streak',
    icon: 'Flame',
    glow: 'shadow-neon-cyan',
    ring: 'ring-neon-cyan',
    criteria: { type: 'streakCount', days: 7 },
  },
  {
    id: 'streak-30',
    name: '30-Day Legend',
    description: 'Keep a 30-day study streak alive.',
    category: 'streak',
    icon: 'Flame',
    glow: 'shadow-neon-gold',
    ring: 'ring-neon-gold',
    criteria: { type: 'streakCount', days: 30 },
  },
  {
    id: 'hours-10',
    name: '10 Hours Logged',
    description: 'Log 10 total hours of focused study.',
    category: 'milestone',
    icon: 'Award',
    glow: 'shadow-neon-green',
    ring: 'ring-neon-green',
    criteria: { type: 'totalHours', hours: 10 },
  },
  {
    id: 'hours-50',
    name: '50 Hours Logged',
    description: 'Log 50 total hours of focused study.',
    category: 'milestone',
    icon: 'Medal',
    glow: 'shadow-neon-purple',
    ring: 'ring-neon-purple',
    criteria: { type: 'totalHours', hours: 50 },
  },
  {
    id: 'hours-100',
    name: '100 Hours Logged',
    description: 'Log 100 total hours of focused study.',
    category: 'milestone',
    icon: 'Trophy',
    glow: 'shadow-neon-gold',
    ring: 'ring-neon-gold',
    criteria: { type: 'totalHours', hours: 100 },
  },
]

export function getBadgeById(id) {
  return BADGES.find((b) => b.id === id)
}
