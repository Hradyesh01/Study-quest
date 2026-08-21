import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const TITLES = {
  '/': 'Dashboard',
  '/study-room': 'Study Room',
  '/badges': 'Badges',
  '/leaderboard': 'Leaderboard',
  '/ai-assistant': 'AI Assistant',
  '/profile': 'Profile',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'StudyQuest'

  return (
    <div className="min-h-screen flex bg-base-950 text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
