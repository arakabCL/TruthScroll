const TOKEN_KEY = 'truthscroll_token_v1'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {}
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const api = {
  signup: (username, password) => request('/api/auth/signup', { method: 'POST', body: { username, password } }),
  login:  (username, password) => request('/api/auth/login',  { method: 'POST', body: { username, password } }),
  me:     () => request('/api/auth/me', { auth: true }),
  syncProgress: (progress) => request('/api/progress', { method: 'POST', body: progress, auth: true }),
  leaderboard:  () => request('/api/leaderboard'),
}
