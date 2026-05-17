import { useState } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function SettingsView({ onReload }) {
  const [token, setToken] = useState(localStorage.getItem('ht_token') || '')
  const [owner, setOwner] = useState(localStorage.getItem('ht_owner') || 'qrushnazari')
  const [repo, setRepo] = useState(localStorage.getItem('ht_repo') || 'health-tracker-data')
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem('ht_token', token.trim())
    localStorage.setItem('ht_owner', owner.trim())
    localStorage.setItem('ht_repo', repo.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onReload() }, 500)
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-mono text-subtle leading-relaxed">
          Data is stored as <span className="text-accent">logs.json</span> in your GitHub repo.
          Generate a fine-grained token at <span className="text-accent">github.com/settings/tokens</span> with <span className="text-accent">Contents: Read &amp; Write</span> on the <span className="text-accent">health-tracker-data</span> repo.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">GitHub Owner</label>
            <input
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Repository Name</label>
            <input
              value={repo}
              onChange={e => setRepo(e.target.value)}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Personal Access Token</label>
            <div className="relative mt-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 pr-10 text-text font-mono text-sm focus:border-accent focus:outline-none"
              />
              <button
                onClick={() => setShowToken(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors"
              >
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className="w-full bg-accent hover:bg-orange-500 text-black font-display tracking-widest text-lg py-3 rounded-xl transition-colors"
        >
          {saved ? 'SAVED' : 'SAVE & CONNECT'}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 space-y-2">
        <p className="text-xs font-mono text-subtle uppercase tracking-wider">Targets</p>
        {[
          { label: 'Goal weight', value: '76 kg' },
          { label: 'Daily kcal', value: '1900 kcal' },
          { label: 'Daily protein', value: '150 g' },
          { label: 'Fasting target', value: '16 h' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
            <span className="text-sm font-mono text-subtle">{label}</span>
            <span className="font-mono text-sm text-accent">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onReload}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-subtle font-mono text-sm hover:border-accent hover:text-accent transition-all"
      >
        <RefreshCw size={14} /> Reload data from GitHub
      </button>
    </div>
  )
}
