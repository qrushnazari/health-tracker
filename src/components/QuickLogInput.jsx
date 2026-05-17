import { useState } from 'react'
import { Sparkles, Loader2, Plus } from 'lucide-react'
import { parseHealthLog } from '../utils/openai'

export default function QuickLogInput({ onAddMeals, onAddTraining }) {
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
    setText('')
    setPreview(null)
  }

  function discard() {
    setPreview(null)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        <p className="text-xs font-mono text-subtle uppercase tracking-widest">Quick Log</p>
      </div>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setPreview(null) }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) parse() }}
        placeholder="e.g. had 5 eggs with sucuk and greek yoghurt, then went for a 40 min run and 40 min weights..."
        rows={3}
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
          {preview.meals.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">Meals</p>
              {preview.meals.map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2">
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
                <div key={t.id} className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2">
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
            <button onClick={discard}
              className="px-4 py-2.5 rounded-lg border border-border text-subtle font-mono text-sm hover:border-red-500 hover:text-red-400 transition-all">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
