import { useCallback, useEffect, useRef, useState } from 'react'
import { formatClock } from '../lib/formatters'
import { playPhaseCompleteChime } from '../lib/audioEngine'

const ORIGINAL_TITLE = 'StudyQuest'

/**
 * Drives both timer modes used by the Focus Timer:
 *  - 'pomodoro': counts DOWN through alternating work/break phases
 *  - 'stopwatch': counts UP indefinitely until the user finishes manually
 *
 * Also keeps the document title synced to the remaining/elapsed time so
 * students can see their progress from a background browser tab.
 */
export function useTimer({ mode, workMinutes, breakMinutes, onWorkPhaseComplete }) {
  const [phase, setPhase] = useState('work') // 'work' | 'break'
  const [isRunning, setIsRunning] = useState(false)
  const [secondsElapsedInPhase, setSecondsElapsedInPhase] = useState(0)
  const [wasSkippedOrReset, setWasSkippedOrReset] = useState(false)
  const intervalRef = useRef(null)
  const startedAtRef = useRef(null)

  const phaseTargetSeconds = mode === 'pomodoro' ? (phase === 'work' ? workMinutes : breakMinutes) * 60 : Infinity

  const secondsRemaining = mode === 'pomodoro' ? Math.max(0, phaseTargetSeconds - secondsElapsedInPhase) : null

  useEffect(() => {
    if (!isRunning) return undefined
    intervalRef.current = setInterval(() => {
      setSecondsElapsedInPhase((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  // Document title ticker
  useEffect(() => {
    if (!isRunning) {
      document.title = ORIGINAL_TITLE
      return undefined
    }
    const displaySeconds = mode === 'pomodoro' ? secondsRemaining : secondsElapsedInPhase
    const icon = mode === 'pomodoro' && phase === 'break' ? '☕' : '⏱️'
    document.title = `${icon} ${formatClock(displaySeconds)} — StudyQuest`
    return () => {
      document.title = ORIGINAL_TITLE
    }
  }, [isRunning, secondsElapsedInPhase, secondsRemaining, mode, phase])

  // Pomodoro phase-complete handling
  useEffect(() => {
    if (mode !== 'pomodoro' || !isRunning) return
    if (secondsElapsedInPhase >= phaseTargetSeconds) {
      playPhaseCompleteChime()
      if (phase === 'work') {
        onWorkPhaseComplete({
          durationMinutes: workMinutes,
          wasFullyCompleted: !wasSkippedOrReset,
        })
        setPhase('break')
      } else {
        setPhase('work')
      }
      setSecondsElapsedInPhase(0)
      setWasSkippedOrReset(false)
    }
  }, [secondsElapsedInPhase, phaseTargetSeconds, mode, isRunning, phase, workMinutes, onWorkPhaseComplete, wasSkippedOrReset])

  const start = useCallback(() => {
    if (!startedAtRef.current) startedAtRef.current = new Date()
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => setIsRunning(false), [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsElapsedInPhase(0)
    setPhase('work')
    setWasSkippedOrReset(true)
    startedAtRef.current = null
  }, [])

  const skipPhase = useCallback(() => {
    setWasSkippedOrReset(true)
    setSecondsElapsedInPhase(0)
    setPhase((p) => (p === 'work' ? 'break' : 'work'))
  }, [])

  /** Stopwatch-only: finalize the current elapsed time as a session. */
  const finishStopwatch = useCallback(() => {
    const durationMinutes = Math.max(1, Math.round(secondsElapsedInPhase / 60))
    setIsRunning(false)
    const result = { durationMinutes, wasFullyCompleted: true, startedAt: startedAtRef.current }
    setSecondsElapsedInPhase(0)
    startedAtRef.current = null
    return result
  }, [secondsElapsedInPhase])

  const progressPct =
    mode === 'pomodoro' && phaseTargetSeconds > 0
      ? Math.min(100, Math.round((secondsElapsedInPhase / phaseTargetSeconds) * 100))
      : 0

  return {
    phase,
    isRunning,
    secondsElapsedInPhase,
    secondsRemaining,
    progressPct,
    clockLabel: formatClock(mode === 'pomodoro' ? secondsRemaining : secondsElapsedInPhase),
    startedAt: startedAtRef.current,
    start,
    pause,
    reset,
    skipPhase,
    finishStopwatch,
  }
}
