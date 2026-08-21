import { useMemo, useRef, useState } from 'react'
import { Crown, Medal, Search, Target } from 'lucide-react'
import { minutesToHoursLabel } from '../../lib/formatters'

const RANK_STYLES = {
  1: { border: 'border-neon-gold/50', glow: 'shadow-neon-gold', badge: 'bg-neon-gold text-base-950' },
  2: { border: 'border-neon-silver/40', glow: 'shadow-[0_0_18px_rgba(199,208,221,0.35)]', badge: 'bg-neon-silver text-base-950' },
  3: { border: 'border-neon-bronze/40', glow: 'shadow-[0_0_18px_rgba(224,153,94,0.35)]', badge: 'bg-neon-bronze text-base-950' },
}

export default function LeaderboardTable({ entries, metricKey }) {
  const [search, setSearch] = useState('')
  const rowRefs = useRef({})

  const ranked = useMemo(
    () => [...entries].sort((a, b) => (b[metricKey] || 0) - (a[metricKey] || 0)).map((e, i) => ({ ...e, rank: i + 1 })),
    [entries, metricKey]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return ranked
    return ranked.filter((e) => e.username.toLowerCase().includes(search.trim().toLowerCase()))
  }, [ranked, search])

  const me = ranked.find((e) => e.isCurrentUser)

  const scrollToMe = () => {
    setSearch('')
    requestAnimationFrame(() => {
      rowRefs.current[me?.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-white/10">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full rounded-xl bg-base-700 border border-white/10 pl-9 pr-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
        <button
          onClick={scrollToMe}
          className="flex items-center justify-center gap-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan px-4 py-2 text-sm font-medium hover:bg-neon-cyan/20 transition-colors shrink-0"
        >
          <Target size={15} /> Find My Rank
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium text-center">Streak</th>
              <th className="px-4 py-3 font-medium text-center">Hours</th>
              <th className="px-4 py-3 font-medium text-right">XP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const style = RANK_STYLES[entry.rank]
              return (
                <tr
                  key={entry.id}
                  ref={(el) => (rowRefs.current[entry.id] = el)}
                  className={`border-t border-white/5 transition-colors ${
                    entry.isCurrentUser ? 'bg-neon-cyan/5' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {entry.rank <= 3 ? (
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${style.badge}`}
                        >
                          {entry.rank === 1 ? <Crown size={13} /> : <Medal size={13} />}
                        </span>
                      ) : (
                        <span className="w-6 text-center text-white/50 font-medium">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-700 text-base border ${
                          entry.rank <= 3 ? style.border : 'border-white/10'
                        }`}
                      >
                        {entry.avatar}
                      </span>
                      <span className={`truncate font-medium ${entry.isCurrentUser ? 'text-neon-cyan' : ''}`}>
                        {entry.username}
                        {entry.isCurrentUser && <span className="ml-1.5 text-[10px] text-white/40">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-white/70">🔥 {entry.streakCount}</td>
                  <td className="px-4 py-3 text-center text-white/70">{minutesToHoursLabel(entry.totalMinutes)}</td>
                  <td className="px-4 py-3 text-right font-display font-semibold text-neon-cyan">
                    {entry.xp.toLocaleString()}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  No players match "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
