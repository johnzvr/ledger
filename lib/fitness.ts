export const MUSCLES = ['Pecho','Espalda','Hombro anterior','Hombro lateral','Hombro posterior','Bíceps','Tríceps','Cuádriceps','Isquios','Glúteos','Pantorrillas','Abdominales'] as const;
export type Muscle = typeof MUSCLES[number];
export type Exercise = {id:string;name:string;primary:Muscle[];secondary:Muscle[];sets:number;reps:string;weight:number|null;rest:number|null;notes:string};
export type Routine = {id:string;name:string;exercises:Exercise[]};
export type SetLog = {id:string;weight:number|null;reps:number|null;done:boolean;warmup:boolean};
export type SessionExercise = Omit<Exercise,'sets'> & {sets:SetLog[]};
export type Session = {id:string;routineId:string;name:string;date:string;startedAt:number;endedAt:number|null;status:'active'|'finished';exercises:SessionExercise[];timerEnd:number|null;notes:string};
export type Measurement = {id:string;date:string;weight:number|null;waist:number|null};
export type DataBody = Routine|Session|Measurement;
export type RecordData = {id:string;kind:'routine'|'session'|'measurement';body:DataBody;deleted:boolean;revision:number};
export type Pending = RecordData & {baseRevision:number;stamp:number};
export type Cache = {records:Record<string,RecordData>;pending:Record<string,Pending>};
export const uid=()=>crypto.randomUUID();
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const CATALOG: {name:string;primary:Muscle[];secondary:Muscle[];aliases?:string[]}[] = [
 {name:'Press de banca',primary:['Pecho'],secondary:['Tríceps','Hombro anterior'],aliases:['press banca','bench press','press plano']},
 {name:'Press inclinado con mancuernas',primary:['Pecho'],secondary:['Tríceps','Hombro anterior'],aliases:['press inclinado','incline press']},
 {name:'Aperturas con mancuernas',primary:['Pecho'],secondary:[],aliases:['aperturas','pec deck','cruces en polea']},
 {name:'Flexiones',primary:['Pecho'],secondary:['Tríceps','Hombro anterior'],aliases:['push ups']},
 {name:'Remo con barra',primary:['Espalda'],secondary:['Bíceps','Hombro posterior'],aliases:['barbell row']},
 {name:'Remo con mancuerna',primary:['Espalda'],secondary:['Bíceps','Hombro posterior'],aliases:['remo unilateral']},
 {name:'Remo en polea',primary:['Espalda'],secondary:['Bíceps','Hombro posterior'],aliases:['remo sentado','seated row']},
 {name:'Jalón al pecho',primary:['Espalda'],secondary:['Bíceps'],aliases:['jalon','lat pulldown']},
 {name:'Dominadas',primary:['Espalda'],secondary:['Bíceps'],aliases:['pull ups']},
 {name:'Pullover en polea',primary:['Espalda'],secondary:[],aliases:['pullover']},
 {name:'Press militar',primary:['Hombro anterior'],secondary:['Tríceps','Hombro lateral'],aliases:['shoulder press','press hombros']},
 {name:'Elevaciones laterales',primary:['Hombro lateral'],secondary:[],aliases:['laterales','lateral raises']},
 {name:'Pájaros',primary:['Hombro posterior'],secondary:[],aliases:['reverse fly','aperturas inversas']},
 {name:'Face pull',primary:['Hombro posterior'],secondary:['Espalda'],aliases:['face pulls']},
 {name:'Curl de bíceps',primary:['Bíceps'],secondary:[],aliases:['curl barra','curl con barra','curl con mancuernas','biceps curl']},
 {name:'Curl martillo',primary:['Bíceps'],secondary:[],aliases:['hammer curl']},
 {name:'Curl predicador',primary:['Bíceps'],secondary:[],aliases:['curl scott']},
 {name:'Extensión de tríceps en polea',primary:['Tríceps'],secondary:[],aliases:['triceps en polea','pushdown','extension de triceps','triceps polea']},
 {name:'Press francés',primary:['Tríceps'],secondary:[],aliases:['skull crusher']},
 {name:'Sentadilla',primary:['Cuádriceps','Glúteos'],secondary:[],aliases:['sentadilla con barra','squat']},
 {name:'Prensa',primary:['Cuádriceps'],secondary:['Glúteos'],aliases:['leg press','prensa de piernas']},
 {name:'Sentadilla hack',primary:['Cuádriceps'],secondary:['Glúteos'],aliases:['hack squat']},
 {name:'Extensión de cuádriceps',primary:['Cuádriceps'],secondary:[],aliases:['extension de piernas','leg extension','extensiones']},
 {name:'Sentadilla búlgara',primary:['Cuádriceps','Glúteos'],secondary:[],aliases:['bulgaras','bulgarian split squat']},
 {name:'Peso muerto rumano',primary:['Isquios','Glúteos'],secondary:['Espalda'],aliases:['rdl','rumano']},
 {name:'Peso muerto',primary:['Glúteos','Espalda'],secondary:['Isquios','Cuádriceps'],aliases:['deadlift']},
 {name:'Curl femoral',primary:['Isquios'],secondary:[],aliases:['leg curl','curl de piernas','curl femoral sentado','curl femoral acostado']},
 {name:'Hip thrust',primary:['Glúteos'],secondary:[],aliases:['empuje de cadera']},
 {name:'Elevación de pantorrillas',primary:['Pantorrillas'],secondary:[],aliases:['gemelos','pantorrillas','calf raise']},
 {name:'Crunch',primary:['Abdominales'],secondary:[],aliases:['abdominales','crunch en polea']},
];
export function musclesFor(name:string) {const n=normalize(name);return CATALOG.find(e=>[e.name,...e.aliases??[]].some(a=>normalize(a)===n))??null;}
export function newExercise(name=''):Exercise {const c=musclesFor(name);return {id:uid(),name,primary:c?.primary??[],secondary:c?.secondary??[],sets:3,reps:'8–12',weight:null,rest:90,notes:''};}
export function parseRoutine(text:string):{routines:Routine[];warnings:string[]} {
 const routines:Routine[]=[];const warnings:string[]=[];let current:Routine|null=null;
 for(const raw of text.split(/\r?\n/)) {const line=raw.trim().replace(/\*\*/g,'').replace(/^[-•*]\s*/,'').replace(/^\d+[.)]\s*/,'');if(!line||/^\|?\s*[-:]+\s*(\|[-: ]+)+\|?$/.test(line))continue;
  const heading=/^(?:#{1,4}\s*)?(?:d[ií]a\s*\d+|rutina\b|push\b|pull\b|upper\b|lower\b|piernas\b|torso\b)/i.test(line)&&!/(\d+)\s*[x×]\s*\d+/.test(line);
  if(heading) {current={id:uid(),name:line.replace(/^#+\s*/,'').replace(/:$/,''),exercises:[]};routines.push(current);continue;}
  const match=line.match(/(\d+)\s*(?:[x×]|series?\s*(?:de|[x×])?)\s*(\d+(?:\s*[-–—]\s*\d+)?)/i);
  if(!match) {warnings.push('Revisar línea: '+line);continue;}
  if(!current){current={id:uid(),name:'Mi rutina',exercises:[]};routines.push(current);}
  const name=line.slice(0,match.index).replace(/^#+\s*/,'').replace(/[|:;\-(\s]+$/,'').trim();
  if(!name){warnings.push('Falta el nombre: '+line);continue;}
  const e=newExercise(name);e.sets=Number(match[1]);e.reps=match[2].replace(/\s/g,'');
  if(e.sets<1||e.sets>30){warnings.push('Número de series fuera de rango: '+line);continue;}
  const tail=line.slice((match.index??0)+match[0].length);
  const weight=tail.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);e.weight=weight?Number(weight[1].replace(',','.')):null;
  const time=tail.match(/(\d+(?:[.,]\d+)?)\s*(min(?:utos?)?|m\b|s(?:eg(?:undos?)?)?\b|seconds?)/i);
  const clock=tail.match(/(?:descanso|rest)\s*[:=]?\s*(\d+):(\d{2})/i);
  e.rest=clock?Number(clock[1])*60+Number(clock[2]):time?Math.round(Number(time[1].replace(',','.'))*(/^m/i.test(time[2])?60:1)):null;
  e.notes=tail.replace(/^[\s,;|)]+/,'').trim();
  if(!e.primary.length)warnings.push('Asigna músculos a «'+name+'».');if(e.rest===null)warnings.push('Falta descanso en «'+name+'».');
  current.exercises.push(e);
 }
 return {routines:routines.filter(r=>r.exercises.length),warnings};
}
export function startSession(routine:Routine,history:Session[]):Session {return {id:uid(),routineId:routine.id,name:routine.name,date:today(),startedAt:Date.now(),endedAt:null,status:'active',timerEnd:null,notes:'',exercises:routine.exercises.map(e=>{
 const prev=[...history].sort((a,b)=>b.startedAt-a.startedAt).flatMap(s=>s.exercises).find(x=>normalize(x.name)===normalize(e.name));
 return {...e,sets:Array.from({length:e.sets},(_,i)=>({id:uid(),weight:prev?.sets.filter(s=>!s.warmup&&s.done)[i]?.weight??e.weight,reps:null,done:false,warmup:false}))};})};}
export function volume(sessions:Session[]) {const result=Object.fromEntries(MUSCLES.map(m=>[m,{direct:0,secondary:0,exercises:new Set<string>()}])) as Record<Muscle,{direct:number;secondary:number;exercises:Set<string>}>;
 for(const s of sessions)for(const e of s.exercises){const count=e.sets.filter(x=>x.done&&!x.warmup).length;if(!count)continue;for(const m of e.primary){if(result[m]){result[m].direct+=count;result[m].exercises.add(e.name);}}for(const m of e.secondary){if(result[m]&&!e.primary.includes(m)){result[m].secondary+=count;result[m].exercises.add(e.name);}}}return result;}
export function weekRange(offset=0) {const d=new Date(today()+'T12:00:00Z');const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-day+1+offset*7);const from=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()+6);return {from,to:d.toISOString().slice(0,10)};}
export const tonnage=(s:Session)=>s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done&&!x.warmup).reduce((b,x)=>b+(x.weight??0)*(x.reps??0),0),0);
export function csv(rows:unknown[][]) {return '\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
