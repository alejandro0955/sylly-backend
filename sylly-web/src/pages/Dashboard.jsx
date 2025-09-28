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

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'TBD';

    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays > 1 && diffInDays <= 7) return `In ${diffInDays} days`;
    if (diffInDays < 0 && diffInDays >= -1) return 'Recently passed';
    return date.toLocaleDateString();
  };

  const getEventIcon = (summary) => {
    const s = summary.toLowerCase();
    if (s.includes('exam') || s.includes('test') || s.includes('midterm') || s.includes('final')) return '📝';
    if (s.includes('assignment') || s.includes('homework') || s.includes('project')) return '📋';
    if (s.includes('lecture') || s.includes('class')) return '🎓';
    if (s.includes('quiz')) return '❓';
    if (s.includes('lab')) return '🔬';
    if (s.includes('presentation')) return '📊';
    return '📅';
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <h3>📅 Upcoming Events</h3>
        {loading && (
          <div className="empty-state">
            <div className="loading-skeleton" style={{ height: '20px', width: '200px', margin: '0 auto' }}></div>
            <div className="muted" style={{ marginTop: 8 }}>Loading your schedule...</div>
          </div>
        )}
        {error && !loading && (
          <div className="status-error">
            <strong>Unable to load events</strong><br />
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <h3>No upcoming events</h3>
            <p>Generate a schedule from one of your syllabi to see your upcoming assignments and exams here.</p>
          </div>
        )}
        {!loading && events.length > 0 && (
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            {events.map((event, index) => (
              <div key={`${event.syllabusId}-${index}`} className="event-card">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div className="badge">{event.syllabusTitle || 'Untitled Course'}</div>
                  <div className="muted text-sm">{formatRelativeTime(event.start?.dateTime || event.start?.date)}</div>
                </div>
                <div className="row" style={{ gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px' }}>{getEventIcon(event.summary)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{event.summary}</div>
                    <div className="muted text-sm">{formatDateRange(event)}</div>
                    {event.location && <div className="muted text-sm">📍 {event.location}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

