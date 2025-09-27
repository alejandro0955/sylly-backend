import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'

export function useMySyllabi() {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await api.get('/api/syllabi')
      setSyllabi(resp.syllabi || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load syllabi')
      setSyllabi([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { syllabi, loading, error, refresh: load }
}