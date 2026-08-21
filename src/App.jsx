import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import StudyRoom from './pages/StudyRoom'
import Badges from './pages/Badges'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import AIAssistant from './pages/AIAssistant'

// HashRouter is used (routes like "/#/study-room") so the app works when
// simply dropped onto any static host or custom domain — no server-side
// rewrite rules required. Swap to BrowserRouter + the included
// vercel.json / public/_redirects if you deploy somewhere that supports
// SPA rewrites and want clean "/study-room" style URLs.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study-room" element={<StudyRoom />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
