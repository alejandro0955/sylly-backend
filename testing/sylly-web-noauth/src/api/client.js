const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
      const text = await res.text()
      throw new Error(text || res.statusText)
    }

    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  },
  get: (p) => api.request(p),
  post: (p, b) => api.request(p, { method: 'POST', body: b }),
  patch: (p, b) => api.request(p, { method: 'PATCH', body: b }),
  del: (p) => api.request(p, { method: 'DELETE' }),
}