const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim()
if (!rawBase) {
  throw new Error('VITE_API_BASE_URL is not configured. Set it in your environment.')
}
const API_BASE = rawBase.replace(/\/+$/, '')

let tokenSupplier = null

export function setAccessTokenSupplier(fn) {
  tokenSupplier = typeof fn === 'function' ? fn : null
}

export const api = {
  async request(path, { method = 'GET', body } = {}) {
    const headers = { 'content-type': 'application/json' }
    if (tokenSupplier) {
      try {
        const token = await tokenSupplier()
        if (token) headers.Authorization = `Bearer ${token}`
      } catch (err) {
        console.warn('Failed to fetch access token', err)
      }
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const raw = await res.text()
      let message = raw || res.statusText || 'Request failed'
      let code
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          message = parsed.error || parsed.message || message
          code = parsed.code
        } catch (err) {
          // leave message as-is when body is not JSON
        }
      }
      const error = new Error(message)
      error.status = res.status
      if (code) error.code = code
      throw error
    }

    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  },
  get: (p) => api.request(p),
  post: (p, b) => api.request(p, { method: 'POST', body: b }),
  patch: (p, b) => api.request(p, { method: 'PATCH', body: b }),
  del: (p) => api.request(p, { method: 'DELETE' }),
}

