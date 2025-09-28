import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { api } from '../api/client'

const audience = import.meta.env.VITE_AUTH0_AUDIENCE

function formatDateRange(event) {
  const start = event.start?.dateTime || event.start?.date
  const end = event.end?.dateTime || event.end?.date
  const startDate = start ? new Date(start) : null
  const endDate = end ? new Date(end) : null

  const startString = startDate && !Number.isNaN(startDate.getTime()) ? startDate.toLocaleString() : 'TBD'
  const endString = endDate && !Number.isNaN(endDate.getTime()) ? endDate.toLocaleString() : ''

  return endString ? `${startString} - ${endString}` : startString
}

export default function Dashboard(){
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [events,setEvents]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let cancelled = false

    if(!isAuthenticated){
      setLoading(false)
      setEvents([])
      return
    }

    async function load(){
      setLoading(true)
      try {
        await getAccessTokenSilently({
          authorizationParams: audience ? { audience } : undefined,
        })
        const resp = await api.get('/api/planner/events')
        if(!cancelled){
          setEvents(resp.events || [])
          setError('')
        }
      } catch(err){
        if(!cancelled){
          const status = err?.status
          const code = err?.code
          const message = err?.message || 'Failed to load events'
          const normalized = message.toLowerCase()
          if(status === 401 || status === 400 || code === 'invalid_token' || normalized.includes('invalid request')){
            setError('Please refresh the page after logging in to view your upcoming events.')
          }else{
            setError(message)
          }
          setEvents([])
        }
      } finally {
        if(!cancelled) setLoading(false)
      }
    }

    load()
    return ()=>{ cancelled = true }
  },[isAuthenticated, getAccessTokenSilently])

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <h3>Upcoming events</h3>
        {loading && <div className="muted">Loading...</div>}
        {error && !loading && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && events.length === 0 && (
          <div className="muted">No upcoming events yet. Generate a schedule from one of your syllabi.</div>
        )}
        {!loading && events.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'grid', gap: '12px' }}>
            {events.map((event, index) => (
              <li key={`${event.syllabusId}-${index}`} className="card" style={{ margin: 0 }}>
                <div className="muted text-sm" style={{ marginBottom: 4 }}>{event.syllabusTitle || 'Untitled course'}</div>
                <div style={{ fontWeight: 600 }}>{event.summary}</div>
                <div className="muted text-sm" style={{ marginTop: 4 }}>{formatDateRange(event)}</div>
                {event.location && <div className="muted text-sm">{event.location}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

