import { useMemo, useState } from 'react'
import { useStudy } from '../context/StudyContext'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable'
import { buildLeaderboard } from '../lib/leaderboard'

export default function Leaderboard() {
  const { user, weeklyMinutes } = useStudy()
  const [tab, setTab] = useState('global')

  const entries = useMemo(() => buildLeaderboard(user, { weeklyMinutes }), [user, weeklyMinutes])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Leaderboard</h2>
          <p className="text-white/50 text-sm mt-1">See how you stack up against other students.</p>
        </div>
        <div className="inline-flex rounded-xl bg-base-800 border border-white/10 p-1 self-start">
          {['global', 'weekly'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <LeaderboardTable entries={entries} metricKey={tab === 'global' ? 'xp' : 'weeklyMinutes'} />
    </div>
  )
}
