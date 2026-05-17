import { useState } from 'react'
import { Eye, EyeOff, RefreshCw, Unplug, Scale } from 'lucide-react'
import { getWithingsConfig, startOAuth } from '../utils/withings'

export default function SettingsView({ onReload }) {
  const [token, setToken] = useState(localStorage.getItem('ht_token') || '')
  const [owner, setOwner] = useState(localStorage.getItem('ht_owner') || 'qrushnazari')
  const [repo, setRepo] = useState(localStorage.getItem('ht_repo') || 'health-tracker-data')
  const [showToken, setShowToken] = useState(false)
  const [ghSaved, setGhSaved] = useState(false)

  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('openai_key') || '')
  const [showOpenai, setShowOpenai] = useState(false)
  const [openaiSaved, setOpenaiSaved] = useState(false)

  const [clientId, setClientId] = useState(localStorage.getItem('withings_client_id') || '')
  const [clientSecret, setClientSecret] = useState(localStorage.getItem('withings_client_secret') || '')
  const [showSecret, setShowSecret] = useState(false)
  const isWithingsConnected = !!localStorage.getItem('withings_access_token')

  function saveGitHub() {
    localStorage.setItem('ht_token', token.trim())
    localStorage.setItem('ht_owner', owner.trim())
    localStorage.setItem('ht_repo', repo.trim())
    setGhSaved(true)
    setTimeout(() => { setGhSaved(false); onReload() }, 500)
  }

  function saveOpenAI() {
    localStorage.setItem('openai_key', openaiKey.trim())
    setOpenaiSaved(true)
    setTimeout(() => setOpenaiSaved(false), 1500)
  }

  function saveWithingsCredentials() {
    localStorage.setItem('withings_client_id', clientId.trim())
    localStorage.setItem('withings_client_secret', clientSecret.trim())
  }

  function connectWithings() {
    saveWithingsCredentials()
    startOAuth()
  }

  function disconnectWithings() {
    localStorage.removeItem('withings_access_token')
    localStorage.removeItem('withings_refresh_token')
    window.location.reload()
  }

  return (
    <div className="space-y-4 pb-8">
      {/* GitHub */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-mono text-subtle uppercase tracking-wider">GitHub Storage</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Owner</label>
            <input value={owner} onChange={e => setOwner(e.target.value)}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Repository</label>
            <input value={repo} onChange={e => setRepo(e.target.value)}
              className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-mono text-subtle uppercase tracking-wider">Access Token</label>
            <div className="relative mt-1">
              <input type={showToken ? 'text' : 'password'} value={token} onChange={e => setToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 pr-10 text-text font-mono text-sm focus:border-accent focus:outline-none" />
              <button onClick={() => setShowToken(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors">
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
        <button onClick={saveGitHub} className="w-full bg-accent hover:bg-orange-500 text-black font-display tracking-widest text-lg py-3 rounded-xl transition-colors">
          {ghSaved ? 'SAVED' : 'SAVE & CONNECT'}
        </button>
      </div>

      {/* OpenAI */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <p className="text-xs font-mono text-subtle uppercase tracking-wider">OpenAI — Quick Log Parser</p>
        <div>
          <label className="text-xs font-mono text-subtle uppercase tracking-wider">API Key</label>
          <div className="relative mt-1">
            <input
              type={showOpenai ? 'text' : 'password'}
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 pr-10 text-text font-mono text-sm focus:border-accent focus:outline-none"
            />
            <button onClick={() => setShowOpenai(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors">
              {showOpenai ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <button onClick={saveOpenAI} className="w-full bg-accent hover:bg-orange-500 text-black font-display tracking-widest text-lg py-3 rounded-xl transition-colors">
          {openaiSaved ? 'SAVED' : 'SAVE KEY'}
        </button>
      </div>

      {/* Withings */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-subtle uppercase tracking-wider">Withings Scale</p>
          {isWithingsConnected && (
            <span className="text-xs font-mono text-green-400">Connected</span>
          )}
        </div>

        {isWithingsConnected ? (
          <button onClick={disconnectWithings}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-subtle font-mono text-sm hover:border-red-500 hover:text-red-400 transition-all">
            <Unplug size={14} /> Disconnect Withings
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-subtle font-mono">Enter your app credentials from developer.withings.com</p>
            <div>
              <label className="text-xs font-mono text-subtle uppercase tracking-wider">Client ID</label>
              <input value={clientId} onChange={e => setClientId(e.target.value)}
                className="w-full mt-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-subtle uppercase tracking-wider">Client Secret</label>
              <div className="relative mt-1">
                <input type={showSecret ? 'text' : 'password'} value={clientSecret} onChange={e => setClientSecret(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 pr-10 text-text font-mono text-sm focus:border-accent focus:outline-none" />
                <button onClick={() => setShowSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors">
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button onClick={connectWithings}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-500 text-black font-display tracking-widest text-lg py-3 rounded-xl transition-colors">
              <Scale size={16} /> CONNECT WITHINGS
            </button>
          </div>
        )}
      </div>

      {/* Targets */}
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

      <button onClick={onReload}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-subtle font-mono text-sm hover:border-accent hover:text-accent transition-all">
        <RefreshCw size={14} /> Reload data from GitHub
      </button>
    </div>
  )
}
