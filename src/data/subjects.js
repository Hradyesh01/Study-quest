// Subject catalog shown in the Subject Selector before a session starts.
// `icon` maps to a lucide-react component name (see components/timer/SubjectSelector.jsx).
export const SUBJECTS = [
  { id: 'physics', name: 'Physics', icon: 'Atom', color: '#00f5ff' },
  { id: 'coding', name: 'Coding', icon: 'Code2', color: '#39ff88' },
  { id: 'math', name: 'Math', icon: 'Sigma', color: '#b026ff' },
  { id: 'chemistry', name: 'Chemistry', icon: 'FlaskConical', color: '#ff2e93' },
  { id: 'literature', name: 'Literature', icon: 'BookOpen', color: '#ffd700' },
  { id: 'languages', name: 'Languages', icon: 'Languages', color: '#38bdf8' },
  { id: 'other', name: 'Other', icon: 'Sparkles', color: '#c7d0dd' },
]

export function getSubjectById(id) {
  return SUBJECTS.find((s) => s.id === id) || SUBJECTS[SUBJECTS.length - 1]
}
