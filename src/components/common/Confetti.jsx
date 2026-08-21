import { useMemo } from 'react'

const COLORS = ['#00f5ff', '#b026ff', '#ff2e93', '#39ff88', '#ffd700']

export default function Confetti({ active, pieceCount = 60 }) {
  const pieces = useMemo(() => {
    if (!active) return []
    return Array.from({ length: pieceCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
      isCircle: Math.random() > 0.5,
    }))
    // regenerate only when a new "burst" starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '9999px' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
