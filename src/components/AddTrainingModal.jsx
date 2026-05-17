import { useState } from 'react'
import { X } from 'lucide-react'

const QUICK = [
  { type: 'Walk/Run', duration: 40 },
  { type: 'Weights', duration: 40 },
  { type: 'Cycling', duration: 45 },
  { type: 'HIIT', duration: 25 },
  { type: 'Swimming', duration: 45 },
]

export default function AddTrainingModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ type: '', duration: '' })

  function submit(e) {
    e.preventDefault()
    if (!form.type) return
    onAdd({ id: crypto.randomUUID(), type: form.type, duration: Number(form.duration) || 0 })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl text-accent tracking-widest">ADD TRAINING</span>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK.map(q => (
            <button
              key={q.type}
              onClick={() => setForm(q)}
              className="text-xs font-mono px-3 py-1.5 rounded-full bg-border hover:bg-accent/20 hover:text-accent border border-border hover:border-accent/40 transition-all text-subtle"
            >
              {q.type} {q.duration}m
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-subtle font-mono uppercase tracking-wider">Type</label>
            <input
              type="text"
              placeholder="e.g. Weights, Run, Cycling..."
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-subtle font-mono uppercase tracking-wider">Duration (min)</label>
            <input
              type="number"
              placeholder="0"
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-orange-500 text-black font-display tracking-widest text-lg py-3 rounded-xl transition-colors mt-2"
          >
            LOG IT
          </button>
        </form>
      </div>
    </div>
  )
}
