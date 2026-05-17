import { useState, useCallback } from 'react'
import { fetchLogs, saveLogs, getConfig } from '../utils/github'

const today = () => new Date().toISOString().slice(0, 10)

function emptyDay(date) {
  return {
    date,
    weight: null,
    fastingWindow: { open: null, close: null },
    meals: [],
    training: [],
  }
}

export function useHealthData() {
  const [allLogs, setAllLogs] = useState([])
  const [sha, setSha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    const { token } = getConfig()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchLogs()
      setAllLogs(data.logs || [])
      setSha(data.sha || null)
      setReady(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load once on mount
  useState(() => { load() })

  const todayLog = allLogs.find(l => l.date === today()) || emptyDay(today())

  const updateToday = useCallback(async (updater) => {
    const current = allLogs.find(l => l.date === today()) || emptyDay(today())
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
    const exists = allLogs.some(l => l.date === today())
    const newLogs = exists
      ? allLogs.map(l => l.date === today() ? updated : l)
      : [...allLogs, updated]

    setAllLogs(newLogs)

    const { token } = getConfig()
    if (!token) return

    try {
      setSyncing(true)
      setError(null)
      const newSha = await saveLogs(newLogs, sha)
      setSha(newSha)
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }, [allLogs, sha])

  return { todayLog, allLogs, loading, syncing, error, updateToday, reload: load, ready }
}
