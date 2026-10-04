import type {RecordData} from './fitness';
export type WriteRecord = {id:string;kind:RecordData['kind'];body:RecordData['body'];baseRevision:number;deleted:boolean};
export function decodeRecord(row:any):RecordData {return {id:row.id,kind:row.kind,body:JSON.parse(row.body),deleted:!!row.deleted,revision:row.revision};}
export async function writeRecord(db:D1Database,userId:string,op:WriteRecord):Promise<{record:RecordData|null;conflict:boolean}>{
 const {id,kind,body,baseRevision,deleted}=op;const serialized=JSON.stringify(body);let result;
 if(baseRevision===0)result=await db.prepare('INSERT OR IGNORE INTO fitness_records (user_id,id,kind,body,deleted,revision,updated_at) VALUES (?,?,?,?,?,1,?)').bind(userId,id,kind,serialized,deleted?1:0,new Date().toISOString()).run();
 else result=await db.prepare('UPDATE fitness_records SET body=?,deleted=?,revision=revision+1,updated_at=? WHERE user_id=? AND id=? AND kind=? AND revision=?').bind(serialized,deleted?1:0,new Date().toISOString(),userId,id,kind,baseRevision).run();
 const row=await db.prepare('SELECT id,kind,body,deleted,revision FROM fitness_records WHERE user_id=? AND id=?').bind(userId,id).first<any>();
 const same=!!row&&row.kind===kind&&row.body===serialized&&!!row.deleted===deleted;
 return {record:row?decodeRecord(row):null,conflict:!result.meta.changes&&!same};
}
