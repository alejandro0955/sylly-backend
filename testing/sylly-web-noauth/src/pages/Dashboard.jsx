import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Dashboard(){
  const [user,setUser]=useState(null); const [err,setErr]=useState(''); const [health,setHealth]=useState(null)
  useEffect(()=>{ (async()=>{
    try{ const h=await api.get('/api/health'); setHealth(h) }catch(e){ setErr(String(e.message)) }
    try{ const me=await api.get('/api/users/me'); setUser(me.user) }catch(e){ setErr(String(e.message)) }
  })() },[])
  return (<div>
    <h2>Dashboard</h2>
    <div className="card"><div className="muted">Health</div><pre>{JSON.stringify(health, null, 2)}</pre></div>
    <div className="card"><div className="muted">User (demo)</div><pre>{JSON.stringify(user, null, 2)}</pre></div>
    {err && <div className="card">Error: {err}</div>}
  </div>)
}
