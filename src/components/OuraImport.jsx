import { useState } from 'react'
import { Activity, Loader2, Plus, Footprints } from 'lucide-react'
import { fetchOuraDayData, getOuraToken } from '../utils/oura'

export default function OuraImport({ date, onAddTraining, onUpdateActivity }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  if (!getOuraToken()) return null

  async function fetchData() {
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const data = await fetchOuraDayData(date)
      setPreview(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (!preview) return
    if (preview.workouts.length) onAddTraining(preview.workouts)
    onUpdateActivity({
      steps: preview.steps,
      activeCalories: preview.activeCalories,
      activityScore: preview.activityScore,
      readinessScore: preview.readinessScore,
    })
    setPreview(null)
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <p className="text-xs font-mono text-subtle uppercase tracking-widest">Oura Ring</p>
        </div>
        {!preview && (
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-mono text-accent hover:text-orange-400 disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
            {loading ? 'Fetching...' : 'Import today'}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

      {preview && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg rounded-lg p-2.5 text-center">
              <p className="font-mono text-xs text-subtle">Steps</p>
              <p className="font-display text-xl text-text tracking-wider">{preview.steps.toLocaleString()}</p>
            </div>
            <div className="bg-bg rounded-lg p-2.5 text-center">
              <p className="font-mono text-xs text-subtle">Active kcal</p>
              <p className="font-display text-xl text-text tracking-wider">{preview.activeCalories}</p>
            </div>
            <div className="bg-bg rounded-lg p-2.5 text-center">
              <p className="font-mono text-xs text-subtle">Readiness</p>
              <p className={`font-display text-xl tracking-wider ${
                preview.readinessScore >= 70 ? 'text-green-400' :
                preview.readinessScore >= 50 ? 'text-accent' : 'text-red-400'
              }`}>{preview.readinessScore ?? '—'}</p>
            </div>
          </div>

          {preview.workouts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">Workouts</p>
              {preview.workouts.map(w => (
                <div key={w.id} className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-muted w-10 shrink-0">{w.time}</span>
                  <span className="text-sm text-text flex-1">{w.type}</span>
                  <span className="font-mono text-xs text-subtle">{w.duration}min</span>
                  {w.calories > 0 && <span className="font-mono text-xs text-subtle">{w.calories}kcal</span>}
                </div>
              ))}
            </div>
          )}

          {preview.workouts.length === 0 && (
            <p className="text-xs font-mono text-subtle text-center py-1">No recorded workouts today</p>
          )}

          <div className="flex gap-2">
            <button onClick={confirm}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-accent hover:bg-orange-500 text-black font-display tracking-widest transition-colors">
              <Plus size={14} /> ADD TO LOG
            </button>
            <button onClick={() => setPreview(null)}
              className="px-4 py-2.5 rounded-lg border border-border text-subtle font-mono text-sm hover:border-red-500 hover:text-red-400 transition-all">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
