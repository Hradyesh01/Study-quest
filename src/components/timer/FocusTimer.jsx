import { useMemo } from 'react'
import { Pause, Play, RotateCcw, SkipForward, Square } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { getSubjectById } from '../../data/subjects'

const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Reads the session timer straight from StudyContext instead of owning any
// local state — that's what lets it keep running when you leave the Study
// Room (e.g. to use the AI Assistant tab) and come back later.
export default function FocusTimer() {
  const {
    timer,
    timerSubjectId: subjectId,
    timerMode: mode,
    setTimerMode: setMode,
    workMinutes,
    setWorkMinutes,
    breakMinutes,
    setBreakMinutes,
    finishStopwatchSession,
  } = useStudy()

  const subject = subjectId ? getSubjectById(subjectId) : null
  const canStart = Boolean(subjectId)

  const phaseTargetSeconds = mode === 'pomodoro' ? (timer.phase === 'work' ? workMinutes : breakMinutes) * 60 : 1
  const dashOffset = useMemo(() => {
    if (mode !== 'pomodoro') return 0
    const pct = timer.secondsRemaining != null ? 1 - timer.secondsRemaining / phaseTargetSeconds : 0
    return CIRCUMFERENCE * (1 - pct)
  }, [mode, timer.secondsRemaining, phaseTargetSeconds])

  const ringColor = timer.phase === 'break' ? '#39ff88' : subject?.color || '#00f5ff'

  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 p-5 sm:p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex rounded-xl bg-base-700 p-1">
          {['pomodoro', 'stopwatch'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                mode === m ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'pomodoro' && (
          <span
            className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              timer.phase === 'work' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-neon-green/10 text-neon-green'
            }`}
          >
            {timer.phase === 'work' ? 'Focus' : 'Break'}
          </span>
        )}
      </div>

      {mode === 'pomodoro' && !timer.isRunning && timer.secondsElapsedInPhase === 0 && (
        <div className="flex gap-4 mb-6 justify-center text-sm">
          <label className="flex items-center gap-2 text-white/60">
            Work
            <input
              type="number"
              min={1}
              max={120}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 0)))}
              className="w-16 rounded-lg bg-base-700 border border-white/10 px-2 py-1 text-center text-white"
            />
            min
          </label>
          <label className="flex items-center gap-2 text-white/60">
            Break
            <input
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Math.max(1, Math.min(60, Number(e.target.value) || 0)))}
              className="w-16 rounded-lg bg-base-700 border border-white/10 px-2 py-1 text-center text-white"
            />
            min
          </label>
        </div>
      )}

      <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#1a1f3a" strokeWidth="12" />
          {mode === 'pomodoro' && (
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${ringColor}aa)` }}
            />
          )}
          {mode === 'stopwatch' && timer.isRunning && (
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * 0.28} ${CIRCUMFERENCE}`}
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}aa)` }}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl sm:text-5xl font-bold tabular-nums">{timer.clockLabel}</span>
          <span className="text-xs text-white/40 mt-2">
            {subject ? subject.name : 'Select a subject to begin'}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        {!timer.isRunning ? (
          <button
            disabled={!canStart}
            onClick={timer.start}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 font-display font-semibold text-base-950 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Play size={18} fill="currentColor" /> Start
          </button>
        ) : (
          <button
            onClick={timer.pause}
            className="flex items-center gap-2 rounded-xl bg-base-700 border border-white/10 px-6 py-3 font-display font-semibold hover:bg-base-600 transition-colors"
          >
            <Pause size={18} fill="currentColor" /> Pause
          </button>
        )}

        {mode === 'pomodoro' && (
          <button
            onClick={timer.skipPhase}
            className="flex items-center gap-2 rounded-xl bg-base-700 border border-white/10 px-4 py-3 text-white/70 hover:text-white transition-colors"
            title="Skip to next phase"
          >
            <SkipForward size={18} />
          </button>
        )}

        {mode === 'stopwatch' && timer.secondsElapsedInPhase > 0 && (
          <button
            onClick={finishStopwatchSession}
            className="flex items-center gap-2 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green px-4 py-3 font-medium hover:bg-neon-green/20 transition-colors"
          >
            <Square size={16} fill="currentColor" /> Finish
          </button>
        )}

        <button
          onClick={timer.reset}
          className="flex items-center gap-2 rounded-xl bg-base-700 border border-white/10 px-4 py-3 text-white/70 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {!canStart && (
        <p className="mt-4 text-center text-xs text-white/40">Pick a subject above to unlock the Start button.</p>
      )}
    </div>
  )
}
