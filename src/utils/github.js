const BASE = 'https://api.github.com'

function getConfig() {
  return {
    token: localStorage.getItem('ht_token'),
    owner: localStorage.getItem('ht_owner') || 'qrushnazari',
    repo: localStorage.getItem('ht_repo') || 'health-tracker-data',
    path: 'logs.json',
  }
}

async function fetchLogs() {
  const { token, owner, repo, path } = getConfig()
  if (!token) return { logs: [] }

  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
  })

  if (res.status === 404) return { logs: [], sha: null }
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`)

  const data = await res.json()
  const content = JSON.parse(atob(data.content.replace(/\n/g, '')))
  return { ...content, sha: data.sha }
}

async function saveLogs(logs, sha) {
  const { token, owner, repo, path } = getConfig()
  if (!token) throw new Error('No GitHub token configured')

  const content = btoa(JSON.stringify({ logs }, null, 2))
  const body = {
    message: `Update logs ${new Date().toISOString().slice(0, 10)}`,
    content,
    ...(sha ? { sha } : {}),
  }

  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `GitHub save failed: ${res.status}`)
  }
  const data = await res.json()
  return data.content.sha
}

export { fetchLogs, saveLogs, getConfig }
