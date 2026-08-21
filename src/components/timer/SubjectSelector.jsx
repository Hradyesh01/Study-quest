import * as Icons from 'lucide-react'
import { SUBJECTS } from '../../data/subjects'

export default function SubjectSelector({ selectedId, onSelect, disabled }) {
  return (
    <div>
      <p className="text-sm font-medium text-white/70 mb-3">Pick a subject to focus on</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {SUBJECTS.map((subject) => {
          const Icon = Icons[subject.icon] || Icons.Sparkles
          const isSelected = subject.id === selectedId
          return (
            <button
              key={subject.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(subject.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/5 bg-base-800 hover:bg-base-700 hover:border-white/10'
              }`}
              style={isSelected ? { boxShadow: `0 0 0 1px ${subject.color}55, 0 0 24px ${subject.color}33` } : undefined}
            >
              <Icon size={22} style={{ color: isSelected ? subject.color : '#ffffff99' }} />
              <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>
                {subject.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
