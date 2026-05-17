const OURA_BASE = 'https://api.ouraring.com/v2'

function getOuraToken() {
  return (localStorage.getItem('oura_token') || '').trim()
}

function headers() {
  return { Authorization: `Bearer ${getOuraToken()}` }
}

function toDate(datetimeStr) {
  return datetimeStr?.slice(0, 10)
}

function toTime(datetimeStr) {
  if (!datetimeStr) return null
  const d = new Date(datetimeStr)
  return d.toTimeString().slice(0, 5)
}

function durationMins(seconds) {
  return seconds ? Math.round(seconds / 60) : 0
}

const ACTIVITY_LABELS = {
  walking: 'Walk', running: 'Run', cycling: 'Cycling', swimming: 'Swimming',
  strength_training: 'Weights', yoga: 'Yoga', hiit: 'HIIT', elliptical: 'Elliptical',
  rowing: 'Rowing', stair_climbing: 'Stair Climb', high_intensity_interval_training: 'HIIT',
  functional_training: 'Functional Training', stretching: 'Stretching',
}

export async function fetchOuraDayData(date) {
  const token = getOuraToken()
  if (!token) throw new Error('No Oura token configured')

  const params = `?start_date=${date}&end_date=${date}`

  const [activityRes, workoutRes, readinessRes] = await Promise.all([
    fetch(`${OURA_BASE}/usercollection/daily_activity${params}`, { headers: headers() }),
    fetch(`${OURA_BASE}/usercollection/workout${params}`, { headers: headers() }),
    fetch(`${OURA_BASE}/usercollection/daily_readiness${params}`, { headers: headers() }),
  ])

  const [activityData, workoutData, readinessData] = await Promise.all([
    activityRes.ok ? activityRes.json() : { data: [] },
    workoutRes.ok ? workoutRes.json() : { data: [] },
    readinessRes.ok ? readinessRes.json() : { data: [] },
  ])

  const activity = activityData.data?.[0] || null
  const readiness = readinessData.data?.[0] || null

  const workouts = (workoutData.data || []).map(w => ({
    id: crypto.randomUUID(),
    type: ACTIVITY_LABELS[w.activity] || w.activity || 'Workout',
    duration: durationMins(w.duration),
    time: toTime(w.start_datetime),
    calories: w.calories || 0,
    source: 'oura',
  }))

  return {
    steps: activity?.steps || 0,
    activeCalories: activity?.active_calories || 0,
    totalCalories: activity?.total_calories || 0,
    activityScore: activity?.score || null,
    readinessScore: readiness?.score || null,
    workouts,
  }
}

export { getOuraToken }
