import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseRoutine,newExercise,startSession,volume,tonnage,csv} from '../lib/fitness.ts';
test('imports several days, ranges, decimal kg, seconds and minute clocks',()=>{
 const {routines,warnings}=parseRoutine('Día 1: Pecho\n- Press de banca: 3 × 6–8, 100 kg, descanso 2 min\nRemo con barra: 4 series de 8-10, 72,5 kg, descanso 1:30\nDía 2: Piernas\nSentadilla: 3x8, descanso 90 s');
 assert.equal(routines.length,2);assert.equal(routines[0].exercises.length,2);assert.equal(routines[0].exercises[0].rest,120);assert.equal(routines[0].exercises[1].weight,72.5);assert.equal(routines[0].exercises[1].rest,90);assert.equal(routines[1].exercises[0].weight,null);assert.equal(warnings.length,0);
});
test('preserves unknown exercises and flags missing data and unreadable lines',()=>{
 const p=parseRoutine('Ejercicio inventado: 3x12\nUna indicación sin estructura');
 assert.equal(p.routines[0].exercises[0].primary.length,0);assert.equal(p.routines[0].exercises[0].rest,null);assert.equal(p.routines[0].exercises[0].weight,null);assert.equal(p.warnings.length,3);
});
test('does not misread exercise as day or accept zero/excessive series',()=>{
 assert.equal(parseRoutine('Día 1: Pecho\nPress de banca: 0x8\nRemo con barra: 31x8').routines.length,0);
});
test('fresh sessions use previous kg while keeping actual reps and completion empty',()=>{
 const r={id:'r',name:'Pecho',exercises:[newExercise('Press de banca')]};
 const prev=startSession(r,[]);prev.status='finished';prev.exercises[0].sets[0]={...prev.exercises[0].sets[0],weight:100,reps:8,done:true};
 const next=startSession(r,[prev]);assert.equal(next.exercises[0].sets[0].weight,100);assert.equal(next.exercises[0].sets[0].reps,null);assert.equal(next.exercises[0].sets[0].done,false);assert.notEqual(next.id,prev.id);assert.equal(r.exercises[0].sets,3);
});
test('volume excludes warmups and unfinished sets and keeps secondary distinct',()=>{
 const r={id:'r',name:'Pecho',exercises:[newExercise('Press de banca')]};const s=startSession(r,[]);
 s.exercises[0].sets=[{id:'1',weight:100,reps:8,done:true,warmup:false},{id:'2',weight:50,reps:10,done:true,warmup:true},{id:'3',weight:100,reps:7,done:false,warmup:false}];
 const v=volume([s]);assert.equal(v.Pecho.direct,1);assert.equal(v.Tríceps.secondary,1);assert.equal(v.Tríceps.direct,0);assert.equal(tonnage(s),800);
});
test('CSV escapes commas, quotes and line breaks for spreadsheets',()=>{
 assert.equal(csv([['a,b','"name"','line\nbreak',null]]),'\uFEFF"a,b","""name""","line\nbreak",""');
});
