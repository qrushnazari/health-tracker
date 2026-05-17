import { useState, useCallback } from 'react'
import { fetchLogs, saveLogs, getConfig } from '../utils/github'

export const today = () => new Date().toISOString().slice(0, 10)

export function emptyDay(date) {
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

  const load = useCallback(async () => {
    const { token } = getConfig()
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchLogs()
      setAllLogs(data.logs || [])
      setSha(data.sha || null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { load() })

  const getLog = useCallback((date) => {
    return allLogs.find(l => l.date === date) || emptyDay(date)
  }, [allLogs])

  const updateLog = useCallback(async (date, updater) => {
    setAllLogs(prev => {
      const current = prev.find(l => l.date === date) || emptyDay(date)
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      const exists = prev.some(l => l.date === date)
      const newLogs = exists
        ? prev.map(l => l.date === date ? updated : l)
        : [...prev, updated].sort((a, b) => a.date.localeCompare(b.date))

      const { token } = getConfig()
      if (token) {
        saveLogs(newLogs, sha)
          .then(newSha => setSha(newSha))
          .catch(e => setError(e.message))
          .finally(() => setSyncing(false))
        setSyncing(true)
      }

      return newLogs
    })
  }, [sha])

  const todayLog = allLogs.find(l => l.date === today()) || emptyDay(today())

  return { todayLog, allLogs, getLog, loading, syncing, error, updateLog, reload: load }
}
