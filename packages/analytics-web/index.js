const SESSION_KEY='sukima-insight.session'
function session(){let id=sessionStorage.getItem(SESSION_KEY);if(!id){id=crypto.randomUUID();sessionStorage.setItem(SESSION_KEY,id)}return id}
export function createInsight({apiUrl,projectId,writeKey,app='web',hasConsent=()=>false}){
  const endpoint=`${apiUrl.replace(/\/$/,'')}/v1/events`
  const track=(eventName,{page=location.pathname,properties={},revenue=0,currency='JPY'}={})=>{if(!hasConsent())return false;const payload=JSON.stringify({projectId,writeKey,sessionId:session(),eventName,app,page,properties,revenue,currency});fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{});return true}
  return {start:()=>{track('session_started');track('page_view')},track}
}
