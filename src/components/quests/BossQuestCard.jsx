import * as Icons from 'lucide-react'
import { CheckCircle2, Circle } from 'lucide-react'
import ProgressBar from '../common/ProgressBar'
import { getSubjectLabel } from '../../data/quests'

export default function BossQuestCard({ boss, quests }) {
  const BossIcon = Icons[boss.icon] || Icons.Skull
  const hpPct = Math.round((boss.hpRemaining / boss.maxHP) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 p-5 sm:p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 flex items-center justify-center shrink-0">
          <BossIcon size={28} className="text-neon-pink" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold truncate">{boss.name}</p>
          <p className="text-xs text-white/50">Weekly boss · {boss.hpRemaining.toLocaleString()} / {boss.maxHP.toLocaleString()} HP left</p>
        </div>
      </div>

      <ProgressBar
        value={boss.hpRemaining}
        max={boss.maxHP}
        colorClass="bg-gradient-to-r from-neon-pink to-neon-purple"
        heightClass="h-3"
      />
      <p className="text-right text-[11px] text-white/40 mt-1">{hpPct}% HP remaining</p>

      <div className="mt-5 space-y-2.5">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Today's quests</p>
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`rounded-xl border p-3 transition-colors ${
              quest.isComplete ? 'border-neon-green/30 bg-neon-green/5' : 'border-white/5 bg-base-700/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {quest.isComplete ? (
                <CheckCircle2 size={18} className="text-neon-green shrink-0 mt-0.5" />
              ) : (
                <Circle size={18} className="text-white/25 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${quest.isComplete ? 'text-white/80 line-through' : 'text-white/85'}`}>
                  {quest.label}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {getSubjectLabel(quest.subjectId)} · {quest.minutesLogged}/{quest.targetMinutes} min · {quest.damage} dmg · +{quest.rewardXP} XP
                </p>
                <div className="mt-1.5">
                  <ProgressBar
                    value={quest.minutesLogged}
                    max={quest.targetMinutes}
                    heightClass="h-1.5"
                    colorClass={quest.isComplete ? 'bg-neon-green' : 'bg-neon-cyan'}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
