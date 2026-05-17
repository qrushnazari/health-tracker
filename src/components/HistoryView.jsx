import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const GOAL = 76

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2">
      <p className="font-mono text-xs text-subtle">{label}</p>
      <p className="font-display text-xl text-accent tracking-wider">{payload[0].value}kg</p>
    </div>
  )
}

export default function HistoryView({ logs }) {
  const sorted = [...logs]
    .filter(l => l.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(l => ({
      date: l.date.slice(5),
      weight: l.weight,
    }))

  const latest = sorted[sorted.length - 1]?.weight
  const first = sorted[0]?.weight
  const change = latest && first ? (latest - first).toFixed(1) : null

  return (
    <div className="space-y-4 pb-8">
      <div>
        <p className="text-subtle font-mono text-xs uppercase tracking-widest">Last 30 days</p>
        <h1 className="font-display text-5xl text-text tracking-widest leading-none mt-0.5">HISTORY</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs font-mono text-subtle uppercase tracking-wider">Current</p>
          <p className="font-display text-3xl text-accent tracking-wider mt-1">{latest ?? '—'}<span className="text-base text-subtle">kg</span></p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs font-mono text-subtle uppercase tracking-wider">Goal</p>
          <p className="font-display text-3xl text-muted tracking-wider mt-1">{GOAL}<span className="text-base text-subtle">kg</span></p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs font-mono text-subtle uppercase tracking-wider">30d change</p>
          <p className={`font-display text-3xl tracking-wider mt-1 ${change < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change != null ? (change > 0 ? '+' : '') + change : '—'}<span className="text-base text-subtle">kg</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border rounded-xl p-4">
        {sorted.length < 2 ? (
          <p className="text-subtle text-sm font-mono text-center py-8">Log weight daily to see your trend</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sorted} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#8888A0', fontSize: 10, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#8888A0', fontSize: 10, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={GOAL}
                stroke="#F97316"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                label={{ value: `Goal ${GOAL}kg`, fill: '#F97316', fontSize: 10, fontFamily: 'DM Mono', position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ fill: '#F97316', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#F97316', r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Log table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-border">
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Date</span>
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Weight</span>
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Kcal</span>
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">Protein</span>
        </div>
        <div className="divide-y divide-border max-h-64 overflow-y-auto">
          {[...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map(log => {
            const kcal = log.meals?.reduce((s, m) => s + (m.kcal || 0), 0) || 0
            const protein = log.meals?.reduce((s, m) => s + (m.protein || 0), 0) || 0
            return (
              <div key={log.date} className="grid grid-cols-4 px-4 py-2.5">
                <span className="font-mono text-xs text-subtle">{log.date.slice(5)}</span>
                <span className="font-mono text-sm text-text">{log.weight ? `${log.weight}kg` : '—'}</span>
                <span className="font-mono text-xs text-subtle">{kcal || '—'}</span>
                <span className="font-mono text-xs text-accent">{protein ? `${protein}g` : '—'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
