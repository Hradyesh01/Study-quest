import { BADGES } from '../data/badges'
import { useStudy } from '../context/StudyContext'
import BadgeCard from '../components/badges/BadgeCard'

const CATEGORY_LABELS = {
  time: 'Time-based',
  streak: 'Streak-based',
  milestone: 'Milestone-based',
}

export default function Badges() {
  const { user } = useStudy()
  const categories = ['milestone', 'time', 'streak']

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Badges & Achievements</h2>
        <p className="text-white/50 text-sm mt-1">
          {user.unlockedBadgeIds.length} of {BADGES.length} unlocked. Hover a badge to see how to earn it.
        </p>
      </div>

      {categories.map((category) => {
        const items = BADGES.filter((b) => b.category === category)
        return (
          <section key={category}>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={user.unlockedBadgeIds.includes(badge.id)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
