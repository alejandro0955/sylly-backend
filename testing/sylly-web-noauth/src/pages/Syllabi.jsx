import React, { useState } from 'react'
import { api } from '../api/client'

export default function Syllabi(){
  const [title,setTitle]=useState('My Course')
  const [rawText,setRawText]=useState('Week 1: Reading due 2025-10-01\nMidterm on 2025-10-20 (20%)')
  const [id,setId]=useState('')
  const [syllabus,setSyllabus]=useState(null)

  async function create(e){ e.preventDefault(); const s=await api.post('/api/syllabi',{title,rawText}); setId(s.id) }
  async function parse(){ await api.post(`/api/syllabi/${id}/parse`,{}); alert('Parsed! Now fetch it.'); }
  async function fetchS(){ const s=await api.get(`/api/syllabi/${id}`); setSyllabus(s) }

  return (<div>
    <h2>Syllabi</h2>
    <div className="card">
      <form onSubmit={create}>
        <div className="row">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Course title" />
          <button type="submit">Create</button>
        </div>
        <div style={{marginTop:8}}>
          <textarea rows={8} style={{width:'100%'}} value={rawText} onChange={e=>setRawText(e.target.value)} />
        </div>
      </form>
    </div>
    {!!id && <div className="card">
      <div className="row">
        <div>Created id: <code>{id}</code></div>
        <button onClick={parse}>Parse with AI</button>
        <button onClick={fetchS}>Fetch syllabus</button>
      </div>
    </div>}
    {syllabus && <div className="card"><pre>{JSON.stringify(syllabus,null,2)}</pre></div>}
  </div>)
}
