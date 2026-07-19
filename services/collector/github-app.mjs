import { createHmac,createSign,randomUUID,timingSafeEqual } from 'node:crypto'

const api='https://api.github.com'
const encode=(value)=>Buffer.from(JSON.stringify(value)).toString('base64url')
export function verifyWebhookSignature(payload,signature,secret=process.env.GITHUB_WEBHOOK_SECRET||''){
  if(!secret||!signature?.startsWith('sha256='))return false
  const expected=`sha256=${createHmac('sha256',secret).update(payload).digest('hex')}`
  const left=Buffer.from(signature),right=Buffer.from(expected)
  return left.length===right.length&&timingSafeEqual(left,right)
}
export function appJwt({appId=process.env.GITHUB_APP_ID,privateKey=process.env.GITHUB_PRIVATE_KEY}={}){
  if(!appId||!privateKey)throw new Error('github_app_not_configured')
  const now=Math.floor(Date.now()/1000),header=encode({alg:'RS256',typ:'JWT'}),claims=encode({iat:now-60,exp:now+540,iss:String(appId)}),unsigned=`${header}.${claims}`
  return `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(privateKey.replace(/\\n/g,'\n'),'base64url')}`
}
async function github(path,options={}){const response=await fetch(`${api}${path}`,{...options,headers:{accept:'application/vnd.github+json','user-agent':'sukima-insight','x-github-api-version':'2022-11-28',...options.headers}});if(!response.ok)throw new Error(`github_${response.status}`);return response.json()}
export async function installationToken(installationId){const data=await github(`/app/installations/${installationId}/access_tokens`,{method:'POST',headers:{authorization:`Bearer ${appJwt()}`}});return data.token}
export async function listInstallationRepositories(installationId){const token=await installationToken(installationId),repositories=[];let page=1;while(true){const data=await github(`/installation/repositories?per_page=100&page=${page}`,{headers:{authorization:`Bearer ${token}`}});repositories.push(...data.repositories);if(data.repositories.length<100)break;page+=1}return repositories}
export function syncRepositories(db,{workspaceId,installationId,repositories,accountLogin='',accountType='User',repositorySelection='selected'}){
  const now=new Date().toISOString(),installationKey=`ghi-${installationId}`
  db.prepare(`INSERT INTO github_installations(id,workspace_id,installation_id,account_login,account_type,repository_selection,status,last_synced_at,created_at,updated_at) VALUES(?,?,?,?,?,?, 'active',?,?,?) ON CONFLICT(installation_id) DO UPDATE SET workspace_id=excluded.workspace_id,account_login=excluded.account_login,account_type=excluded.account_type,repository_selection=excluded.repository_selection,status='active',last_synced_at=excluded.last_synced_at,updated_at=excluded.updated_at`).run(installationKey,workspaceId,installationId,accountLogin,accountType,repositorySelection,now,now,now)
  const seen=[]
  for(const repo of repositories){seen.push(repo.id);db.prepare(`INSERT INTO projects(id,workspace_id,repo_full_name,name,homepage_url,visibility,write_key_hash,active,updated_at,github_repository_id,default_branch,archived,last_synced_at) VALUES(?,?,?,?,?,?,?,1,?,?,?,?,?) ON CONFLICT(workspace_id,repo_full_name) DO UPDATE SET name=excluded.name,homepage_url=excluded.homepage_url,visibility=excluded.visibility,active=1,updated_at=excluded.updated_at,github_repository_id=excluded.github_repository_id,default_branch=excluded.default_branch,archived=excluded.archived,last_synced_at=excluded.last_synced_at`).run(randomUUID(),workspaceId,repo.full_name,repo.name,repo.homepage||'',repo.private?'private':'public','github-app-pending-key',now,repo.id,repo.default_branch||'main',repo.archived?1:0,now)}
  if(seen.length){const placeholders=seen.map(()=>'?').join(',');db.prepare(`UPDATE projects SET active=0,updated_at=? WHERE workspace_id=? AND github_repository_id IS NOT NULL AND github_repository_id NOT IN (${placeholders})`).run(now,workspaceId,...seen)}else db.prepare('UPDATE projects SET active=0,updated_at=? WHERE workspace_id=? AND github_repository_id IS NOT NULL').run(now,workspaceId)
  db.prepare('INSERT INTO audit_logs(id,workspace_id,action,actor,metadata_json,created_at) VALUES(?,?,?,?,?,?)').run(randomUUID(),workspaceId,'github.repositories.synced','github-app',JSON.stringify({installationId,count:repositories.length}),now)
  return {synced:repositories.length,lastSyncedAt:now}
}
export function githubStatus(db,workspaceId){const installations=db.prepare('SELECT installation_id,account_login,account_type,repository_selection,status,last_synced_at FROM github_installations WHERE workspace_id=? ORDER BY updated_at DESC').all(workspaceId);const repositoryCount=db.prepare('SELECT COUNT(*) count FROM projects WHERE workspace_id=? AND github_repository_id IS NOT NULL AND active=1').get(workspaceId).count;return {configured:Boolean(process.env.GITHUB_APP_ID&&process.env.GITHUB_PRIVATE_KEY&&process.env.GITHUB_WEBHOOK_SECRET),installations,repositoryCount}}
