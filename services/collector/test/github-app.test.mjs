import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { openDatabase } from '../db.mjs'
import { githubStatus,syncRepositories,verifyWebhookSignature } from '../github-app.mjs'
import { seedDevelopment } from '../domain.mjs'

test('GitHub webhook signature is verified safely',()=>{const payload=Buffer.from('{"action":"created"}'),secret='test-secret',signature=`sha256=${createHmac('sha256',secret).update(payload).digest('hex')}`;assert.equal(verifyWebhookSignature(payload,signature,secret),true);assert.equal(verifyWebhookSignature(payload,'sha256=bad',secret),false)})
test('installation repositories are synchronized and removed repositories deactivate',()=>{const db=openDatabase(':memory:');seedDevelopment(db);const repo=(id,name)=>({id,name,full_name:`syunnjack/${name}`,private:true,homepage:'',default_branch:'main',archived:false});syncRepositories(db,{workspaceId:'ws-demo',installationId:99,repositories:[repo(1,'one'),repo(2,'two')],accountLogin:'syunnjack'});syncRepositories(db,{workspaceId:'ws-demo',installationId:99,repositories:[repo(2,'two')],accountLogin:'syunnjack'});assert.equal(db.prepare('SELECT active FROM projects WHERE github_repository_id=1').get().active,0);assert.equal(githubStatus(db,'ws-demo').repositoryCount,1)})
