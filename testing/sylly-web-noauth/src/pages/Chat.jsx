import React, { useState } from 'react'
import { api } from '../api/client'

export default function Chat(){
  const [syllabusId,setSyllabusId]=useState('')
  const [question,setQuestion]=useState('When is the midterm?')
  const [answer,setAnswer]=useState(null)
  async function ask(e){ e.preventDefault(); const res=await api.post('/api/chat',{ syllabusId, question }); setAnswer(res) }
  return (<div>
    <h2>Chat</h2>
    <form onSubmit={ask} className="card">
      <div className="row">
        <input placeholder="Syllabus ID" value={syllabusId} onChange={e=>setSyllabusId(e.target.value)} style={{width:'40%'}} />
        <input placeholder="Your question" value={question} onChange={e=>setQuestion(e.target.value)} style={{width:'50%'}} />
        <button type="submit">Ask</button>
      </div>
    </form>
    {answer && <div className="card"><pre>{JSON.stringify(answer,null,2)}</pre></div>}
  </div>)
}
