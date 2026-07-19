import { mkdirSync } from 'node:fs'
import { dirname,resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
export function openDatabase(path=process.env.INSIGHT_DB_PATH||'./data/insight.db'){
  const target=path===':memory:'?path:resolve(path);if(target!==':memory:')mkdirSync(dirname(target),{recursive:true})
  const db=new DatabaseSync(target);db.exec('PRAGMA foreign_keys=ON')
  for(const sql of[
    `CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY,name TEXT NOT NULL,admin_key_hash TEXT NOT NULL,plan TEXT NOT NULL DEFAULT 'starter',created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),repo_full_name TEXT NOT NULL,name TEXT NOT NULL,homepage_url TEXT,visibility TEXT NOT NULL DEFAULT 'private',write_key_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL,UNIQUE(workspace_id,repo_full_name))`,
    `CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),project_id TEXT NOT NULL REFERENCES projects(id),session_hash TEXT NOT NULL,event_name TEXT NOT NULL,app TEXT NOT NULL,page TEXT,properties_json TEXT NOT NULL DEFAULT '{}',revenue REAL NOT NULL DEFAULT 0,currency TEXT NOT NULL DEFAULT 'JPY',occurred_at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS events_workspace_time_idx ON events(workspace_id,occurred_at)`,
    `CREATE INDEX IF NOT EXISTS events_project_time_idx ON events(project_id,occurred_at)`
    ,`CREATE TABLE IF NOT EXISTS github_installations(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),installation_id INTEGER NOT NULL UNIQUE,account_login TEXT NOT NULL,account_type TEXT NOT NULL DEFAULT 'User',repository_selection TEXT NOT NULL DEFAULT 'selected',status TEXT NOT NULL DEFAULT 'active',last_synced_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`
    ,`CREATE TABLE IF NOT EXISTS webhook_deliveries(delivery_id TEXT PRIMARY KEY,event_name TEXT NOT NULL,status TEXT NOT NULL,received_at TEXT NOT NULL)`
    ,`CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,workspace_id TEXT,action TEXT NOT NULL,actor TEXT NOT NULL,metadata_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL)`
  ])db.prepare(sql).run()
  const columns=new Set(db.prepare('PRAGMA table_info(projects)').all().map((row)=>row.name))
  for(const [name,type] of [['github_repository_id','INTEGER'],['default_branch','TEXT'],['archived','INTEGER NOT NULL DEFAULT 0'],['last_synced_at','TEXT']])if(!columns.has(name))db.exec(`ALTER TABLE projects ADD COLUMN ${name} ${type}`)
  return db
}
