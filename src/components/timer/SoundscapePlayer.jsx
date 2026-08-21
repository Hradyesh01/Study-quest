import { useEffect, useRef, useState } from 'react'
import { CloudRain, Music2, Sunset as SunsetIcon, Volume2, VolumeX } from 'lucide-react'
import { Soundscape } from '../../lib/audioEngine'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const TRACKS = [
  { id: 'lofi', label: 'Lofi Beats', icon: Music2 },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'sunset', label: 'Sunset', icon: SunsetIcon },
]

export default function SoundscapePlayer() {
  const [activeTrackId, setActiveTrackId] = useLocalStorage('sq_soundscape_track', null)
  const [volume, setVolume] = useLocalStorage('sq_soundscape_volume', 0.5)
  const soundscapeRef = useRef(null)

  useEffect(() => {
    return () => {
      soundscapeRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    soundscapeRef.current?.setVolume(volume)
  }, [volume])

  const handleSelect = (trackId) => {
    if (activeTrackId === trackId) {
      soundscapeRef.current?.stop()
      soundscapeRef.current = null
      setActiveTrackId(null)
      return
    }
    soundscapeRef.current?.stop()
    const next = new Soundscape(trackId)
    next.start(volume)
    soundscapeRef.current = next
    setActiveTrackId(trackId)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 p-4 sm:p-5">
      <p className="text-sm font-medium text-white/70 mb-3">Ambient soundscape</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {TRACKS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTrackId === id
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all ${
                isActive
                  ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan'
                  : 'border-white/5 bg-base-700 text-white/60 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'animate-pulse-glow' : ''} />
              {label}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        {volume === 0 ? <VolumeX size={16} className="text-white/40" /> : <Volume2 size={16} className="text-white/40" />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-neon-cyan"
        />
      </div>
    </div>
  )
}
