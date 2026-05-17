import { useState, useEffect } from 'react'
import { CalendarDays, LineChart, Settings, AlertCircle, Loader2 } from 'lucide-react'
import { useHealthData } from './hooks/useHealthData'
import TodayView from './components/TodayView'
import HistoryView from './components/HistoryView'
import SettingsView from './components/SettingsView'
import { handleOAuthCallback, fetchLatestWeight } from './utils/withings'

const TABS = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'history', label: 'History', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const { todayLog, allLogs, getLog, loading, syncing, error, updateLog, reload } = useHealthData()
  const hasToken = !!localStorage.getItem('ht_token')
  const selectedLog = getLog(selectedDate)

  // Handle Withings OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) return

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname)

    handleOAuthCallback(code, state)
      .then(() => fetchLatestWeight())
      .then(weight => {
        if (weight) updateLog(new Date().toISOString().slice(0, 10), { weight: Math.round(weight * 10) / 10 })
      })
      .catch(console.error)
  }, [])

  // Auto-fetch Withings weight on load if connected and today has no weight
  useEffect(() => {
    if (!loading && !todayLog.weight && localStorage.getItem('withings_access_token')) {
      fetchLatestWeight()
        .then(weight => {
          if (weight) updateToday({ weight: Math.round(weight * 10) / 10 })
        })
        .catch(console.error)
    }
  }, [loading])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
        {!hasToken ? (
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-5xl text-text tracking-widest leading-none">SETUP</h1>
              <p className="text-subtle font-mono text-sm mt-2">Connect GitHub to save your data.</p>
            </div>
            <SettingsView onReload={reload} />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64 gap-3 text-subtle font-mono text-sm">
            <Loader2 size={16} className="animate-spin text-accent" />
            Loading from GitHub...
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-mono text-xs uppercase tracking-wider mb-1">Error</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
            <SettingsView onReload={reload} />
          </div>
        ) : tab === 'today' ? (
          <TodayView
            log={selectedLog}
            date={selectedDate}
            onDateChange={setSelectedDate}
            onUpdate={(updater) => updateLog(selectedDate, updater)}
            syncing={syncing}
          />
        ) : tab === 'history' ? (
          <HistoryView logs={allLogs} />
        ) : (
          <SettingsView onReload={reload} />
        )}
      </main>

      {hasToken && !loading && !error && (
        <nav className="sticky bottom-0 bg-surface/90 backdrop-blur border-t border-border">
          <div className="max-w-lg mx-auto flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab === id ? 'text-accent' : 'text-muted hover:text-subtle'}`}>
                <Icon size={18} />
                <span className="font-mono text-xs tracking-wider uppercase">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
