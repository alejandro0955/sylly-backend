import React, { useState } from 'react'
import { api } from '../api/client'

export default function Planner(){
  const [syllabusId,setSyllabusId]=useState('')
  const [tasks,setTasks]=useState([])
  async function plan(e){ e.preventDefault(); const r=await api.post('/api/planner/plan',{ syllabusId, prefs:{ dailyCapMin:180, blockMin:50 } }); setTasks(r.tasks) }
  return (<div>
    <h2>Planner</h2>
    <form onSubmit={plan} className="card">
      <div className="row">
        <input placeholder="Syllabus ID" value={syllabusId} onChange={e=>setSyllabusId(e.target.value)} style={{width:'60%'}} />
        <button type="submit">Generate Plan</button>
      </div>
    </form>
    {tasks.length>0 && <div className="card">
      <h3>Planned Tasks</h3>
      <table><thead><tr><th>Title</th><th>Start</th><th>End</th></tr></thead><tbody>
        {tasks.map((t,i)=>(<tr key={i}><td>{t.title}</td><td>{new Date(t.start).toLocaleString()}</td><td>{new Date(t.end).toLocaleString()}</td></tr>))}
      </tbody></table>
    </div>}
  </div>)
}
