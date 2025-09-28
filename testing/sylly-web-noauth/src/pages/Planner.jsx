import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useMySyllabi } from '../hooks/useMySyllabi'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default function Planner(){
  const { syllabi, loading: loadingSyllabi, error: syllabiError, refresh: refreshSyllabi } = useMySyllabi()
  const [syllabusId,setSyllabusId]=useState('')
  const [events,setEvents]=useState([])
  const [status,setStatus]=useState('')
  const [googleConnected,setGoogleConnected]=useState(false)
  const [googleEmail,setGoogleEmail]=useState('')

  const [sessionMinutes, setSessionMinutes] = useState('60')
  const [sessionCount, setSessionCount] = useState('3')
  const [suggestions, setSuggestions] = useState([])
  const [suggestStatus, setSuggestStatus] = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    if(params.get('google')==='connected'){
      setGoogleConnected(true)
      setStatus('Google Calendar connected.')
      params.delete('google')
      const newQuery=params.toString()
      const newUrl=`${window.location.pathname}${newQuery?`?${newQuery}`:''}`
      window.history.replaceState({},'',newUrl)
    }
    (async()=>{
      try{
        const resp=await api.get('/api/google/status')
        setGoogleConnected(Boolean(resp.connected))
        setGoogleEmail(resp.email||'')
      }catch(err){
        console.warn('Failed to load Google status',err)
      }
    })()
  },[])

  useEffect(()=>{
    if(syllabi.length>0){
      setSyllabusId(prev=>prev || syllabi[0].id)
    } else {
      setSyllabusId('')
    }
  },[syllabi])

  useEffect(() => {
    setSuggestions([])
    setSuggestStatus('')
  }, [syllabusId])

  const activeSyllabus = useMemo(()=>syllabi.find(s=>s.id===syllabusId) || null,[syllabi, syllabusId])

  async function plan(e){
    e.preventDefault()
    if(!syllabusId){
      setStatus('Add a syllabus first, then select it here.')
      return
    }
    try{
      setStatus('Loading saved events (or generating them with Gemini)...')
      const r=await api.post('/api/planner/plan',{ syllabusId })
      setEvents(r.events || [])
      setStatus(r.events?.length ? `Loaded ${r.events.length} events.` : 'No events found for that syllabus yet.')
      refreshSyllabi()
    }catch(err){
      setStatus(`Failed to load events: ${err.message}`)
    }
  }

  async function connectGoogle(){
    try{
      setStatus('Redirecting to Google for authorization...')
      const currentPath=window.location.pathname + window.location.search
      const { url }=await api.get(`/api/google/oauth/url?continue=${encodeURIComponent(currentPath)}`)
      window.location.href=url
    }catch(err){
      setStatus(`Failed to start Google authorization: ${err.message}`)
    }
  }

  async function pushToGoogle(){
    if(!googleConnected){
      setStatus('Connect Google Calendar first.')
      return
    }
    if(!syllabusId){
      setStatus('Select a syllabus to push events for.')
      return
    }
    try{
      setStatus('Pushing events to Google Calendar...')
      const response=await api.post('/api/google/calendar/push',{ syllabusId })
      const successCount=response.pushed || 0
      const failureCount=response.failures?.length || 0
      setStatus(`Added ${successCount} events to Google Calendar.${failureCount?` ${failureCount} failed.`:''}`)
      if(failureCount){
        console.warn('Google Calendar push failures',response.failures)
      }
    }catch(err){
      setStatus(`Failed to push events: ${err.message}`)
    }
  }

  async function suggestStudy(e){
    e?.preventDefault?.()
    if(!syllabusId){
      setSuggestStatus('Select a course first.')
      return
    }
    const minutes = Number(sessionMinutes)
    const count = Number(sessionCount)
    if(!Number.isFinite(minutes) || !Number.isFinite(count) || minutes <= 0 || count <= 0){
      setSuggestStatus('Enter a valid session length and count before requesting suggestions.')
      return
    }
    try{
      setSuggestLoading(true)
      setSuggestStatus('Calculating study sessions...')
      const resp = await api.post('/api/planner/study-suggestions', {
        syllabusId,
        sessionMinutes: minutes,
        sessionCount: count,
      })
      const nextSuggestions = resp.suggestions || []
      setSuggestions(nextSuggestions)
      setSuggestStatus(nextSuggestions.length ? `Suggested ${nextSuggestions.length} session${nextSuggestions.length===1?'':'s'}.` : 'No free time slots were available in the next two weeks.')
    }catch(err){
      setSuggestStatus(`Failed to suggest study time: ${err.message}`)
      setSuggestions([])
    }finally{
      setSuggestLoading(false)
    }
  }

  async function pushStudySessions(){
    if(!googleConnected){
      setSuggestStatus('Connect Google Calendar before adding study sessions.')
      return
    }
    if(suggestions.length===0){
      setSuggestStatus('Generate study suggestions first.')
      return
    }
    try{
      setSuggestStatus('Adding study sessions to Google Calendar...')
      const resp = await api.post('/api/planner/study-sessions/push', { events: suggestions })
      const pushed = resp.pushed || 0
      const failed = resp.failures?.length || 0
      setSuggestStatus(`Added ${pushed} study session${pushed===1?'':'s'} to Google Calendar.${failed?` ${failed} failed.`:''}`)
      if(failed){
        console.warn('Study session push failures', resp.failures)
      }
      if(pushed){
        refreshSyllabi()
      }
    }catch(err){
      setSuggestStatus(`Failed to add study sessions: ${err.message}`)
    }
  }

  return (
    <div>
      <h2>Planner</h2>
      <div className="card" style={{marginBottom:16}}>
        <h3>Google Calendar</h3>
        <div className="row" style={{gap:12, alignItems:'center'}}>
          <span className="muted">{googleConnected?`Connected${googleEmail?` as ${googleEmail}`:''}`:'Not connected'}</span>
          <button type="button" onClick={connectGoogle}>
            {googleConnected?'Reconnect Google Calendar':'Connect Google Calendar'}
          </button>
          <button type="button" onClick={pushToGoogle} disabled={!googleConnected || !syllabusId}>
            Add events to Google Calendar
          </button>
        </div>
      </div>
      <form onSubmit={plan} className="card">
        <div className="grid" style={{gap:12}}>
          <div className="row" style={{gap:12, alignItems:'center'}}>
            <label className="muted" htmlFor="syllabus-select">Course</label>
            <select
              id="syllabus-select"
              value={syllabusId}
              onChange={e=>setSyllabusId(e.target.value)}
              disabled={loadingSyllabi || syllabi.length===0}
              style={{minWidth:'260px'}}
            >
              {syllabi.length===0 && <option value="">No syllabi yet</option>}
              {syllabi.map((s)=> (
                <option key={s.id} value={s.id}>
                  {s.title || 'Untitled'}{s.professor ? ` - ${s.professor}` : ''}
                </option>
              ))}
            </select>
          </div>
          {syllabiError && <div className="text-sm text-red-600">{syllabiError}</div>}
          {loadingSyllabi && <div className="muted">Loading courses...</div>}
          <button type="submit" disabled={!syllabusId}>Fetch Calendar Events</button>
          {status && <div className="muted" style={{marginTop:4}}>{status}</div>}
        </div>
      </form>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Suggested Study Sessions</h3>
        <form className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }} onSubmit={suggestStudy}>
          <div>
            <label className="muted" htmlFor="session-minutes">Session length (minutes)</label>
            <input
              id="session-minutes"
              type="number"
              min="15"
              max="240"
              step="15"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(e.target.value)}
              style={{ width: 120 }}
            />
          </div>
          <div>
            <label className="muted" htmlFor="session-count">Sessions</label>
            <input
              id="session-count"
              type="number"
              min="1"
              max="20"
              value={sessionCount}
              onChange={(e) => setSessionCount(e.target.value)}
              style={{ width: 120 }}
            />
          </div>
          <button type="submit" disabled={suggestLoading || !syllabusId}>
            {suggestLoading ? 'Calculating...' : 'Suggest Study Sessions'}
          </button>
          <button
            type="button"
            onClick={pushStudySessions}
            disabled={!googleConnected || suggestions.length===0 || suggestLoading}
          >
            Add study sessions to Google Calendar
          </button>
        </form>
        {suggestStatus && <div className="muted" style={{ marginTop: 12 }}>{suggestStatus}</div>}
        {suggestions.length>0 && (
          <table style={{ width: '100%', marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Summary</th>
                <th style={{ textAlign: 'left' }}>Start</th>
                <th style={{ textAlign: 'left' }}>End</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((event, index) => (
                <tr key={`${event.summary}-${index}`}>
                  <td>{event.summary}</td>
                  <td>{formatDateTime(event.start?.dateTime || event.start?.date)}</td>
                  <td>{formatDateTime(event.end?.dateTime || event.end?.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {events.length>0 && <div className="card" style={{ marginTop: 16 }}>
        <h3>Calendar Events {activeSyllabus ? `for ${activeSyllabus.title || 'Untitled'}` : ''}</h3>
        <table><thead><tr><th>Title</th><th>Start</th><th>End</th></tr></thead><tbody>
          {events.map((evt,i)=>(<tr key={i}>
            <td>{evt.summary}</td>
            <td>{evt.start?.dateTime || evt.start?.date || ''}</td>
            <td>{evt.end?.dateTime || evt.end?.date || ''}</td>
          </tr>))}
        </tbody></table>
      </div>}
    </div>
  )
}

