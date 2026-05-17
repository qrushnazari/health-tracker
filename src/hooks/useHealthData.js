import { useState, useCallback, useRef } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  // Use refs so async save callbacks always see the latest values
  const shaRef = useRef(null)
  const logsRef = useRef([])
  const saveTimer = useRef(null)

  const load = useCallback(async () => {
    const { token } = getConfig()
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchLogs()
      const logs = data.logs || []
      setAllLogs(logs)
      logsRef.current = logs
      shaRef.current = data.sha || null
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { load() })

  const getLog = useCallback((date) => {
    return logsRef.current.find(l => l.date === date) || emptyDay(date)
  }, [])

  const scheduleSave = useCallback(() => {
    const { token } = getConfig()
    if (!token) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        setSyncing(true)
        setError(null)
        const newSha = await saveLogs(logsRef.current, shaRef.current)
        shaRef.current = newSha
      } catch (e) {
        setError(e.message)
      } finally {
        setSyncing(false)
      }
    }, 800)
  }, [])

  const updateLog = useCallback((date, updater) => {
    const current = logsRef.current.find(l => l.date === date) || emptyDay(date)
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
    const exists = logsRef.current.some(l => l.date === date)
    const newLogs = exists
      ? logsRef.current.map(l => l.date === date ? updated : l)
      : [...logsRef.current, updated].sort((a, b) => a.date.localeCompare(b.date))

    logsRef.current = newLogs
    setAllLogs([...newLogs])
    scheduleSave()
  }, [scheduleSave])

  const todayLog = allLogs.find(l => l.date === today()) || emptyDay(today())

  return { todayLog, allLogs, getLog, loading, syncing, error, updateLog, reload: load }
}
