import { useState } from 'react'
import * as Icons from 'lucide-react'
import { AlertTriangle, Check, Pencil, Sparkles } from 'lucide-react'
import { useStudy } from '../context/StudyContext'
import { SUBJECTS } from '../data/subjects'
import { BADGES } from '../data/badges'
import { minutesToHoursLabel, todayISO } from '../lib/formatters'
import ProgressBar from '../components/common/ProgressBar'

const AVATAR_CHOICES = ['🦊', '🐼', '🦉', '🐺', '🐧', '🦁', '🐯', '🦝', '🐨', '🐸', '🦄', '🐲']

export default function Profile() {
  const { user, updateProfile, resetProgress, levelProgress, unlockedBadges } = useStudy()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [avatar, setAvatar] = useState(user.avatar)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSave = () => {
    updateProfile({ username: username.trim() || user.username, avatar })
    setIsEditing(false)
  }

  // Demo/dev helper: instantly maxes out XP, streak and every badge so you
  // can show off the UI without grinding real sessions. Safe to remove
  // before a real deployment.
  const handleMaxOutForDemo = () => {
    const fakeSubjectMinutes = SUBJECTS.reduce((acc, s) => {
      acc[s.id] = 600 + Math.round(Math.random() * 4000)
      return acc
    }, {})
    const totalMinutes = Object.values(fakeSubjectMinutes).reduce((a, b) => a + b, 0)

    updateProfile({
      xp: 25000,
      streakCount: 45,
      longestStreak: 45,
      lastStudyDateISO: todayISO(),
      dailyMinutesTowardStreak: { dateISO: todayISO(), minutes: 240 },
      totalMinutes,
      totalSessions: 120,
      unlockedBadgeIds: BADGES.map((b) => b.id),
      subjectMinutes: fakeSubjectMinutes,
    })
  }

  const subjectBreakdown = SUBJECTS.map((s) => ({
    ...s,
    minutes: user.subjectMinutes[s.id] || 0,
  }))
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)

  const maxSubjectMinutes = Math.max(1, ...subjectBreakdown.map((s) => s.minutes))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-base-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm text-neon-cyan hover:underline"
            >
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-sm rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan px-3 py-1.5 hover:bg-neon-cyan/20 transition-colors"
            >
              <Check size={14} /> Save
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-base-700 border border-white/10 flex items-center justify-center text-3xl">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                className="w-full rounded-lg bg-base-700 border border-white/10 px-3 py-2 text-lg font-display font-semibold focus:outline-none focus:border-neon-cyan/50"
              />
            ) : (
              <p className="text-lg font-display font-semibold">{user.username}</p>
            )}
            <p className="text-xs text-white/40 mt-1">
              Level {levelProgress.level} · {user.xp.toLocaleString()} total XP
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 flex flex-wrap gap-2">
            {AVATAR_CHOICES.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatar(emoji)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                  avatar === emoji ? 'border-neon-cyan/60 bg-neon-cyan/10' : 'border-white/10 bg-base-700 hover:bg-base-600'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-base-800 p-4 text-center">
          <p className="font-display text-xl font-bold">{minutesToHoursLabel(user.totalMinutes)}</p>
          <p className="text-xs text-white/45 mt-1">Total studied</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-base-800 p-4 text-center">
          <p className="font-display text-xl font-bold">{user.totalSessions}</p>
          <p className="text-xs text-white/45 mt-1">Sessions</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-base-800 p-4 text-center">
          <p className="font-display text-xl font-bold">{unlockedBadges.length}</p>
          <p className="text-xs text-white/45 mt-1">Badges</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-base-800 p-5 sm:p-6">
        <p className="text-sm font-medium text-white/60 mb-4">Time by subject</p>
        {subjectBreakdown.length === 0 ? (
          <p className="text-xs text-white/35">No sessions logged yet — head to the Study Room to get started.</p>
        ) : (
          <div className="space-y-3">
            {subjectBreakdown.map((s) => {
              const Icon = Icons[s.icon] || Icons.Sparkles
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white/70">
                      <Icon size={13} style={{ color: s.color }} /> {s.name}
                    </span>
                    <span className="text-white/40">{minutesToHoursLabel(s.minutes)}</span>
                  </div>
                  <ProgressBar
                    value={s.minutes}
                    max={maxSubjectMinutes}
                    heightClass="h-1.5"
                    colorClass="bg-gradient-to-r from-neon-cyan to-neon-purple"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neon-purple/20 bg-neon-purple/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-neon-purple mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neon-purple">Demo mode</p>
            <p className="text-xs text-white/40 mt-1">
              Instantly sets a high XP total, a 45-day streak, and unlocks every badge — handy for showing off the UI
              (to judges, or yourself) without grinding real sessions.
            </p>
            <button
              onClick={handleMaxOutForDemo}
              className="mt-3 rounded-lg border border-neon-purple/40 bg-neon-purple/10 text-neon-purple text-sm px-3 py-1.5 hover:bg-neon-purple/20 transition-colors"
            >
              Max out for demo
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Reset all progress</p>
            <p className="text-xs text-white/40 mt-1">
              Clears your XP, streak, sessions and badges from this browser. This can't be undone.
            </p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="mt-3 rounded-lg border border-red-500/30 text-red-300 text-sm px-3 py-1.5 hover:bg-red-500/10 transition-colors"
              >
                Reset progress
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={resetProgress}
                  className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm px-3 py-1.5 hover:bg-red-500/30 transition-colors"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg border border-white/10 text-white/60 text-sm px-3 py-1.5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
