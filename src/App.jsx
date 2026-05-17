import { useState, useEffect } from 'react'
import { CalendarDays, LineChart, Settings, AlertCircle, Loader2 } from 'lucide-react'
import { useHealthData } from './hooks/useHealthData'
import TodayView from './components/TodayView'
import HistoryView from './components/HistoryView'
import SettingsView from './components/SettingsView'

const TABS = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'history', label: 'History', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const hasToken = !!localStorage.getItem('ht_token')
  const { todayLog, allLogs, loading, syncing, error, updateToday, reload } = useHealthData()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Content */}
      {!hasToken && (
          <div className="max-w-lg mx-auto w-full px-4 pt-3">
            <button onClick={() => setTab('settings')} className="w-full text-xs font-mono text-center py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors">
              No token configured. Tap to set up GitHub sync.
            </button>
          </div>
        )}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 gap-3 text-subtle font-mono text-sm">
            <Loader2 size={16} className="animate-spin text-accent" />
            Loading...
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex gap-3 text-sm">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-mono text-xs uppercase tracking-wider mb-1">Error</p>
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-subtle text-xs mt-2 font-mono">Check your token in Settings.</p>
            </div>
          </div>
        ) : tab === 'today' ? (
          <TodayView log={todayLog} onUpdate={updateToday} syncing={syncing} />
        ) : tab === 'history' ? (
          <HistoryView logs={allLogs} />
        ) : (
          <SettingsView onReload={reload} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-surface/90 backdrop-blur border-t border-border">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                tab === id ? 'text-accent' : 'text-muted hover:text-subtle'
              }`}
            >
              <Icon size={18} />
              <span className="font-mono text-xs tracking-wider uppercase">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
