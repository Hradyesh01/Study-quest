import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Timer, Award, Trophy, User, Zap, X, Bot } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/study-room', label: 'Study Room', icon: Timer },
  { to: '/badges', label: 'Badges', icon: Award },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 border-r border-white/10 bg-base-900/95 backdrop-blur-xl transform transition-transform duration-300 lg:static lg:translate-x-0 lg:flex lg:flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
              <Zap size={18} className="text-base-950" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">StudyQuest</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-neon-cyan drop-shadow-[0_0_6px_rgba(0,245,255,0.8)]' : ''}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="rounded-xl bg-base-800 border border-white/10 p-3 text-xs text-white/50 leading-relaxed">
            Built for the hackathon. Progress is saved locally in this browser — no account needed.
          </div>
        </div>
      </aside>
    </>
  )
}
