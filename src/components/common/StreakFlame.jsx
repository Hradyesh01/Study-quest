import { Flame } from 'lucide-react'

export default function StreakFlame({ count, size = 'md' }) {
  const isHot = count >= 7
  const isBlazing = count >= 30
  const dims = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 16 : 22

  const colorClass = isBlazing ? 'text-neon-gold' : isHot ? 'text-neon-pink' : count > 0 ? 'text-orange-400' : 'text-white/25'
  const glow = isBlazing ? 'shadow-neon-gold' : isHot ? 'shadow-neon-pink' : count > 0 ? 'shadow-[0_0_16px_rgba(251,146,60,0.35)]' : ''

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative flex items-center justify-center ${dims} rounded-2xl bg-base-800 border border-white/10 ${glow} ${
          count > 0 ? 'animate-flicker' : ''
        }`}
      >
        <Flame size={iconSize} className={colorClass} fill={count > 0 ? 'currentColor' : 'none'} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display font-bold leading-none text-lg">{count}</p>
        <p className="text-[11px] text-white/50 leading-none mt-1">day streak</p>
      </div>
    </div>
  )
}
