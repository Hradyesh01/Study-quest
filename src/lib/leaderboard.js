import { storage } from './storage'

const NAME_POOL = [
  'PixelNinja', 'QuantumFox', 'ByteWitch', 'NovaStudy', 'CosmicOtter',
  'ZenCoder', 'BrainStorm', 'BlazeRunner', 'EchoScholar', 'LunarSage',
  'CipherCat', 'AtomicPanda', 'VelvetHawk', 'DriftKnight', 'PulseRabbit',
  'FrostByte', 'EmberWolf', 'GlitchOwl', 'NeonSloth', 'CryptoLynx',
]
const AVATAR_POOL = ['🦊', '🐼', '🦉', '🐺', '🐧', '🦁', '🐯', '🦝', '🐨', '🐸', '🦄', '🐲']

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

/**
 * Generates (once) a stable list of mock competitors so the leaderboard has
 * something to show before other real users exist. Persisted to
 * localStorage so it doesn't reshuffle on every reload.
 */
export function getOrCreateLeaderboardSeed() {
  const existing = storage.getLeaderboardSeed()
  if (existing) return existing

  const rand = seededRandom(42)
  const seeded = NAME_POOL.map((name, i) => {
    const totalMinutes = Math.round(200 + rand() * 5800)
    const streakCount = Math.round(rand() * 28)
    const xp = Math.round(totalMinutes * (1.8 + rand() * 0.6))
    return {
      id: `seed-${i}`,
      username: name,
      avatar: AVATAR_POOL[i % AVATAR_POOL.length],
      totalMinutes,
      streakCount,
      xp,
      isCurrentUser: false,
    }
  })

  storage.saveLeaderboardSeed(seeded)
  return seeded
}

export function buildLeaderboard(user, { weeklyMinutes } = {}) {
  const seeded = getOrCreateLeaderboardSeed()
  const me = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    totalMinutes: user.totalMinutes,
    streakCount: user.streakCount,
    xp: user.xp,
    weeklyMinutes: weeklyMinutes ?? user.totalMinutes,
    isCurrentUser: true,
  }

  const combined = [
    ...seeded.map((s) => ({ ...s, weeklyMinutes: Math.round(s.totalMinutes * 0.22) })),
    me,
  ]

  return combined
}
