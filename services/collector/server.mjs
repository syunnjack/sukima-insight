import { createServer } from 'node:http'
import { openDatabase } from './db.mjs'
import { authenticateWorkspace,recordEvent,registerProject,seedDevelopment,summary } from './domain.mjs'
const db=openDatabase();seedDevelopment(db);const port=Number(process.env.PORT||8788);const origin=process.env.ALLOWED_ORIGIN||'http://localhost:5173'
const send=(response,status,data)=>{response.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':origin,'access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'GET,POST,OPTIONS','cache-control':'no-store'});response.end(JSON.stringify(data))}
async function body(request){const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>64_000)throw new Error('body_too_large');chunks.push(chunk)}return chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{}}
createServer(async(request,response)=>{if(request.method==='OPTIONS')return send(response,204,{});const url=new URL(request.url,'http://localhost');try{
  if(request.method==='GET'&&url.pathname==='/health')return send(response,200,{ok:true,service:'sukima-insight-collector'})
  if(request.method==='POST'&&url.pathname==='/v1/events')return send(response,202,recordEvent(db,await body(request)))
  const input=request.method==='POST'?await body(request):{};const workspaceId=url.searchParams.get('workspaceId')||input.workspaceId;const key=request.headers.authorization?.startsWith('Bearer ')?request.headers.authorization.slice(7):'';if(!authenticateWorkspace(db,workspaceId,key))return send(response,401,{error:'authentication_required'})
  if(request.method==='GET'&&url.pathname==='/v1/summary')return send(response,200,summary(db,workspaceId,url.searchParams.get('days')))
  if(request.method==='GET'&&url.pathname==='/v1/projects')return send(response,200,{projects:db.prepare('SELECT id,repo_full_name,name,homepage_url,visibility,active,updated_at FROM projects WHERE workspace_id=? ORDER BY name').all(workspaceId)})
  if(request.method==='POST'&&url.pathname==='/v1/projects')return send(response,201,registerProject(db,{workspaceId,...input}))
  return send(response,404,{error:'not_found'})
}catch(error){return send(response,error.message==='body_too_large'?413:400,{error:error.message})}}).listen(port,()=>console.log(`SUKIMA INSIGHT collector listening on http://localhost:${port}`))
