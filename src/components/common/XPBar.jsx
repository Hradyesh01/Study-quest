import { Zap } from 'lucide-react'
import ProgressBar from './ProgressBar'
import { useStudy } from '../../context/StudyContext'

export default function XPBar({ compact = false }) {
  const { levelProgress } = useStudy()
  const { level, currentLevelXP, xpForNextLevel } = levelProgress

  return (
    <div className={compact ? 'w-40' : 'w-full'}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-neon-cyan to-neon-purple text-[11px] font-bold font-display shadow-neon-cyan">
          {level}
        </span>
        {!compact && (
          <span className="text-xs text-white/60 flex items-center gap-1">
            <Zap size={12} className="text-neon-cyan" />
            {currentLevelXP}/{xpForNextLevel} XP
          </span>
        )}
      </div>
      <ProgressBar value={currentLevelXP} max={xpForNextLevel} heightClass="h-2" />
    </div>
  )
}
