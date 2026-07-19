import { createServer } from 'node:http'
import { openDatabase } from './db.mjs'
import { authenticateWorkspace,recordEvent,registerProject,seedDevelopment,summary } from './domain.mjs'
import { githubStatus,listInstallationRepositories,syncRepositories,verifyWebhookSignature } from './github-app.mjs'
const db=openDatabase();seedDevelopment(db);const port=Number(process.env.PORT||8788);const origin=process.env.ALLOWED_ORIGIN||'http://localhost:5173'
const send=(response,status,data)=>{response.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':origin,'access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'GET,POST,OPTIONS','cache-control':'no-store'});response.end(JSON.stringify(data))}
async function rawBody(request){const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>1_000_000)throw new Error('body_too_large');chunks.push(chunk)}return Buffer.concat(chunks)}
async function body(request){const raw=await rawBody(request);return raw.length?JSON.parse(raw.toString('utf8')):{}}
createServer(async(request,response)=>{if(request.method==='OPTIONS')return send(response,204,{});const url=new URL(request.url,'http://localhost');try{
  if(request.method==='GET'&&url.pathname==='/health')return send(response,200,{ok:true,service:'sukima-insight-collector'})
  if(request.method==='POST'&&url.pathname==='/v1/github/webhook'){
    const raw=await rawBody(request),signature=request.headers['x-hub-signature-256'],delivery=String(request.headers['x-github-delivery']||''),event=String(request.headers['x-github-event']||'')
    if(!verifyWebhookSignature(raw,signature))return send(response,401,{error:'invalid_webhook_signature'})
    if(!delivery)return send(response,400,{error:'missing_delivery_id'})
    if(db.prepare('SELECT 1 FROM webhook_deliveries WHERE delivery_id=?').get(delivery))return send(response,202,{accepted:true,duplicate:true})
    const payload=JSON.parse(raw.toString('utf8')),now=new Date().toISOString();db.prepare('INSERT INTO webhook_deliveries(delivery_id,event_name,status,received_at) VALUES(?,?,?,?)').run(delivery,event,'received',now)
    const installation=payload.installation;if(installation&&['installation','installation_repositories','repository'].includes(event)){
      const workspaceId=process.env.INSIGHT_WORKSPACE_ID||'ws-demo'
      if(payload.action==='deleted')db.prepare("UPDATE github_installations SET status='deleted',updated_at=? WHERE installation_id=?").run(now,installation.id)
      else {const repositories=await listInstallationRepositories(installation.id);syncRepositories(db,{workspaceId,installationId:installation.id,repositories,accountLogin:payload.installation.account?.login||payload.sender?.login||'',accountType:payload.installation.account?.type||'User',repositorySelection:payload.installation.repository_selection||'selected'})}
    }
    db.prepare("UPDATE webhook_deliveries SET status='processed' WHERE delivery_id=?").run(delivery);return send(response,202,{accepted:true})
  }
  if(request.method==='POST'&&url.pathname==='/v1/events')return send(response,202,recordEvent(db,await body(request)))
  const input=request.method==='POST'?await body(request):{};const workspaceId=url.searchParams.get('workspaceId')||input.workspaceId;const key=request.headers.authorization?.startsWith('Bearer ')?request.headers.authorization.slice(7):'';if(!authenticateWorkspace(db,workspaceId,key))return send(response,401,{error:'authentication_required'})
  if(request.method==='GET'&&url.pathname==='/v1/summary')return send(response,200,summary(db,workspaceId,url.searchParams.get('days')))
  if(request.method==='GET'&&url.pathname==='/v1/projects')return send(response,200,{projects:db.prepare('SELECT id,repo_full_name,name,homepage_url,visibility,active,updated_at FROM projects WHERE workspace_id=? ORDER BY name').all(workspaceId)})
  if(request.method==='POST'&&url.pathname==='/v1/projects')return send(response,201,registerProject(db,{workspaceId,...input}))
  if(request.method==='GET'&&url.pathname==='/v1/github/status')return send(response,200,githubStatus(db,workspaceId))
  if(request.method==='POST'&&url.pathname==='/v1/github/sync'){
    const installation=db.prepare("SELECT * FROM github_installations WHERE workspace_id=? AND status='active' ORDER BY updated_at DESC LIMIT 1").get(workspaceId);if(!installation)return send(response,409,{error:'github_installation_required'})
    return send(response,200,syncRepositories(db,{workspaceId,installationId:installation.installation_id,repositories:await listInstallationRepositories(installation.installation_id),accountLogin:installation.account_login,accountType:installation.account_type,repositorySelection:installation.repository_selection}))
  }
  return send(response,404,{error:'not_found'})
}catch(error){return send(response,error.message==='body_too_large'?413:400,{error:error.message})}}).listen(port,()=>console.log(`SUKIMA INSIGHT collector listening on http://localhost:${port}`))
