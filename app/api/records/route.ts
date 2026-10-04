import { env } from 'cloudflare:workers';
import { getFitZUser } from '../../auth';
import { z } from 'zod';
import { MUSCLES } from '../../../lib/fitness';
import {writeRecord,decodeRecord} from '../../../lib/repository';
export const dynamic='force-dynamic';
const num=z.number().finite().min(0).max(10000).nullable();
const ex=z.object({id:z.string().max(100),name:z.string().min(1).max(200),primary:z.array(z.enum(MUSCLES)).max(12),secondary:z.array(z.enum(MUSCLES)).max(12),reps:z.string().max(40),weight:num,rest:z.number().int().min(0).max(3600).nullable(),notes:z.string().max(4000)});
const routine=ex.extend({sets:z.number().int().min(1).max(30)});
const set=z.object({id:z.string().max(100),weight:num,reps:z.number().int().min(0).max(1000).nullable(),done:z.boolean(),warmup:z.boolean()});
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const body=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('routine'),body:z.object({id:z.string(),name:z.string().min(1).max(200),exercises:z.array(routine).max(100)})}),
 z.object({kind:z.literal('session'),body:z.object({id:z.string(),routineId:z.string().max(100),name:z.string().min(1).max(200),date,startedAt:z.number().finite(),endedAt:z.number().finite().nullable(),status:z.enum(['active','finished']),exercises:z.array(ex.extend({sets:z.array(set).max(100)})).max(100),timerEnd:z.number().finite().nullable(),notes:z.string().max(4000)})}),
 z.object({kind:z.literal('measurement'),body:z.object({id:z.string(),date,weight:z.number().min(20).max(500).nullable(),waist:z.number().min(20).max(300).nullable()})}),
]);
function reply(v:unknown,status=200){return Response.json(v,{status,headers:{'Cache-Control':'no-store'}});}
export async function GET(){const u=await getFitZUser();if(!u)return reply({error:'Acceso no autorizado.'},401);if(!env.DB)return reply({error:'Almacenamiento no disponible.'},503);
 const q=await env.DB.prepare('SELECT id,kind,body,deleted,revision FROM fitness_records WHERE user_id = ?').bind(u.userId).all();return reply({records:q.results.map(decodeRecord)});}
export async function POST(request:Request){const u=await getFitZUser();if(!u)return reply({error:'Acceso no autorizado.'},401);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Origen no permitido.'},403);
 if(!env.DB)return reply({error:'Almacenamiento no disponible.'},503);
 let raw:any;try{const text=await request.text();if(text.length>300000)return reply({error:'Registro demasiado grande.'},413);raw=JSON.parse(text);}catch{return reply({error:'JSON inválido.'},400);}
 const meta=z.object({id:z.string().min(1).max(100),baseRevision:z.number().int().min(0),deleted:z.boolean()}).safeParse(raw);
 const value=body.safeParse(raw);if(!meta.success||!value.success||raw.body.id!==raw.id)return reply({error:'Datos inválidos.'},400);
 const result=await writeRecord(env.DB,u.userId,{...meta.data,...value.data});
 if(result.conflict)return reply({conflict:result.record},409);
 return reply({record:result.record});
}
