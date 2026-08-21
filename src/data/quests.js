import { SUBJECTS } from './subjects'

// The weekly Study Boss. Damage is derived (not stored) from the sum of
// study minutes logged during the current ISO week, so it can never drift
// out of sync with the session log.
export const WEEKLY_BOSS = {
  id: 'exam-dragon',
  name: 'The Exam Dragon',
  icon: 'Skull',
  maxHP: 6000,
  damagePerMinute: 8,
}

// A larger pool of possible daily quests. `getDailyQuests(dateISO)` below
// deterministically samples 3 of these per calendar day so every visitor
// sees the same quest board on a given day without needing a backend.
export const QUEST_POOL = [
  { id: 'q-math-120', subjectId: 'math', label: 'Deal damage with Math', targetMinutes: 120, damage: 500, rewardXP: 60 },
  { id: 'q-coding-90', subjectId: 'coding', label: 'Ship focus time in Coding', targetMinutes: 90, damage: 400, rewardXP: 45 },
  { id: 'q-physics-60', subjectId: 'physics', label: 'Crack Physics problems', targetMinutes: 60, damage: 300, rewardXP: 35 },
  { id: 'q-chem-45', subjectId: 'chemistry', label: 'Mix up a Chemistry session', targetMinutes: 45, damage: 250, rewardXP: 30 },
  { id: 'q-lit-30', subjectId: 'literature', label: 'Read up on Literature', targetMinutes: 30, damage: 200, rewardXP: 25 },
  { id: 'q-lang-30', subjectId: 'languages', label: 'Practice a Language', targetMinutes: 30, damage: 200, rewardXP: 25 },
  { id: 'q-any-25', subjectId: 'any', label: 'Complete any focused session', targetMinutes: 25, damage: 150, rewardXP: 20 },
  { id: 'q-any-180', subjectId: 'any', label: 'Grind out 3 hours today', targetMinutes: 180, damage: 700, rewardXP: 90 },
]

// Simple deterministic string hash -> used to seed which 3 quests show today.
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getDailyQuests(dateISO) {
  const seed = hashString(dateISO)
  const pool = [...QUEST_POOL]
  const picked = []
  let cursor = seed
  const count = Math.min(3, pool.length)
  for (let i = 0; i < count; i++) {
    cursor = (cursor * 9301 + 49297) % 233280
    const index = cursor % pool.length
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

export function getSubjectLabel(subjectId) {
  if (subjectId === 'any') return 'Any subject'
  return SUBJECTS.find((s) => s.id === subjectId)?.name || subjectId
}
