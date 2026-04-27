import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="flex h-screen min-h-0 bg-gray-50 text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
