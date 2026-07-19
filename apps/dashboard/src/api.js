const API=(import.meta.env.VITE_INSIGHT_API_URL||'').replace(/\/$/,'')
export async function getSummary(workspaceId,adminKey,days){
  const response=await fetch(`${API}/v1/summary?workspaceId=${encodeURIComponent(workspaceId)}&days=${days}`,{headers:{authorization:`Bearer ${adminKey}`}})
  const data=await response.json();if(!response.ok)throw new Error(data.error||'request_failed');return data
}
export const apiConfigured=Boolean(API)
async function request(path,adminKey,options={}){const response=await fetch(`${API}${path}`,{...options,headers:{authorization:`Bearer ${adminKey}`,'content-type':'application/json',...options.headers}});const data=await response.json();if(!response.ok)throw new Error(data.error||'request_failed');return data}
export const getGithubStatus=(workspaceId,adminKey)=>request(`/v1/github/status?workspaceId=${encodeURIComponent(workspaceId)}`,adminKey)
export const syncGithub=(workspaceId,adminKey)=>request('/v1/github/sync',adminKey,{method:'POST',body:JSON.stringify({workspaceId})})
