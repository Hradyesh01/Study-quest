import { Link, useLocation } from 'react-router-dom'
import { Menu, Timer } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import XPBar from '../common/XPBar'
import StreakFlame from '../common/StreakFlame'
import { getSubjectById } from '../../data/subjects'

export default function TopBar({ onMenuClick, title }) {
  const { user, timer, timerSubjectId } = useStudy()
  const location = useLocation()
  const subject = timerSubjectId ? getSubjectById(timerSubjectId) : null
  const showMiniTimer = timer.isRunning && location.pathname !== '/study-room'

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-white/10 bg-base-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden text-white/70 hover:text-white shrink-0">
          <Menu size={22} />
        </button>
        <h1 className="font-display font-semibold text-base sm:text-lg truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
        {showMiniTimer && (
          <Link
            to="/study-room"
            className="flex items-center gap-1.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/20 transition-colors animate-pulse-glow"
            title="A focus session is still running — click to go back to the Study Room"
          >
            <Timer size={13} />
            <span className="tabular-nums">{timer.clockLabel}</span>
            {subject && <span className="hidden sm:inline text-neon-cyan/70">· {subject.name}</span>}
          </Link>
        )}
        <div className="hidden sm:block">
          <XPBar compact />
        </div>
        <StreakFlame count={user.streakCount} size="sm" />
        <div className="h-9 w-9 rounded-full bg-base-800 border border-white/10 flex items-center justify-center text-lg">
          {user.avatar}
        </div>
      </div>
    </header>
  )
}
