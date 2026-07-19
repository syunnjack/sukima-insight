import { openDatabase } from './db.mjs'
import { registerProject,seedDevelopment } from './domain.mjs'
const token=process.env.GITHUB_TOKEN,owner=process.env.GITHUB_OWNER,workspaceId=process.env.INSIGHT_WORKSPACE_ID||'ws-demo';if(!token||!owner)throw new Error('GITHUB_TOKEN_and_GITHUB_OWNER_required')
const db=openDatabase();seedDevelopment(db);let page=1,synced=0
while(true){const response=await fetch(`https://api.github.com/user/repos?affiliation=owner,organization_member&per_page=100&page=${page}`,{headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','user-agent':'sukima-insight'}});if(!response.ok)throw new Error(`github_${response.status}`);const repos=await response.json();for(const repo of repos.filter((item)=>item.owner.login===owner)){registerProject(db,{workspaceId,repoFullName:repo.full_name,name:repo.name,homepageUrl:repo.homepage||'',visibility:repo.private?'private':'public'});synced+=1}if(repos.length<100)break;page+=1}
console.log(JSON.stringify({owner,synced,pages:page}))
