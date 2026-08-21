import SubjectSelector from '../components/timer/SubjectSelector'
import FocusTimer from '../components/timer/FocusTimer'
import SoundscapePlayer from '../components/timer/SoundscapePlayer'
import SessionSummaryModal from '../components/timer/SessionSummaryModal'
import { useStudy } from '../context/StudyContext'

export default function StudyRoom() {
  const { lastSessionResult, dismissSessionResult, timerSubjectId, setTimerSubjectId, timer } = useStudy()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Study Room</h2>
        <p className="text-white/50 text-sm mt-1">Pick a subject, start the timer, and let StudyQuest handle the XP math.</p>
      </div>

      <SubjectSelector selectedId={timerSubjectId} onSelect={setTimerSubjectId} disabled={timer.isRunning} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FocusTimer />
        </div>
        <div>
          <SoundscapePlayer />
        </div>
      </div>

      <SessionSummaryModal result={lastSessionResult} onClose={dismissSessionResult} />
    </div>
  )
}
