const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const api = {
  async request(path, { method='GET', body } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error(await res.text() || res.statusText)
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  },
  get: (p) => api.request(p),
  post: (p, b) => api.request(p, { method: 'POST', body: b }),
  patch: (p, b) => api.request(p, { method: 'PATCH', body: b }),
  del: (p) => api.request(p, { method: 'DELETE' }),
}
