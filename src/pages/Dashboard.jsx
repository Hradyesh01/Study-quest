import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Clock, Flame, Layers, Trophy, Zap } from 'lucide-react'
import { useStudy } from '../context/StudyContext'
import StreakFlame from '../components/common/StreakFlame'
import XPBar from '../components/common/XPBar'
import BossQuestCard from '../components/quests/BossQuestCard'
import { minutesToHoursLabel } from '../lib/formatters'
import { BADGES } from '../data/badges'

function StatTile({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-display font-bold leading-tight">{value}</p>
        <p className="text-xs text-white/45">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, todaysSessions, boss, dailyQuests, unlockedBadges } = useStudy()
  const todaysMinutes = todaysSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const recentBadges = [...unlockedBadges].slice(-4).reverse()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Welcome back, {user.username.split(' ')[0]} {user.avatar}
          </h2>
          <p className="text-white/50 text-sm mt-1">Let's keep that streak alive today.</p>
        </div>
        <Link
          to="/study-room"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple px-5 py-2.5 font-display font-semibold text-base-950 hover:opacity-90 transition-opacity shrink-0"
        >
          <Zap size={16} fill="currentColor" /> Start a session
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Clock} label="Minutes today" value={todaysMinutes} colorClass="text-neon-cyan" />
        <StatTile icon={Layers} label="Total hours" value={minutesToHoursLabel(user.totalMinutes)} colorClass="text-neon-purple" />
        <StatTile icon={Flame} label="Sessions logged" value={user.totalSessions} colorClass="text-neon-pink" />
        <StatTile
          icon={Trophy}
          label="Badges earned"
          value={`${unlockedBadges.length}/${BADGES.length}`}
          colorClass="text-neon-gold"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-base-800 p-5">
            <p className="text-sm font-medium text-white/60 mb-4">Your progress</p>
            <XPBar />
            <div className="mt-6 flex items-center justify-between">
              <StreakFlame count={user.streakCount} />
              <div className="text-right">
                <p className="text-xs text-white/40">Longest streak</p>
                <p className="font-display font-bold text-lg">{user.longestStreak} days</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-base-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/60">Recent badges</p>
              <Link to="/badges" className="text-xs text-neon-cyan hover:underline">
                View all
              </Link>
            </div>
            {recentBadges.length === 0 ? (
              <p className="text-xs text-white/35">Complete a session to earn your first badge.</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {recentBadges.map((badge) => {
                  const Icon = Icons[badge.icon] || Icons.Award
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-base-700 px-2.5 py-1.5 text-xs ${badge.glow}`}
                    >
                      <Icon size={13} className="text-neon-gold" />
                      {badge.name}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <BossQuestCard boss={boss} quests={dailyQuests} />
        </div>
      </div>
    </div>
  )
}
