import { useState } from 'react'
import * as Icons from 'lucide-react'
import { Lock } from 'lucide-react'

// Drop a square PNG/SVG named after the badge id into `public/badges/`
// (e.g. public/badges/night-owl.png) and it's picked up automatically —
// no code change needed. If the file is missing, this falls back to the
// lucide-react icon named in `badge.icon`.
export default function BadgeCard({ badge, isUnlocked }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const Icon = Icons[badge.icon] || Icons.Award
  const imageSrc = `/badges/${badge.id}.png`

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <div
        tabIndex={0}
        className={`flex flex-col items-center gap-2.5 rounded-2xl border p-2.5 text-center transition-all cursor-default ${
          isUnlocked
            ? `border-white/15 bg-base-800 ${badge.glow}`
            : 'border-white/5 bg-base-800/50'
        }`}
      >
        <div
          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl ${
            isUnlocked ? 'bg-gradient-to-br from-white/10 to-transparent' : 'bg-base-700'
          }`}
        >
          {!imageFailed ? (
            <img
              src={imageSrc}
              alt={badge.name}
              onError={() => setImageFailed(true)}
              className={`h-full w-full object-contain transition-all ${
                isUnlocked ? '' : 'grayscale blur-[1.5px] opacity-40'
              }`}
              style={isUnlocked ? { filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' } : undefined}
            />
          ) : (
            <Icon
              size={56}
              className={isUnlocked ? 'text-white' : 'text-white/25'}
              style={isUnlocked ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' } : undefined}
            />
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-base-950/50 backdrop-blur-[2px]">
              <Lock size={22} className="text-white/40" />
            </div>
          )}
        </div>
        <div>
          <p className={`text-sm font-semibold ${isUnlocked ? 'text-white' : 'text-white/40'}`}>{badge.name}</p>
          <p className="text-[11px] text-white/35 mt-0.5 capitalize">{badge.category}</p>
        </div>
      </div>

      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-10 w-48 rounded-xl border border-white/10 bg-base-950 p-3 text-xs text-white/70 shadow-xl">
          <p className="font-medium text-white mb-1">{badge.name}</p>
          <p>{badge.description}</p>
          {!isUnlocked && <p className="mt-1.5 text-white/40 italic">Not yet unlocked</p>}
        </div>
      )}
    </div>
  )
}
