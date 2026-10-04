'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
import type {Cache,DataBody,Pending,RecordData} from './fitness';
const blank=():Cache=>({records:{},pending:{}});
export function useStore(userId:string){
 const key='fitz-v1-'+userId;const [cache,setCache]=useState<Cache>(blank);const ref=useRef<Cache>(blank());const ready=useRef(false);const busy=useRef(false);const serial=useRef(0);
 const [loaded,setLoaded]=useState(false);const [status,setStatus]=useState('Conectando…');const [conflicts,setConflicts]=useState<Record<string,RecordData>>({});const conflictsRef=useRef<Record<string,RecordData>>({});
 const commit=useCallback((value:Cache)=>{ref.current=value;setCache(value);try{localStorage.setItem(key,JSON.stringify(value));}catch{setStatus('Sin espacio local · exporta una copia');}},[key]);
 const sync=useCallback(async()=>{
  if(!ready.current||busy.current)return;if(!navigator.onLine){setStatus('Sin conexión · guardado en este dispositivo');return;}busy.current=true;setStatus('Sincronizando…');
  try{
   for(const op of Object.values(ref.current.pending)){
    if(conflictsRef.current[op.id])continue;
    const r=await fetch('/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(op)});
    if(r.status===401){setStatus('Acceso vencido · vuelve a iniciar sesión');return;}
    const result=await r.json() as {record:RecordData;conflict?:RecordData;error?:string};
    if(r.status===409&&result.conflict){conflictsRef.current={...conflictsRef.current,[op.id]:result.conflict};setConflicts(conflictsRef.current);continue;}
    if(!r.ok)throw new Error(result.error||'Error de sincronización');
    const c=ref.current;const p={...c.pending};const record=result.record as RecordData;
    if(p[op.id]?.stamp===op.stamp)delete p[op.id];else if(p[op.id])p[op.id]={...p[op.id],baseRevision:record.revision,revision:record.revision};
    commit({pending:p,records:{...c.records,[op.id]:p[op.id]?{...c.records[op.id],revision:record.revision}:record}});
   }
   const r=await fetch('/api/records',{cache:'no-store'});if(r.status===401){setStatus('Acceso vencido · vuelve a iniciar sesión');return;}if(!r.ok)throw new Error('No se pudo conectar');const data=await r.json() as {records:RecordData[]};
   const c=ref.current;const records={...c.records};for(const rec of data.records as RecordData[])if(!c.pending[rec.id])records[rec.id]=rec;
   commit({...c,records});setStatus(Object.keys(conflictsRef.current).length?'Cambios pendientes de resolver':Object.keys(c.pending).length?'Cambios pendientes':'Sincronizado');
  }catch(e){setStatus((e instanceof Error?e.message:'Sin conexión')+' · cambios guardados localmente');}finally{busy.current=false;}
 },[commit]);
 useEffect(()=>{try{const saved=localStorage.getItem(key);if(saved){const data=JSON.parse(saved);if(data.records&&data.pending)commit(data);}}catch{setStatus('No se pudo leer la copia local');}ready.current=true;setLoaded(true);void sync();
 const timer=setInterval(()=>void sync(),30000);const online=()=>void sync();const visible=()=>{if(document.visibilityState==='visible')void sync();};window.addEventListener('online',online);document.addEventListener('visibilitychange',visible);
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(r=>r.active?.postMessage({type:'CACHE_SHELL',urls:[...new Set(performance.getEntriesByType('resource').map(e=>e.name).filter(u=>{const v=new URL(u);return v.origin===location.origin&&/\.(js|css|svg|woff2?)$/.test(v.pathname);}))]})).catch(()=>{});
 return()=>{ready.current=false;clearInterval(timer);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visible);};},[key,commit,sync]);
 useEffect(()=>{if(!loaded||!Object.keys(cache.pending).length)return;const t=setTimeout(()=>void sync(),750);return()=>clearTimeout(t);},[cache.pending,loaded,sync]);
 function put(kind:RecordData['kind'],body:DataBody,deleted=false){const c=ref.current;const revision=c.records[body.id]?.revision??0;const rec={id:body.id,kind,body,deleted,revision};const stamp=Date.now()*1000+(serial.current++%1000);commit({records:{...c.records,[body.id]:rec},pending:{...c.pending,[body.id]:{...rec,baseRevision:c.pending[body.id]?.baseRevision??revision,stamp}}});setStatus('Guardado · sincronización pendiente');}
 function resolve(id:string,keepLocal:boolean){const remote=conflictsRef.current[id];const c=ref.current;const pending={...c.pending};const records={...c.records};if(keepLocal&&pending[id]){pending[id]={...pending[id],baseRevision:remote.revision,revision:remote.revision};records[id]={...records[id],revision:remote.revision};}else{delete pending[id];records[id]=remote;}delete conflictsRef.current[id];setConflicts({...conflictsRef.current});commit({records,pending});void sync();}
 return {records:Object.values(cache.records).filter(r=>!r.deleted),put,loaded,status,sync,conflicts,resolve,pendingCount:Object.keys(cache.pending).length};
}
