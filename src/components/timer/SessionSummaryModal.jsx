import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Zap, X } from 'lucide-react'
import Confetti from '../common/Confetti'
import { getSubjectById } from '../../data/subjects'

export default function SessionSummaryModal({ result, onClose }) {
  const [confettiActive, setConfettiActive] = useState(false)

  useEffect(() => {
    if (result) {
      setConfettiActive(true)
      const timer = setTimeout(() => setConfettiActive(false), 2800)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [result])

  if (!result) return null

  const { session, xp, newlyUnlockedBadges, streakCount } = result
  const subject = getSubjectById(session.subjectId)

  return (
    <>
      <Confetti active={confettiActive} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-base-900 p-6 shadow-neon-purple">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
              <Zap size={26} className="text-base-950" fill="currentColor" />
            </div>
            <h2 className="font-display text-xl font-bold">Session complete!</h2>
            <p className="text-sm text-white/50 mt-1">
              {session.durationMinutes} min of {subject.name} · {streakCount}-day streak
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-base-800 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">XP earned</span>
              <span className="font-display text-2xl font-bold text-neon-cyan">+{xp.totalXP}</span>
            </div>
            <div className="space-y-1.5 text-xs text-white/50">
              <div className="flex justify-between">
                <span>Base ({session.durationMinutes} min)</span>
                <span>{xp.baseXP} XP</span>
              </div>
              {xp.breakdown.map((b) => (
                <div key={b.label} className="flex justify-between text-neon-green">
                  <span>{b.label}</span>
                  <span>+{Math.round(b.bonus * 100)}%</span>
                </div>
              ))}
              <div className="flex justify-between pt-1.5 border-t border-white/10 text-white/70 font-medium">
                <span>Multiplier</span>
                <span>×{xp.multiplier}</span>
              </div>
            </div>
          </div>

          {newlyUnlockedBadges.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-white/70 mb-2">New badge{newlyUnlockedBadges.length > 1 ? 's' : ''} unlocked!</p>
              <div className="flex flex-wrap gap-2">
                {newlyUnlockedBadges.map((badge) => {
                  const Icon = Icons[badge.icon] || Icons.Award
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-2 rounded-xl border border-white/10 bg-base-800 px-3 py-2 ${badge.glow}`}
                    >
                      <Icon size={16} className="text-neon-gold" />
                      <span className="text-xs font-medium">{badge.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-display font-semibold text-base-950 hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
