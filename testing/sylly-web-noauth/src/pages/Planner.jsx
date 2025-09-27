import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Planner(){
  const [syllabusId,setSyllabusId]=useState('')
  const [events,setEvents]=useState([])
  const [status,setStatus]=useState('')
  const [googleConnected,setGoogleConnected]=useState(false)
  const [googleEmail,setGoogleEmail]=useState('')

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

  async function plan(e){
    e.preventDefault()
    if(!syllabusId.trim()){
      setStatus('Enter a syllabus ID first.')
      return
    }
    try{
      setStatus('Loading saved events (or generating them with Gemini)...')
      const r=await api.post('/api/planner/plan',{ syllabusId })
      setEvents(r.events || [])
      setStatus(r.events?.length ? `Loaded ${r.events.length} events.` : 'No events found for that syllabus yet.')
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
    if(!syllabusId.trim()){
      setStatus('Enter a syllabus ID to push events for.')
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

  return (<div>
    <h2>Planner</h2>
    <div className="card" style={{marginBottom:16}}>
      <h3>Google Calendar</h3>
      <div className="row" style={{gap:12, alignItems:'center'}}>
        <span className="muted">{googleConnected?`Connected${googleEmail?` as ${googleEmail}`:''}`:'Not connected'}</span>
        <button type="button" onClick={connectGoogle}>
          {googleConnected?'Reconnect Google Calendar':'Connect Google Calendar'}
        </button>
        <button type="button" onClick={pushToGoogle} disabled={!googleConnected}>
          Add events to Google Calendar
        </button>
      </div>
    </div>
    <form onSubmit={plan} className="card">
      <div className="row">
        <input placeholder="Syllabus ID" value={syllabusId} onChange={e=>setSyllabusId(e.target.value)} style={{width:'60%'}} />
        <button type="submit">Fetch Calendar Events</button>
      </div>
      {status && <div className="muted" style={{marginTop:12}}>{status}</div>}
    </form>
    {events.length>0 && <div className="card">
      <h3>Calendar Events</h3>
      <table><thead><tr><th>Title</th><th>Start</th><th>End</th></tr></thead><tbody>
        {events.map((evt,i)=>(<tr key={i}>
          <td>{evt.summary}</td>
          <td>{evt.start?.dateTime || evt.start?.date || ''}</td>
          <td>{evt.end?.dateTime || evt.end?.date || ''}</td>
        </tr>))}
      </tbody></table>
    </div>}
  </div>)
}