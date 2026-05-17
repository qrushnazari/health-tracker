import { useState } from 'react'
import { Plus, Trash2, Timer, Dumbbell, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react'
import AddMealModal from './AddMealModal'
import AddTrainingModal from './AddTrainingModal'
import QuickLogInput from './QuickLogInput'
import OuraImport from './OuraImport'

const GOAL_WEIGHT = 76
const PROTEIN_TARGET = 150
const KCAL_TARGET = 1900
const TODAY = new Date().toISOString().slice(0, 10)

function offsetDate(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDate(date) {
  const d = new Date(date)
  if (date === TODAY) return 'Today'
  if (date === offsetDate(TODAY, -1)) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fastingHours(open, close) {
  if (!open) return null
  const end = close || new Date().toTimeString().slice(0, 5)
  const [oh, om] = open.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = (eh * 60 + em) - (oh * 60 + om)
  if (diff < 0) diff += 24 * 60 // overnight fast
  return diff > 0 ? (diff / 60).toFixed(1) : null
}

function now() {
  return new Date().toTimeString().slice(0, 5)
}

export default function TodayView({ log, date, onDateChange, onUpdate, syncing }) {
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTrainModal, setShowTrainModal] = useState(false)
  const [editingWeight, setEditingWeight] = useState(false)
  const [weightInput, setWeightInput] = useState(log.weight ?? '')

  const totalKcal = log.meals.reduce((s, m) => s + (m.kcal || 0), 0)
  const totalProtein = log.meals.reduce((s, m) => s + (m.protein || 0), 0)
  const totalTrainMin = log.training.reduce((s, t) => s + (t.duration || 0), 0)
  const fastHours = fastingHours(log.fastingWindow?.open, log.fastingWindow?.close)
  const toGoal = log.weight ? (log.weight - GOAL_WEIGHT).toFixed(1) : null

  function saveWeight() {
    const w = parseFloat(weightInput)
    if (!isNaN(w)) onUpdate({ weight: w })
    setEditingWeight(false)
  }

  function addMeal(meal) {
    onUpdate(prev => ({ ...prev, meals: [...prev.meals, meal] }))
  }

  function removeMeal(id) {
    onUpdate(prev => ({ ...prev, meals: prev.meals.filter(m => m.id !== id) }))
  }

  function addTraining(t) {
    onUpdate(prev => ({ ...prev, training: [...prev.training, t] }))
  }

  function removeTraining(id) {
    onUpdate(prev => ({ ...prev, training: prev.training.filter(t => t.id !== id) }))
  }

  function openFast() {
    onUpdate(prev => ({ ...prev, fastingWindow: { open: now(), close: null } }))
  }

  function closeFast() {
    onUpdate(prev => ({ ...prev, fastingWindow: { ...prev.fastingWindow, close: now() } }))
  }

  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => onDateChange(offsetDate(date, -1))} className="text-muted hover:text-accent transition-colors p-1">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-display text-4xl text-text tracking-widest leading-none">{formatDate(date).toUpperCase()}</h1>
          {date !== TODAY && (
            <button onClick={() => onDateChange(TODAY)} className="text-xs font-mono text-accent hover:text-orange-400 transition-colors mt-1 block">
              Back to today
            </button>
          )}
        </div>
        <button
          onClick={() => onDateChange(offsetDate(date, 1))}
          disabled={date >= TODAY}
          className="text-muted hover:text-accent transition-colors p-1 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'KCAL', value: totalKcal, target: KCAL_TARGET, unit: '' },
          { label: 'PROTEIN', value: totalProtein, target: PROTEIN_TARGET, unit: 'g' },
          { label: 'TRAINING', value: totalTrainMin, target: 60, unit: 'm' },
          { label: 'FASTING', value: fastHours, target: 16, unit: 'h' },
          ...(log.steps ? [{ label: 'STEPS', value: log.steps, target: 10000, unit: '' }] : []),
          ...(log.readinessScore ? [{ label: 'READINESS', value: log.readinessScore, target: 85, unit: '' }] : []),
        ].map(({ label, value, target, unit }) => {
          const pct = value != null ? Math.min((value / target) * 100, 100) : 0
          const hit = value != null && value >= target
          return (
            <div key={label} className="bg-surface border border-border rounded-xl p-3 space-y-2">
              <p className="text-xs font-mono text-subtle uppercase tracking-wider">{label}</p>
              <p className={`font-display text-2xl tracking-wider ${hit ? 'text-accent' : 'text-text'}`}>
                {value ?? '—'}{value != null ? unit : ''}
              </p>
              <div className="h-0.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${hit ? 'bg-accent' : 'bg-muted'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Weight */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-mono text-subtle uppercase tracking-widest">Weight</p>
          {editingWeight ? (
            <input
              autoFocus
              type="number"
              step="0.1"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onBlur={saveWeight}
              onKeyDown={e => e.key === 'Enter' && saveWeight()}
              className="bg-transparent font-display text-4xl text-accent tracking-wider w-32 focus:outline-none"
            />
          ) : (
            <button onClick={() => setEditingWeight(true)} className="group flex items-baseline gap-2">
              <span className="font-display text-4xl text-accent tracking-wider">
                {log.weight ?? '—'}
              </span>
              <span className="text-subtle font-mono text-sm">kg</span>
            </button>
          )}
        </div>
        {toGoal != null && (
          <div className="text-right">
            <p className="text-xs font-mono text-subtle uppercase tracking-widest">To goal</p>
            <p className="font-display text-2xl text-muted tracking-wider">{toGoal}kg</p>
            <p className="text-xs font-mono text-subtle">→ {GOAL_WEIGHT}kg</p>
          </div>
        )}
      </div>

      {/* Fasting window */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-accent" />
            <p className="text-xs font-mono text-subtle uppercase tracking-widest">Fasting Window</p>
          </div>
          {fastHours && (
            <span className="font-display text-accent tracking-wider text-lg">{fastHours}h</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Fast starts</label>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="time"
                value={log.fastingWindow?.open || ''}
                onChange={e => onUpdate(prev => ({ ...prev, fastingWindow: { ...prev.fastingWindow, open: e.target.value } }))}
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
              />
              {!log.fastingWindow?.open && (
                <button onClick={openFast} className="text-xs font-mono text-accent hover:text-orange-400 whitespace-nowrap transition-colors">
                  Now
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Fast breaks</label>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="time"
                value={log.fastingWindow?.close || ''}
                onChange={e => onUpdate(prev => ({
                  ...prev,
                  fastingWindow: {
                    ...prev.fastingWindow,
                    close: e.target.value,
                    closeNextDay: prev.fastingWindow?.closeNextDay ?? true,
                  }
                }))}
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
              />
              {log.fastingWindow?.open && !log.fastingWindow?.close && (
                <button onClick={closeFast} className="text-xs font-mono text-accent hover:text-orange-400 whitespace-nowrap transition-colors">
                  Now
                </button>
              )}
            </div>
            <label className={`flex items-center gap-2 mt-2 cursor-pointer w-fit ${log.fastingWindow?.close ? 'visible' : 'invisible'}`}>
              <input
                type="checkbox"
                checked={log.fastingWindow?.closeNextDay ?? true}
                onChange={e => onUpdate(prev => ({ ...prev, fastingWindow: { ...prev.fastingWindow, closeNextDay: e.target.checked } }))}
                className="accent-orange-500 w-3 h-3"
              />
              <span className="text-xs font-mono text-subtle">next day</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Log */}
      <QuickLogInput
        onAddMeals={meals => onUpdate(prev => ({ ...prev, meals: [...prev.meals, ...meals] }))}
        onAddTraining={training => onUpdate(prev => ({ ...prev, training: [...prev.training, ...training] }))}
        onUpdateFasting={fasting => onUpdate(prev => ({ ...prev, fastingWindow: { ...prev.fastingWindow, ...fasting } }))}
      />

      {/* Oura */}
      <OuraImport
        date={date}
        onAddTraining={training => onUpdate(prev => ({ ...prev, training: [...prev.training, ...training] }))}
        onUpdateActivity={activity => onUpdate(prev => ({ ...prev, ...activity }))}
      />

      {/* Meals */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={14} className="text-accent" />
            <p className="text-xs font-mono text-subtle uppercase tracking-widest">Meals</p>
          </div>
          <button
            onClick={() => setShowMealModal(true)}
            className="flex items-center gap-1 text-xs font-mono text-accent hover:text-orange-400 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {log.meals.length === 0 ? (
          <p className="text-subtle text-sm font-mono text-center py-4">No meals logged yet</p>
        ) : (
          <div className="space-y-2">
            {log.meals.map(meal => (
              <div key={meal.id} className="flex items-center gap-3 group">
                <span className="font-mono text-xs text-muted w-10 shrink-0">{meal.time}</span>
                <span className="text-sm text-text flex-1">{meal.description}</span>
                <span className="font-mono text-xs text-subtle shrink-0">{meal.kcal}kcal</span>
                <span className="font-mono text-xs text-accent shrink-0">{meal.protein}g</span>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Training */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell size={14} className="text-accent" />
            <p className="text-xs font-mono text-subtle uppercase tracking-widest">Training</p>
          </div>
          <button
            onClick={() => setShowTrainModal(true)}
            className="flex items-center gap-1 text-xs font-mono text-accent hover:text-orange-400 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {log.training.length === 0 ? (
          <p className="text-subtle text-sm font-mono text-center py-4">No training logged yet</p>
        ) : (
          <div className="space-y-2">
            {log.training.map(t => (
              <div key={t.id} className="flex items-center gap-3 group">
                <span className="text-sm text-text flex-1">{t.type}</span>
                <span className="font-mono text-xs text-subtle">{t.duration}min</span>
                <button
                  onClick={() => removeTraining(t.id)}
                  className="text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMealModal && <AddMealModal onAdd={addMeal} onClose={() => setShowMealModal(false)} />}
      {showTrainModal && <AddTrainingModal onAdd={addTraining} onClose={() => setShowTrainModal(false)} />}
    </div>
  )
}
