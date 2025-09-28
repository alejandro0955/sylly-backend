import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useMySyllabi } from '../hooks/useMySyllabi'

export default function Chat(){
  const { syllabi, loading: loadingSyllabi, error: syllabiError, refresh: refreshSyllabi } = useMySyllabi()
  const [syllabusId,setSyllabusId]=useState('')
  const [question,setQuestion]=useState('When is the midterm?')
  const [answer,setAnswer]=useState(null)
  const [status,setStatus]=useState('')

  useEffect(()=>{
    if(syllabi.length>0){
      setSyllabusId(prev=>prev || syllabi[0].id)
    } else {
      setSyllabusId('')
    }
  },[syllabi])

  const activeSyllabus = useMemo(()=>syllabi.find(s=>s.id===syllabusId) || null,[syllabi,syllabusId])

  async function ask(e){
    e.preventDefault()
    if(!syllabusId){
      setStatus('Select one of your syllabi first.')
      return
    }
    if(!question.trim()){
      setStatus('Type a question to ask.')
      return
    }
    setStatus('Thinking...')
    try{
      const res=await api.post('/api/chat',{ syllabusId, question })
      setAnswer(res)
      setStatus('')
      refreshSyllabi()
    }catch(err){
      setStatus(`Failed to ask: ${err.message}`)
    }
  }

  return (
    <div>
      <h2>Chat</h2>
      <form onSubmit={ask} className="card">
        <div className="grid" style={{gap:12}}>
          <div className="row" style={{gap:12,alignItems:'center'}}>
            <label className="muted" htmlFor="chat-syllabus">Course</label>
            <select
              id="chat-syllabus"
              value={syllabusId}
              onChange={e=>setSyllabusId(e.target.value)}
              disabled={loadingSyllabi || syllabi.length===0}
              style={{minWidth:'240px'}}
            >
              {syllabi.length===0 && <option value="">No syllabi yet</option>}
              {syllabi.map((s)=>(
                <option key={s.id} value={s.id}>
                  {s.title || 'Untitled'}{s.professor ? ` - ${s.professor}` : ''}
                </option>
              ))}
            </select>
          </div>
          {syllabiError && <div className="text-sm text-red-600">{syllabiError}</div>}
          <input placeholder="Your question" value={question} onChange={e=>setQuestion(e.target.value)} style={{width:'100%'}} />
          <button type="submit" disabled={!syllabusId}>Ask</button>
          {status && <div className="muted">{status}</div>}
        </div>
      </form>
      {answer && <div className="card">
        <h3>Answer{activeSyllabus ? ` - ${activeSyllabus.title || 'Untitled'}` : ''}</h3>
        <pre>{JSON.stringify(answer,null,2)}</pre>
      </div>}
    </div>
  )
}