import FitnessApp from './fitness-app';
import {getFitZUser} from './auth';
export const dynamic='force-dynamic';
export default async function Home(){
 const user=await getFitZUser();
 if(!user)return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f7f8fa',fontFamily:'system-ui'}}><section style={{maxWidth:520,textAlign:'center'}}><div style={{width:52,height:52,display:'grid',placeItems:'center',margin:'0 auto 20px',borderRadius:14,background:'#7961ee',color:'white',fontSize:32,fontWeight:800}}>Z</div><h1 style={{fontSize:28}}>Fit Z está protegido</h1><p style={{marginTop:12,color:'#777b8e',lineHeight:1.7}}>Esta instalación necesita Cloudflare Access. Protege la dirección de la app y autoriza el mismo correo configurado en FITZ_OWNER_EMAIL.</p></section></main>;
 return <FitnessApp userId={user.userId}/>;
}
