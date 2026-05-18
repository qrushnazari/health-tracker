import { useState } from 'react'
import { Sparkles, Loader2, Plus } from 'lucide-react'
import { parseHealthLog } from '../utils/openai'

export default function QuickLogInput({ onAddMeals, onAddTraining, onUpdateFasting, onClose }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  async function parse() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const result = await parseHealthLog(text)
      setPreview(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (!preview) return
    if (preview.meals.length) onAddMeals(preview.meals)
    if (preview.training.length) onAddTraining(preview.training)
    const f = preview.fasting
    if (f && (f.open || f.close)) {
      onUpdateFasting({
        ...(f.open && { open: f.open }),
        ...(f.close && { close: f.close }),
        ...(f.closeNextDay !== null && { closeNextDay: f.closeNextDay }),
      })
    }
    setText('')
    setPreview(null)
    onClose?.()
  }

  const hasFasting = preview?.fasting && (preview.fasting.open || preview.fasting.close)

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setPreview(null) }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) parse() }}
        placeholder="e.g. started fasting at 20:00 yesterday, broke fast at 11:30 this morning with a protein shake, then 5 eggs with sucuk, 40 min run and weights..."
        rows={4}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm focus:border-accent focus:outline-none resize-none placeholder:text-muted"
      />

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

      {!preview && (
        <button
          onClick={parse}
          disabled={loading || !text.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent hover:bg-orange-500 disabled:opacity-40 text-black font-display tracking-widest transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'PARSING...' : 'PARSE & LOG'}
        </button>
      )}

      {preview && (
        <div className="space-y-3">
          {hasFasting && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">Fasting Window</p>
              <div className="flex gap-2">
                {preview.fasting.open && (
                  <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2">
                    <p className="text-xs font-mono text-subtle">starts</p>
                    <p className="font-mono text-sm text-text">{preview.fasting.open}</p>
                  </div>
                )}
                {preview.fasting.close && (
                  <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2">
                    <p className="text-xs font-mono text-subtle">breaks {preview.fasting.closeNextDay ? '(next day)' : ''}</p>
                    <p className="font-mono text-sm text-text">{preview.fasting.close}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {preview.meals.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">Meals</p>
              {preview.meals.map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-muted w-10 shrink-0">{m.time}</span>
                  <span className="text-sm text-text flex-1">{m.description}</span>
                  <span className="font-mono text-xs text-subtle shrink-0">{m.kcal}kcal</span>
                  <span className="font-mono text-xs text-accent shrink-0">{m.protein}g</span>
                </div>
              ))}
            </div>
          )}

          {preview.training.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">Training</p>
              {preview.training.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                  <span className="font-mono text-xs text-muted w-10 shrink-0">{t.time}</span>
                  <span className="text-sm text-text flex-1">{t.type}</span>
                  <span className="font-mono text-xs text-subtle">{t.duration}min</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={confirm}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-accent hover:bg-orange-500 text-black font-display tracking-widest transition-colors">
              <Plus size={14} /> ADD ALL
            </button>
            <button onClick={() => setPreview(null)}
              className="px-4 py-2.5 rounded-lg border border-border text-subtle font-mono text-sm hover:border-red-500 hover:text-red-400 transition-all">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
