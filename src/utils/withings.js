const WITHINGS_AUTH_URL = 'https://account.withings.com/oauth2_user/authorize2'
const WITHINGS_TOKEN_URL = 'https://wbsapi.withings.net/v2/oauth2'
const WITHINGS_MEASURE_URL = 'https://wbsapi.withings.net/measure'
const REDIRECT_URI = 'https://qrushnazari.github.io/health-tracker/'

function getWithingsConfig() {
  return {
    clientId: (localStorage.getItem('withings_client_id') || '').trim(),
    clientSecret: (localStorage.getItem('withings_client_secret') || '').trim(),
    accessToken: localStorage.getItem('withings_access_token'),
    refreshToken: localStorage.getItem('withings_refresh_token'),
  }
}

function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('withings_access_token', accessToken)
  localStorage.setItem('withings_refresh_token', refreshToken)
}

function startOAuth() {
  const { clientId } = getWithingsConfig()
  if (!clientId) throw new Error('No Withings client ID configured')
  const state = crypto.randomUUID()
  localStorage.setItem('withings_oauth_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: 'user.metrics',
    state,
  })
  window.location.href = `${WITHINGS_AUTH_URL}?${params}`
}

async function handleOAuthCallback(code, state) {
  const savedState = localStorage.getItem('withings_oauth_state')
  if (state !== savedState) throw new Error('OAuth state mismatch')
  localStorage.removeItem('withings_oauth_state')

  const { clientId, clientSecret } = getWithingsConfig()
  const params = new URLSearchParams({
    action: 'requesttoken',
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: REDIRECT_URI,
  })

  const res = await fetch(WITHINGS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  const data = await res.json()
  if (data.status !== 0) throw new Error(`Withings auth failed: ${data.error}`)

  saveTokens(data.body.access_token, data.body.refresh_token)
  return data.body.access_token
}

async function refreshAccessToken() {
  const { clientId, clientSecret, refreshToken } = getWithingsConfig()
  if (!refreshToken) throw new Error('No refresh token')

  const params = new URLSearchParams({
    action: 'requesttoken',
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const res = await fetch(WITHINGS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  const data = await res.json()
  if (data.status !== 0) throw new Error(`Token refresh failed: ${data.error}`)

  saveTokens(data.body.access_token, data.body.refresh_token)
  return data.body.access_token
}

async function fetchLatestWeight() {
  let { accessToken } = getWithingsConfig()
  if (!accessToken) throw new Error('Not connected to Withings')

  async function doFetch(token) {
    const params = new URLSearchParams({
      action: 'getmeas',
      meastype: '1', // weight in kg
      category: '1',
      lastupdate: Math.floor(Date.now() / 1000) - 86400 * 7, // last 7 days
    })
    const res = await fetch(`${WITHINGS_MEASURE_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json()
  }

  let data = await doFetch(accessToken)

  if (data.status === 401) {
    accessToken = await refreshAccessToken()
    data = await doFetch(accessToken)
  }

  if (data.status !== 0) throw new Error(`Withings fetch failed: ${data.error}`)

  const groups = data.body?.measuregrps
  if (!groups?.length) return null

  const latest = groups[0].measures.find(m => m.type === 1)
  if (!latest) return null

  return latest.value * Math.pow(10, latest.unit)
}

export { getWithingsConfig, startOAuth, handleOAuthCallback, fetchLatestWeight }
