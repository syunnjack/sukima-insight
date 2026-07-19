import { createHash,randomBytes,randomUUID,timingSafeEqual } from 'node:crypto'
export const hash=(value)=>createHash('sha256').update(String(value)).digest('hex')
const equal=(a,b)=>{const left=Buffer.from(a);const right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
const token=()=>randomBytes(32).toString('base64url')
const eventNames=new Set(['session_started','page_view','offer_impression','concierge_started','concierge_completed','checklist_completed','notification_subscribed','affiliate_click','booking_started','conversion','error'])
const propertyKeys=new Set(['campaign','placement','category','itemId','experiment','variant','contentClass'])

export function seedDevelopment(db,{adminKey=process.env.INSIGHT_ADMIN_KEY||'dev-change-me'}={}){
  const now=new Date().toISOString();db.prepare('INSERT OR IGNORE INTO workspaces(id,name,admin_key_hash,created_at) VALUES(?,?,?,?)').run('ws-demo','SUKIMA Demo',hash(adminKey),now)
  db.prepare('INSERT OR IGNORE INTO projects(id,workspace_id,repo_full_name,name,write_key_hash,updated_at) VALUES(?,?,?,?,?,?)').run('project-task-dashboard','ws-demo','syunnjack/task-dashboard','task-dashboard',hash('project-dev-key'),now)
}
export function authenticateWorkspace(db,workspaceId,key){const row=db.prepare('SELECT * FROM workspaces WHERE id=?').get(workspaceId);return row&&equal(row.admin_key_hash,hash(key))?row:null}
export function registerProject(db,{workspaceId,repoFullName,name,homepageUrl='',visibility='private'}){
  if(!repoFullName?.includes('/'))throw new Error('invalid_repository');const raw=token();const now=new Date().toISOString();const id=randomUUID()
  db.prepare(`INSERT INTO projects(id,workspace_id,repo_full_name,name,homepage_url,visibility,write_key_hash,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(workspace_id,repo_full_name) DO UPDATE SET name=excluded.name,homepage_url=excluded.homepage_url,visibility=excluded.visibility,active=1,updated_at=excluded.updated_at`).run(id,workspaceId,repoFullName,String(name||repoFullName.split('/').at(-1)).slice(0,100),String(homepageUrl||'').slice(0,300),visibility==='public'?'public':'private',hash(raw),now)
  const project=db.prepare('SELECT id,repo_full_name,name,homepage_url,visibility,active,updated_at FROM projects WHERE workspace_id=? AND repo_full_name=?').get(workspaceId,repoFullName)
  return {...project,writeKey:raw}
}
export function recordEvent(db,{projectId,writeKey,sessionId,eventName,app='web',page='',properties={},revenue=0,currency='JPY'}){
  if(!eventNames.has(eventName))throw new Error('invalid_event')
  const project=db.prepare('SELECT * FROM projects WHERE id=? AND active=1').get(projectId);if(!project||!equal(project.write_key_hash,hash(writeKey)))throw new Error('invalid_project_key')
  const safe=Object.fromEntries(Object.entries(properties).filter(([key,value])=>propertyKeys.has(key)&&['string','number','boolean'].includes(typeof value)).slice(0,8));const now=new Date().toISOString();const salt=process.env.ANALYTICS_SALT||'dev-salt-change-me'
  db.prepare('INSERT INTO events(id,workspace_id,project_id,session_hash,event_name,app,page,properties_json,revenue,currency,occurred_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),project.workspace_id,project.id,hash(`${salt}:${now.slice(0,10)}:${sessionId||token()}`),eventName,['web','pwa','ios','android'].includes(app)?app:'web',String(page).slice(0,200),JSON.stringify(safe),Math.max(0,Math.min(10_000_000,Number(revenue)||0)),String(currency).slice(0,3),now)
  return {accepted:true}
}
export function summary(db,workspaceId,days=30){
  const period=Math.min(365,Math.max(1,Number(days)||30));const since=new Date(Date.now()-period*86400_000).toISOString();const rows=db.prepare('SELECT e.*,p.name project_name FROM events e JOIN projects p ON p.id=e.project_id WHERE e.workspace_id=? AND e.occurred_at>=?').all(workspaceId,since);const count=(name,list=rows)=>list.filter((row)=>row.event_name===name).length
  const sessions=new Set(rows.map((row)=>row.session_hash)).size,views=count('page_view'),impressions=count('offer_impression'),clicks=count('affiliate_click'),conversions=count('conversion'),revenue=Math.round(rows.reduce((sum,row)=>sum+row.revenue,0));const groups=Object.groupBy(rows,(row)=>row.project_name)
  const projects=db.prepare('SELECT id,name FROM projects WHERE workspace_id=? AND active=1 ORDER BY name').all(workspaceId).map((project)=>{const list=groups[project.name]||[];const projectImpressions=count('offer_impression',list),projectClicks=count('affiliate_click',list);return {name:project.name,status:list.length?'計測中':'SDK待ち',views:count('page_view',list),ctr:projectImpressions?Math.round(projectClicks/projectImpressions*1000)/10:0,conversions:count('conversion',list),revenue:Math.round(list.reduce((sum,row)=>sum+row.revenue,0))}})
  const started=count('concierge_started'),completed=count('concierge_completed');const recommendations=[];if(views&&started/views<.2)recommendations.push('最初の画面で主要機能の価値と開始ボタンを明確にする');if(completed&&clicks/completed<.25)recommendations.push('完了結果と商品・予約候補の関連性を改善する');if(clicks&&conversions/clicks<.03)recommendations.push('リンク先、価格、キャンセル条件を再確認する');if(!recommendations.length)recommendations.push('上位プロジェクトの導線を低成果プロジェクトでA/Bテストする')
  return {sessions,views,impressions,clicks,ctr:impressions?Math.round(clicks/impressions*1000)/10:0,conversions,cvr:clicks?Math.round(conversions/clicks*1000)/10:0,revenue,rps:sessions?Math.round(revenue/sessions):0,projects,funnel:[['アクセス',sessions],['AI準備開始',started],['準備完了',completed],['広告クリック',clicks],['成果',conversions]],recommendations}
}
