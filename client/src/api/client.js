// Small fetch wrapper used by every API call.
// In development, Vite forwards /api to the Express server (see vite.config.js).
const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'cms_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export async function apiRequest(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    }
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('Could not reach the server. Check your internet connection and try again.')
  }

  const data = await response.json().catch(() => null)

  if (response.status === 401 && token) {
    // Token expired or account deactivated: tell the app to log out
    tokenStore.clear()
    window.dispatchEvent(new Event('auth:expired'))
  }

  if (!response.ok) {
    // 502 to 504 come from the proxy when the API itself is down or restarting
    const fallback =
      response.status >= 502 && response.status <= 504
        ? 'The server is not responding right now. Please try again in a moment.'
        : `Something went wrong (error ${response.status})`
    const error = new Error(data?.message || fallback)
    error.status = response.status
    throw error
  }

  return data
}
