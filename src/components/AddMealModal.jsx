import { useState } from 'react'
import { X } from 'lucide-react'

const QUICK_MEALS = [
  { description: 'Protein shake', kcal: 140, protein: 28 },
  { description: 'Eggs (x5) + sucuk', kcal: 890, protein: 60 },
  { description: 'Greek yoghurt', kcal: 120, protein: 10 },
  { description: 'Chicken breast 200g', kcal: 220, protein: 46 },
  { description: 'Ground beef 200g', kcal: 340, protein: 42 },
]

export default function AddMealModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    kcal: '',
    protein: '',
  })

  function fill(quick) {
    setForm(f => ({ ...f, ...quick }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.description) return
    onAdd({
      id: crypto.randomUUID(),
      time: form.time,
      description: form.description,
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl text-accent tracking-widest">ADD MEAL</span>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_MEALS.map(q => (
            <button
              key={q.description}
              onClick={() => fill(q)}
              className="text-xs font-mono px-3 py-1.5 rounded-full bg-border hover:bg-accent/20 hover:text-accent border border-border hover:border-accent/40 transition-all text-subtle"
            >
              {q.description}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-subtle font-mono uppercase tracking-wider">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-subtle font-mono uppercase tracking-wider">Kcal</label>
              <input
                type="number"
                placeholder="0"
                value={form.kcal}
                onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))}
                className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-subtle font-mono uppercase tracking-wider">Description</label>
            <input
              type="text"
              placeholder="What did you eat?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-subtle font-mono uppercase tracking-wider">Protein (g)</label>
            <input
              type="number"
              placeholder="0"
              value={form.protein}
              onChange={e => setForm(f => ({ ...f, protein: e.target.value }))}
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
