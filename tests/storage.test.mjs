import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {writeRecord} from '../lib/repository.ts';
function storage(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_volatile_blackheart.sql',import.meta.url),'utf8'));return {prepare(sql){const s=db.prepare(sql);return {bind(...values){return {async run(){return {meta:s.run(...values)}},async first(){return s.get(...values)||null},async all(){return {results:s.all(...values)}}}}}}};}
const op=(name='Rutina')=>({id:'r1',kind:'routine',body:{id:'r1',name,exercises:[]},baseRevision:0,deleted:false});
test('record revisions reject stale overwrites and isolate each account',async()=>{
 const db=storage();const first=await writeRecord(db,'john',op());assert.equal(first.record.revision,1);
 const other=await writeRecord(db,'other',op('Otra cuenta'));assert.equal(other.record.body.name,'Otra cuenta');
 const changed=await writeRecord(db,'john',{...op('Nueva'),baseRevision:1});assert.equal(changed.record.revision,2);
 const conflict=await writeRecord(db,'john',{...op('Desactualizada'),baseRevision:1});assert.equal(conflict.conflict,true);assert.equal(conflict.record.body.name,'Nueva');assert.equal(conflict.record.revision,2);
});
test('retries are idempotent and deletion tombstones prevent resurrection',async()=>{
 const db=storage();await writeRecord(db,'john',op());const repeat=await writeRecord(db,'john',op());assert.equal(repeat.conflict,false);assert.equal(repeat.record.revision,1);
 const deleted=await writeRecord(db,'john',{...op(),baseRevision:1,deleted:true});assert.equal(deleted.record.deleted,true);assert.equal(deleted.record.revision,2);
 const stale=await writeRecord(db,'john',op());assert.equal(stale.conflict,true);assert.equal(stale.record.deleted,true);
});
