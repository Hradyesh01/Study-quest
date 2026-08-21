export default function ProgressBar({
  value = 0,
  max = 100,
  colorClass = 'bg-gradient-to-r from-neon-cyan to-neon-purple',
  trackClass = 'bg-base-700',
  heightClass = 'h-2.5',
  label,
  showPct = false,
}) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100))

  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/60">
          {label && <span>{label}</span>}
          {showPct && <span className="font-medium text-white/80">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} ${colorClass} rounded-full origin-left transition-transform duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
