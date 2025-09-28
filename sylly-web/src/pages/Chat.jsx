import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useMySyllabi } from '../hooks/useMySyllabi'

export default function Chat(){
  const { syllabi, loading: loadingSyllabi, error: syllabiError, refresh: refreshSyllabi } = useMySyllabi()
  const [syllabusId,setSyllabusId]=useState('')
  const [question,setQuestion]=useState('When is the midterm?')
  const [answer,setAnswer]=useState("")
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
      setAnswer(typeof res === 'string' ? res : (res && res.answer ? res.answer : ''))
      setStatus('')
      refreshSyllabi()
    }catch(err){
      setStatus(`Failed to ask: ${err.message}`)
    }
  }

  return (
    <div>
      <h2>Chat</h2>
      <div className="card">
        <h3>💬 Ask Questions About Your Syllabi</h3>
        <p className="muted" style={{ marginBottom: '20px' }}>
          Get instant answers about course requirements, due dates, grading policies, and more from your uploaded syllabi.
        </p>

        <form onSubmit={ask} className="grid" style={{gap: 20}}>
          <div>
            <label htmlFor="chat-syllabus">📚 Select Course</label>
            <select
              id="chat-syllabus"
              value={syllabusId}
              onChange={e=>setSyllabusId(e.target.value)}
              disabled={loadingSyllabi || syllabi.length===0}
              style={{ width: '100%' }}
            >
              {syllabi.length===0 && <option value="">No syllabi uploaded yet</option>}
              {syllabi.map((s)=>(
                <option key={s.id} value={s.id}>
                  {s.title || 'Untitled'}{s.professor ? ` - ${s.professor}` : ''}
                </option>
              ))}
            </select>
            {syllabiError && <div className="status-error">{syllabiError}</div>}
          </div>

          <div>
            <label htmlFor="question-input">❓ Your Question</label>
            <input
              id="question-input"
              placeholder="e.g., When is the midterm exam? What's the grading policy?"
              value={question}
              onChange={e=>setQuestion(e.target.value)}
              style={{width:'100%'}}
            />
          </div>

          <button type="submit" disabled={!syllabusId || !question.trim()} style={{ width: '100%' }}>
            🚀 Ask Question
          </button>

          {status && (
            <div className={status.includes('Failed') ? 'status-error' : status.includes('Thinking') ? 'status-warning' : 'muted'}>
              {status}
            </div>
          )}
        </form>
      </div>

      {answer && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>💡 Answer{activeSyllabus ? ` - ${activeSyllabus.title || 'Untitled'}` : ''}</h3>
          <div style={{
            background: 'var(--gray-50)',
            padding: '20px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--gray-200)',
            marginTop: '16px'
          }}>
            <pre style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>{answer}</pre>
          </div>
        </div>
      )}
    </div>
  )
}