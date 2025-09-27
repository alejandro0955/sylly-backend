import { useEffect, useState } from 'react'
import { api } from '../api/client'

export function useSchools() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await api.get('/api/public/schools')
        if (!mounted) return
        setSchools(Array.isArray(resp.schools) ? resp.schools : [])
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Failed to load schools')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return { schools, loading, error }
}